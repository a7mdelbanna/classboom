# 🚨 URGENT: Fix RLS Infinite Recursion Error

## The Problem
The RLS policies from the staff portal fix are causing infinite recursion, blocking ALL access to the schools table. This is preventing the entire app from working.

## Immediate Fix Required
Run this SQL in your Supabase Dashboard NOW:

```sql
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
```

## What This Does
1. Removes all the problematic RLS policies that were causing infinite recursion
2. Restores the simple, working policies that were in place before
3. Allows school owners to access their data again
4. Temporarily removes staff-specific policies (we'll add them back carefully)

## After Running This
1. The app should work again for school owners
2. Students, courses, and other data should be visible
3. We'll need to carefully add staff portal access without causing recursion

## Next Steps
After the app is working again, we'll implement staff portal access using the RPC functions (which bypass RLS) instead of complex RLS policies.