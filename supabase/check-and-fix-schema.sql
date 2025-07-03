-- Check current state of schools table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'schools'
    AND column_name = 'schema_name';

-- Check if UNIQUE constraint exists
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.schools'::regclass
    AND contype = 'u';

-- Drop any UNIQUE constraints on schema_name
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.schools'::regclass
            AND contype = 'u'
            AND pg_get_constraintdef(oid) LIKE '%schema_name%'
    LOOP
        EXECUTE format('ALTER TABLE public.schools DROP CONSTRAINT %I', constraint_record.conname);
        RAISE NOTICE 'Dropped constraint: %', constraint_record.conname;
    END LOOP;
END $$;

-- Alter the column to be nullable with default
ALTER TABLE public.schools 
    ALTER COLUMN schema_name DROP NOT NULL,
    ALTER COLUMN schema_name SET DEFAULT 'public';

-- Update any NULL values
UPDATE public.schools 
SET schema_name = 'public' 
WHERE schema_name IS NULL;

-- Check RLS policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'schools'
ORDER BY policyname;

-- Ensure INSERT policy exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' 
        AND policyname = 'Users can create their own school'
    ) THEN
        CREATE POLICY "Users can create their own school" ON public.schools
            FOR INSERT WITH CHECK (owner_id = auth.uid());
        RAISE NOTICE 'Created INSERT policy for schools table';
    ELSE
        RAISE NOTICE 'INSERT policy already exists';
    END IF;
END $$;

-- Verify the changes
SELECT 
    'Column is_nullable: ' || is_nullable AS status,
    'Column default: ' || COALESCE(column_default, 'NULL') AS default_value
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'schools'
    AND column_name = 'schema_name';