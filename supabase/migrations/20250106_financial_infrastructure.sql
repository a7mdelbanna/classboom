-- Financial Infrastructure for ClassBoom
-- This migration creates the foundation for multi-currency support and payment account management

-- 1. Payment Accounts Table
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  
  -- Account Details
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('cash', 'bank', 'stripe', 'paypal', 'other')),
  account_number VARCHAR(255), -- For bank accounts
  bank_name VARCHAR(255),
  swift_code VARCHAR(50),
  iban VARCHAR(50),
  routing_number VARCHAR(50),
  
  -- Currency & Settings
  currency VARCHAR(3) NOT NULL, -- ISO 4217 currency code
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Integration Details
  stripe_account_id VARCHAR(255), -- For Stripe Connect
  paypal_email VARCHAR(255), -- For PayPal
  integration_config JSONB, -- For other payment gateway configs
  
  -- Metadata
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT unique_default_account_per_currency UNIQUE (school_id, currency, is_default)
);

-- 2. Supported Currencies Table
CREATE TABLE IF NOT EXISTS public.currencies (
  code VARCHAR(3) PRIMARY KEY, -- ISO 4217 code (USD, EUR, etc.)
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10),
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. School Currency Settings
CREATE TABLE IF NOT EXISTS public.school_currency_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  
  -- Base Currency
  base_currency VARCHAR(3) NOT NULL REFERENCES public.currencies(code),
  
  -- Accepted Currencies (array of currency codes)
  accepted_currencies VARCHAR(3)[] NOT NULL DEFAULT ARRAY['USD'],
  
  -- Display Settings
  currency_display VARCHAR(20) DEFAULT 'symbol' CHECK (currency_display IN ('symbol', 'code', 'both')),
  decimal_separator VARCHAR(1) DEFAULT '.',
  thousand_separator VARCHAR(1) DEFAULT ',',
  
  -- Exchange Rate Settings
  auto_update_rates BOOLEAN DEFAULT true,
  rate_update_frequency VARCHAR(20) DEFAULT 'daily' CHECK (rate_update_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_school_currency_settings UNIQUE (school_id)
);

-- 4. Exchange Rates Table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_currency VARCHAR(3) NOT NULL REFERENCES public.currencies(code),
  target_currency VARCHAR(3) NOT NULL REFERENCES public.currencies(code),
  rate DECIMAL(20, 10) NOT NULL,
  rate_date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'frankfurter', -- API source
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_daily_rate UNIQUE (base_currency, target_currency, rate_date)
);

-- 5. Financial Settings Table
CREATE TABLE IF NOT EXISTS public.financial_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  
  -- Tax Settings
  tax_enabled BOOLEAN DEFAULT false,
  tax_rate DECIMAL(5, 2),
  tax_name VARCHAR(50), -- e.g., 'VAT', 'GST', 'Sales Tax'
  tax_number VARCHAR(100), -- School's tax registration number
  
  -- Payment Terms
  payment_terms_days INTEGER DEFAULT 30,
  late_payment_fee_enabled BOOLEAN DEFAULT false,
  late_payment_fee_type VARCHAR(20) CHECK (late_payment_fee_type IN ('fixed', 'percentage')),
  late_payment_fee_amount DECIMAL(10, 2),
  
  -- Invoice Settings
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  next_invoice_number INTEGER DEFAULT 1,
  invoice_footer_text TEXT,
  
  -- Refund Policy
  refund_policy_text TEXT,
  partial_refund_allowed BOOLEAN DEFAULT true,
  refund_processing_days INTEGER DEFAULT 7,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_school_financial_settings UNIQUE (school_id)
);

-- Insert common currencies
INSERT INTO public.currencies (code, name, symbol, decimal_places) VALUES
  ('USD', 'US Dollar', '$', 2),
  ('EUR', 'Euro', '€', 2),
  ('GBP', 'British Pound', '£', 2),
  ('JPY', 'Japanese Yen', '¥', 0),
  ('CNY', 'Chinese Yuan', '¥', 2),
  ('AUD', 'Australian Dollar', 'A$', 2),
  ('CAD', 'Canadian Dollar', 'C$', 2),
  ('CHF', 'Swiss Franc', 'Fr', 2),
  ('HKD', 'Hong Kong Dollar', 'HK$', 2),
  ('SGD', 'Singapore Dollar', 'S$', 2),
  ('SEK', 'Swedish Krona', 'kr', 2),
  ('NOK', 'Norwegian Krone', 'kr', 2),
  ('NZD', 'New Zealand Dollar', 'NZ$', 2),
  ('KRW', 'South Korean Won', '₩', 0),
  ('MXN', 'Mexican Peso', '$', 2),
  ('INR', 'Indian Rupee', '₹', 2),
  ('RUB', 'Russian Ruble', '₽', 2),
  ('BRL', 'Brazilian Real', 'R$', 2),
  ('ZAR', 'South African Rand', 'R', 2),
  ('TRY', 'Turkish Lira', '₺', 2),
  ('AED', 'UAE Dirham', 'د.إ', 2),
  ('SAR', 'Saudi Riyal', '﷼', 2),
  ('PLN', 'Polish Złoty', 'zł', 2),
  ('THB', 'Thai Baht', '฿', 2),
  ('IDR', 'Indonesian Rupiah', 'Rp', 0),
  ('MYR', 'Malaysian Ringgit', 'RM', 2),
  ('PHP', 'Philippine Peso', '₱', 2),
  ('CZK', 'Czech Koruna', 'Kč', 2),
  ('ILS', 'Israeli Shekel', '₪', 2),
  ('CLP', 'Chilean Peso', '$', 0),
  ('PKR', 'Pakistani Rupee', '₨', 2),
  ('HUF', 'Hungarian Forint', 'Ft', 0),
  ('EGP', 'Egyptian Pound', 'E£', 2),
  ('KES', 'Kenyan Shilling', 'KSh', 2),
  ('QAR', 'Qatari Riyal', '﷼', 2),
  ('DKK', 'Danish Krone', 'kr', 2)
ON CONFLICT (code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_payment_accounts_school ON public.payment_accounts(school_id);
CREATE INDEX idx_payment_accounts_currency ON public.payment_accounts(currency);
CREATE INDEX idx_exchange_rates_lookup ON public.exchange_rates(base_currency, target_currency, rate_date DESC);
CREATE INDEX idx_school_currency_settings_school ON public.school_currency_settings(school_id);

-- RLS Policies for Payment Accounts
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their school's payment accounts" ON public.payment_accounts
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can create payment accounts for their school" ON public.payment_accounts
  FOR INSERT TO authenticated
  WITH CHECK (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can update their school's payment accounts" ON public.payment_accounts
  FOR UPDATE TO authenticated
  USING (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can delete their school's payment accounts" ON public.payment_accounts
  FOR DELETE TO authenticated
  USING (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

-- RLS Policies for School Currency Settings
ALTER TABLE public.school_currency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their school's currency settings" ON public.school_currency_settings
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their school's currency settings" ON public.school_currency_settings
  FOR ALL TO authenticated
  USING (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

-- RLS Policies for Financial Settings
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their school's financial settings" ON public.financial_settings
  FOR SELECT TO authenticated
  USING (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their school's financial settings" ON public.financial_settings
  FOR ALL TO authenticated
  USING (school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  ));

-- Public read access for currencies and exchange rates
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view currencies" ON public.currencies FOR SELECT TO authenticated USING (true);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exchange rates" ON public.exchange_rates FOR SELECT TO authenticated USING (true);

-- Function to get exchange rate
CREATE OR REPLACE FUNCTION public.get_exchange_rate(
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3),
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(20, 10)
LANGUAGE plpgsql
AS $$
DECLARE
  v_rate DECIMAL(20, 10);
BEGIN
  -- If same currency, return 1
  IF p_from_currency = p_to_currency THEN
    RETURN 1.0;
  END IF;
  
  -- Try direct rate
  SELECT rate INTO v_rate
  FROM public.exchange_rates
  WHERE base_currency = p_from_currency
    AND target_currency = p_to_currency
    AND rate_date <= p_date
  ORDER BY rate_date DESC
  LIMIT 1;
  
  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;
  
  -- Try inverse rate
  SELECT 1.0 / rate INTO v_rate
  FROM public.exchange_rates
  WHERE base_currency = p_to_currency
    AND target_currency = p_from_currency
    AND rate_date <= p_date
  ORDER BY rate_date DESC
  LIMIT 1;
  
  IF v_rate IS NOT NULL THEN
    RETURN v_rate;
  END IF;
  
  -- Try cross rate through USD
  IF p_from_currency != 'USD' AND p_to_currency != 'USD' THEN
    DECLARE
      v_from_to_usd DECIMAL(20, 10);
      v_usd_to_target DECIMAL(20, 10);
    BEGIN
      v_from_to_usd := get_exchange_rate(p_from_currency, 'USD', p_date);
      v_usd_to_target := get_exchange_rate('USD', p_to_currency, p_date);
      
      IF v_from_to_usd IS NOT NULL AND v_usd_to_target IS NOT NULL THEN
        RETURN v_from_to_usd * v_usd_to_target;
      END IF;
    END;
  END IF;
  
  -- No rate found
  RETURN NULL;
END;
$$;

-- Function to convert amount between currencies
CREATE OR REPLACE FUNCTION public.convert_currency(
  p_amount DECIMAL(20, 2),
  p_from_currency VARCHAR(3),
  p_to_currency VARCHAR(3),
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(20, 2)
LANGUAGE plpgsql
AS $$
DECLARE
  v_rate DECIMAL(20, 10);
BEGIN
  v_rate := get_exchange_rate(p_from_currency, p_to_currency, p_date);
  
  IF v_rate IS NULL THEN
    RAISE EXCEPTION 'No exchange rate found for % to % on %', p_from_currency, p_to_currency, p_date;
  END IF;
  
  RETURN ROUND(p_amount * v_rate, 2);
END;
$$;

-- Add currency fields to existing tables
ALTER TABLE public.schools 
  ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'USD';

-- Update enrollments table to reference payment account
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES public.payment_accounts(id);

-- Update payroll table to reference payment account
ALTER TABLE public.payroll
  ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES public.payment_accounts(id);