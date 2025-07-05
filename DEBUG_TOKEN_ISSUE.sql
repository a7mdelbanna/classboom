-- Let's check the exact token for this staff member
SELECT 
  id,
  first_name,
  last_name,
  email,
  invite_token,
  LENGTH(invite_token) as token_length,
  invite_sent_at,
  can_login,
  portal_access_enabled
FROM public.staff
WHERE email = 'masdbsoft@gmail.com';

-- Let's see if we can manually update the token to match what's in the URL
-- First, let's update the invite_token to the one from the URL
UPDATE public.staff
SET invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49'
WHERE email = 'masdbsoft@gmail.com' 
  AND id = 'fb32faf9-e9a8-42f1-b8ba-11f9f37dc85e';

-- Verify the update
SELECT 
  id,
  first_name,
  last_name,
  email,
  invite_token,
  LENGTH(invite_token) as token_length,
  invite_sent_at,
  can_login,
  portal_access_enabled
FROM public.staff
WHERE email = 'masdbsoft@gmail.com';

-- Now let's test the query that the React component uses
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.email,
  s.role,
  s.department,
  s.invite_token,
  s.invite_sent_at,
  s.portal_access_enabled,
  sc.name as school_name
FROM public.staff s
LEFT JOIN public.schools sc ON s.school_id = sc.id
WHERE s.invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49'
  AND s.can_login = true;