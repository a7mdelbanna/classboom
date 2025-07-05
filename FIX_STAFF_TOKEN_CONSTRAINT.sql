-- First, let's see all constraints on the staff table
SELECT 
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.staff'::regclass
AND conname LIKE '%invite_token%';

-- Check if the column is already TEXT (which it appears to be)
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'staff' 
  AND column_name = 'invite_token';

-- Since the token exists and is in TEXT format, let's check why the query is failing
-- Try this exact query from the StaffActivation component
SELECT 
  id,
  first_name,
  last_name,
  email,
  role,
  department,
  invite_token,
  invite_sent_at,
  portal_access_enabled,
  school_id
FROM public.staff
WHERE invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49'
  AND can_login = true;

-- Check if there's any whitespace or case issues
SELECT 
  id,
  first_name,
  last_name,
  email,
  LENGTH(invite_token) as token_length,
  invite_token,
  can_login,
  portal_access_enabled
FROM public.staff
WHERE invite_token LIKE '405b3c6820b09fa%';

-- Let's also check the schools relationship
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.email,
  s.school_id,
  sc.name as school_name
FROM public.staff s
LEFT JOIN public.schools sc ON s.school_id = sc.id
WHERE s.invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49';