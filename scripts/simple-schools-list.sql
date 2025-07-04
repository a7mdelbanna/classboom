-- Simple list of schools and their admins
-- Run this in Supabase SQL Editor

SELECT 
  s.name as school_name,
  u.email as admin_email,
  COUNT(st.id) as total_students,
  s.created_at::date as created_date
FROM schools s
JOIN auth.users u ON s.owner_id = u.id
LEFT JOIN students st ON st.school_id = s.id
GROUP BY s.id, s.name, u.email, s.created_at
ORDER BY s.created_at DESC;