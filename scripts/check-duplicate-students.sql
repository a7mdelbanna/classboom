-- Check for duplicate student records
SELECT 
  COUNT(*) as record_count,
  user_id,
  email
FROM students 
WHERE user_id = '66e0e600-7827-4498-8532-021be649fc80'
GROUP BY user_id, email;

-- Get all student records for this user
SELECT 
  id,
  email,
  user_id,
  school_id,
  first_name,
  last_name,
  account_created_at,
  created_at
FROM students 
WHERE user_id = '66e0e600-7827-4498-8532-021be649fc80'
ORDER BY created_at DESC;