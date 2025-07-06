-- Fix staff activation function
-- This ensures the validation function exists and works correctly

-- Drop and recreate the function to ensure it's working
DROP FUNCTION IF EXISTS validate_staff_activation_token(text);

-- Create a function to validate staff activation tokens
-- This runs with elevated privileges to bypass RLS
CREATE OR REPLACE FUNCTION validate_staff_activation_token(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff record;
  v_result json;
BEGIN
  -- Find the staff member by token
  SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.role,
    s.department,
    s.invite_sent_at,
    s.portal_access_enabled,
    s.school_id,
    sc.name as school_name
  INTO v_staff
  FROM public.staff s
  LEFT JOIN public.schools sc ON s.school_id = sc.id
  WHERE s.invite_token = p_token
    AND s.can_login = true
  LIMIT 1;

  -- Check if staff member was found
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired invitation link'
    );
  END IF;

  -- Check if already activated
  IF v_staff.portal_access_enabled THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invitation has already been used'
    );
  END IF;

  -- Check if invitation is expired (48 hours)
  IF v_staff.invite_sent_at IS NOT NULL AND v_staff.invite_sent_at + interval '48 hours' < now() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'This invitation has expired'
    );
  END IF;

  -- Return success with staff data
  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'id', v_staff.id,
      'first_name', v_staff.first_name,
      'last_name', v_staff.last_name,
      'email', v_staff.email,
      'role', v_staff.role,
      'department', v_staff.department,
      'school_name', COALESCE(v_staff.school_name, 'School')
    )
  );
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION validate_staff_activation_token(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_staff_activation_token(text) TO authenticated;

-- Also ensure we have the activate_staff_account function
CREATE OR REPLACE FUNCTION activate_staff_account(
  p_staff_id uuid,
  p_user_id uuid,
  p_permissions jsonb DEFAULT '{}'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  -- Update the staff record
  UPDATE public.staff
  SET 
    user_id = p_user_id,
    portal_access_enabled = true,
    invite_token = NULL,
    account_created_at = NOW(),
    permissions = CASE 
      WHEN p_permissions IS NOT NULL AND p_permissions != '{}'::jsonb 
      THEN p_permissions 
      ELSE permissions 
    END
  WHERE id = p_staff_id
    AND portal_access_enabled = false;

  -- Check if update was successful
  IF FOUND THEN
    -- Update user metadata with staff_id for faster lookups
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('staff_id', p_staff_id)
    WHERE id = p_user_id;

    RETURN json_build_object(
      'success', true,
      'message', 'Staff account activated successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to activate staff account or account already activated'
    );
  END IF;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION activate_staff_account(uuid, uuid, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION activate_staff_account(uuid, uuid, jsonb) TO authenticated;