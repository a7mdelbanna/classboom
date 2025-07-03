import { supabase } from '../../../lib/supabase';
import type { Student, CreateStudentInput } from '../types/student.types';

export class StudentService {
  // Helper to get current user's school ID
  static async getCurrentSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // CRITICAL FIX: Always get the OLDEST school to prevent duplicates
    // Order by created_at ASC to get the first school created
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, created_at, name')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (error) {
      console.error('Error fetching school:', error);
      throw new Error(`Failed to fetch school: ${error.message}`);
    }
    
    if (!schools || schools.length === 0) {
      // Only create if truly no schools exist
      const schoolName = user.user_metadata?.school_name || 'My School';
      console.log('No schools found, creating first school for user...');
      
      try {
        const { data: newSchool, error: createError } = await supabase
          .from('schools')
          .insert({
            name: schoolName,
            owner_id: user.id,
            subscription_plan: 'trial',
            subscription_status: 'active',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            settings: user.user_metadata?.school_settings || {}
          })
          .select('id')
          .single();
        
        if (createError) {
          // Check if it's a unique constraint violation (school already exists)
          if (createError.code === '23505') {
            console.log('School was created by another request, fetching it now...');
            // Try to fetch the school again
            const { data: existingSchools, error: refetchError } = await supabase
              .from('schools')
              .select('id, created_at, name')
              .eq('owner_id', user.id)
              .order('created_at', { ascending: true })
              .limit(1);
            
            if (!refetchError && existingSchools && existingSchools.length > 0) {
              console.log('Found existing school after race condition:', existingSchools[0].id);
              return existingSchools[0].id;
            }
          }
          throw new Error(`Failed to create school: ${createError.message}`);
        }
        
        if (!newSchool) {
          throw new Error('Failed to create school: No data returned');
        }
        
        console.log('Successfully created first school:', newSchool.id);
        return newSchool.id;
      } catch (createErr) {
        console.error('Error creating school:', createErr);
        throw new Error('No school found for user and failed to create one');
      }
    }
    
    // Always return the oldest school
    const schoolId = schools[0].id;
    console.log('Using existing school:', schoolId, schools[0].name);
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
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,student_code.ilike.%${search}%`);
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

      // Build full name from first_name and last_name
      const fullName = `${studentData.first_name} ${studentData.last_name}`.trim();

      // Clean up empty strings for optional fields
      const cleanedData = {
        school_id: schoolId,
        student_code: studentCode,
        full_name: fullName,
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        email: studentData.email || null,
        phone: studentData.phone || null,
        date_of_birth: studentData.date_of_birth || null,
        city: studentData.city || null,
        country: studentData.country || null,
        skill_level: studentData.skill_level || null,
        notes: studentData.notes || null,
        interested_courses: studentData.interested_courses || [],
        social_media: studentData.social_media || {},
        communication_preferences: studentData.communication_preferences || {},
        emergency_contact: studentData.emergency_contact || null,
        medical_info: studentData.medical_info || {},
        parent_info: studentData.parent_info || {}
      };

      const { data, error } = await supabase
        .from('students')
        .insert(cleanedData)
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
      
      // Build full name if first_name or last_name is updated
      let fullName: string | undefined;
      if (updates.first_name || updates.last_name) {
        const { data: currentStudent } = await supabase
          .from('students')
          .select('first_name, last_name')
          .eq('id', id)
          .single();
        
        const firstName = updates.first_name || currentStudent?.first_name || '';
        const lastName = updates.last_name || currentStudent?.last_name || '';
        fullName = `${firstName} ${lastName}`.trim();
      }
      
      // Clean up empty strings for optional fields
      const cleanedUpdates: any = {
        ...updates,
        date_of_birth: updates.date_of_birth === '' ? null : updates.date_of_birth,
        city: updates.city === '' ? null : updates.city,
        country: updates.country === '' ? null : updates.country,
        skill_level: updates.skill_level === '' ? null : updates.skill_level,
        notes: updates.notes === '' ? null : updates.notes
      };
      
      if (fullName) {
        cleanedUpdates.full_name = fullName;
      }
      
      const { data, error } = await supabase
        .from('students')
        .update(cleanedUpdates)
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