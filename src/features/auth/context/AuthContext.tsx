import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

export type UserRole = 'school_owner' | 'teacher' | 'student' | 'parent' | null;

interface SchoolInfo {
  id: string;
  name: string;
  subscription_plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
  settings?: {
    theme?: {
      primary: string;
      secondary: string;
    };
    terminology?: {
      student: string;
      students: string;
      teacher: string;
      teachers: string;
      class: string;
      classes: string;
    };
    institution_type?: string;
    [key: string]: any;
  };
}

// Additional context for students and parents
interface StudentInfo {
  id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  school_id: string;
}

interface ParentInfo {
  id: string;
  first_name: string;
  last_name: string;
  children: StudentInfo[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  schoolInfo: SchoolInfo | null;
  studentInfo: StudentInfo | null;
  parentInfo: ParentInfo | null;
  userRole: UserRole;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, schoolName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateSchoolSettings: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserMetadata(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserMetadata(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserMetadata = async (user: User) => {
    try {
      // Reset previous role data
      setSchoolInfo(null);
      setStudentInfo(null);
      setParentInfo(null);
      setUserRole(null);

      // 1. Check if user is a school owner
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (school && !schoolError) {
        setUserRole('school_owner');
        setSchoolInfo({
          id: school.id,
          name: school.name,
          subscription_plan: school.subscription_plan || 'trial',
          subscription_status: school.subscription_status || 'active',
          trial_ends_at: school.trial_ends_at,
          settings: school.settings
        });
        
        // Update user metadata with school_id if not already there
        if (!user.user_metadata?.school_id) {
          await supabase.auth.updateUser({
            data: { ...user.user_metadata, school_id: school.id }
          });
        }
        return;
      }
      
      // 2. Check if user is a student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id, student_code, first_name, last_name, school_id')
        .eq('user_id', user.id)
        .single();
      
      if (student && !studentError) {
        setUserRole('student');
        setStudentInfo({
          id: student.id,
          student_code: student.student_code,
          first_name: student.first_name,
          last_name: student.last_name,
          school_id: student.school_id
        });
        return;
      }
      
      // 3. Check if user is a parent
      const { data: parentAccount, error: parentError } = await supabase
        .from('parent_accounts')
        .select(`
          id,
          first_name,
          last_name,
          parent_student_relationships (
            student_id,
            students (
              id,
              student_code,
              first_name,
              last_name,
              school_id
            )
          )
        `)
        .eq('user_id', user.id)
        .single();
      
      if (parentAccount && !parentError) {
        setUserRole('parent');
        const children = parentAccount.parent_student_relationships?.map((rel: any) => ({
          id: rel.students.id,
          student_code: rel.students.student_code,
          first_name: rel.students.first_name,
          last_name: rel.students.last_name,
          school_id: rel.students.school_id
        })) || [];
        
        setParentInfo({
          id: parentAccount.id,
          first_name: parentAccount.first_name,
          last_name: parentAccount.last_name,
          children
        });
        return;
      }
      
      // 4. Check if user has school_name in metadata (new school owner signup)
      if (user.user_metadata?.school_name) {
        console.log('Creating school during metadata load...');
        const { data: newSchool } = await supabase
          .from('schools')
          .insert({
            name: user.user_metadata.school_name,
            owner_id: user.id,
            subscription_plan: 'trial',
            subscription_status: 'active',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();
        
        if (newSchool) {
          setUserRole('school_owner');
          setSchoolInfo({
            id: newSchool.id,
            name: newSchool.name,
            subscription_plan: 'trial',
            subscription_status: 'active',
            trial_ends_at: newSchool.trial_ends_at,
            settings: newSchool.settings
          });
          
          // Update user metadata with school_id for faster access
          await supabase.auth.updateUser({
            data: { ...user.user_metadata, school_id: newSchool.id }
          });
        }
      }
      
      // TODO: Add teacher role check when teacher table is created
      
    } catch (err) {
      console.error('Error loading user metadata:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
      await loadUserMetadata(data.user);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, schoolName?: string) => {
    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const metadata = schoolName 
      ? { full_name: fullName, first_name: firstName, last_name: lastName, school_name: schoolName }
      : { full_name: fullName, first_name: firstName, last_name: lastName };

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    
    // Check if email confirmation is required
    if (data?.user && !data.session) {
      throw new Error('Please check your email to confirm your account');
    }

    // If school owner signup, ensure school is created
    if (schoolName && data?.user) {
      try {
        console.log('School owner signup detected, ensuring school setup...');
        
        // Check if user already has a school
        const { data: existingSchool } = await supabase
          .from('schools')
          .select('*')
          .eq('owner_id', data.user.id)
          .single();
        
        if (existingSchool) {
          console.log('School already exists');
          setUserRole('school_owner');
          setSchoolInfo({
            id: existingSchool.id,
            name: existingSchool.name,
            subscription_plan: existingSchool.subscription_plan || 'trial',
            subscription_status: existingSchool.subscription_status || 'active',
            trial_ends_at: existingSchool.trial_ends_at,
            settings: existingSchool.settings
          });
        } else {
          console.log('Creating school manually...');
          // Create school directly
          const { data: newSchool } = await supabase
            .from('schools')
            .insert({
              name: schoolName,
              owner_id: data.user.id,
              subscription_plan: 'trial',
              subscription_status: 'active',
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            })
            .select()
            .single();
          
          if (newSchool) {
            console.log('School created successfully');
            setUserRole('school_owner');
            setSchoolInfo({
              id: newSchool.id,
              name: newSchool.name,
              subscription_plan: 'trial',
              subscription_status: 'active',
              trial_ends_at: newSchool.trial_ends_at,
              settings: newSchool.settings
            });
            
            // Update user metadata with school_id
            if (data.user) {
              await supabase.auth.updateUser({
                data: { ...data.user.user_metadata, school_id: newSchool.id }
              });
            }
          }
        }
      } catch (err) {
        console.error('Error during school setup:', err);
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSchoolInfo(null);
    setStudentInfo(null);
    setParentInfo(null);
    setUserRole(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updateSchoolSettings = async (updates: any) => {
    if (!schoolInfo?.id) return;
    
    try {
      // Get current settings first
      const { data: currentSchool, error: fetchError } = await supabase
        .from('schools')
        .select('settings')
        .eq('id', schoolInfo.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Merge with existing settings
      const currentSettings = currentSchool?.settings || {};
      const newSettings = { ...currentSettings, ...updates };
      
      // Update the database
      const { error: updateError } = await supabase
        .from('schools')
        .update({ settings: newSettings })
        .eq('id', schoolInfo.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setSchoolInfo(prev => prev ? { ...prev, settings: newSettings } : null);
    } catch (err) {
      console.error('Error updating school settings:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      schoolInfo,
      studentInfo,
      parentInfo,
      userRole,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateSchoolSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}