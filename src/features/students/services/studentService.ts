import { supabase } from '../../../lib/supabase';
import { EmailService } from '../../../services/emailServiceClient';
import { ActivityService } from '../../../services/activityService';
import type { Student, CreateStudentInput } from '../types/student.types';
import type { AdvancedFilterState } from '../components/AdvancedFilters';

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

  static async getStudents(search?: string, status?: string, advancedFilters?: AdvancedFilterState): Promise<Student[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('enrolled_at', { ascending: false });

      // Basic filters
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,student_code.ilike.%${search}%`);
      }

      // Advanced filters
      if (advancedFilters) {
        // Date filters
        if (advancedFilters.enrolledAfter) {
          query = query.gte('enrolled_at', advancedFilters.enrolledAfter);
        }
        if (advancedFilters.enrolledBefore) {
          query = query.lte('enrolled_at', advancedFilters.enrolledBefore);
        }
        if (advancedFilters.bornAfter) {
          query = query.gte('date_of_birth', advancedFilters.bornAfter);
        }
        if (advancedFilters.bornBefore) {
          query = query.lte('date_of_birth', advancedFilters.bornBefore);
        }

        // Demographic filters
        if (advancedFilters.countries && advancedFilters.countries.length > 0) {
          query = query.in('country', advancedFilters.countries);
        }
        if (advancedFilters.cities && advancedFilters.cities.length > 0) {
          query = query.in('city', advancedFilters.cities);
        }
        if (advancedFilters.skillLevels && advancedFilters.skillLevels.length > 0) {
          query = query.in('skill_level', advancedFilters.skillLevels);
        }

        // Contact filters (these will need client-side filtering for JSON fields)
        if (advancedFilters.hasEmail) {
          query = query.not('email', 'is', null);
        }
        if (advancedFilters.hasPhone) {
          query = query.not('phone', 'is', null);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching students:', error);
        throw new Error(error.message);
      }

      let students = data || [];

      // Client-side filtering for complex JSON field filters
      if (advancedFilters) {
        students = students.filter(student => {
          // Course interest filter
          if (advancedFilters.interestedCourses && advancedFilters.interestedCourses.length > 0) {
            const studentCourses = student.interested_courses || [];
            const hasMatchingCourse = advancedFilters.interestedCourses.some(course => 
              studentCourses.includes(course)
            );
            if (!hasMatchingCourse) return false;
          }

          // Social media filter
          if (advancedFilters.hasSocialMedia) {
            const socialMedia = student.social_media || {};
            const hasSocialMedia = Object.values(socialMedia).some(value => 
              value && value.toString().trim() !== ''
            );
            if (!hasSocialMedia) return false;
          }

          // Parent info filter
          if (advancedFilters.hasParentInfo) {
            const parentInfo = student.parent_info || {};
            const hasParentInfo = Object.values(parentInfo).some(value => 
              value && value.toString().trim() !== ''
            );
            if (!hasParentInfo) return false;
          }

          // Emergency contact filter
          if (advancedFilters.hasEmergencyContact) {
            const emergencyContact = student.emergency_contact || {};
            const hasEmergencyContact = emergencyContact.name && emergencyContact.phone;
            if (!hasEmergencyContact) return false;
          }

          // Medical info filter
          if (advancedFilters.hasMedicalInfo) {
            const medicalInfo = student.medical_info || {};
            const hasMedicalInfo = Object.values(medicalInfo).some(value => {
              if (Array.isArray(value)) return value.length > 0;
              return value && value.toString().trim() !== '';
            });
            if (!hasMedicalInfo) return false;
          }

          return true;
        });
      }

      return students;
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }

  // Helper methods for filter options
  static async getAvailableCities(): Promise<string[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('students')
        .select('city')
        .eq('school_id', schoolId)
        .not('city', 'is', null);

      if (error) {
        console.error('Error fetching cities:', error);
        return [];
      }

      const cities = [...new Set(data?.map(item => item.city).filter(city => city && city.trim() !== ''))];
      return cities.sort();
    } catch (error) {
      console.error('Error in getAvailableCities:', error);
      return [];
    }
  }

  static async getAvailableCourses(): Promise<string[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data, error } = await supabase
        .from('students')
        .select('interested_courses')
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error fetching courses:', error);
        return [];
      }

      const allCourses = new Set<string>();
      data?.forEach(student => {
        if (student.interested_courses && Array.isArray(student.interested_courses)) {
          student.interested_courses.forEach(course => {
            if (course && course.trim() !== '') {
              allCourses.add(course);
            }
          });
        }
      });

      return Array.from(allCourses).sort();
    } catch (error) {
      console.error('Error in getAvailableCourses:', error);
      return [];
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

      // Log activity
      await ActivityService.logActivity({
        action_type: 'student_added',
        entity_type: 'student',
        entity_id: data.id,
        entity_name: `${data.first_name} ${data.last_name}`,
        description: `added a new student: ${data.first_name} ${data.last_name}`
      });

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

      // Log activity
      await ActivityService.logActivity({
        action_type: 'student_updated',
        entity_type: 'student',
        entity_id: data.id,
        entity_name: `${data.first_name} ${data.last_name}`,
        description: `updated student: ${data.first_name} ${data.last_name}`
      });

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
      
      // Get student info before deleting for activity log
      const { data: student } = await supabase
        .from('students')
        .select('first_name, last_name')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();
      
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
        .eq('school_id', schoolId);

      if (error) {
        console.error('Error deleting student:', error);
        throw new Error(error.message);
      }

      // Log activity
      if (student) {
        await ActivityService.logActivity({
          action_type: 'student_deleted',
          entity_type: 'student',
          entity_id: id,
          entity_name: `${student.first_name} ${student.last_name}`,
          description: `deleted student: ${student.first_name} ${student.last_name}`
        });
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

  // Portal invitation methods
  static async inviteStudent(studentId: string): Promise<boolean> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*, schools!inner(name)')
        .eq('id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (studentError || !student) {
        throw new Error('Student not found');
      }

      if (!student.email) {
        throw new Error('Student email is required to send invitation');
      }

      // Get current user (inviter) details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Generate invitation token
      const inviteToken = EmailService.generateInvitationToken();
      // Generate token expiration (48 hours from now)
      EmailService.getTokenExpiration(48); // 48 hours

      // Update student record with invitation details
      const { error: updateError } = await supabase
        .from('students')
        .update({
          invite_token: inviteToken,
          invite_sent_at: new Date().toISOString(),
          can_login: true
        })
        .eq('id', studentId)
        .eq('school_id', schoolId);

      if (updateError) {
        throw new Error('Failed to update student invitation status');
      }

      // Send invitation email
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const activationLink = `${baseUrl}/activate/student/${inviteToken}`;
      const schoolName = (student.schools as any).name;
      
      try {
        await EmailService.sendStudentInvitation(student.email, {
          studentName: `${student.first_name} ${student.last_name}`,
          schoolName: schoolName,
          inviterName: user.user_metadata?.full_name || 'School Administrator',
          activationLink,
          expiresIn: '48 hours'
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        // Rollback invitation if email fails
        await supabase
          .from('students')
          .update({
            invite_token: null,
            invite_sent_at: null,
            can_login: false
          })
          .eq('id', studentId);
        
        throw new Error(`Failed to send invitation email: ${emailError instanceof Error ? emailError.message : String(emailError)}`);
      }

      return true;
    } catch (error) {
      console.error('Error inviting student:', error);
      throw error;
    }
  }

  static async resendInvitation(studentId: string): Promise<boolean> {
    // Simply call inviteStudent again - it will generate a new token
    return this.inviteStudent(studentId);
  }

  static async getStudentByToken(token: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('invite_token', token)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if token is expired (48 hours)
      if (data.invite_sent_at) {
        const sentAt = new Date(data.invite_sent_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 48) {
          return null; // Token expired
        }
      }

      return data;
    } catch (error) {
      console.error('Error getting student by token:', error);
      return null;
    }
  }

  static async activateStudentAccount(
    token: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get student by token
      const student = await this.getStudentByToken(token);
      if (!student) {
        return { success: false, error: 'Invalid or expired invitation token' };
      }

      if (!student.email) {
        return { success: false, error: 'Student email not found' };
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: student.email,
        password,
        options: {
          data: {
            student_id: student.id,
            full_name: `${student.first_name} ${student.last_name}`,
            role: 'student'
          }
        }
      });

      if (signUpError || !authData.user) {
        return { success: false, error: signUpError?.message || 'Failed to create account' };
      }

      // Update student record
      const { error: updateError } = await supabase
        .from('students')
        .update({
          user_id: authData.user.id,
          invite_token: null, // Clear the token
          account_created_at: new Date().toISOString()
        })
        .eq('id', student.id);

      if (updateError) {
        // TODO: Consider cleanup of auth user if this fails
        return { success: false, error: 'Failed to link account' };
      }

      // Get school name for welcome email
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', student.school_id)
        .single();

      // Send welcome email
      if (school) {
        await EmailService.sendWelcomeEmail(
          student.email,
          `${student.first_name} ${student.last_name}`,
          school.name,
          'student'
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error activating student account:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async revokePortalAccess(studentId: string): Promise<void> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Get student to check if they have a user_id
      const { error: fetchError } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (fetchError) {
        throw new Error('Student not found');
      }

      // Update student record
      const { error: updateError } = await supabase
        .from('students')
        .update({
          can_login: false,
          invite_token: null,
          invite_sent_at: null
        })
        .eq('id', studentId)
        .eq('school_id', schoolId);

      if (updateError) {
        throw new Error('Failed to revoke portal access');
      }

      // If student has an auth account, we might want to disable it
      // For now, we just prevent login via can_login flag
    } catch (error) {
      console.error('Error revoking portal access:', error);
      throw error;
    }
  }
}