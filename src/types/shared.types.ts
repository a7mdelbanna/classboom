// Shared types for cross-feature communication
// These minimal interfaces prevent circular dependencies

export interface MinimalStaffInfo {
  id: string;
  first_name: string;
  last_name: string;
  staff_code: string;
  role: string;
  email: string;
  compensation_model?: string;
  base_salary?: number;
  hourly_rate?: number;
  session_rate?: number;
  currency: string;
  department?: string;
  employment_type?: string;
}

export interface MinimalSchoolInfo {
  id: string;
  name: string;
  logo_url?: string;
  currency?: string;
}

// Shared enums that multiple features might need
export type PaymentStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'cancelled';
export type DateRange = {
  start: string;
  end: string;
};