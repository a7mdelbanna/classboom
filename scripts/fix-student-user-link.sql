-- Script to check and fix student user_id linking
-- Run this in Supabase SQL Editor

-- 1. Check if ahmedoshkaa@gmail.com exists in auth.users
SELECT 
  id as auth_user_id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'ahmedoshkaa@gmail.com';

-- 2. Check if there's a student record with this email
SELECT 
  id as student_id,
  email,
  user_id,
  first_name,
  last_name,
  school_id,
  account_created_at
FROM students 
WHERE email = 'ahmedoshkaa@gmail.com';

-- 3. Fix the link - update the student record with the correct user_id
UPDATE students 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'ahmedoshkaa@gmail.com'
  LIMIT 1
)
WHERE email = 'ahmedoshkaa@gmail.com' 
  AND user_id IS NULL;

-- 4. Verify the fix
SELECT 
  s.id as student_id,
  s.email,
  s.user_id,
  s.first_name,
  s.last_name,
  u.email as auth_email,
  u.id as auth_id
FROM students s
LEFT JOIN auth.users u ON s.user_id = u.id
WHERE s.email = 'ahmedoshkaa@gmail.com';