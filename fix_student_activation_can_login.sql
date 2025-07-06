-- Fix student activation to set can_login = true
-- This is the missing piece that prevents students from being identified after activation

-- Update the activate_student_account function to set can_login = true
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
    account_created_at = NOW(),
    can_login = true  -- This was missing!
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