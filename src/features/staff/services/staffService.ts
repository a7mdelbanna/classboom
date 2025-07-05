import { supabase } from '../../../lib/supabase';
import type { Staff, StaffFormData, StaffFilters, StaffCourseAssignment, Payroll, PayrollFilters } from '../types/staff.types';

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
          created_by: user?.id
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
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      
      return this.enrichStaffData(staff);
    } catch (error) {
      console.error('Error fetching staff member:', error);
      return null;
    }
  }

  // Get staff member by user ID (for portal access)
  static async getStaffByUserId(userId: string): Promise<Staff | null> {
    try {
      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .eq('portal_access_enabled', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      
      return this.enrichStaffData(staff);
    } catch (error) {
      console.error('Error fetching staff by user ID:', error);
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
      const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';
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

  // Get payroll records
  static async getPayrollRecords(filters?: PayrollFilters): Promise<Payroll[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('payroll')
        .select(`
          *,
          staff(
            id,
            first_name,
            last_name,
            staff_code,
            role
          )
        `)
        .eq('school_id', schoolId)
        .order('period_start', { ascending: false });
      
      // Apply filters
      if (filters?.staff_id) {
        query = query.eq('staff_id', filters.staff_id);
      }
      if (filters?.status) {
        query = query.eq('payment_status', filters.status);
      }
      if (filters?.period_start) {
        query = query.gte('period_start', filters.period_start);
      }
      if (filters?.period_end) {
        query = query.lte('period_end', filters.period_end);
      }

      const { data: payroll, error } = await query;

      if (error) throw new Error(error.message);
      
      return payroll || [];
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      throw error;
    }
  }

  // Calculate payroll for staff member
  static async calculatePayroll(staffId: string, periodStart: string, periodEnd: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('calculate_staff_payroll', {
        p_staff_id: staffId,
        p_period_start: periodStart,
        p_period_end: periodEnd
      });

      if (error) throw new Error(error.message);
      
      return data;
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw error;
    }
  }

  // Create payroll record
  static async createPayroll(staffId: string, periodStart: string, periodEnd: string): Promise<Payroll> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate payroll details
      const calculation = await this.calculatePayroll(staffId, periodStart, periodEnd);
      
      const { data: payroll, error } = await supabase
        .from('payroll')
        .insert({
          school_id: schoolId,
          staff_id: staffId,
          period_start: periodStart,
          period_end: periodEnd,
          base_amount: calculation.base_amount,
          hours_worked: calculation.hours_worked,
          sessions_taught: calculation.sessions_count,
          gross_amount: calculation.gross_amount,
          net_amount: calculation.net_amount,
          currency: calculation.currency,
          calculation_details: calculation,
          submitted_by: user?.id
        })
        .select(`
          *,
          staff(
            id,
            first_name,
            last_name,
            staff_code,
            role
          )
        `)
        .single();

      if (error) throw new Error(error.message);
      
      return payroll;
    } catch (error) {
      console.error('Error creating payroll:', error);
      throw error;
    }
  }

  // Update payroll status
  static async updatePayrollStatus(payrollId: string, status: string, paymentDetails?: any): Promise<Payroll> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const { data: { user } } = await supabase.auth.getUser();
      
      const updates: any = {
        payment_status: status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
        updates.approved_by = user?.id;
      } else if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
        updates.paid_by = user?.id;
        if (paymentDetails) {
          updates.payment_date = paymentDetails.payment_date;
          updates.payment_method = paymentDetails.payment_method;
          updates.payment_reference = paymentDetails.payment_reference;
          updates.payment_account_id = paymentDetails.payment_account_id;
        }
      }
      
      const { data: payroll, error } = await supabase
        .from('payroll')
        .update(updates)
        .eq('id', payrollId)
        .eq('school_id', schoolId)
        .select(`
          *,
          staff(
            id,
            first_name,
            last_name,
            staff_code,
            role
          )
        `)
        .single();

      if (error) throw new Error(error.message);
      
      return payroll;
    } catch (error) {
      console.error('Error updating payroll status:', error);
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

  // Enrich staff data with computed fields
  private static enrichStaffData(staff: any): Staff {
    return {
      ...staff,
      full_name: `${staff.first_name} ${staff.last_name}`
    };
  }
}

export default StaffService;