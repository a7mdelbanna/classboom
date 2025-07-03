-- IMMEDIATE FIX for disappearing students
-- Run this SQL in Supabase Dashboard > SQL Editor

-- 1. Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;
DROP POLICY IF EXISTS "Enable update for users based on school_id" ON public.students;
DROP POLICY IF EXISTS "Enable delete for users based on school_id" ON public.students;

-- 3. Create simple policies based on school ownership

-- Allow users to SELECT students from schools they own
CREATE POLICY "Enable read access for all users" ON public.students
FOR SELECT USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Allow users to INSERT students to schools they own
CREATE POLICY "Enable insert for authenticated users only" ON public.students
FOR INSERT WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Allow users to UPDATE students in schools they own
CREATE POLICY "Enable update for users based on school_id" ON public.students
FOR UPDATE USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Allow users to DELETE students from schools they own
CREATE POLICY "Enable delete for users based on school_id" ON public.students
FOR DELETE USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- 4. Verify the fix worked
SELECT COUNT(*) as visible_students FROM public.students;