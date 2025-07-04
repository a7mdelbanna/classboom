-- Check the actual columns in the students table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'students'
ORDER BY ordinal_position;

-- Also check if there are any broken generated columns
SELECT 
  attname as column_name,
  attgenerated as is_generated
FROM pg_attribute
WHERE attrelid = 'public.students'::regclass
  AND attnum > 0
  AND NOT attisdropped
  AND attgenerated != '';