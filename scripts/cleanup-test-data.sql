-- Cleanup script to remove test data for fresh email flow testing
-- Run this in Supabase SQL Editor

-- 1. First, check what we're about to delete
SELECT 'Users to delete:' as info;
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('ahmedoshkaa@gmail.com', 'test@example.com')
ORDER BY created_at DESC;

SELECT 'Schools to delete:' as info;
SELECT s.id, s.name, u.email as owner_email
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
WHERE u.email IN ('ahmedoshkaa@gmail.com', 'test@example.com');

SELECT 'Students to delete:' as info;
SELECT id, first_name, last_name, email, school_id
FROM students
WHERE email IN ('ahmedoshkaa@gmail.com', 'test@example.com');

-- 2. Delete the data (uncomment to execute)
-- Delete students first (due to foreign key constraints)
/*
DELETE FROM students 
WHERE email IN ('ahmedoshkaa@gmail.com', 'test@example.com');

-- Delete schools owned by these users
DELETE FROM schools 
WHERE owner_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('ahmedoshkaa@gmail.com', 'test@example.com')
);

-- Delete the auth users
-- Note: This requires service role access or Supabase Dashboard
-- You can do this from Supabase Dashboard > Authentication > Users
*/

-- 3. Alternative: Just clear the student records to test invitation flow again
-- This keeps the school owner account intact
DELETE FROM students 
WHERE email = 'ahmedoshkaa@gmail.com'
AND school_id IN (
  SELECT id FROM schools 
  WHERE owner_id = (
    SELECT id FROM auth.users 
    WHERE email = 'a7md.elbanna@gmail.com'
  )
);

-- 4. Verify the cleanup
SELECT 'Remaining students with this email:' as info;
SELECT * FROM students WHERE email = 'ahmedoshkaa@gmail.com';