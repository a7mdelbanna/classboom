-- EMERGENCY FIX: Remove RLS policies causing infinite recursion
-- Run this immediately to restore access to the application

-- Drop the problematic policies that are causing recursion
DROP POLICY IF EXISTS "Staff can read their own record" ON public.staff;
DROP POLICY IF EXISTS "Staff can update their own record" ON public.staff;
DROP POLICY IF EXISTS "School owners can manage staff" ON public.staff;
DROP POLICY IF EXISTS "School owners can read their school" ON public.schools;
DROP POLICY IF EXISTS "Staff can read their school" ON public.schools;
DROP POLICY IF EXISTS "School owners can manage students" ON public.students;
DROP POLICY IF EXISTS "Staff can view students based on permissions" ON public.students;
DROP POLICY IF EXISTS "School owners can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Staff can view courses" ON public.courses;
DROP POLICY IF EXISTS "Staff can view their assignments" ON public.staff_course_assignments;

-- Restore the original simple policies that were working

-- Schools table - simple policy without recursion
CREATE POLICY "Schools can be read by school owner"
ON public.schools
FOR ALL
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Students table - simple policy
CREATE POLICY "Students belong to school"
ON public.students
FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Staff table - simple policy for school owners only (for now)
CREATE POLICY "School owners can manage staff"
ON public.staff
FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Courses table - simple policy
CREATE POLICY "Courses belong to school"
ON public.courses
FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Activities table - simple policy
CREATE POLICY "Activities belong to school"
ON public.activities
FOR ALL
TO authenticated
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);