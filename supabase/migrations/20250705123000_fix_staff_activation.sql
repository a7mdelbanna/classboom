-- Function to safely activate staff account
CREATE OR REPLACE FUNCTION public.activate_staff_account(
  p_staff_id UUID,
  p_user_id UUID,
  p_permissions JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_staff RECORD;
  v_result JSONB;
BEGIN
  -- Update the staff record
  UPDATE public.staff
  SET 
    user_id = p_user_id,
    portal_access_enabled = true,
    account_created_at = NOW(),
    invite_token = NULL,
    permissions = COALESCE(p_permissions, permissions, '{}'::jsonb),
    updated_at = NOW()
  WHERE id = p_staff_id
  RETURNING * INTO v_staff;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Staff member not found'
    );
  END IF;
  
  -- Return success with staff data
  RETURN jsonb_build_object(
    'success', true,
    'data', row_to_json(v_staff)::jsonb
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.activate_staff_account TO authenticated;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff can read their own record by user_id" ON public.staff;
DROP POLICY IF EXISTS "Staff can read their own school" ON public.schools;

-- Ensure RLS allows staff to read their own record
CREATE POLICY "Staff can read their own record by user_id" ON public.staff
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR auth.uid() IN (SELECT owner_id FROM public.schools WHERE id = staff.school_id)
  );

-- Ensure RLS allows staff to read their school
CREATE POLICY "Staff can read their own school" ON public.schools
  FOR SELECT
  USING (
    auth.uid() = owner_id 
    OR auth.uid() IN (SELECT user_id FROM public.staff WHERE school_id = schools.id AND portal_access_enabled = true)
  );