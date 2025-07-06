import { supabase } from '../../../lib/supabase';
import type { Student, StudentFilters, StudentFormData } from '../types/student.types';
import { EmailService } from '../../../services/emailServiceClient';
import { ActivityService } from '../../../services/activityService';

export class StudentService {
  private static async getCurrentSchoolId(): Promise<string> {
    console.log('Getting current school ID...');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('Not authenticated');
    }

    console.log('Current user:', user.id);

    // Use the OLDEST school ID to avoid race conditions
    const { data: school, error } = await supabase
      .from('schools')
      .select('id')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !school) {
      console.error('Error getting school:', error);
      
      // Create a new school if none exists
      console.log('No school found, creating new school...');
      const { data: newSchool, error: createError } = await supabase
        .from('schools')
        .insert({
          name: user.user_metadata?.school_name || 'My School',
          owner_id: user.id,
          subscription_plan: 'trial',
          subscription_status: 'active',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (createError) {
        // Check if it's a unique constraint violation (another request created it)
        if (createError.code === '23505') {
          console.log('School was created by another request, fetching it...');
          // Try to fetch again
          const { data: existingSchool, error: fetchError } = await supabase
            .from('schools')
            .select('id')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

          if (fetchError || !existingSchool) {
            throw new Error('Failed to get or create school');
          }
          
          console.log('Using existing school:', existingSchool.id);
          return existingSchool.id;
        }
        
        console.error('Failed to create school:', createError);
        throw new Error('Failed to create school');
      }

      console.log('Created new school:', newSchool.id);
      return newSchool.id;
    }

    console.log('Using existing school:', school.id);
    return school.id;
  }

  static async createStudent(data: StudentFormData): Promise<Student> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Get the next student code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_student_code', { 
        p_school_id: schoolId 
      });
      
      if (codeError) {
        console.error('Error generating student code:', codeError);
        throw new Error('Failed to generate student code');
      }

      const studentCode = codeData;
      
      // Build emergency contact JSONB object
      const emergencyContact = {};
      if (data.emergency_contact_name) emergencyContact.name = data.emergency_contact_name;
      if (data.emergency_contact_phone) emergencyContact.phone = data.emergency_contact_phone;
      if (data.emergency_contact_relationship) emergencyContact.relationship = data.emergency_contact_relationship;

      // Build parent info JSONB object
      const parentInfo = {};
      if (data.parent_name) parentInfo.name = data.parent_name;
      if (data.parent_email) parentInfo.email = data.parent_email;
      if (data.parent_phone) parentInfo.phone = data.parent_phone;

      const { data: student, error } = await supabase
        .from('students')
        .insert({
          school_id: schoolId,
          student_code: studentCode,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || null,
          phone: data.phone || null,
          date_of_birth: data.date_of_birth || null,
          grade: data.grade || null,
          skill_level: data.skill_level || null,
          country: data.country || null,
          city: data.city || null,
          notes: data.notes || null,
          emergency_contact: Object.keys(emergencyContact).length > 0 ? emergencyContact : {},
          parent_info: Object.keys(parentInfo).length > 0 ? parentInfo : {},
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating student:', error);
        throw new Error(error.message);
      }

      // Log activity
      await ActivityService.logActivity({
        action_type: 'student_added',
        entity_type: 'student',
        entity_id: student.id,
        entity_name: `${student.first_name} ${student.last_name}`,
        description: `added new student: ${student.first_name} ${student.last_name}`
      });

      return student;
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  static async getStudents(filters?: StudentFilters): Promise<Student[]> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      let query = supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,student_code.ilike.%${filters.search}%`);
      }

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply skill level filter
      if (filters?.skill_level) {
        query = query.eq('skill_level', filters.skill_level);
      }

      // Apply grade filter
      if (filters?.grade) {
        query = query.eq('grade', filters.grade);
      }

      // Apply gender filter
      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }

      // Apply age range filter
      if (filters?.ageRange) {
        const today = new Date();
        const [minAge, maxAge] = filters.ageRange;
        
        const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        const minDate = new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate());
        
        query = query.gte('date_of_birth', minDate.toISOString().split('T')[0])
                     .lte('date_of_birth', maxDate.toISOString().split('T')[0]);
      }

      // Apply date range filters
      if (filters?.createdAfter) {
        query = query.gte('created_at', filters.createdAfter);
      }
      if (filters?.createdBefore) {
        query = query.lte('created_at', filters.createdBefore);
      }

      // Apply country filter
      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      // Apply city filter
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      // Apply has email filter
      if (filters?.hasEmail !== undefined) {
        if (filters.hasEmail) {
          query = query.not('email', 'is', null);
        } else {
          query = query.is('email', null);
        }
      }

      // Apply has phone filter
      if (filters?.hasPhone !== undefined) {
        if (filters.hasPhone) {
          query = query.not('phone', 'is', null);
        } else {
          query = query.is('phone', null);
        }
      }

      // Apply parent email filter
      if (filters?.hasParentEmail !== undefined) {
        if (filters.hasParentEmail) {
          query = query.not('parent_email', 'is', null);
        } else {
          query = query.is('parent_email', null);
        }
      }

      // Apply parent phone filter
      if (filters?.hasParentPhone !== undefined) {
        if (filters.hasParentPhone) {
          query = query.not('parent_phone', 'is', null);
        } else {
          query = query.is('parent_phone', null);
        }
      }

      // Apply emergency contact filter
      if (filters?.hasEmergencyContact !== undefined) {
        if (filters.hasEmergencyContact) {
          query = query.not('emergency_contact_name', 'is', null);
        } else {
          query = query.is('emergency_contact_name', null);
        }
      }

      // Apply medical info filter
      if (filters?.hasMedicalInfo !== undefined) {
        if (filters.hasMedicalInfo) {
          query = query.not('medical_info', 'is', null);
        } else {
          query = query.is('medical_info', null);
        }
      }

      // Apply portal access filter
      if (filters?.hasPortalAccess !== undefined) {
        if (filters.hasPortalAccess) {
          query = query.eq('can_login', true).not('user_id', 'is', null);
        } else {
          query = query.or('can_login.eq.false,user_id.is.null');
        }
      }

      // Apply tag filter (using exact match for now)
      if (filters?.tags && filters.tags.length > 0) {
        // For now, we'll check if any tag matches in the notes field
        const tagQuery = filters.tags.map(tag => `notes.ilike.%${tag}%`).join(',');
        query = query.or(tagQuery);
      }

      const { data: students, error } = await query;

      if (error) {
        console.error('Error fetching students:', error);
        throw new Error(error.message);
      }

      return students || [];
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }

  static async getStudent(id: string): Promise<Student | null> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('school_id', schoolId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching student:', error);
        throw new Error(error.message);
      }

      return student;
    } catch (error) {
      console.error('Error in getStudent:', error);
      throw error;
    }
  }

  static async updateStudent(id: string, data: Partial<StudentFormData>): Promise<Student> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Build emergency contact JSONB object for update
      const updateData: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        grade: data.grade || null,
        skill_level: data.skill_level || null,
        country: data.country || null,
        city: data.city || null,
        notes: data.notes || null
      };

      // Build emergency contact JSONB if provided
      if (data.emergency_contact_name || data.emergency_contact_phone || data.emergency_contact_relationship) {
        const emergencyContact: any = {};
        if (data.emergency_contact_name) emergencyContact.name = data.emergency_contact_name;
        if (data.emergency_contact_phone) emergencyContact.phone = data.emergency_contact_phone;
        if (data.emergency_contact_relationship) emergencyContact.relationship = data.emergency_contact_relationship;
        updateData.emergency_contact = emergencyContact;
      }

      // Build parent info JSONB if provided
      if (data.parent_name || data.parent_email || data.parent_phone) {
        const parentInfo: any = {};
        if (data.parent_name) parentInfo.name = data.parent_name;
        if (data.parent_email) parentInfo.email = data.parent_email;
        if (data.parent_phone) parentInfo.phone = data.parent_phone;
        updateData.parent_info = parentInfo;
      }
      
      const { data: student, error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        throw new Error(error.message);
      }

      // Log activity
      await ActivityService.logActivity({
        action_type: 'student_updated',
        entity_type: 'student',
        entity_id: student.id,
        entity_name: `${student.first_name} ${student.last_name}`,
        description: `updated student: ${student.first_name} ${student.last_name}`
      });

      return student;
    } catch (error) {
      console.error('Error in updateStudent:', error);
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
        .eq('id', studentId);

      if (updateError) {
        throw new Error('Failed to update student record');
      }

      // Create activation link
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin || 'http://localhost:5174';
      const activationLink = `${baseUrl}/activate/student/${inviteToken}`;

      // Send invitation email
      try {
        await EmailService.sendStudentInvitation(student.email, {
          studentName: `${student.first_name} ${student.last_name}`,
          schoolName: student.schools?.name || 'School',
          inviterName: user.user_metadata?.full_name || user.email || 'School Administrator',
          activationLink,
          expiresIn: '48 hours'
        });
      } catch (emailError) {
        // Rollback the invitation if email failed
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

  // Get student by user ID (for student portal)
  static async getStudentByUserId(userId: string): Promise<Student> {
    try {
      // Use RPC function which bypasses RLS and includes school data
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_student_with_school', { p_user_id: userId });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw new Error('Failed to fetch student data');
      }

      if (!rpcData || rpcData.length === 0) {
        throw new Error('Student not found or portal access not enabled');
      }

      const studentData = rpcData[0];
      return {
        ...studentData,
        full_name: `${studentData.first_name} ${studentData.last_name}`,
        school: studentData.school_name ? {
          id: studentData.school_id,
          name: studentData.school_name,
          address: studentData.school_address,
          phone: studentData.school_phone,
          email: studentData.school_email
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching student by user_id:', error);
      throw error;
    }
  }

  static async revokePortalAccess(studentId: string): Promise<boolean> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      const { error } = await supabase
        .from('students')
        .update({
          can_login: false,
          user_id: null,
          invite_token: null,
          account_created_at: null
        })
        .eq('id', studentId)
        .eq('school_id', schoolId);

      if (error) {
        throw new Error('Failed to revoke portal access');
      }

      return true;
    } catch (error) {
      console.error('Error revoking portal access:', error);
      throw error;
    }
  }

  // Bulk import methods
  static async bulkImportStudents(students: Partial<StudentFormData>[]): Promise<{ 
    success: number; 
    failed: number; 
    errors: Array<{ row: number; error: string; data: any }> 
  }> {
    const schoolId = await this.getCurrentSchoolId();
    let success = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string; data: any }> = [];

    // Process in batches of 50
    const batchSize = 50;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      
      // Process each student in the batch
      await Promise.all(batch.map(async (studentData, index) => {
        const rowNum = i + index + 2; // +2 because Excel rows start at 1 and we skip header
        try {
          // Validate required fields
          if (!studentData.first_name || !studentData.last_name) {
            errors.push({
              row: rowNum,
              error: 'First name and last name are required',
              data: studentData
            });
            failed++;
            return;
          }

          // Create the student
          await this.createStudent(studentData as StudentFormData);
          success++;
        } catch (error) {
          errors.push({
            row: rowNum,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: studentData
          });
          failed++;
        }
      }));
    }

    return { success, failed, errors };
  }
}

export default StudentService;