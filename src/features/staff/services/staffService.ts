import { supabase } from '../../../lib/supabase';
import type { Staff, StaffFormData, StaffFilters, StaffCourseAssignment, WeeklyAvailability, TimeSlot } from '../types/staff.types';

export class StaffService {
  // Get current school ID
  private static async getCurrentSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: school, error } = await supabase
      .from('schools')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (error) throw new Error('School not found');
    return school.id;
  }

  // Get default permissions based on staff role
  private static getDefaultPermissions(role: string) {
    switch (role) {
      case 'admin':
        return {
          can_view_all_students: true,
          can_edit_students: true,
          can_manage_enrollments: true,
          can_mark_attendance: true,
          can_view_finances: true,
          can_manage_staff: true,
          can_send_announcements: true
        };
      case 'manager':
        return {
          can_view_all_students: true,
          can_edit_students: true,
          can_manage_enrollments: true,
          can_mark_attendance: true,
          can_view_finances: true,
          can_manage_staff: false,
          can_send_announcements: true
        };
      case 'teacher':
        return {
          can_view_all_students: false,
          can_edit_students: false,
          can_manage_enrollments: false,
          can_mark_attendance: true,
          can_view_finances: false,
          can_manage_staff: false,
          can_send_announcements: false
        };
      case 'support':
        return {
          can_view_all_students: true,
          can_edit_students: false,
          can_manage_enrollments: false,
          can_mark_attendance: false,
          can_view_finances: false,
          can_manage_staff: false,
          can_send_announcements: false
        };
      default:
        return {
          can_view_all_students: false,
          can_edit_students: false,
          can_manage_enrollments: false,
          can_mark_attendance: false,
          can_view_finances: false,
          can_manage_staff: false,
          can_send_announcements: false
        };
    }
  }

  // Generate staff code
  private static async generateStaffCode(role: string): Promise<string> {
    const schoolId = await this.getCurrentSchoolId();
    
    const { data, error } = await supabase.rpc('generate_staff_code', {
      p_school_id: schoolId,
      p_role: role
    });

    if (error) throw new Error('Failed to generate staff code');
    return data;
  }

  // Create staff member
  static async createStaff(data: StaffFormData): Promise<Staff> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate staff code
      const staffCode = await this.generateStaffCode(data.role);
      
      // Get default permissions based on role
      const defaultPermissions = this.getDefaultPermissions(data.role);
      
      const { data: staff, error } = await supabase
        .from('staff')
        .insert({
          school_id: schoolId,
          staff_code: staffCode,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || null,
          role: data.role,
          department: data.department || null,
          employment_type: data.employment_type,
          hire_date: data.hire_date || null,
          contract_end_date: data.contract_end_date || null,
          compensation_model: data.compensation_model,
          base_salary: data.base_salary || null,
          hourly_rate: data.hourly_rate || null,
          session_rate: data.session_rate || null,
          currency: data.currency || 'USD',
          specializations: data.specializations || null,
          max_weekly_hours: data.max_weekly_hours || null,
          min_weekly_hours: data.min_weekly_hours || null,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender || null,
          nationality: data.nationality || null,
          national_id: data.national_id || null,
          address: data.address || null,
          emergency_contact: data.emergency_contact || null,
          notes: data.notes || null,
          created_by: user?.id,
          permissions: defaultPermissions
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return this.enrichStaffData(staff);
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  }

  // Get staff members with filters
  static async getStaff(filters?: StaffFilters): Promise<Staff[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('staff')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.employment_type) {
        query = query.eq('employment_type', filters.employment_type);
      }
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,staff_code.ilike.%${filters.search}%`);
      }

      const { data: staff, error } = await query;

      if (error) throw new Error(error.message);
      
      return staff.map(s => this.enrichStaffData(s));
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  }

  // Get single staff member
  static async getStaffMember(id: string): Promise<Staff | null> {
    try {
      // First try to get the staff record
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .single();

      if (staffError) {
        if (staffError.code === 'PGRST116') return null;
        console.error('Error fetching staff:', staffError);
        throw new Error(`Failed to fetch staff data: ${staffError.message}`);
      }
      
      if (!staff) return null;

      // Then try to get the school data separately
      let schoolData = null;
      if (staff.school_id) {
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('id, name, logo_url, address, phone, email')
          .eq('id', staff.school_id)
          .single();

        if (!schoolError && school) {
          schoolData = school;
        } else {
          console.warn('Could not fetch school data for staff member:', schoolError);
        }
      }

      // Combine the data
      return this.enrichStaffData({
        ...staff,
        school: schoolData
      });
    } catch (error) {
      console.error('Error fetching staff member:', error);
      return null;
    }
  }


  // Update staff member
  static async updateStaff(id: string, updates: Partial<StaffFormData>): Promise<Staff> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Clean up date fields and empty values
      const cleanedUpdates = {
        ...updates,
        phone: updates.phone || null,
        department: updates.department || null,
        hire_date: updates.hire_date || null,
        contract_end_date: updates.contract_end_date || null,
        base_salary: updates.base_salary || null,
        hourly_rate: updates.hourly_rate || null,
        session_rate: updates.session_rate || null,
        specializations: updates.specializations || null,
        max_weekly_hours: updates.max_weekly_hours || null,
        min_weekly_hours: updates.min_weekly_hours || null,
        date_of_birth: updates.date_of_birth || null,
        gender: updates.gender || null,
        nationality: updates.nationality || null,
        national_id: updates.national_id || null,
        address: updates.address || null,
        emergency_contact: updates.emergency_contact || null,
        notes: updates.notes || null,
        updated_at: new Date().toISOString()
      };
      
      const { data: staff, error } = await supabase
        .from('staff')
        .update(cleanedUpdates)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return this.enrichStaffData(staff);
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  }

  // Delete staff member
  static async deleteStaff(id: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  }

  // Get staff course assignments
  static async getStaffCourseAssignments(staffId?: string): Promise<StaffCourseAssignment[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('staff_course_assignments')
        .select(`
          *,
          staff!inner(
            id,
            first_name,
            last_name,
            role,
            school_id
          ),
          course:courses!inner(
            id,
            name,
            level,
            category
          )
        `)
        .eq('staff.school_id', schoolId);
      
      if (staffId) {
        query = query.eq('staff_id', staffId);
      }

      const { data: assignments, error } = await query;

      if (error) throw new Error(error.message);
      
      return assignments || [];
    } catch (error) {
      console.error('Error fetching staff course assignments:', error);
      throw error;
    }
  }

  // Assign staff to course
  static async assignStaffToCourse(staffId: string, courseId: string, isPrimary = false): Promise<StaffCourseAssignment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: assignment, error } = await supabase
        .from('staff_course_assignments')
        .insert({
          staff_id: staffId,
          course_id: courseId,
          is_primary: isPrimary,
          assigned_by: user?.id
        })
        .select(`
          *,
          staff(id, first_name, last_name, role),
          course:courses(id, name, level, category)
        `)
        .single();

      if (error) throw new Error(error.message);
      
      return assignment;
    } catch (error) {
      console.error('Error assigning staff to course:', error);
      throw error;
    }
  }

  // Remove staff course assignment
  static async removeStaffCourseAssignment(assignmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('staff_course_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Error removing staff course assignment:', error);
      throw error;
    }
  }

  // Send portal invitation
  static async sendPortalInvitation(staffId: string): Promise<void> {
    try {
      const staff = await this.getStaffMember(staffId);
      if (!staff) throw new Error('Staff member not found');

      // Get school info for email
      const schoolId = await this.getCurrentSchoolId();
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .single();

      const { data: { user } } = await supabase.auth.getUser();
      const { data: inviter } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      // Generate secure invitation token  
      const { EmailService } = await import('../../../services/emailServiceClient');
      const token = EmailService.generateInvitationToken();
      
      // Create activation link
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'http://localhost:5174';
      const activationLink = `${baseUrl}/activate/staff/${token}`;
      
      // Update staff with invitation details
      const { error: updateError } = await supabase
        .from('staff')
        .update({
          invite_token: token,
          invite_sent_at: new Date().toISOString(),
          can_login: true,
          portal_access_enabled: false // Will be enabled after activation
        })
        .eq('id', staffId);

      if (updateError) throw updateError;

      // Send invitation email
      const inviterName = inviter ? `${inviter.first_name} ${inviter.last_name}` : 'School Administrator';
      
      try {
        await EmailService.sendStaffInvitation(staff.email, {
          staffName: staff.full_name,
          staffRole: staff.role.charAt(0).toUpperCase() + staff.role.slice(1),
          schoolName: school?.name || 'School',
          inviterName,
          activationLink,
          department: staff.department || undefined,
          startDate: staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : undefined
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        // Rollback the invitation if email failed
        await supabase
          .from('staff')
          .update({
            invite_token: null,
            invite_sent_at: null,
            can_login: false
          })
          .eq('id', staffId);
        
        throw new Error(`Failed to send invitation email: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
      }

      console.log(`✅ Staff portal invitation sent to ${staff.email}`);
    } catch (error) {
      console.error('Error sending portal invitation:', error);
      throw error;
    }
  }

  // Get staff by user ID (for staff portal)
  static async getStaffByUserId(userId: string): Promise<Staff> {
    try {
      // Use RPC function which bypasses RLS and includes school data
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_staff_with_school', { p_user_id: userId });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw new Error('Failed to fetch staff data');
      }

      if (!rpcData || rpcData.length === 0) {
        throw new Error('Staff member not found or portal access not enabled');
      }

      const staffData = rpcData[0];
      return {
        ...staffData,
        full_name: `${staffData.first_name} ${staffData.last_name}`,
        school: staffData.school_name ? {
          id: staffData.school_id,
          name: staffData.school_name,
          logo_url: staffData.school_logo_url,
          address: staffData.school_address,
          phone: staffData.school_phone,
          email: staffData.school_email
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching staff by user_id:', error);
      throw error;
    }
  }

  // Get staff statistics
  static async getStaffStats(): Promise<any> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: stats, error } = await supabase
        .from('staff')
        .select('role, status, employment_type')
        .eq('school_id', schoolId);

      if (error) throw new Error(error.message);
      
      const total = stats.length;
      const byRole = stats.reduce((acc: any, staff) => {
        acc[staff.role] = (acc[staff.role] || 0) + 1;
        return acc;
      }, {});
      
      const byStatus = stats.reduce((acc: any, staff) => {
        acc[staff.status] = (acc[staff.status] || 0) + 1;
        return acc;
      }, {});
      
      const byEmploymentType = stats.reduce((acc: any, staff) => {
        acc[staff.employment_type] = (acc[staff.employment_type] || 0) + 1;
        return acc;
      }, {});
      
      return {
        total,
        active: byStatus.active || 0,
        teachers: byRole.teacher || 0,
        managers: byRole.manager || 0,
        byRole,
        byStatus,
        byEmploymentType
      };
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      throw error;
    }
  }

  // Update staff availability
  static async updateStaffAvailability(staffId: string, availability: WeeklyAvailability): Promise<Staff> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: staff, error } = await supabase
        .from('staff')
        .update({
          availability,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffId)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      
      return this.enrichStaffData(staff);
    } catch (error) {
      console.error('Error updating staff availability:', error);
      throw error;
    }
  }

  // Get available staff for a specific time slot
  static async getAvailableStaff(dayOfWeek: string, startTime: string, endTime: string): Promise<Staff[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: allStaff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'active');

      if (error) throw new Error(error.message);
      
      // Filter staff who are available for the requested time slot
      const availableStaff = allStaff.filter(staff => {
        const availability = staff.availability as WeeklyAvailability;
        if (!availability || !availability[dayOfWeek]) return false;
        
        const dayAvailability = availability[dayOfWeek];
        if (!dayAvailability.available || !dayAvailability.slots) return false;
        
        // Check if any time slot covers the requested time
        return dayAvailability.slots.some(slot => 
          this.timeSlotOverlaps(slot, { start: startTime, end: endTime })
        );
      });
      
      return availableStaff.map(s => this.enrichStaffData(s));
    } catch (error) {
      console.error('Error getting available staff:', error);
      throw error;
    }
  }

  // Check if a staff member is available at a specific time
  static isStaffAvailable(availability: WeeklyAvailability, dayOfWeek: string, startTime: string, endTime: string): boolean {
    if (!availability || !availability[dayOfWeek]) return false;
    
    const dayAvailability = availability[dayOfWeek];
    if (!dayAvailability.available || !dayAvailability.slots) return false;
    
    return dayAvailability.slots.some(slot => 
      this.timeSlotCovers(slot, { start: startTime, end: endTime })
    );
  }

  // Check if two time slots overlap
  private static timeSlotOverlaps(slot1: TimeSlot, slot2: TimeSlot): boolean {
    const start1 = this.timeToMinutes(slot1.start);
    const end1 = this.timeToMinutes(slot1.end);
    const start2 = this.timeToMinutes(slot2.start);
    const end2 = this.timeToMinutes(slot2.end);
    
    return start1 < end2 && start2 < end1;
  }

  // Check if one time slot completely covers another
  private static timeSlotCovers(availableSlot: TimeSlot, requestedSlot: TimeSlot): boolean {
    const availStart = this.timeToMinutes(availableSlot.start);
    const availEnd = this.timeToMinutes(availableSlot.end);
    const reqStart = this.timeToMinutes(requestedSlot.start);
    const reqEnd = this.timeToMinutes(requestedSlot.end);
    
    return availStart <= reqStart && availEnd >= reqEnd;
  }

  // Convert time string to minutes for comparison
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get staff weekly schedule summary
  static getStaffScheduleSummary(availability: WeeklyAvailability): {
    totalHours: number;
    availableDays: number;
    busyDays: string[];
    longestDay: { day: string; hours: number } | null;
  } {
    let totalHours = 0;
    let availableDays = 0;
    const busyDays: string[] = [];
    let longestDay: { day: string; hours: number } | null = null;

    Object.entries(availability).forEach(([day, dayAvail]) => {
      if (dayAvail.available && dayAvail.slots && dayAvail.slots.length > 0) {
        availableDays++;
        busyDays.push(day);
        
        const dayHours = dayAvail.slots.reduce((total, slot) => {
          const start = this.timeToMinutes(slot.start);
          const end = this.timeToMinutes(slot.end);
          return total + (end - start) / 60;
        }, 0);
        
        totalHours += dayHours;
        
        if (!longestDay || dayHours > longestDay.hours) {
          longestDay = { day, hours: dayHours };
        }
      }
    });

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      availableDays,
      busyDays,
      longestDay
    };
  }

  // Enrich staff data with computed fields
  private static enrichStaffData(staff: any): Staff {
    return {
      ...staff,
      full_name: `${staff.first_name} ${staff.last_name}`
    };
  }
}

export default StaffService;