-- Drop the old trigger that creates custom schemas
DROP TRIGGER IF EXISTS on_classboom_user_created ON auth.users;

-- Drop the old functions that are no longer needed
DROP FUNCTION IF EXISTS public.handle_classboom_signup() CASCADE;
DROP FUNCTION IF EXISTS public.create_classboom_school_schema(TEXT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_classboom_login(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_school_schema(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.check_classboom_email_exists(TEXT) CASCADE;

-- Verify triggers are removed
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid::regclass::text = 'auth.users'
    OR tgrelid::regclass::text = 'public.schools';

-- Check for any remaining functions
SELECT 
    proname AS function_name,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname IN (
    'handle_classboom_signup',
    'create_classboom_school_schema',
    'handle_classboom_login',
    'get_user_school_schema',
    'check_classboom_email_exists'
);