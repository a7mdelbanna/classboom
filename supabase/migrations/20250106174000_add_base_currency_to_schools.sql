-- Add base_currency column to schools table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 
                   FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'schools' 
                   AND column_name = 'base_currency') 
    THEN
        ALTER TABLE public.schools 
        ADD COLUMN base_currency VARCHAR(3) DEFAULT 'USD';
    END IF;
END $$;