import { supabase } from '../../../lib/supabase';
import type { PricingModel } from '../../../types/institution.types';

export type EnrollmentStatus = 'active' | 'pending' | 'completed' | 'cancelled' | 'suspended';
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'refunded';

export interface Enrollment {
  id: string;
  school_id: string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  start_date: string;
  end_date?: string;
  status: EnrollmentStatus;
  pricing_model: PricingModel;
  price_amount: number;
  currency: string;
  total_sessions?: number;
  sessions_used: number;
  sessions_remaining?: number;
  payment_status: PaymentStatus;
  total_paid: number;
  balance_due: number;
  next_payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Joined data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
  };
  course?: {
    id: string;
    name: string;
    category?: string;
    level?: string;
  };
}

export interface EnrollmentFormData {
  student_id: string;
  course_id: string;
  start_date: string;
  end_date?: string;
  status?: EnrollmentStatus;
  pricing_model: PricingModel;
  price_amount: number;
  currency?: string;
  total_sessions?: number;
  payment_status?: PaymentStatus;
  notes?: string;
}

export interface EnrollmentFilters {
  student_id?: string;
  course_id?: string;
  status?: EnrollmentStatus;
  payment_status?: PaymentStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export class EnrollmentService {
  // Get current user's school ID
  static async getCurrentSchoolId(): Promise<string> {
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

  // Create a new enrollment
  static async createEnrollment(data: EnrollmentFormData): Promise<Enrollment> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate next payment date for recurring subscriptions
      let nextPaymentDate: string | null = null;
      if (['monthly', 'quarterly', 'semester', 'annual'].includes(data.pricing_model)) {
        const { data: dateResult } = await supabase.rpc('calculate_next_payment_date', {
          p_pricing_model: data.pricing_model,
          p_start_date: data.start_date
        });
        nextPaymentDate = dateResult;
      }

      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .insert({
          school_id: schoolId,
          student_id: data.student_id,
          course_id: data.course_id,
          enrollment_date: new Date().toISOString().split('T')[0],
          start_date: data.start_date,
          end_date: data.end_date && data.end_date !== '' ? data.end_date : null,
          status: data.status || 'pending',
          pricing_model: data.pricing_model,
          price_amount: data.price_amount,
          currency: data.currency || 'USD',
          total_sessions: data.total_sessions || null,
          payment_status: data.payment_status || 'pending',
          next_payment_date: nextPaymentDate || null,
          notes: data.notes || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return enrollment;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  }

  // Get enrollments with filters
  static async getEnrollments(filters?: EnrollmentFilters): Promise<Enrollment[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('enrollments')
        .select(`
          *,
          student:students!inner(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          ),
          course:courses!inner(
            id,
            name,
            category,
            level
          )
        `)
        .eq('school_id', schoolId);

      // Apply filters
      if (filters?.student_id) {
        query = query.eq('student_id', filters.student_id);
      }
      if (filters?.course_id) {
        query = query.eq('course_id', filters.course_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      if (filters?.date_from) {
        query = query.gte('start_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('start_date', filters.date_to);
      }
      if (filters?.search) {
        query = query.or(`
          student.first_name.ilike.%${filters.search}%,
          student.last_name.ilike.%${filters.search}%,
          course.name.ilike.%${filters.search}%
        `);
      }

      const { data: enrollments, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return enrollments || [];
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  }

  // Get single enrollment
  static async getEnrollment(id: string): Promise<Enrollment | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          student:students!inner(
            id,
            first_name,
            last_name,
            email,
            avatar_url
          ),
          course:courses!inner(
            id,
            name,
            category,
            level
          )
        `)
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        console.error('Error fetching enrollment:', error);
        return null;
      }

      return enrollment;
    } catch (error) {
      console.error('Error getting enrollment:', error);
      return null;
    }
  }

  // Update enrollment
  static async updateEnrollment(id: string, updates: Partial<EnrollmentFormData>): Promise<Enrollment> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // If pricing model is changing to recurring, calculate next payment date
      let nextPaymentDate = undefined;
      if (updates.pricing_model && ['monthly', 'quarterly', 'semester', 'annual'].includes(updates.pricing_model)) {
        const enrollment = await this.getEnrollment(id);
        if (enrollment) {
          const { data: dateResult } = await supabase.rpc('calculate_next_payment_date', {
            p_pricing_model: updates.pricing_model,
            p_start_date: updates.start_date || enrollment.start_date
          });
          nextPaymentDate = dateResult;
        }
      }

      // Clean up the update data - convert empty strings to null for date fields
      const updateData: any = { ...updates };
      if (updateData.end_date === '') {
        updateData.end_date = null;
      }
      if (updateData.total_sessions === '') {
        updateData.total_sessions = null;
      }
      if (updateData.notes === '') {
        updateData.notes = null;
      }
      if (nextPaymentDate !== undefined) {
        updateData.next_payment_date = nextPaymentDate;
      }

      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return enrollment;
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  }

  // Delete enrollment
  static async deleteEnrollment(id: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      throw error;
    }
  }

  // Update session count (for package pricing)
  static async updateSessionCount(id: string, sessionsToAdd: number): Promise<Enrollment> {
    try {
      const enrollment = await this.getEnrollment(id);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      if (enrollment.pricing_model !== 'package') {
        throw new Error('Session tracking only available for package pricing');
      }

      const newSessionsUsed = enrollment.sessions_used + sessionsToAdd;
      
      if (enrollment.total_sessions && newSessionsUsed > enrollment.total_sessions) {
        throw new Error('Cannot exceed total sessions in package');
      }

      return await this.updateEnrollment(id, {
        sessions_used: newSessionsUsed
      });
    } catch (error) {
      console.error('Error updating session count:', error);
      throw error;
    }
  }

  // Record payment
  static async recordPayment(id: string, amount: number): Promise<Enrollment> {
    try {
      const enrollment = await this.getEnrollment(id);
      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const newTotalPaid = enrollment.total_paid + amount;
      const newPaymentStatus: PaymentStatus = 
        newTotalPaid >= enrollment.price_amount ? 'paid' :
        newTotalPaid > 0 ? 'partial' : 'pending';

      // Calculate next payment date for recurring subscriptions
      let updates: any = {
        total_paid: newTotalPaid,
        payment_status: newPaymentStatus
      };

      if (['monthly', 'quarterly', 'semester', 'annual'].includes(enrollment.pricing_model) && 
          newPaymentStatus === 'paid') {
        const { data: dateResult } = await supabase.rpc('calculate_next_payment_date', {
          p_pricing_model: enrollment.pricing_model,
          p_start_date: enrollment.start_date,
          p_last_payment_date: new Date().toISOString().split('T')[0]
        });
        updates.next_payment_date = dateResult;
      }

      return await this.updateEnrollment(id, updates);
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }

  // Get enrollments for a specific student
  static async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    return this.getEnrollments({ student_id: studentId });
  }

  // Get enrollments for a specific course
  static async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    return this.getEnrollments({ course_id: courseId });
  }

  // Get enrollment statistics
  static async getEnrollmentStats() {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('status, payment_status, pricing_model')
        .eq('school_id', schoolId);

      if (error) {
        throw new Error(error.message);
      }

      const stats = {
        total: data?.length || 0,
        byStatus: {} as Record<EnrollmentStatus, number>,
        byPaymentStatus: {} as Record<PaymentStatus, number>,
        byPricingModel: {} as Record<PricingModel, number>
      };

      data?.forEach(enrollment => {
        // Count by status
        stats.byStatus[enrollment.status] = (stats.byStatus[enrollment.status] || 0) + 1;
        
        // Count by payment status
        stats.byPaymentStatus[enrollment.payment_status] = 
          (stats.byPaymentStatus[enrollment.payment_status] || 0) + 1;
        
        // Count by pricing model
        stats.byPricingModel[enrollment.pricing_model as PricingModel] = 
          (stats.byPricingModel[enrollment.pricing_model as PricingModel] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting enrollment stats:', error);
      return {
        total: 0,
        byStatus: {},
        byPaymentStatus: {},
        byPricingModel: {}
      };
    }
  }
}