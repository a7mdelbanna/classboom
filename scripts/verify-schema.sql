-- Verify Database Schema Script
-- Run this after cleaning data to ensure schema is correct

-- 1. Check if all expected tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('schools', 'students', 'classes', 'enrollment', 
                        'attendance', 'activities', 'grades', 'invoices', 
                        'payments', 'parent_accounts', 'parents', 
                        'parent_student_relationships') 
    THEN 'Expected' 
    ELSE 'Unexpected' 
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check students table columns specifically
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'full_name' THEN 'GENERATED'
    ELSE 'REGULAR'
  END as column_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'students'
ORDER BY ordinal_position;

-- 3. Check for any generated columns issues
SELECT 
  c.column_name,
  c.generation_expression
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'students'
  AND c.is_generated = 'ALWAYS';

-- 4. Check RLS policies on students table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'students'
ORDER BY policyname;

-- 5. Check if there are any issues with the full_name generated column
-- Try to create a test record to see if the generated column works
DO $$
BEGIN
  -- This is just a test, it will be rolled back
  INSERT INTO public.students (
    school_id,
    student_code,
    first_name,
    last_name,
    email
  ) VALUES (
    gen_random_uuid(),
    'TEST001',
    'Test',
    'Student',
    'test@example.com'
  );
  
  -- If we get here, the insert worked
  RAISE NOTICE 'Generated column test: SUCCESS';
  
  -- Rollback the test insert
  ROLLBACK;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Generated column test: FAILED - %', SQLERRM;
    ROLLBACK;
END $$;