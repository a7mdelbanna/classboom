-- COMPLETE MIGRATION TO FIX ALL SCHEMA_NAME ERRORS
-- Run this entire script in one go in Supabase SQL Editor

-- STEP 1: Drop old triggers and functions that create custom schemas
DROP TRIGGER IF EXISTS on_classboom_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_classboom_signup() CASCADE;
DROP FUNCTION IF EXISTS public.create_classboom_school_schema(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_classboom_login(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_school_schema(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_classboom_email_exists(TEXT) CASCADE;

-- STEP 2: Fix schema_name column constraints
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

-- Make schema_name nullable with default 'public'
ALTER TABLE public.schools 
    ALTER COLUMN schema_name DROP NOT NULL,
    ALTER COLUMN schema_name SET DEFAULT 'public';

-- Update any existing values
UPDATE public.schools 
SET schema_name = 'public' 
WHERE schema_name IS NULL OR schema_name != 'public';

-- STEP 3: Ensure all RLS policies exist for schools table
-- Check and create INSERT policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' 
        AND policyname = 'Users can create their own school'
    ) THEN
        CREATE POLICY "Users can create their own school" ON public.schools
            FOR INSERT WITH CHECK (owner_id = auth.uid());
    END IF;
END $$;

-- Check and create DELETE policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' 
        AND policyname = 'School owners can delete their school'
    ) THEN
        CREATE POLICY "School owners can delete their school" ON public.schools
            FOR DELETE USING (owner_id = auth.uid());
    END IF;
END $$;

-- STEP 4: Create students table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  grade TEXT,
  class TEXT,
  address TEXT,
  medical_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graduated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_student_status CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  CONSTRAINT unique_student_code_per_school UNIQUE (school_id, student_code)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON public.students(student_code);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students table
DO $$
BEGIN
    -- SELECT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'School owners can view their students'
    ) THEN
        CREATE POLICY "School owners can view their students" ON public.students
          FOR SELECT USING (
            school_id IN (
              SELECT id FROM public.schools WHERE owner_id = auth.uid()
            )
          );
    END IF;

    -- INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'School owners can create students'
    ) THEN
        CREATE POLICY "School owners can create students" ON public.students
          FOR INSERT WITH CHECK (
            school_id IN (
              SELECT id FROM public.schools WHERE owner_id = auth.uid()
            )
          );
    END IF;

    -- UPDATE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'School owners can update students'
    ) THEN
        CREATE POLICY "School owners can update students" ON public.students
          FOR UPDATE USING (
            school_id IN (
              SELECT id FROM public.schools WHERE owner_id = auth.uid()
            )
          );
    END IF;

    -- DELETE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'students' 
        AND policyname = 'School owners can delete students'
    ) THEN
        CREATE POLICY "School owners can delete students" ON public.students
          FOR DELETE USING (
            school_id IN (
              SELECT id FROM public.schools WHERE owner_id = auth.uid()
            )
          );
    END IF;
END $$;

-- STEP 5: Create or replace the update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for students table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_students_updated_at'
    ) THEN
        CREATE TRIGGER update_students_updated_at
          BEFORE UPDATE ON public.students
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- STEP 6: Verify everything is correct
SELECT 
    'Schools table schema_name column:' AS check_item,
    is_nullable AS result,
    column_default AS default_value
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'schools'
    AND column_name = 'schema_name'

UNION ALL

SELECT 
    'Number of schools RLS policies:' AS check_item,
    COUNT(*)::TEXT AS result,
    STRING_AGG(policyname, ', ') AS default_value
FROM pg_policies
WHERE tablename = 'schools'

UNION ALL

SELECT 
    'Number of students RLS policies:' AS check_item,
    COUNT(*)::TEXT AS result,
    STRING_AGG(policyname, ', ') AS default_value
FROM pg_policies
WHERE tablename = 'students'

UNION ALL

SELECT 
    'Old triggers on auth.users:' AS check_item,
    COUNT(*)::TEXT AS result,
    STRING_AGG(tgname, ', ') AS default_value
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
    AND tgname LIKE '%classboom%';

-- Final message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! The schema_name errors should now be fixed.';
END $$;