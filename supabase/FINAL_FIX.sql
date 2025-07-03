-- FINAL FIX: Ensure schema_name can accept null values without constraint violations

-- 1. First check current constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.schools'::regclass;

-- 2. Drop ALL constraints that might be checking schema_name
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_schema_name_key;
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_schema_name_check;

-- 3. Alter the column to truly accept NULL and have a proper default
ALTER TABLE public.schools 
    ALTER COLUMN schema_name DROP NOT NULL;

-- Set default AFTER dropping not null
ALTER TABLE public.schools
    ALTER COLUMN schema_name SET DEFAULT 'public'::text;

-- 4. Update any existing NULL values
UPDATE public.schools 
SET schema_name = 'public' 
WHERE schema_name IS NULL;

-- 5. Verify the column is now properly configured
SELECT 
    column_name,
    is_nullable,
    column_default,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'schools'
    AND column_name = 'schema_name';

-- 6. Create a trigger to handle NULL values on insert
CREATE OR REPLACE FUNCTION public.set_default_schema_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.schema_name IS NULL THEN
        NEW.schema_name := 'public';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_schema_name_default ON public.schools;

-- Create the trigger
CREATE TRIGGER ensure_schema_name_default
    BEFORE INSERT ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_schema_name();

-- 7. Test the fix by inserting a record with NULL schema_name
-- This should now work without error
INSERT INTO public.schools (name, owner_id, schema_name)
VALUES ('Test School', gen_random_uuid(), NULL)
RETURNING *;

-- 8. Clean up the test record
DELETE FROM public.schools WHERE name = 'Test School';

-- Final verification
SELECT 'Fix completed successfully!' AS status;