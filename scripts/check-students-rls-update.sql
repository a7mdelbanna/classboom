-- Check RLS policies on students table for UPDATE operations
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
  AND (cmd = 'UPDATE' OR cmd = 'ALL')
ORDER BY policyname;

-- Check if school owners can update students
-- This will help us understand if RLS is blocking the invite_token update