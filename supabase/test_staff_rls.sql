-- Test script to verify staff RLS policies are working correctly
-- Run this in Supabase SQL editor after applying the migration

-- 1. First, let's see what staff records exist
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.email,
  s.user_id,
  s.portal_access_enabled,
  s.school_id,
  sc.name as school_name,
  sc.owner_id as school_owner_id
FROM public.staff s
LEFT JOIN public.schools sc ON s.school_id = sc.id
LIMIT 10;

-- 2. Test: Can a staff member with portal access read their own record?
-- Replace 'STAFF_USER_ID' with an actual staff user_id from above query
-- Run this with "Run as: authenticated user" and set the user_id
/*
SELECT * FROM public.staff 
WHERE user_id = auth.uid();
*/

-- 3. Test: Can a staff member read their school?
-- This simulates what happens when staff.school is joined
/*
SELECT 
  s.*,
  sc.id as school_id,
  sc.name as school_name
FROM public.staff s
JOIN public.schools sc ON s.school_id = sc.id
WHERE s.user_id = auth.uid();
*/

-- 4. Test: Can staff see students based on permissions?
-- This shows what students a staff member can see
/*
SELECT 
  st.id,
  st.first_name,
  st.last_name,
  s.role as staff_role,
  s.permissions->>'can_view_all_students' as can_view_all
FROM public.students st
CROSS JOIN public.staff s
WHERE s.user_id = auth.uid()
LIMIT 10;
*/

-- 5. Check if there are any staff with null or invalid data
SELECT 
  COUNT(*) as total_staff,
  COUNT(user_id) as with_user_id,
  COUNT(CASE WHEN portal_access_enabled THEN 1 END) as with_portal_access,
  COUNT(CASE WHEN user_id IS NOT NULL AND portal_access_enabled THEN 1 END) as ready_for_portal
FROM public.staff;

-- 6. Find staff that might have issues accessing the portal
SELECT 
  id,
  first_name,
  last_name,
  email,
  user_id,
  portal_access_enabled,
  invite_token IS NOT NULL as has_invite_token,
  account_created_at
FROM public.staff
WHERE user_id IS NOT NULL 
  AND (portal_access_enabled IS NULL OR portal_access_enabled = false);

-- 7. Debug: Show current RLS policies
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
WHERE tablename IN ('staff', 'schools', 'students', 'courses')
ORDER BY tablename, policyname;

-- 8. Helper: Update a specific staff member to enable portal access
-- Uncomment and modify as needed
/*
UPDATE public.staff
SET 
  portal_access_enabled = true,
  updated_at = NOW()
WHERE id = 'STAFF_ID_HERE'
  AND user_id IS NOT NULL;
*/