-- Comprehensive RLS fix for staff portal access
-- This migration ensures staff members can access all necessary data

-- First, drop all existing conflicting policies
DROP POLICY IF EXISTS "Staff can read their own record by user_id" ON public.staff;
DROP POLICY IF EXISTS "Staff can view their own record" ON public.staff;
DROP POLICY IF EXISTS "Staff can update their own record" ON public.staff;
DROP POLICY IF EXISTS "Schools can be read by school owner" ON public.schools;
DROP POLICY IF EXISTS "Staff can read their own school" ON public.schools;
DROP POLICY IF EXISTS "Staff can read their school" ON public.schools;

-- 1. STAFF TABLE POLICIES

-- Allow staff to read their own record (by user_id OR by id when authenticated)
CREATE POLICY "Staff can read their own record"
ON public.staff
FOR SELECT
TO authenticated
USING (
  -- Can read by user_id match
  auth.uid() = user_id
  -- OR can read by id if they are the authenticated user for that staff record
  OR id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
  -- OR school owner can read all staff
  OR auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = staff.school_id)
);

-- Allow staff to update their own record
CREATE POLICY "Staff can update their own record"
ON public.staff
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow school owners to manage all staff
CREATE POLICY "School owners can manage staff"
ON public.staff
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = staff.school_id)
)
WITH CHECK (
  auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = staff.school_id)
);

-- 2. SCHOOLS TABLE POLICIES

-- Allow school owners to read their school
CREATE POLICY "School owners can read their school"
ON public.schools
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Allow staff to read their school
CREATE POLICY "Staff can read their school"
ON public.schools
FOR SELECT
TO authenticated
USING (
  -- School is linked to a staff member with this user_id
  id IN (
    SELECT school_id 
    FROM public.staff 
    WHERE user_id = auth.uid() 
      AND portal_access_enabled = true
  )
);

-- 3. STUDENTS TABLE POLICIES

-- First drop any existing student policies that might conflict
DROP POLICY IF EXISTS "Students belong to school" ON public.students;
DROP POLICY IF EXISTS "School owners can manage students" ON public.students;
DROP POLICY IF EXISTS "Staff can view students based on permissions" ON public.students;

-- School owners can manage all students
CREATE POLICY "School owners can manage students"
ON public.students
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = students.school_id)
)
WITH CHECK (
  auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = students.school_id)
);

-- Staff can view students based on their permissions
CREATE POLICY "Staff can view students based on permissions"
ON public.students
FOR SELECT
TO authenticated
USING (
  -- Check if user is a staff member with appropriate permissions
  EXISTS (
    SELECT 1 
    FROM public.staff 
    WHERE staff.user_id = auth.uid()
      AND staff.school_id = students.school_id
      AND portal_access_enabled = true
      AND (
        -- Admin and manager can view all
        role IN ('admin', 'manager')
        -- Teachers can view if they have permission
        OR (role = 'teacher' AND (permissions->>'can_view_all_students')::boolean = true)
        -- Support staff can view if they have permission
        OR (role = 'support' AND (permissions->>'can_view_all_students')::boolean = true)
        -- TODO: Add logic for teachers to see only their assigned students
      )
  )
);

-- 4. COURSES TABLE POLICIES (if staff need to access courses)

-- Drop existing policies if any
DROP POLICY IF EXISTS "Courses belong to school" ON public.courses;
DROP POLICY IF EXISTS "Staff can view courses" ON public.courses;

-- School owners can manage all courses
CREATE POLICY "School owners can manage courses"
ON public.courses
FOR ALL
TO authenticated
USING (
  auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = courses.school_id)
)
WITH CHECK (
  auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = courses.school_id)
);

-- Staff can view courses in their school
CREATE POLICY "Staff can view courses"
ON public.courses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.staff 
    WHERE staff.user_id = auth.uid()
      AND staff.school_id = courses.school_id
      AND portal_access_enabled = true
  )
);

-- 5. STAFF_COURSE_ASSIGNMENTS TABLE POLICIES

-- Drop existing policies if any
DROP POLICY IF EXISTS "Staff can view their assignments" ON public.staff_course_assignments;

-- Staff can view their own course assignments
CREATE POLICY "Staff can view their assignments"
ON public.staff_course_assignments
FOR SELECT
TO authenticated
USING (
  -- Can see their own assignments
  staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
  -- OR school owner can see all
  OR EXISTS (
    SELECT 1 
    FROM public.staff s
    JOIN public.schools sc ON s.school_id = sc.id
    WHERE s.id = staff_course_assignments.staff_id
      AND sc.owner_id = auth.uid()
  )
);

-- 6. PAYROLL TABLE POLICIES (if exists)

-- Check if payroll table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Staff can view their payroll" ON public.payroll;
    DROP POLICY IF EXISTS "School owners can manage payroll" ON public.payroll;
    
    -- Staff can view their own payroll records
    EXECUTE 'CREATE POLICY "Staff can view their payroll"
    ON public.payroll
    FOR SELECT
    TO authenticated
    USING (
      staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
    )';
    
    -- School owners can manage all payroll
    EXECUTE 'CREATE POLICY "School owners can manage payroll"
    ON public.payroll
    FOR ALL
    TO authenticated
    USING (
      auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = payroll.school_id)
    )
    WITH CHECK (
      auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = payroll.school_id)
    )';
  END IF;
END $$;

-- 7. Add helpful indexes for performance

-- Index for staff lookups by user_id
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON public.staff(user_id);

-- Index for staff lookups by school_id
CREATE INDEX IF NOT EXISTS idx_staff_school_id ON public.staff(school_id);

-- Index for portal access checks
CREATE INDEX IF NOT EXISTS idx_staff_portal_access ON public.staff(user_id, portal_access_enabled) WHERE portal_access_enabled = true;

-- 8. Grant necessary permissions

-- Ensure authenticated users can execute RLS policies
GRANT SELECT ON public.staff TO authenticated;
GRANT SELECT ON public.schools TO authenticated;
GRANT SELECT ON public.students TO authenticated;
GRANT SELECT ON public.courses TO authenticated;
GRANT SELECT ON public.staff_course_assignments TO authenticated;

-- Update permissions for staff
GRANT UPDATE (portal_access_enabled, permissions, updated_at) ON public.staff TO authenticated;

-- Add comment explaining the policy structure
COMMENT ON POLICY "Staff can read their own record" ON public.staff IS 
'Allows staff members to read their own record either by user_id match or by id when they are authenticated. Also allows school owners to read all staff records.';

COMMENT ON POLICY "Staff can view students based on permissions" ON public.students IS
'Staff can view students based on their role and permissions. Admins and managers can see all students. Teachers and support staff need the can_view_all_students permission.';