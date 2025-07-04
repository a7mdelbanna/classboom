-- Script to list all schools and their admin/owner information
-- Run this in Supabase SQL Editor

-- 1. List all schools with their owners
SELECT 
  s.id as school_id,
  s.name as school_name,
  s.created_at as school_created,
  s.subscription_plan,
  s.subscription_status,
  u.id as owner_id,
  u.email as owner_email,
  u.created_at as owner_joined,
  u.last_sign_in_at as last_login
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
ORDER BY s.created_at DESC;

-- 2. Count students per school
SELECT 
  s.name as school_name,
  u.email as owner_email,
  COUNT(DISTINCT st.id) as student_count
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
LEFT JOIN students st ON st.school_id = s.id
GROUP BY s.id, s.name, u.email
ORDER BY s.created_at DESC;

-- 3. List all users and their roles
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'role' as metadata_role,
  u.raw_user_meta_data->>'full_name' as full_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM schools WHERE owner_id = u.id) THEN 'School Owner'
    WHEN EXISTS (SELECT 1 FROM students WHERE user_id = u.id) THEN 'Student'
    WHEN EXISTS (SELECT 1 FROM parent_accounts WHERE user_id = u.id) THEN 'Parent'
    ELSE 'No Role'
  END as actual_role
FROM auth.users u
ORDER BY u.created_at DESC;

-- 4. Find users with multiple roles (like ahmedoshkaa@gmail.com)
SELECT 
  u.email,
  COUNT(DISTINCT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM schools WHERE owner_id = u.id) THEN 'school_owner'
      ELSE NULL
    END
  ) + 
  COUNT(DISTINCT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM students WHERE user_id = u.id) THEN 'student'
      ELSE NULL
    END
  ) + 
  COUNT(DISTINCT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM parent_accounts WHERE user_id = u.id) THEN 'parent'
      ELSE NULL
    END
  ) as role_count,
  ARRAY_AGG(DISTINCT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM schools WHERE owner_id = u.id) THEN 'school_owner'
      WHEN EXISTS (SELECT 1 FROM students WHERE user_id = u.id) THEN 'student'
      WHEN EXISTS (SELECT 1 FROM parent_accounts WHERE user_id = u.id) THEN 'parent'
    END
  ) FILTER (WHERE 
    CASE 
      WHEN EXISTS (SELECT 1 FROM schools WHERE owner_id = u.id) THEN 'school_owner'
      WHEN EXISTS (SELECT 1 FROM students WHERE user_id = u.id) THEN 'student'
      WHEN EXISTS (SELECT 1 FROM parent_accounts WHERE user_id = u.id) THEN 'parent'
    END IS NOT NULL
  ) as roles
FROM auth.users u
GROUP BY u.id, u.email
HAVING COUNT(DISTINCT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM schools WHERE owner_id = u.id) THEN 'school_owner'
      WHEN EXISTS (SELECT 1 FROM students WHERE user_id = u.id) THEN 'student'
      WHEN EXISTS (SELECT 1 FROM parent_accounts WHERE user_id = u.id) THEN 'parent'
    END
  ) > 1;