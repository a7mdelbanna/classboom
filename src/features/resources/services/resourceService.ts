import { supabase } from '../../../lib/supabase';
import type {
  Resource,
  ResourceFormData,
  ResourceFilters,
  ResourceStats,
  ResourceBooking,
  ResourceBookingFormData,
  ResourceBookingFilters,
  ResourceAvailabilityCheck,
  ResourceAvailabilityResult,
  ResourceSet,
  ResourceType,
  ResourceWithAvailability
} from '../types/resource.types';

export class ResourceService {
  // Get current user's school ID
  private static async getCurrentSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data: schools, error } = await supabase
      .from('schools')
      .select('id')
      .eq('owner_id', user.id)
      .single();
    
    if (error || !schools) {
      throw new Error('No school found for user');
    }
    
    return schools.id;
  }

  // ==================== RESOURCE CRUD ====================

  // Create a new resource
  static async createResource(data: ResourceFormData): Promise<Resource> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const { data: { user } } = await supabase.auth.getUser();

      const { data: resource, error } = await supabase
        .from('resources')
        .insert({
          school_id: schoolId,
          resource_type: data.resource_type,
          name: data.name,
          code: data.code || null,
          description: data.description || null,
          building: data.building || null,
          floor: data.floor || null,
          room_number: data.room_number || null,
          address: data.address || null,
          capacity: data.capacity || 1,
          features: data.features || {},
          platform: data.platform || null,
          account_email: data.account_email || null,
          account_password_hint: data.account_password_hint || null,
          meeting_url: data.meeting_url || null,
          meeting_id: data.meeting_id || null,
          passcode: data.passcode || null,
          license_limit: data.license_limit || null,
          is_active: data.is_active !== false,
          available_from: data.available_from === '' ? null : data.available_from || null,
          available_until: data.available_until === '' ? null : data.available_until || null,
          days_available: data.days_available || null,
          min_booking_duration: data.min_booking_duration || 30,
          max_booking_duration: data.max_booking_duration || 480,
          buffer_time_before: data.buffer_time_before || 0,
          buffer_time_after: data.buffer_time_after || 15,
          advance_booking_days: data.advance_booking_days || 90,
          requires_approval: data.requires_approval || false,
          approval_roles: data.approval_roles || null,
          hourly_rate: data.hourly_rate || null,
          currency: data.currency || null,
          image_url: data.image_url || null,
          notes: data.notes || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating resource:', error);
        throw new Error(error.message);
      }

      return resource;
    } catch (error) {
      console.error('Error in createResource:', error);
      throw error;
    }
  }

  // Get resources with filters
  static async getResources(filters?: ResourceFilters): Promise<Resource[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('resources')
        .select('*')
        .eq('school_id', schoolId);

      // Apply filters
      if (filters?.resource_type) {
        query = query.eq('resource_type', filters.resource_type);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters?.building) {
        query = query.eq('building', filters.building);
      }
      if (filters?.capacity_min) {
        query = query.gte('capacity', filters.capacity_min);
      }
      if (filters?.capacity_max) {
        query = query.lte('capacity', filters.capacity_max);
      }
      if (filters?.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
          code.ilike.%${filters.search}%,
          description.ilike.%${filters.search}%,
          room_number.ilike.%${filters.search}%
        `);
      }
      if (filters?.features && filters.features.length > 0) {
        // Filter by features (all specified features must exist)
        filters.features.forEach(feature => {
          query = query.filter('features', '@>', JSON.stringify({ [feature]: true }));
        });
      }

      const { data: resources, error } = await query
        .order('resource_type')
        .order('name');

      if (error) {
        console.error('Error fetching resources:', error);
        throw new Error(error.message);
      }

      return resources || [];
    } catch (error) {
      console.error('Error in getResources:', error);
      return [];
    }
  }

  // Get single resource
  static async getResource(id: string): Promise<Resource | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: resource, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        console.error('Error fetching resource:', error);
        return null;
      }

      return resource;
    } catch (error) {
      console.error('Error in getResource:', error);
      return null;
    }
  }

  // Update resource
  static async updateResource(id: string, updates: Partial<ResourceFormData>): Promise<Resource> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      // Clean up empty strings for time fields and other nullable fields
      const cleanedUpdates = {
        ...updates,
        // Convert empty strings to null for time fields
        available_from: updates.available_from === '' ? null : updates.available_from,
        available_until: updates.available_until === '' ? null : updates.available_until,
        // Convert empty strings to null for other nullable fields
        code: updates.code === '' ? null : updates.code,
        description: updates.description === '' ? null : updates.description,
        building: updates.building === '' ? null : updates.building,
        floor: updates.floor === '' ? null : updates.floor,
        room_number: updates.room_number === '' ? null : updates.room_number,
        address: updates.address === '' ? null : updates.address,
        platform: updates.platform === '' ? null : updates.platform,
        account_email: updates.account_email === '' ? null : updates.account_email,
        account_password_hint: updates.account_password_hint === '' ? null : updates.account_password_hint,
        meeting_url: updates.meeting_url === '' ? null : updates.meeting_url,
        meeting_id: updates.meeting_id === '' ? null : updates.meeting_id,
        passcode: updates.passcode === '' ? null : updates.passcode,
        currency: updates.currency === '' ? null : updates.currency,
        image_url: updates.image_url === '' ? null : updates.image_url,
        notes: updates.notes === '' ? null : updates.notes,
        updated_at: new Date().toISOString()
      };

      const { data: resource, error } = await supabase
        .from('resources')
        .update(cleanedUpdates)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) {
        console.error('Error updating resource:', error);
        throw new Error(error.message);
      }

      return resource;
    } catch (error) {
      console.error('Error in updateResource:', error);
      throw error;
    }
  }

  // Delete resource
  static async deleteResource(id: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      // Check if resource has any bookings
      const { data: bookings } = await supabase
        .from('resource_bookings')
        .select('id')
        .eq('resource_id', id)
        .eq('status', 'confirmed')
        .gte('start_datetime', new Date().toISOString())
        .limit(1);

      if (bookings && bookings.length > 0) {
        throw new Error('Cannot delete resource with future bookings');
      }

      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error deleting resource:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteResource:', error);
      throw error;
    }
  }

  // ==================== AVAILABILITY CHECKING ====================

  // Check resource availability
  static async checkAvailability(params: ResourceAvailabilityCheck): Promise<ResourceAvailabilityResult> {
    try {
      const { data, error } = await supabase.rpc('check_resource_availability', {
        p_resource_id: params.resource_id,
        p_start_datetime: params.start_datetime,
        p_end_datetime: params.end_datetime,
        p_exclude_booking_id: params.exclude_booking_id || null
      });

      if (error) {
        console.error('Error checking availability:', error);
        throw new Error(error.message);
      }

      return {
        is_available: data[0]?.is_available || false,
        conflicting_bookings: data[0]?.conflicting_bookings || []
      };
    } catch (error) {
      console.error('Error in checkAvailability:', error);
      return {
        is_available: false,
        conflicting_bookings: [{ reason: 'Error checking availability' }]
      };
    }
  }

  // Find alternative resources
  static async findAlternatives(
    resourceId: string,
    startDatetime: string,
    endDatetime: string
  ): Promise<Resource[]> {
    try {
      const { data: alternatives, error } = await supabase.rpc('find_alternative_resources', {
        p_resource_id: resourceId,
        p_start_datetime: startDatetime,
        p_end_datetime: endDatetime
      });

      if (error) {
        console.error('Error finding alternatives:', error);
        return [];
      }

      return alternatives || [];
    } catch (error) {
      console.error('Error in findAlternatives:', error);
      return [];
    }
  }

  // Get resources with current availability status
  static async getResourcesWithAvailability(
    filters?: ResourceFilters
  ): Promise<ResourceWithAvailability[]> {
    try {
      const resources = await this.getResources(filters);
      const now = new Date();
      
      // For each resource, check if it's currently available
      const resourcesWithAvailability = await Promise.all(
        resources.map(async (resource) => {
          // Check current booking
          const { data: currentBooking } = await supabase
            .from('resource_bookings')
            .select('*')
            .eq('resource_id', resource.id)
            .eq('status', 'confirmed')
            .lte('start_datetime', now.toISOString())
            .gte('end_datetime', now.toISOString())
            .single();

          // Find next available slot
          const { data: nextBooking } = await supabase
            .from('resource_bookings')
            .select('end_datetime')
            .eq('resource_id', resource.id)
            .eq('status', 'confirmed')
            .gte('start_datetime', now.toISOString())
            .order('start_datetime', { ascending: true })
            .limit(1)
            .single();

          return {
            ...resource,
            is_available_now: !currentBooking,
            current_booking: currentBooking || undefined,
            next_available: currentBooking ? nextBooking?.end_datetime : undefined
          } as ResourceWithAvailability;
        })
      );

      return resourcesWithAvailability;
    } catch (error) {
      console.error('Error in getResourcesWithAvailability:', error);
      return [];
    }
  }

  // ==================== RESOURCE BOOKINGS ====================

  // Create resource booking
  static async createBooking(data: ResourceBookingFormData): Promise<ResourceBooking> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Check availability first
      const availability = await this.checkAvailability({
        resource_id: data.resource_id,
        start_datetime: data.start_datetime,
        end_datetime: data.end_datetime
      });

      if (!availability.is_available) {
        throw new Error('Resource is not available for the selected time');
      }

      const { data: booking, error } = await supabase
        .from('resource_bookings')
        .insert({
          resource_id: data.resource_id,
          session_id: data.session_id || null,
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          booked_by: user?.id,
          booked_for: data.booked_for || null,
          status: 'confirmed', // Auto-confirm for now, can add approval flow later
          booking_notes: data.booking_notes || null,
          priority: data.priority || 0,
          is_recurring: data.is_recurring || false
        })
        .select(`
          *,
          resource:resources(*)
        `)
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw new Error(error.message);
      }

      return booking;
    } catch (error) {
      console.error('Error in createBooking:', error);
      throw error;
    }
  }

  // Get bookings
  static async getBookings(filters?: ResourceBookingFilters): Promise<ResourceBooking[]> {
    try {
      let query = supabase
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
        `);

      // Apply filters
      if (filters?.resource_id) {
        query = query.eq('resource_id', filters.resource_id);
      }
      if (filters?.session_id) {
        query = query.eq('session_id', filters.session_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.booked_by) {
        query = query.eq('booked_by', filters.booked_by);
      }
      if (filters?.date_from) {
        query = query.gte('start_datetime', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('end_datetime', filters.date_to);
      }

      const { data: bookings, error } = await query
        .order('start_datetime', { ascending: true });

      if (error) {
        console.error('Error fetching bookings:', error);
        throw new Error(error.message);
      }

      return bookings || [];
    } catch (error) {
      console.error('Error in getBookings:', error);
      return [];
    }
  }

  // Cancel booking
  static async cancelBooking(id: string, reason?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('resource_bookings')
        .update({
          status: 'cancelled',
          cancellation_reason: reason || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error cancelling booking:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in cancelBooking:', error);
      throw error;
    }
  }

  // ==================== RESOURCE SETS ====================

  // Create resource set
  static async createResourceSet(
    name: string,
    description: string | null,
    resourceIds: string[]
  ): Promise<ResourceSet> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      const { data: resourceSet, error } = await supabase
        .from('resource_sets')
        .insert({
          school_id: schoolId,
          name,
          description,
          resource_ids: resourceIds
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating resource set:', error);
        throw new Error(error.message);
      }

      return resourceSet;
    } catch (error) {
      console.error('Error in createResourceSet:', error);
      throw error;
    }
  }

  // Get resource sets
  static async getResourceSets(): Promise<ResourceSet[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      const { data: resourceSets, error } = await supabase
        .from('resource_sets')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching resource sets:', error);
        throw new Error(error.message);
      }

      // Load resources for each set
      const setsWithResources = await Promise.all(
        (resourceSets || []).map(async (set) => {
          const resources = await Promise.all(
            set.resource_ids.map(id => this.getResource(id))
          );
          return {
            ...set,
            resources: resources.filter(r => r !== null) as Resource[]
          };
        })
      );

      return setsWithResources;
    } catch (error) {
      console.error('Error in getResourceSets:', error);
      return [];
    }
  }

  // ==================== STATISTICS ====================

  // Get resource statistics
  static async getResourceStats(): Promise<ResourceStats> {
    try {
      const schoolId = await this.getCurrentSchoolId();

      // Get all resources
      const { data: resources, error: resourceError } = await supabase
        .from('resources')
        .select('*')
        .eq('school_id', schoolId);

      if (resourceError) throw resourceError;

      // Get upcoming bookings count
      const { count: upcomingBookings, error: bookingError } = await supabase
        .from('resource_bookings')
        .select('*', { count: 'exact', head: true })
        .in('resource_id', resources?.map(r => r.id) || [])
        .eq('status', 'confirmed')
        .gte('start_datetime', new Date().toISOString());

      if (bookingError) throw bookingError;

      // Get maintenance count
      const { count: maintenanceScheduled, error: maintenanceError } = await supabase
        .from('resource_maintenance')
        .select('*', { count: 'exact', head: true })
        .in('resource_id', resources?.map(r => r.id) || [])
        .eq('status', 'scheduled')
        .gte('start_datetime', new Date().toISOString());

      if (maintenanceError) throw maintenanceError;

      // Calculate statistics
      const stats: ResourceStats = {
        total_resources: resources?.length || 0,
        by_type: {} as Record<ResourceType, number>,
        active_resources: resources?.filter(r => r.is_active).length || 0,
        total_capacity: resources?.reduce((sum, r) => sum + r.capacity, 0) || 0,
        utilization_rate: 0, // TODO: Calculate based on bookings
        upcoming_bookings: upcomingBookings || 0,
        maintenance_scheduled: maintenanceScheduled || 0
      };

      // Count by type
      resources?.forEach(resource => {
        stats.by_type[resource.resource_type] = (stats.by_type[resource.resource_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error in getResourceStats:', error);
      return {
        total_resources: 0,
        by_type: {} as Record<ResourceType, number>,
        active_resources: 0,
        total_capacity: 0,
        utilization_rate: 0,
        upcoming_bookings: 0,
        maintenance_scheduled: 0
      };
    }
  }

  // Get resource by code
  static async getResourceByCode(code: string): Promise<Resource | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: resource, error } = await supabase
        .from('resources')
        .select('*')
        .eq('code', code)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        console.error('Error fetching resource by code:', error);
        return null;
      }

      return resource;
    } catch (error) {
      console.error('Error in getResourceByCode:', error);
      return null;
    }
  }
}