-- COMPREHENSIVE FIX FOR ALL USERS WITH DUPLICATE SCHOOLS
-- This migration consolidates all students into the oldest school for EVERY user

-- 1. First, let's see how many users have duplicate schools
SELECT 
  owner_id,
  COUNT(*) as school_count,
  MIN(created_at) as first_school_created,
  MAX(created_at) as last_school_created
FROM public.schools
GROUP BY owner_id
HAVING COUNT(*) > 1
ORDER BY school_count DESC;

-- 2. For each user with duplicate schools, move all students to their oldest school
WITH users_with_duplicates AS (
  SELECT owner_id
  FROM public.schools
  GROUP BY owner_id
  HAVING COUNT(*) > 1
),
oldest_schools AS (
  SELECT DISTINCT ON (owner_id)
    owner_id,
    id as oldest_school_id
  FROM public.schools
  WHERE owner_id IN (SELECT owner_id FROM users_with_duplicates)
  ORDER BY owner_id, created_at ASC
)
UPDATE public.students s
SET school_id = os.oldest_school_id
FROM oldest_schools os
JOIN public.schools sch ON sch.owner_id = os.owner_id
WHERE s.school_id = sch.id
  AND s.school_id != os.oldest_school_id;

-- 3. Delete all duplicate schools (keeping the oldest for each user)
WITH users_with_duplicates AS (
  SELECT owner_id
  FROM public.schools
  GROUP BY owner_id
  HAVING COUNT(*) > 1
),
oldest_schools AS (
  SELECT DISTINCT ON (owner_id)
    owner_id,
    id as oldest_school_id
  FROM public.schools
  WHERE owner_id IN (SELECT owner_id FROM users_with_duplicates)
  ORDER BY owner_id, created_at ASC
)
DELETE FROM public.schools s
USING oldest_schools os
WHERE s.owner_id = os.owner_id
  AND s.id != os.oldest_school_id;

-- 4. Verify the fix - should show only 1 school per user
SELECT 
  owner_id,
  COUNT(*) as school_count,
  SUM(student_count) as total_students
FROM (
  SELECT 
    s.owner_id,
    s.id,
    COUNT(st.id) as student_count
  FROM public.schools s
  LEFT JOIN public.students st ON s.id = st.school_id
  GROUP BY s.owner_id, s.id
) school_stats
GROUP BY owner_id
ORDER BY total_students DESC;