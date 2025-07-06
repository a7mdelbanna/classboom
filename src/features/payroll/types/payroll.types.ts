// Payroll Module Types - Completely Independent
import type { MinimalStaffInfo, PaymentStatus } from '../../../types/shared.types';

export type PayrollStatus = PaymentStatus;

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
  
  // Relations - using minimal interface
  staff?: MinimalStaffInfo;
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

export interface PayrollFormData {
  staff_ids: string[];
  period_start: string;
  period_end: string;
  notes?: string;
}

export interface PayrollCalculation {
  staff_id: string;
  base_amount: number;
  hours_worked?: number;
  sessions_count?: number;
  overtime_hours?: number;
  overtime_amount?: number;
  bonuses: PayrollItem[];
  deductions: PayrollItem[];
  gross_amount: number;
  net_amount: number;
  currency: string;
  details?: any;
}

export interface PayrollSummary {
  total_records: number;
  total_amount: number;
  by_status: Record<PayrollStatus, number>;
  by_department?: Record<string, number>;
  average_amount: number;
  currency: string;
}