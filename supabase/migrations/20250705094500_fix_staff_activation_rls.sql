-- Create a policy that allows anonymous users to read staff data during activation
-- This is needed because the activation page runs before the user is authenticated

-- First, check if the policy already exists and drop it
DROP POLICY IF EXISTS "Allow anonymous to read staff for activation" ON public.staff;

-- Create the new policy
CREATE POLICY "Allow anonymous to read staff for activation" 
ON public.staff 
FOR SELECT 
TO anon
USING (
  invite_token IS NOT NULL 
  AND can_login = true 
  AND portal_access_enabled = false
);

-- Also ensure schools can be read by anonymous users for the join
DROP POLICY IF EXISTS "Allow anonymous to read schools for staff activation" ON public.schools;

CREATE POLICY "Allow anonymous to read schools for staff activation"
ON public.schools
FOR SELECT
TO anon
USING (
  id IN (
    SELECT school_id 
    FROM public.staff 
    WHERE invite_token IS NOT NULL 
      AND can_login = true 
      AND portal_access_enabled = false
  )
);

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
  IF v_staff.invite_sent_at + interval '48 hours' < now() THEN
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