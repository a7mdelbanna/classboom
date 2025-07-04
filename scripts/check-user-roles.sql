-- Check if a user has multiple roles (both school owner and student)
-- This script helps identify users who might have conflicting roles

-- 1. Check if ahmedoshkaa@gmail.com owns a school
SELECT 
  s.id as school_id,
  s.name as school_name,
  s.owner_id,
  u.email as owner_email,
  s.created_at
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
WHERE u.email = 'ahmedoshkaa@gmail.com';

-- 2. Check if ahmedoshkaa@gmail.com is registered as a student
SELECT 
  st.id as student_id,
  st.first_name,
  st.last_name,
  st.email,
  st.user_id,
  st.school_id,
  sc.name as school_name,
  st.account_created_at
FROM students st
LEFT JOIN schools sc ON st.school_id = sc.id
WHERE st.email = 'ahmedoshkaa@gmail.com';

-- 3. Check the user's metadata
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as metadata_role,
  raw_user_meta_data->>'student_id' as metadata_student_id,
  raw_user_meta_data->>'school_id' as metadata_school_id,
  created_at
FROM auth.users
WHERE email = 'ahmedoshkaa@gmail.com';

-- 4. Find all schools owned by a7md.elbanna@gmail.com to verify EnglishGang
SELECT 
  s.id,
  s.name,
  u.email as owner_email
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
WHERE u.email = 'a7md.elbanna@gmail.com';