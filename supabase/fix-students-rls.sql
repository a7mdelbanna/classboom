-- Fix RLS policies for students table
-- Run this in Supabase SQL Editor to fix the disappearing students issue

-- 1. First, check if RLS is enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view students from their school" ON public.students;
DROP POLICY IF EXISTS "Users can create students in their school" ON public.students;
DROP POLICY IF EXISTS "Users can update students in their school" ON public.students;
DROP POLICY IF EXISTS "Users can delete students from their school" ON public.students;

-- 3. Create proper RLS policies

-- Policy: Users can view students from their school
CREATE POLICY "Users can view students from their school" ON public.students
FOR SELECT
USING (
  school_id IN (
    -- User owns the school
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
    UNION
    -- User is a member of the school (future feature)
    SELECT school_id FROM public.school_users WHERE user_id = auth.uid()
  )
);

-- Policy: Users can create students in their school
CREATE POLICY "Users can create students in their school" ON public.students
FOR INSERT
WITH CHECK (
  school_id IN (
    -- User owns the school
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
    UNION
    -- User is a member of the school (future feature)
    SELECT school_id FROM public.school_users WHERE user_id = auth.uid()
  )
);

-- Policy: Users can update students in their school
CREATE POLICY "Users can update students in their school" ON public.students
FOR UPDATE
USING (
  school_id IN (
    -- User owns the school
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
    UNION
    -- User is a member of the school (future feature)
    SELECT school_id FROM public.school_users WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    -- User owns the school
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
    UNION
    -- User is a member of the school (future feature)
    SELECT school_id FROM public.school_users WHERE user_id = auth.uid()
  )
);

-- Policy: Users can delete students from their school
CREATE POLICY "Users can delete students from their school" ON public.students
FOR DELETE
USING (
  school_id IN (
    -- User owns the school
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
    UNION
    -- User is a member of the school (future feature)
    SELECT school_id FROM public.school_users WHERE user_id = auth.uid()
  )
);

-- 4. Verify the policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'students' 
  AND schemaname = 'public'
ORDER BY policyname;

-- 5. Test: Count students for current user
SELECT COUNT(*) as student_count 
FROM public.students 
WHERE school_id IN (
  SELECT id FROM public.schools WHERE owner_id = auth.uid()
);