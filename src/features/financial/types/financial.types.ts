// Financial Infrastructure Types

export type AccountType = 'cash' | 'bank' | 'stripe' | 'paypal' | 'other';
export type CurrencyDisplay = 'symbol' | 'code' | 'both';
export type RateUpdateFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
export type LateFeeType = 'fixed' | 'percentage';

export interface Currency {
  code: string; // ISO 4217 code
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
  created_at: string;
}

export interface PaymentAccount {
  id: string;
  school_id: string;
  
  // Account Details
  account_name: string;
  account_type: AccountType;
  account_number?: string;
  bank_name?: string;
  swift_code?: string;
  iban?: string;
  routing_number?: string;
  
  // Currency & Settings
  currency: string;
  is_default: boolean;
  is_active: boolean;
  
  // Integration Details
  stripe_account_id?: string;
  paypal_email?: string;
  integration_config?: Record<string, any>;
  
  // Metadata
  description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SchoolCurrencySettings {
  id: string;
  school_id: string;
  
  // Base Currency
  base_currency: string;
  
  // Accepted Currencies
  accepted_currencies: string[];
  
  // Display Settings
  currency_display: CurrencyDisplay;
  decimal_separator: string;
  thousand_separator: string;
  
  // Exchange Rate Settings
  auto_update_rates: boolean;
  rate_update_frequency: RateUpdateFrequency;
  
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  rate_date: string;
  source: string;
  created_at: string;
}

export interface FinancialSettings {
  id: string;
  school_id: string;
  
  // Tax Settings
  tax_enabled: boolean;
  tax_rate?: number;
  tax_name?: string;
  tax_number?: string;
  
  // Payment Terms
  payment_terms_days: number;
  late_payment_fee_enabled: boolean;
  late_payment_fee_type?: LateFeeType;
  late_payment_fee_amount?: number;
  
  // Invoice Settings
  invoice_prefix: string;
  next_invoice_number: number;
  invoice_footer_text?: string;
  
  // Refund Policy
  refund_policy_text?: string;
  partial_refund_allowed: boolean;
  refund_processing_days: number;
  
  created_at: string;
  updated_at: string;
}

// Form Data Types
export interface PaymentAccountFormData {
  account_name: string;
  account_type: AccountType;
  account_number?: string;
  bank_name?: string;
  swift_code?: string;
  iban?: string;
  routing_number?: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  stripe_account_id?: string;
  paypal_email?: string;
  description?: string;
  notes?: string;
}

export interface SchoolCurrencySettingsFormData {
  base_currency: string;
  accepted_currencies: string[];
  currency_display: CurrencyDisplay;
  decimal_separator: string;
  thousand_separator: string;
  auto_update_rates: boolean;
  rate_update_frequency: RateUpdateFrequency;
}

export interface FinancialSettingsFormData {
  tax_enabled: boolean;
  tax_rate?: number;
  tax_name?: string;
  tax_number?: string;
  payment_terms_days: number;
  late_payment_fee_enabled: boolean;
  late_payment_fee_type?: LateFeeType;
  late_payment_fee_amount?: number;
  invoice_prefix: string;
  invoice_footer_text?: string;
  refund_policy_text?: string;
  partial_refund_allowed: boolean;
  refund_processing_days: number;
}

// Utility Types
export interface CurrencyAmount {
  amount: number;
  currency: string;
  formatted?: string;
}

export interface ConversionResult {
  from: CurrencyAmount;
  to: CurrencyAmount;
  rate: number;
  rate_date: string;
}

export interface FinancialSummary {
  base_currency: string;
  total_revenue: number;
  revenue_by_currency: Record<string, number>;
  total_accounts: number;
  accounts_by_type: Record<AccountType, number>;
  active_currencies: string[];
}