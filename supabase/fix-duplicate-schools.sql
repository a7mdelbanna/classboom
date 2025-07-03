-- FIX DUPLICATE SCHOOLS AND CONSOLIDATE STUDENTS
-- This migration consolidates all students into the oldest school for each user

-- First, let's see the damage for a specific user
WITH school_stats AS (
  SELECT 
    owner_id,
    COUNT(*) as total_schools,
    MIN(created_at) as oldest_school_created,
    MAX(created_at) as newest_school_created
  FROM public.schools
  WHERE owner_id = 'cd48cbef-b36f-4f1f-9f81-cb406d72f0a3'
  GROUP BY owner_id
)
SELECT * FROM school_stats;

-- Get the oldest school for this user (the canonical one)
WITH oldest_school AS (
  SELECT id, name, created_at
  FROM public.schools
  WHERE owner_id = 'cd48cbef-b36f-4f1f-9f81-cb406d72f0a3'
  ORDER BY created_at ASC
  LIMIT 1
)
SELECT * FROM oldest_school;

-- Move all students to the oldest school
WITH oldest_school AS (
  SELECT id
  FROM public.schools
  WHERE owner_id = 'cd48cbef-b36f-4f1f-9f81-cb406d72f0a3'
  ORDER BY created_at ASC
  LIMIT 1
)
UPDATE public.students
SET school_id = (SELECT id FROM oldest_school)
WHERE school_id IN (
  SELECT id 
  FROM public.schools 
  WHERE owner_id = 'cd48cbef-b36f-4f1f-9f81-cb406d72f0a3'
);

-- Delete all duplicate schools (keeping the oldest)
WITH oldest_school AS (
  SELECT id
  FROM public.schools
  WHERE owner_id = 'cd48cbef-b36f-4f1f-9f81-cb406d72f0a3'
  ORDER BY created_at ASC
  LIMIT 1
)
DELETE FROM public.schools
WHERE owner_id = 'cd48cbef-b36f-4f1f-9f81-cb406d72f0a3'
  AND id != (SELECT id FROM oldest_school);

-- NOTE: We cannot add a unique constraint on owner_id as it would prevent
-- legitimate use cases where a user might own multiple schools/branches.
-- The fix is in the application code to always use the oldest school.

-- Verify the fix
SELECT 
  s.owner_id,
  COUNT(DISTINCT s.id) as school_count,
  COUNT(DISTINCT st.id) as total_students
FROM public.schools s
LEFT JOIN public.students st ON s.id = st.school_id
WHERE s.owner_id = 'cd48cbef-b36f-4f1f-9f81-cb406d72f0a3'
GROUP BY s.owner_id;