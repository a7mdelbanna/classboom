-- First, check if the students table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'students'
) as table_exists;

-- Check all columns in students table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  is_generated
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'students'
ORDER BY ordinal_position;

-- Check if student_code column exists specifically
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'students'
  AND column_name = 'student_code'
) as student_code_exists;

-- Check if first_name column exists specifically  
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'students'
  AND column_name = 'first_name'
) as first_name_exists;

-- Try a simple query to see if it works
SELECT COUNT(*) FROM public.students;

-- Try selecting specific columns
SELECT id, first_name, last_name FROM public.students LIMIT 1;