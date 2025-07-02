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
          schema_name?: string
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
      [_ in never]: never
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
        Returns: string
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
    }
    Enums: {
      [_ in never]: never
    }
  }
}