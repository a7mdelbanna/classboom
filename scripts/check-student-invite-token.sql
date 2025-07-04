-- Check if invite_token column exists in students table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'students'
  AND column_name IN ('invite_token', 'invite_sent_at', 'can_login', 'user_id', 'account_created_at')
ORDER BY column_name;

-- Check a specific student's invitation data
SELECT 
  id,
  student_code,
  first_name,
  last_name,
  email,
  invite_token,
  invite_sent_at,
  can_login,
  user_id,
  account_created_at
FROM students
WHERE email IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;