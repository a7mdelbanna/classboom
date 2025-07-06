import { supabase } from '../../../lib/supabase';
import type { Payroll, PayrollFilters, PayrollFormData, PayrollCalculation, PayrollSummary } from '../types/payroll.types';
import type { MinimalStaffInfo } from '../../../types/shared.types';

export class PayrollService {
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

  // Get payroll records with staff info joined
  static async getPayrollRecords(filters?: PayrollFilters): Promise<Payroll[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('payroll')
        .select(`
          *,
          staff:staff_id (
            id,
            first_name,
            last_name,
            staff_code,
            email,
            role,
            department,
            employment_type,
            compensation_model,
            base_salary,
            hourly_rate,
            session_rate,
            currency
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
      if (filters?.search) {
        // Can't search staff names directly with this approach
        // Would need to implement client-side filtering or use RPC
      }

      const { data: payroll, error } = await query;

      if (error) throw new Error(error.message);
      
      return payroll || [];
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      throw error;
    }
  }

  // Get single payroll record
  static async getPayrollRecord(id: string): Promise<Payroll | null> {
    try {
      const { data: payroll, error } = await supabase
        .from('payroll')
        .select(`
          *,
          staff:staff_id (
            id,
            first_name,
            last_name,
            staff_code,
            email,
            role,
            department,
            employment_type,
            compensation_model,
            base_salary,
            hourly_rate,
            session_rate,
            currency
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      
      return payroll;
    } catch (error) {
      console.error('Error fetching payroll record:', error);
      return null;
    }
  }

  // Calculate payroll for staff member
  static async calculatePayroll(staffId: string, periodStart: string, periodEnd: string): Promise<PayrollCalculation> {
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

  // Generate payroll for multiple staff
  static async generatePayroll(data: PayrollFormData): Promise<Payroll[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate payroll for each staff member
      const calculations = await Promise.all(
        data.staff_ids.map(staffId =>
          this.calculatePayroll(staffId, data.period_start, data.period_end)
        )
      );
      
      // Create payroll records
      const payrollRecords = calculations.map((calc, index) => ({
        school_id: schoolId,
        staff_id: data.staff_ids[index],
        period_start: data.period_start,
        period_end: data.period_end,
        base_amount: calc.base_amount,
        hours_worked: calc.hours_worked || null,
        sessions_taught: calc.sessions_count || null,
        overtime_hours: calc.overtime_hours || null,
        overtime_amount: calc.overtime_amount || null,
        bonuses: calc.bonuses || null,
        deductions: calc.deductions || null,
        gross_amount: calc.gross_amount,
        net_amount: calc.net_amount,
        currency: calc.currency,
        calculation_details: calc.details || null,
        notes: data.notes || null,
        payment_status: 'pending',
        submitted_by: user?.id,
        submitted_at: new Date().toISOString()
      }));

      const { data: created, error } = await supabase
        .from('payroll')
        .insert(payrollRecords)
        .select(`
          *,
          staff:staff_id (
            id,
            first_name,
            last_name,
            staff_code,
            email,
            role,
            department,
            employment_type,
            compensation_model,
            base_salary,
            hourly_rate,
            session_rate,
            currency
          )
        `);

      if (error) throw new Error(error.message);
      
      return created || [];
    } catch (error) {
      console.error('Error generating payroll:', error);
      throw error;
    }
  }

  // Update payroll status
  static async updatePayrollStatus(
    payrollId: string, 
    status: Payroll['payment_status'], 
    paymentDetails?: {
      payment_date?: string;
      payment_method?: string;
      payment_reference?: string;
      payment_account_id?: string;
    }
  ): Promise<Payroll> {
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
          staff:staff_id (
            id,
            first_name,
            last_name,
            staff_code,
            email,
            role,
            department,
            employment_type,
            compensation_model,
            base_salary,
            hourly_rate,
            session_rate,
            currency
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

  // Delete payroll record
  static async deletePayroll(id: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { error } = await supabase
        .from('payroll')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('Error deleting payroll:', error);
      throw error;
    }
  }

  // Get payroll summary statistics
  static async getPayrollSummary(filters?: PayrollFilters): Promise<PayrollSummary> {
    try {
      const records = await this.getPayrollRecords(filters);
      
      const summary: PayrollSummary = {
        total_records: records.length,
        total_amount: 0,
        by_status: {
          pending: 0,
          approved: 0,
          processing: 0,
          paid: 0,
          cancelled: 0
        },
        by_department: {},
        average_amount: 0,
        currency: 'USD'
      };

      records.forEach(record => {
        summary.total_amount += record.net_amount;
        summary.by_status[record.payment_status]++;
        
        if (record.staff?.department) {
          summary.by_department[record.staff.department] = 
            (summary.by_department[record.staff.department] || 0) + 1;
        }
        
        if (record.currency) {
          summary.currency = record.currency;
        }
      });

      summary.average_amount = records.length > 0 
        ? summary.total_amount / records.length 
        : 0;

      return summary;
    } catch (error) {
      console.error('Error fetching payroll summary:', error);
      throw error;
    }
  }

  // Get staff eligible for payroll
  static async getEligibleStaff(periodStart: string, periodEnd: string): Promise<MinimalStaffInfo[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Get all active staff who don't already have payroll for this period
      const { data: staff, error } = await supabase
        .from('staff')
        .select(`
          id,
          first_name,
          last_name,
          staff_code,
          email,
          role,
          department,
          employment_type,
          compensation_model,
          base_salary,
          hourly_rate,
          session_rate,
          currency
        `)
        .eq('school_id', schoolId)
        .eq('status', 'active')
        .not('compensation_model', 'eq', 'volunteer');

      if (error) throw new Error(error.message);

      // Filter out staff who already have payroll for this period
      const { data: existingPayroll } = await supabase
        .from('payroll')
        .select('staff_id')
        .eq('school_id', schoolId)
        .eq('period_start', periodStart)
        .eq('period_end', periodEnd);

      const existingStaffIds = new Set(existingPayroll?.map(p => p.staff_id) || []);
      
      return (staff || []).filter(s => !existingStaffIds.has(s.id));
    } catch (error) {
      console.error('Error fetching eligible staff:', error);
      throw error;
    }
  }
}

export default PayrollService;