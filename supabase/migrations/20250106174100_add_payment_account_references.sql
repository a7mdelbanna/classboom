-- Add payment_account_id to enrollments table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
                   FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'enrollments' 
                   AND column_name = 'payment_account_id') 
    THEN
        ALTER TABLE public.enrollments 
        ADD COLUMN payment_account_id UUID REFERENCES public.payment_accounts(id);
    END IF;
END $$;

-- Add payment_account_id to payroll table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
                   FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payroll' 
                   AND column_name = 'payment_account_id') 
    THEN
        ALTER TABLE public.payroll 
        ADD COLUMN payment_account_id UUID REFERENCES public.payment_accounts(id);
    END IF;
END $$;