-- COMPREHENSIVE FIX for students disappearing issue
-- This fixes duplicate RLS policies and ensures proper visibility

-- 1. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;
DROP POLICY IF EXISTS "Enable update for users based on school_id" ON public.students;
DROP POLICY IF EXISTS "Enable delete for users based on school_id" ON public.students;
DROP POLICY IF EXISTS "School owners can view their students" ON public.students;
DROP POLICY IF EXISTS "School owners can create students" ON public.students;
DROP POLICY IF EXISTS "School owners can update students" ON public.students;
DROP POLICY IF EXISTS "School owners can delete students" ON public.students;
DROP POLICY IF EXISTS "students_select_policy" ON public.students;
DROP POLICY IF EXISTS "students_insert_policy" ON public.students;
DROP POLICY IF EXISTS "students_update_policy" ON public.students;
DROP POLICY IF EXISTS "students_delete_policy" ON public.students;
DROP POLICY IF EXISTS "Users can view students from their school" ON public.students;
DROP POLICY IF EXISTS "Users can create students in their school" ON public.students;
DROP POLICY IF EXISTS "Users can update students in their school" ON public.students;
DROP POLICY IF EXISTS "Users can delete students from their school" ON public.students;

-- 2. Ensure RLS is enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 3. Create single, clear policies

-- SELECT: School owners can view students from schools they own
CREATE POLICY "school_owners_select_students" ON public.students
FOR SELECT
TO authenticated
USING (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
);

-- INSERT: School owners can create students in schools they own
CREATE POLICY "school_owners_insert_students" ON public.students
FOR INSERT
TO authenticated
WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
);

-- UPDATE: School owners can update students in schools they own
CREATE POLICY "school_owners_update_students" ON public.students
FOR UPDATE
TO authenticated
USING (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
);

-- DELETE: School owners can delete students from schools they own
CREATE POLICY "school_owners_delete_students" ON public.students
FOR DELETE
TO authenticated
USING (
  school_id IN (
    SELECT id FROM public.schools 
    WHERE owner_id = auth.uid()
  )
);

-- 4. Verify the fix
-- Check current user
SELECT auth.uid() as current_user_id;

-- Check schools owned by current user
SELECT id, name, owner_id 
FROM public.schools 
WHERE owner_id = auth.uid();

-- Check students visible to current user
SELECT s.id, s.first_name, s.last_name, s.school_id, sch.name as school_name
FROM public.students s
JOIN public.schools sch ON s.school_id = sch.id
WHERE sch.owner_id = auth.uid()
ORDER BY s.created_at DESC
LIMIT 10;

-- Check policies
SELECT 
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'students' 
  AND schemaname = 'public'
ORDER BY policyname;