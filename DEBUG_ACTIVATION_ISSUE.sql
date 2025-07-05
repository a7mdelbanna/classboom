-- First, let's check if the staff member exists with the token
SELECT 
  id,
  first_name,
  last_name,
  email,
  school_id,
  invite_token,
  can_login,
  portal_access_enabled
FROM public.staff
WHERE invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49';

-- Check if the school exists for this staff member
SELECT 
  s.id as staff_id,
  s.first_name,
  s.last_name,
  s.school_id,
  sc.id as school_id_from_join,
  sc.name as school_name
FROM public.staff s
LEFT JOIN public.schools sc ON s.school_id = sc.id
WHERE s.invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49';

-- Let's check RLS policies on staff table
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

-- Try the exact query from the React component (without RLS)
SELECT 
  s.*,
  sc.name as school_name
FROM public.staff s
LEFT JOIN public.schools sc ON s.school_id = sc.id
WHERE s.invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49'
  AND s.can_login = true;

-- Check if this is an RLS issue by checking with security definer
CREATE OR REPLACE FUNCTION check_staff_token(p_token text)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  role text,
  department text,
  school_name text,
  invite_sent_at timestamptz,
  portal_access_enabled boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.role,
    s.department,
    sc.name as school_name,
    s.invite_sent_at,
    s.portal_access_enabled
  FROM public.staff s
  LEFT JOIN public.schools sc ON s.school_id = sc.id
  WHERE s.invite_token = p_token
    AND s.can_login = true;
$$;

-- Test the function
SELECT * FROM check_staff_token('405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49');