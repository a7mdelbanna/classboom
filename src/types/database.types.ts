// ClassBoom Database Types
// Generated based on Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string
          name: string
          schema_name: string
          owner_id: string
          subscription_plan: string
          subscription_status: string
          trial_ends_at: string | null
          created_at: string
          updated_at: string
          settings: Json
        }
        Insert: {
          id?: string
          name: string
          schema_name: string
          owner_id: string
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
          settings?: Json
        }
        Update: {
          id?: string
          name?: string
          schema_name?: string
          owner_id?: string
          subscription_plan?: string
          subscription_status?: string
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
          settings?: Json
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          code: string
          price: number
          currency: string
          interval: string
          features: Json
          max_students: number | null
          max_teachers: number | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          price: number
          currency?: string
          interval: string
          features: Json
          max_students?: number | null
          max_teachers?: number | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          price?: number
          currency?: string
          interval?: string
          features?: Json
          max_students?: number | null
          max_teachers?: number | null
          is_active?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      classboom_user_profiles: {
        Row: {
          user_id: string
          email: string
          full_name: string | null
          school_schema: string | null
          role: string | null
          school_name: string | null
          created_at: string
          last_sign_in_at: string | null
        }
      }
    }
    Functions: {
      create_classboom_school_schema: {
        Args: {
          p_school_name: string
          p_owner_id: string
        }
        Returns: string
      }
      get_user_school_schema: {
        Args: {
          p_user_id: string
        }
        Returns: string | null
      }
      handle_classboom_login: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      check_classboom_email_exists: {
        Args: {
          p_email: string
        }
        Returns: boolean
      }
      validate_classboom_invite: {
        Args: {
          p_invite_code: string
        }
        Returns: Json
      }
    }
    Enums: {
      subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
      user_role: 'admin' | 'teacher' | 'student' | 'parent'
      payment_status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
      session_status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
      attendance_status: 'present' | 'absent' | 'late' | 'excused'
    }
  }
}

// ClassBoom specific types
export interface ClassBoomUser {
  id: string
  email: string
  fullName: string
  role: Database['public']['Enums']['user_role']
  schoolSchema: string
  schoolName: string
  avatarUrl?: string
  phone?: string
}

export interface ClassBoomSchool {
  id: string
  name: string
  schemaName: string
  subscriptionPlan: string
  subscriptionStatus: Database['public']['Enums']['subscription_status']
  trialEndsAt?: string
  settings: Record<string, any>
}

export interface ClassBoomStudent {
  id: string
  userId: string
  studentCode?: string
  dateOfBirth?: string
  gradeLevel?: string
  status: 'active' | 'inactive' | 'graduated' | 'dropped'
  enrolledAt: string
}

export interface ClassBoomSession {
  id: string
  subscriptionId: string
  scheduledAt: string
  durationMinutes: number
  status: Database['public']['Enums']['session_status']
  teacherId?: string
  room?: string
  notes?: string
}