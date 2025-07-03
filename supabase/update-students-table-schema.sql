-- Update students table to match our current TypeScript types
-- Add missing columns that are in our types but not in the database

-- Add first_name and last_name columns (split from full_name)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Migrate full_name to first_name and last_name if needed
UPDATE public.students
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))
WHERE first_name IS NULL AND full_name IS NOT NULL;

-- Make first_name and last_name NOT NULL after migration
ALTER TABLE public.students
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Add missing columns for complete student profile
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS skill_level TEXT,
ADD COLUMN IF NOT EXISTS interested_courses TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS parent_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Remove columns we don't use anymore
ALTER TABLE public.students
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS grade,
DROP COLUMN IF EXISTS class,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS parent_name,
DROP COLUMN IF EXISTS parent_email,
DROP COLUMN IF EXISTS parent_phone,
DROP COLUMN IF EXISTS graduated_at;

-- Update status constraint to match our types
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS valid_student_status;
ALTER TABLE public.students ADD CONSTRAINT valid_student_status 
CHECK (status IN ('active', 'inactive', 'graduated', 'dropped'));

-- Create function to generate student full name
CREATE OR REPLACE FUNCTION public.get_student_full_name(first_name TEXT, last_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN TRIM(CONCAT(first_name, ' ', last_name));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add generated column for full_name (virtual column)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS full_name TEXT GENERATED ALWAYS AS (
  public.get_student_full_name(first_name, last_name)
) STORED;

-- Update indexes
DROP INDEX IF EXISTS idx_students_email;
CREATE INDEX idx_students_email ON public.students(email) WHERE email IS NOT NULL;
CREATE INDEX idx_students_full_name ON public.students(full_name);
CREATE INDEX idx_students_first_name ON public.students(first_name);
CREATE INDEX idx_students_last_name ON public.students(last_name);