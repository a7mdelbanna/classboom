import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

interface SchoolInfo {
  id: string;
  name: string;
  subscription_plan: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  schoolInfo: SchoolInfo | null;
  userRole: string | null;
  schoolSchema: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, schoolName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [schoolSchema, setSchoolSchema] = useState<string | null>(null);

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
    const metadata = user.user_metadata;
    if (metadata?.school_schema) {
      setSchoolSchema(metadata.school_schema);
      setUserRole(metadata.role);
      setSchoolInfo({
        id: metadata.school_id,
        name: metadata.school_name,
        subscription_plan: metadata.subscription_plan || 'trial',
        subscription_status: metadata.subscription_status || 'active',
        trial_ends_at: metadata.trial_ends_at
      });
    } else {
      const { data, error } = await supabase.rpc('handle_classboom_login', { p_user_id: user.id });
      if (data && data.success) {
        setSchoolSchema(data.school_schema);
        setUserRole(data.role);
        setSchoolInfo(data.school);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
      const { data: loginData } = await supabase.rpc('handle_classboom_login', { p_user_id: data.user.id });
      if (loginData && loginData.success) {
        setSchoolSchema(loginData.school_schema);
        setUserRole(loginData.role);
        setSchoolInfo(loginData.school);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string, schoolName?: string) => {
    const metadata = schoolName 
      ? { full_name: fullName, school_name: schoolName }
      : { full_name: fullName };

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
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSchoolInfo(null);
    setUserRole(null);
    setSchoolSchema(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      schoolInfo,
      userRole,
      schoolSchema,
      signIn,
      signUp,
      signOut,
      resetPassword
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