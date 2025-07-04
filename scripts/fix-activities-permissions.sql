-- Check if activities table exists and has correct permissions

-- 1. Check if the log_activity function exists
SELECT EXISTS (
  SELECT 1 
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
  AND p.proname = 'log_activity'
) as function_exists;

-- 2. Grant permissions on activities table
GRANT SELECT, INSERT ON public.activities TO authenticated;
GRANT USAGE ON SEQUENCE activities_id_seq TO authenticated;

-- 3. Make sure the function has correct permissions
GRANT EXECUTE ON FUNCTION public.log_activity TO authenticated;

-- 4. Test if we can query the activities table
SELECT COUNT(*) as activity_count FROM public.activities;

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'activities'
ORDER BY policyname;