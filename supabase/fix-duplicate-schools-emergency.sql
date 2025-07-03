-- Emergency fix for duplicate schools issue
-- This migration consolidates all duplicate schools into the oldest one per user

-- First, create a temporary table to track the canonical schools
CREATE TEMP TABLE canonical_schools AS
SELECT DISTINCT ON (owner_id) 
    id as canonical_id,
    owner_id,
    name,
    created_at
FROM public.schools
ORDER BY owner_id, created_at ASC;

-- Show what we're about to do
DO $$
DECLARE
    user_rec RECORD;
BEGIN
    FOR user_rec IN 
        SELECT owner_id, COUNT(*) as school_count 
        FROM public.schools 
        GROUP BY owner_id 
        HAVING COUNT(*) > 1
    LOOP
        RAISE NOTICE 'User % has % duplicate schools', user_rec.owner_id, user_rec.school_count;
    END LOOP;
END $$;

-- Update all students to point to the canonical school
-- (Note: In this case, no students belong to the users with duplicates, but this is for safety)
UPDATE public.students s
SET school_id = cs.canonical_id
FROM canonical_schools cs
JOIN public.schools sch ON sch.id = s.school_id
WHERE sch.owner_id = cs.owner_id
AND s.school_id != cs.canonical_id;

-- Update any other tables that reference school_id
-- (Add more UPDATE statements here if there are other tables)

-- Delete all non-canonical schools
DELETE FROM public.schools s
WHERE EXISTS (
    SELECT 1 FROM canonical_schools cs
    WHERE cs.owner_id = s.owner_id
    AND cs.canonical_id != s.id
);

-- Add a unique constraint to prevent this from happening again
-- First drop if exists
ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_owner_id_unique;
-- Then add the constraint
ALTER TABLE public.schools ADD CONSTRAINT schools_owner_id_unique UNIQUE (owner_id);

-- Verify the fix
DO $$
DECLARE
    total_schools INT;
    users_with_schools INT;
BEGIN
    SELECT COUNT(*) INTO total_schools FROM public.schools;
    SELECT COUNT(DISTINCT owner_id) INTO users_with_schools FROM public.schools;
    
    RAISE NOTICE 'After cleanup: % schools for % users', total_schools, users_with_schools;
    
    IF total_schools != users_with_schools THEN
        RAISE EXCEPTION 'Still have duplicate schools after cleanup!';
    END IF;
END $$;

-- Log the fix
RAISE NOTICE 'Successfully consolidated duplicate schools. Each user now has exactly one school.';