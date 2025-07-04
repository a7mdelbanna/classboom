import { supabase } from '../../../lib/supabase';
import { EmailService } from '../../../services/emailServiceClient';
import type { Student } from '../../students/types/student.types';

export interface ParentInviteData {
  studentId: string;
  parentEmail: string;
  parentName?: string;
  relationship: 'father' | 'mother' | 'guardian';
}

export class ParentService {
  // Get the current school ID (shared with StudentService)
  static async getCurrentSchoolId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

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
      throw new Error('No school found for user');
    }
    
    return schools[0].id;
  }

  static async inviteParent(data: ParentInviteData): Promise<boolean> {
    try {
      const schoolId = await this.getCurrentSchoolId();
      
      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*, schools!inner(name)')
        .eq('id', data.studentId)
        .eq('school_id', schoolId)
        .single();

      if (studentError || !student) {
        throw new Error('Student not found');
      }

      // Get current user (inviter) details
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Generate invitation token
      const inviteToken = EmailService.generateInvitationToken();
      
      // Check if parents table exists, if not create parent record
      const { data: existingParent, error: checkError } = await supabase
        .from('parents')
        .select('id')
        .eq('email', data.parentEmail)
        .eq('school_id', schoolId)
        .single();

      let parentId: string;

      if (checkError && checkError.code === 'PGRST116') {
        // Parent doesn't exist, create new one
        const { data: newParent, error: createError } = await supabase
          .from('parents')
          .insert({
            school_id: schoolId,
            email: data.parentEmail,
            name: data.parentName || '',
            invite_token: inviteToken,
            invite_sent_at: new Date().toISOString(),
            can_login: true
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error('Failed to create parent record');
        }

        parentId = newParent!.id;
      } else if (existingParent) {
        // Parent exists, update invitation
        const { error: updateError } = await supabase
          .from('parents')
          .update({
            invite_token: inviteToken,
            invite_sent_at: new Date().toISOString(),
            can_login: true
          })
          .eq('id', existingParent.id);

        if (updateError) {
          throw new Error('Failed to update parent invitation');
        }

        parentId = existingParent.id;
      } else {
        throw new Error('Error checking parent record');
      }

      // Create or update parent-student relationship
      const { error: relationError } = await supabase
        .from('parent_student_relationships')
        .upsert({
          parent_id: parentId,
          student_id: data.studentId,
          relationship_type: data.relationship,
          is_primary: true,
          can_access_grades: true,
          can_access_attendance: true,
          can_access_payments: true,
          can_communicate: true
        }, {
          onConflict: 'parent_id,student_id'
        });

      if (relationError) {
        throw new Error('Failed to create parent-student relationship');
      }

      // Sync parent info back to student's parent_info field
      try {
        // Get current student parent_info
        const { data: currentStudent } = await supabase
          .from('students')
          .select('parent_info')
          .eq('id', data.studentId)
          .single();

        const parentInfo = currentStudent?.parent_info || {};
        
        // Update the appropriate parent field based on relationship
        if (data.relationship === 'father') {
          parentInfo.father_name = data.parentName || '';
          parentInfo.father_email = data.parentEmail;
        } else if (data.relationship === 'mother') {
          parentInfo.mother_name = data.parentName || '';
          parentInfo.mother_email = data.parentEmail;
        }

        // Update student with new parent_info
        await supabase
          .from('students')
          .update({ parent_info: parentInfo })
          .eq('id', data.studentId);
      } catch (syncError) {
        console.error('Failed to sync parent info to student record:', syncError);
        // Don't throw - this is not critical
      }

      // Send invitation email
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const activationLink = `${baseUrl}/activate/parent/${inviteToken}`;
      const schoolName = (student.schools as any).name;
      
      try {
        await EmailService.sendParentInvitation(data.parentEmail, {
          parentName: data.parentName || 'Parent/Guardian',
          studentName: `${student.first_name} ${student.last_name}`,
          schoolName: schoolName,
          inviterName: user.user_metadata?.full_name || 'School Administrator',
          activationLink,
          studentCode: student.student_code
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        // Rollback on email failure
        await supabase
          .from('parents')
          .update({
            invite_token: null,
            invite_sent_at: null,
            can_login: false
          })
          .eq('id', parentId);
        
        throw new Error(`Failed to send invitation email: ${emailError.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error inviting parent:', error);
      throw error;
    }
  }

  static async getParentByToken(token: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('parents')
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
      console.error('Error getting parent by token:', error);
      return null;
    }
  }

  static async activateParentAccount(
    token: string, 
    password: string,
    studentCode: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get parent by token
      const parent = await this.getParentByToken(token);
      if (!parent) {
        return { success: false, error: 'Invalid or expired invitation token' };
      }

      if (!parent.email) {
        return { success: false, error: 'Parent email not found' };
      }

      // Verify student code matches a student linked to this parent
      const { data: relationships, error: relationError } = await supabase
        .from('parent_student_relationships')
        .select('students!inner(student_code)')
        .eq('parent_id', parent.id);

      if (relationError || !relationships) {
        return { success: false, error: 'No students linked to this parent account' };
      }

      const validStudentCode = relationships.some(
        (rel: any) => rel.students.student_code === studentCode
      );

      if (!validStudentCode) {
        return { success: false, error: 'Invalid student code' };
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: parent.email,
        password,
        options: {
          data: {
            parent_id: parent.id,
            full_name: parent.name,
            role: 'parent'
          }
        }
      });

      if (signUpError || !authData.user) {
        return { success: false, error: signUpError?.message || 'Failed to create account' };
      }

      // Update parent record
      const { error: updateError } = await supabase
        .from('parents')
        .update({
          user_id: authData.user.id,
          invite_token: null, // Clear the token
          account_created_at: new Date().toISOString()
        })
        .eq('id', parent.id);

      if (updateError) {
        return { success: false, error: 'Failed to link account' };
      }

      // Get school name for welcome email
      const { data: school } = await supabase
        .from('schools')
        .select('name')
        .eq('id', parent.school_id)
        .single();

      // Send welcome email
      if (school) {
        await EmailService.sendWelcomeEmail(
          parent.email,
          parent.name,
          school.name,
          'parent'
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error activating parent account:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  static async getParentStudents(parentId: string): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('parent_student_relationships')
        .select(`
          relationship_type,
          students!inner(*)
        `)
        .eq('parent_id', parentId);

      if (error) {
        throw new Error('Failed to fetch parent students');
      }

      return data?.map((rel: any) => rel.students) || [];
    } catch (error) {
      console.error('Error getting parent students:', error);
      throw error;
    }
  }
}