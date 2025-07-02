# ClassBoom Database Migration Instructions

## Required Migrations (Run in Order)

These migrations need to be run in your Supabase dashboard to fix the schema_name constraint errors and complete the RLS-based multi-tenancy setup.

### Step 1: Fix schema_name Constraint
Run the migration in `supabase/fix-schema-name-constraint.sql`:

```sql
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
```

### Step 2: Create Public Students Table
Run the migration in `supabase/create-public-students-table.sql`:

```sql
-- Create students table in public schema for RLS-based multi-tenancy
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

-- Create indexes for performance
CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_email ON public.students(email);
CREATE INDEX idx_students_student_code ON public.students(student_code);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- School owners can view all students in their school
CREATE POLICY "School owners can view their students" ON public.students
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- School owners can create students in their school
CREATE POLICY "School owners can create students" ON public.students
  FOR INSERT WITH CHECK (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- School owners can update students in their school
CREATE POLICY "School owners can update students" ON public.students
  FOR UPDATE USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- School owners can delete students from their school
CREATE POLICY "School owners can delete students" ON public.students
  FOR DELETE USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## How to Run Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hokgyujgsvdfhpfrorsu/sql/new
2. Copy and paste each migration in order
3. Click "Run" for each migration
4. Verify success with green checkmarks

## Testing After Migration

Run the following command to verify the setup:
```bash
npm run verify:setup
```

This should show:
- ✓ Database connection successful
- ✓ Schools table with RLS policies
- ✓ Students table with RLS policies

## What These Migrations Fix

1. **schema_name constraint error**: Removes UNIQUE constraint that was preventing multiple schools
2. **Missing students table**: Creates the public.students table with proper RLS policies
3. **Missing RLS policies**: Ensures all required policies exist for schools table

After running these migrations, the authentication and student management system should work without errors.