-- Clean Auth Users Script
-- This will show all users first, then you can decide which ones to delete

-- 1. List all auth users with their metadata
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'school_name' as school_name,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users
ORDER BY created_at DESC;

-- 2. Count users by role
SELECT 
  COALESCE(raw_user_meta_data->>'role', 'no_role') as role,
  COUNT(*) as count
FROM auth.users
GROUP BY role
ORDER BY count DESC;

-- 3. Delete specific users by email (uncomment and modify as needed)
-- DELETE FROM auth.users WHERE email = 'test@example.com';

-- 4. Delete all student users (uncomment if needed)
-- DELETE FROM auth.users WHERE raw_user_meta_data->>'role' = 'student';

-- 5. Delete all parent users (uncomment if needed)
-- DELETE FROM auth.users WHERE raw_user_meta_data->>'role' = 'parent';

-- 6. Delete all users except specific ones (uncomment and modify)
-- DELETE FROM auth.users WHERE email NOT IN ('your-admin@example.com');

-- 7. Delete all unconfirmed users (uncomment if needed)
-- DELETE FROM auth.users WHERE email_confirmed_at IS NULL;

-- 8. Show remaining users after cleanup
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  email_confirmed_at IS NOT NULL as confirmed
FROM auth.users
ORDER BY created_at DESC;