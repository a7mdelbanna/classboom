-- Check and fix RLS policies for students table

-- 1. Check current RLS policies on students table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'students'
ORDER BY policyname;

-- 2. Drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Students can view their own profile" ON students;
DROP POLICY IF EXISTS "Students can read their own record" ON students;
DROP POLICY IF EXISTS "Enable read for students" ON students;

-- 3. Create a proper policy for students to read their own record
CREATE POLICY "Students can read their own record" ON students
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    auth.uid() IN (SELECT owner_id FROM schools WHERE id = school_id)
  );

-- 4. Test the policy
-- This should return 1 row when logged in as the student
SELECT COUNT(*) as accessible_records
FROM students
WHERE user_id = '66e0e600-7827-4498-8532-021be649fc80';

-- 5. Verify all policies
SELECT 
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'students'
ORDER BY policyname;