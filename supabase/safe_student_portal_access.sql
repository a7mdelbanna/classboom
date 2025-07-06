-- SAFE Student Portal Access Implementation
-- Following the same approach as staff portal to avoid RLS recursion

-- 1. Drop any problematic policies if they exist
DROP POLICY IF EXISTS "Students can read their own record" ON public.students;
DROP POLICY IF EXISTS "Students can update their own record" ON public.students;
DROP POLICY IF EXISTS "Students can read their school" ON public.schools;

-- 2. Create simple policies for students (only reference current table)
CREATE POLICY "Students can read own record by user_id"
ON public.students
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND can_login = true);

-- 3. Skip UPDATE policy for now to avoid column issues
-- Students can view their profile but not update it yet
-- This avoids any column reference errors

-- 4. Create RPC function to get student with school data (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_student_with_school(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  student_code text,
  first_name text,
  last_name text,
  email text,
  phone text,
  date_of_birth date,
  school_id uuid,
  user_id uuid,
  can_login boolean,
  account_created_at timestamptz,
  grade text,
  skill_level text,
  notes text,
  avatar_url text,
  created_at timestamptz,
  school_name text,
  school_address jsonb,
  school_phone text,
  school_email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.student_code,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.school_id,
    s.user_id,
    s.can_login,
    s.account_created_at,
    s.grade,
    s.skill_level,
    s.notes,
    s.avatar_url,
    s.created_at,
    sch.name as school_name,
    sch.address as school_address,
    sch.phone as school_phone,
    sch.email as school_email
  FROM public.students s
  LEFT JOIN public.schools sch ON sch.id = s.school_id
  WHERE s.user_id = p_user_id 
    AND s.can_login = true;
END;
$$;

-- 5. Create function to activate student account atomically
CREATE OR REPLACE FUNCTION public.activate_student_account(
  p_token text,
  p_user_id uuid,
  p_student_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_success boolean := false;
BEGIN
  -- Update student record atomically
  UPDATE public.students
  SET 
    user_id = p_user_id,
    invite_token = NULL,
    account_created_at = NOW()
  WHERE id = p_student_id
    AND invite_token = p_token
    AND account_created_at IS NULL;
  
  -- Check if update was successful
  IF FOUND THEN
    v_success := true;
    
    -- Update user metadata with student_id for faster lookups
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('student_id', p_student_id)
    WHERE id = p_user_id;
  END IF;
  
  RETURN v_success;
END;
$$;

-- 6. Create function to check if user is a student
CREATE OR REPLACE FUNCTION public.is_student(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.students 
    WHERE user_id = p_user_id 
      AND can_login = true
  );
END;
$$;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_student_with_school TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_student_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_student TO authenticated;

-- 8. Ensure students can read their own user metadata
GRANT SELECT ON auth.users TO authenticated;