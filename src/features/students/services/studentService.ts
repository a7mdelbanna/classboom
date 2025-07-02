import { supabase } from '../../../lib/supabase';
import type { Student, CreateStudentInput } from '../types/student.types';

export class StudentService {
  // Helper to get current user's school ID
  static async getCurrentSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Try to get school_id from user metadata first (might not be there for new users)
    let schoolId = user.user_metadata?.school_id;
    
    if (!schoolId) {
      // Primary method: get from schools table
      const { data: schools, error } = await supabase
        .from('schools')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      
      if (error || !schools) {
        // Last resort: check if user has school_name and create school
        const schoolName = user.user_metadata?.school_name;
        if (schoolName) {
          console.log('Creating missing school for user...');
          try {
            const { data: newSchool, error: createError } = await supabase
              .from('schools')
              .insert({
                name: schoolName,
                owner_id: user.id,
                subscription_plan: 'trial',
                subscription_status: 'active',
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              })
              .select('id')
              .single();
            
            if (createError || !newSchool) {
              throw new Error(`Failed to create school: ${createError?.message || 'Unknown error'}`);
            }
            
            schoolId = newSchool.id;
            console.log('Successfully created school:', schoolId);
          } catch (createErr) {
            console.error('Error creating school:', createErr);
            throw new Error('No school found for user and failed to create one');
          }
        } else {
          throw new Error('No school found for user');
        }
      } else {
        schoolId = schools.id;
      }
    }
    
    return schoolId;
  }

  static async getStudents(search?: string, status?: string): Promise<Student[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('enrolled_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,student_code.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching students:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }

  static async getStudent(id: string): Promise<Student> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        console.error('Error fetching student:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Student not found');
      }

      return data;
    } catch (error) {
      console.error('Error in getStudent:', error);
      throw error;
    }
  }

  static async createStudent(studentData: CreateStudentInput): Promise<Student> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Generate student code if not provided
      let studentCode = studentData.student_code;
      if (!studentCode) {
        // Get school name for prefix
        const { data: school } = await supabase
          .from('schools')
          .select('name')
          .eq('id', schoolId)
          .single();
        
        const prefix = school?.name?.substring(0, 3).toUpperCase() || 'STU';
        const timestamp = Date.now().toString().slice(-6);
        studentCode = `${prefix}${timestamp}`;
      }

      const newStudent = {
        ...studentData,
        school_id: schoolId,
        student_code: studentCode
      };

      const { data, error } = await supabase
        .from('students')
        .insert(newStudent)
        .select()
        .single();

      if (error) {
        console.error('Error creating student:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Failed to create student');
      }

      return data;
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  static async updateStudent(id: string, updates: Partial<CreateStudentInput>): Promise<Student> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Student not found or update failed');
      }

      return data;
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  }

  static async updateStudentStatus(id: string, status: Student['status']): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { error } = await supabase
        .from('students')
        .update({ status })
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error updating student status:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in updateStudentStatus:', error);
      throw error;
    }
  }

  static async deleteStudent(id: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error deleting student:', error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      throw error;
    }
  }

  static async getStudentCount(): Promise<number> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error getting student count:', error);
        throw new Error(error.message);
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getStudentCount:', error);
      return 0; // Return 0 on error to prevent dashboard crashes
    }
  }
}