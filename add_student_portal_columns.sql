-- Add missing portal-related columns to students table
-- These columns are needed for the activation flow to work

-- Add portal access columns
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS can_login BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invite_token TEXT,
ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_invite_token ON public.students(invite_token);
CREATE INDEX IF NOT EXISTS idx_students_can_login ON public.students(can_login);

-- Add grade column back (it was dropped but we still use it)
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS grade TEXT;

-- Create function to validate student activation tokens (similar to staff)
CREATE OR REPLACE FUNCTION validate_student_activation_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student record;
BEGIN
  -- Find the student by token
  SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.student_code,
    s.grade,
    s.invite_sent_at,
    s.account_created_at,
    s.school_id,
    sc.name as school_name
  INTO v_student
  FROM public.students s
  LEFT JOIN public.schools sc ON s.school_id = sc.id
  WHERE s.invite_token = p_token
    AND s.can_login = true
  LIMIT 1;

  -- Check if student was found
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation link'
    );
  END IF;

  -- Check if already activated
  IF v_student.account_created_at IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invitation has already been used'
    );
  END IF;

  -- Check if invitation is expired (48 hours)
  IF v_student.invite_sent_at IS NOT NULL AND v_student.invite_sent_at + interval '48 hours' < now() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invitation has expired'
    );
  END IF;

  -- Return success with student data
  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'id', v_student.id,
      'first_name', v_student.first_name,
      'last_name', v_student.last_name,
      'email', v_student.email,
      'student_code', v_student.student_code,
      'grade', v_student.grade,
      'school_name', COALESCE(v_student.school_name, 'School')
    )
  );
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION validate_student_activation_token(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_student_activation_token(text) TO authenticated;