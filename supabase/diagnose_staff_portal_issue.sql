-- Diagnostic script to understand the staff portal access issue
-- Run this in your Supabase SQL editor to identify the problem

-- 1. Check current user
SELECT auth.uid() as current_user_id;

-- 2. Check if user exists in staff table
SELECT 
  id,
  user_id,
  email,
  first_name,
  last_name,
  portal_access_enabled,
  school_id
FROM public.staff
WHERE user_id = auth.uid();

-- 3. Check if user can see any staff records
SELECT 
  id,
  user_id,
  email,
  first_name,
  last_name,
  portal_access_enabled,
  school_id
FROM public.staff
WHERE user_id = auth.uid() OR id IN (SELECT id FROM public.staff WHERE user_id = auth.uid());

-- 4. Check school access
SELECT 
  s.id,
  s.name,
  s.owner_id,
  CASE 
    WHEN s.owner_id = auth.uid() THEN 'Owner'
    WHEN EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid() AND school_id = s.id) THEN 'Staff Member'
    ELSE 'No Access'
  END as access_type
FROM public.schools s
WHERE s.owner_id = auth.uid() 
   OR s.id IN (SELECT school_id FROM public.staff WHERE user_id = auth.uid());

-- 5. Check if RPC function works
SELECT * FROM public.get_staff_with_school(auth.uid());

-- 6. Check all policies on staff table
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
WHERE tablename = 'staff'
ORDER BY policyname;

-- 7. Check all policies on schools table
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
WHERE tablename = 'schools'
ORDER BY policyname;