-- Script to remove "My School" owned by ahmedoshkaa@gmail.com
-- Run this in Supabase SQL Editor

-- 1. First, verify what we're about to delete
SELECT 
  s.id,
  s.name,
  u.email as owner_email,
  COUNT(st.id) as student_count
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
LEFT JOIN students st ON st.school_id = s.id
WHERE s.name = 'My School' 
  AND u.email = 'ahmedoshkaa@gmail.com'
GROUP BY s.id, s.name, u.email;

-- 2. Delete any students in this school (if any)
DELETE FROM students 
WHERE school_id IN (
  SELECT s.id 
  FROM schools s
  JOIN auth.users u ON s.owner_id = u.id
  WHERE s.name = 'My School' 
    AND u.email = 'ahmedoshkaa@gmail.com'
);

-- 3. Delete the school
DELETE FROM schools 
WHERE id IN (
  SELECT s.id 
  FROM schools s
  JOIN auth.users u ON s.owner_id = u.id
  WHERE s.name = 'My School' 
    AND u.email = 'ahmedoshkaa@gmail.com'
);

-- 4. Verify deletion
SELECT 'Schools remaining for ahmedoshkaa@gmail.com:' as info;
SELECT s.name, s.created_at
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
WHERE u.email = 'ahmedoshkaa@gmail.com';