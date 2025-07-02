-- Fix schema_name constraint for RLS-based multi-tenancy
-- This migration removes the UNIQUE constraint and makes schema_name nullable with default 'public'

-- First, drop the UNIQUE constraint
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_schema_name_key;

-- Update the column to have a default value and allow nulls
ALTER TABLE public.schools 
  ALTER COLUMN schema_name DROP NOT NULL,
  ALTER COLUMN schema_name SET DEFAULT 'public';

-- Update any existing NULL values to 'public'
UPDATE public.schools 
SET schema_name = 'public' 
WHERE schema_name IS NULL;

-- Update any existing non-'public' values to 'public' since we're using RLS now
UPDATE public.schools 
SET schema_name = 'public' 
WHERE schema_name != 'public';

-- Add missing RLS policies if they don't exist
DO $$ 
BEGIN
    -- Check if INSERT policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' 
        AND policyname = 'Users can create their own school'
    ) THEN
        CREATE POLICY "Users can create their own school" ON public.schools
          FOR INSERT WITH CHECK (owner_id = auth.uid());
    END IF;

    -- Check if DELETE policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'schools' 
        AND policyname = 'School owners can delete their school'
    ) THEN
        CREATE POLICY "School owners can delete their school" ON public.schools
          FOR DELETE USING (owner_id = auth.uid());
    END IF;
END $$;