// Staff Management Types

export type StaffRole = 'teacher' | 'manager' | 'admin' | 'support' | 'custodian';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'volunteer';
export type CompensationModel = 'monthly_salary' | 'per_session' | 'hourly' | 'volunteer';
export type StaffStatus = 'active' | 'inactive' | 'suspended' | 'terminated';

export interface Staff {
  id: string;
  school_id: string;
  user_id?: string;
  
  // Basic Information
  staff_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  
  // Employment Details
  role: StaffRole;
  department?: string;
  employment_type?: EmploymentType;
  hire_date: string;
  contract_end_date?: string;
  
  // Compensation
  compensation_model?: CompensationModel;
  base_salary?: number;
  hourly_rate?: number;
  session_rate?: number;
  currency: string;
  payment_account_id?: string;
  
  // Teaching Specific
  specializations?: string[];
  certifications?: any;
  max_weekly_hours?: number;
  min_weekly_hours?: number;
  
  // Availability
  availability?: WeeklyAvailability;
  
  // Portal Access & Invitations
  portal_access_enabled: boolean;
  portal_access_token?: string;
  portal_access_created_at?: string;
  last_login_at?: string;
  permissions?: StaffPermissions;
  
  // Invitation Tracking
  invite_token?: string;
  invite_sent_at?: string;
  account_created_at?: string;
  can_login?: boolean;
  
  // Personal Details
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  national_id?: string;
  address?: Address;
  emergency_contact?: EmergencyContact;
  
  // Status and Metadata
  status: StaffStatus;
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // Computed
  full_name?: string;
}

export interface StaffFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  department?: string;
  employment_type?: EmploymentType;
  hire_date: string;
  contract_end_date?: string;
  compensation_model?: CompensationModel;
  base_salary?: number;
  hourly_rate?: number;
  session_rate?: number;
  currency: string;
  specializations?: string[];
  max_weekly_hours?: number;
  min_weekly_hours?: number;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  national_id?: string;
  address?: Address;
  emergency_contact?: EmergencyContact;
  notes?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
}

export interface WeeklyAvailability {
  [key: string]: DayAvailability; // monday, tuesday, etc.
}

export interface DayAvailability {
  available: boolean;
  slots?: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface StaffPermissions {
  can_view_all_students?: boolean;
  can_edit_students?: boolean;
  can_manage_enrollments?: boolean;
  can_mark_attendance?: boolean;
  can_view_finances?: boolean;
  can_manage_staff?: boolean;
  can_send_announcements?: boolean;
  custom_permissions?: string[];
}

export interface StaffCourseAssignment {
  id: string;
  staff_id: string;
  course_id: string;
  is_primary: boolean;
  can_substitute: boolean;
  assigned_at: string;
  assigned_by?: string;
  
  // Relations
  staff?: Staff;
  course?: any; // Will be Course type
}

// Payroll types have been moved to features/payroll/types/payroll.types.ts

export interface StaffFilters {
  role?: StaffRole;
  status?: StaffStatus;
  department?: string;
  employment_type?: EmploymentType;
  search?: string;
}