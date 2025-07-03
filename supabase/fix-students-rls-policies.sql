-- Fix infinite recursion in students RLS policies
-- Drop all existing policies first to avoid conflicts

DROP POLICY IF EXISTS "School owners can view their students" ON public.students;
DROP POLICY IF EXISTS "School owners can create students" ON public.students;
DROP POLICY IF EXISTS "School owners can update students" ON public.students;
DROP POLICY IF EXISTS "School owners can delete students" ON public.students;
DROP POLICY IF EXISTS "school_owners_select_students" ON public.students;
DROP POLICY IF EXISTS "school_owners_insert_students" ON public.students;
DROP POLICY IF EXISTS "school_owners_update_students" ON public.students;
DROP POLICY IF EXISTS "school_owners_delete_students" ON public.students;
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Parents can view children profiles" ON public.students;

-- Recreate policies without circular references

-- 1. School owners can manage their students
CREATE POLICY "school_owners_manage_students" ON public.students
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.schools
      WHERE schools.id = students.school_id
      AND schools.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.schools
      WHERE schools.id = students.school_id
      AND schools.owner_id = auth.uid()
    )
  );

-- 2. Students can view their own profile (only if they have a user_id)
CREATE POLICY "students_view_own_profile" ON public.students
  FOR SELECT
  USING (
    user_id IS NOT NULL 
    AND user_id = auth.uid()
  );

-- 3. Parents can view their children's profiles
CREATE POLICY "parents_view_children" ON public.students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM public.parent_student_relationships psr
      JOIN public.parent_accounts pa ON pa.id = psr.parent_id
      WHERE psr.student_id = students.id
      AND pa.user_id = auth.uid()
    )
  );