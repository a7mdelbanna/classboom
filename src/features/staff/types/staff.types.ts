// Staff Management Types

export type StaffRole = 'teacher' | 'manager' | 'admin' | 'support' | 'custodian';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'volunteer';
export type CompensationModel = 'monthly_salary' | 'per_session' | 'hourly' | 'volunteer';
export type StaffStatus = 'active' | 'inactive' | 'suspended' | 'terminated';
export type PayrollStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'cancelled';

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
  
  // Portal Access
  portal_access_enabled: boolean;
  portal_access_token?: string;
  portal_access_created_at?: string;
  last_login_at?: string;
  permissions?: StaffPermissions;
  
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

export interface Payroll {
  id: string;
  school_id: string;
  staff_id: string;
  period_start: string;
  period_end: string;
  
  // Calculation Details
  base_amount: number;
  hours_worked?: number;
  sessions_taught?: number;
  overtime_hours?: number;
  overtime_amount?: number;
  bonuses?: PayrollItem[];
  deductions?: PayrollItem[];
  
  // Totals
  gross_amount: number;
  net_amount: number;
  currency: string;
  
  // Payment Details
  payment_status: PayrollStatus;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  payment_account_id?: string;
  
  // Metadata
  notes?: string;
  calculation_details?: any;
  
  // Workflow
  submitted_at: string;
  submitted_by?: string;
  approved_at?: string;
  approved_by?: string;
  paid_at?: string;
  paid_by?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  staff?: Staff;
}

export interface PayrollItem {
  type: string;
  amount: number;
  description?: string;
}

export interface PayrollFilters {
  staff_id?: string;
  status?: PayrollStatus;
  period_start?: string;
  period_end?: string;
  search?: string;
}

export interface StaffFilters {
  role?: StaffRole;
  status?: StaffStatus;
  department?: string;
  employment_type?: EmploymentType;
  search?: string;
}