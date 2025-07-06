import { supabase } from '../../../lib/supabase';
import { ResourceService } from './resourceService';
import type {
  ResourceBooking,
  ResourceBookingFormData,
  ResourceBookingFilters,
  ResourceConflict,
  Resource
} from '../types/resource.types';

export class ResourceBookingService {
  // Book resources for a session
  static async bookResourcesForSession(
    sessionId: string,
    resourceIds: string[],
    startDatetime: string,
    endDatetime: string,
    notes?: string
  ): Promise<ResourceBooking[]> {
    try {
      // Check all resources availability first
      const conflicts = await this.checkMultipleResourceConflicts(
        resourceIds,
        startDatetime,
        endDatetime
      );

      if (conflicts.length > 0) {
        const conflictMessages = conflicts.map(c => c.message).join(', ');
        throw new Error(`Resource conflicts detected: ${conflictMessages}`);
      }

      // Book all resources
      const bookings: ResourceBooking[] = [];
      
      for (const resourceId of resourceIds) {
        const booking = await ResourceService.createBooking({
          resource_id: resourceId,
          session_id: sessionId,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          booking_notes: notes
        });
        bookings.push(booking);
      }

      return bookings;
    } catch (error) {
      console.error('Error in bookResourcesForSession:', error);
      throw error;
    }
  }

  // Check conflicts for multiple resources
  static async checkMultipleResourceConflicts(
    resourceIds: string[],
    startDatetime: string,
    endDatetime: string,
    excludeBookingIds?: string[]
  ): Promise<ResourceConflict[]> {
    const conflicts: ResourceConflict[] = [];

    for (const resourceId of resourceIds) {
      const resource = await ResourceService.getResource(resourceId);
      if (!resource) continue;

      const availability = await ResourceService.checkAvailability({
        resource_id: resourceId,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        exclude_booking_id: excludeBookingIds?.[0] // TODO: Handle multiple excludes
      });

      if (!availability.is_available) {
        conflicts.push({
          resource_id: resourceId,
          resource_name: resource.name,
          conflict_type: 'booking',
          message: `${resource.name} is not available`,
          conflicting_item: availability.conflicting_bookings[0] as any
        });
      }
    }

    return conflicts;
  }

  // Book recurring resources
  static async bookRecurringResources(
    resourceId: string,
    pattern: {
      start_date: string;
      end_date: string;
      days_of_week: number[];
      start_time: string;
      end_time: string;
    },
    sessionIds?: string[]
  ): Promise<ResourceBooking[]> {
    try {
      const bookings: ResourceBooking[] = [];
      const recurrenceGroupId = crypto.randomUUID();
      
      // Generate dates based on pattern
      const dates = this.generateRecurringDates(
        pattern.start_date,
        pattern.end_date,
        pattern.days_of_week
      );

      // Create booking for each date
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const startDatetime = `${date}T${pattern.start_time}`;
        const endDatetime = `${date}T${pattern.end_time}`;

        // Check availability
        const availability = await ResourceService.checkAvailability({
          resource_id: resourceId,
          start_datetime: startDatetime,
          end_datetime: endDatetime
        });

        if (availability.is_available) {
          const booking = await ResourceService.createBooking({
            resource_id: resourceId,
            session_id: sessionIds?.[i],
            start_datetime: startDatetime,
            end_datetime: endDatetime,
            is_recurring: true,
            booking_notes: `Recurring booking ${i + 1} of ${dates.length}`
          });

          // Update with recurrence group ID
          await supabase
            .from('resource_bookings')
            .update({ recurrence_group_id: recurrenceGroupId })
            .eq('id', booking.id);

          bookings.push(booking);
        }
      }

      return bookings;
    } catch (error) {
      console.error('Error in bookRecurringResources:', error);
      throw error;
    }
  }

  // Cancel all bookings in a recurrence group
  static async cancelRecurringBookings(
    recurrenceGroupId: string,
    reason?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('resource_bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason || 'Recurring booking cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('recurrence_group_id', recurrenceGroupId);

      if (error) {
        console.error('Error cancelling recurring bookings:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in cancelRecurringBookings:', error);
      throw error;
    }
  }

  // Find best available resource for requirements
  static async findBestResource(
    requirements: {
      resource_type: string;
      capacity_needed: number;
      features_required?: string[];
      start_datetime: string;
      end_datetime: string;
      preferred_building?: string;
    }
  ): Promise<Resource | null> {
    try {
      // Get all matching resources
      const resources = await ResourceService.getResources({
        resource_type: requirements.resource_type as any,
        capacity_min: requirements.capacity_needed,
        is_active: true,
        building: requirements.preferred_building
      });

      // Filter by required features
      let matchingResources = resources;
      if (requirements.features_required && requirements.features_required.length > 0) {
        matchingResources = resources.filter(resource => {
          return requirements.features_required!.every(feature => 
            resource.features && resource.features[feature]
          );
        });
      }

      // Check availability and find the best match
      for (const resource of matchingResources) {
        const availability = await ResourceService.checkAvailability({
          resource_id: resource.id,
          start_datetime: requirements.start_datetime,
          end_datetime: requirements.end_datetime
        });

        if (availability.is_available) {
          return resource; // Return first available
        }
      }

      return null;
    } catch (error) {
      console.error('Error in findBestResource:', error);
      return null;
    }
  }

  // Smart resource assignment for session
  static async smartResourceAssignment(
    sessionRequirements: {
      course_id: string;
      capacity: number;
      is_online: boolean;
      start_datetime: string;
      end_datetime: string;
      preferred_resources?: string[];
    }
  ): Promise<Resource[]> {
    const assignedResources: Resource[] = [];

    try {
      // Get course details to understand requirements
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', sessionRequirements.course_id)
        .single();

      if (!course) {
        throw new Error('Course not found');
      }

      // Determine resource types needed
      const resourceTypesNeeded: string[] = [];
      
      if (!sessionRequirements.is_online) {
        resourceTypesNeeded.push('physical_room');
      } else {
        resourceTypesNeeded.push('online_meeting');
      }

      // Add equipment based on course type
      if (course.category === 'music') {
        resourceTypesNeeded.push('instrument');
      } else if (course.category === 'cooking') {
        resourceTypesNeeded.push('equipment');
      } else if (course.category === 'fitness') {
        resourceTypesNeeded.push('sports_facility');
      }

      // Try to assign each type of resource needed
      for (const resourceType of resourceTypesNeeded) {
        // Check preferred resources first
        if (sessionRequirements.preferred_resources) {
          for (const preferredId of sessionRequirements.preferred_resources) {
            const resource = await ResourceService.getResource(preferredId);
            if (resource && resource.resource_type === resourceType) {
              const availability = await ResourceService.checkAvailability({
                resource_id: preferredId,
                start_datetime: sessionRequirements.start_datetime,
                end_datetime: sessionRequirements.end_datetime
              });

              if (availability.is_available) {
                assignedResources.push(resource);
                continue;
              }
            }
          }
        }

        // If no preferred resource available, find best match
        if (!assignedResources.some(r => r.resource_type === resourceType)) {
          const bestResource = await this.findBestResource({
            resource_type: resourceType,
            capacity_needed: sessionRequirements.capacity,
            start_datetime: sessionRequirements.start_datetime,
            end_datetime: sessionRequirements.end_datetime
          });

          if (bestResource) {
            assignedResources.push(bestResource);
          }
        }
      }

      return assignedResources;
    } catch (error) {
      console.error('Error in smartResourceAssignment:', error);
      return assignedResources;
    }
  }

  // Transfer booking to another resource
  static async transferBooking(
    bookingId: string,
    newResourceId: string,
    reason?: string
  ): Promise<ResourceBooking> {
    try {
      // Get existing booking
      const { data: existingBooking, error: fetchError } = await supabase
        .from('resource_bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchError || !existingBooking) {
        throw new Error('Booking not found');
      }

      // Check new resource availability
      const availability = await ResourceService.checkAvailability({
        resource_id: newResourceId,
        start_datetime: existingBooking.start_datetime,
        end_datetime: existingBooking.end_datetime
      });

      if (!availability.is_available) {
        throw new Error('New resource is not available for this time slot');
      }

      // Update booking with new resource
      const { data: updatedBooking, error: updateError } = await supabase
        .from('resource_bookings')
        .update({
          resource_id: newResourceId,
          booking_notes: `${existingBooking.booking_notes || ''}\n\nTransferred from another resource. Reason: ${reason || 'Not specified'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select(`
          *,
          resource:resources(*)
        `)
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      return updatedBooking;
    } catch (error) {
      console.error('Error in transferBooking:', error);
      throw error;
    }
  }

  // Helper: Generate recurring dates
  private static generateRecurringDates(
    startDate: string,
    endDate: string,
    daysOfWeek: number[]
  ): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7
      
      if (daysOfWeek.includes(dayOfWeek)) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    return dates;
  }

  // Get booking conflicts for a time range
  static async getBookingConflicts(
    resourceId: string,
    startDatetime: string,
    endDatetime: string
  ): Promise<ResourceBooking[]> {
    try {
      const { data: conflicts, error } = await supabase
        .from('resource_bookings')
        .select(`
          *,
          resource:resources(*),
          session:sessions(
            id,
            title,
            scheduled_date,
            start_time,
            end_time
          )
        `)
        .eq('resource_id', resourceId)
        .in('status', ['confirmed', 'pending'])
        .or(`
          and(start_datetime.lte.${endDatetime},end_datetime.gte.${startDatetime})
        `);

      if (error) {
        console.error('Error fetching conflicts:', error);
        return [];
      }

      return conflicts || [];
    } catch (error) {
      console.error('Error in getBookingConflicts:', error);
      return [];
    }
  }
}