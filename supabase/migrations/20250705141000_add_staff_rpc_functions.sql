-- RPC functions to help staff access their data without RLS issues

-- Function to get staff data with school information
CREATE OR REPLACE FUNCTION public.get_staff_with_school(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  school_id UUID,
  staff_code TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT,
  department TEXT,
  employment_type TEXT,
  hire_date DATE,
  contract_end_date DATE,
  compensation_model TEXT,
  base_salary NUMERIC,
  hourly_rate NUMERIC,
  session_rate NUMERIC,
  currency TEXT,
  specializations TEXT[],
  max_weekly_hours INTEGER,
  min_weekly_hours INTEGER,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  national_id TEXT,
  address JSONB,
  emergency_contact JSONB,
  status TEXT,
  can_login BOOLEAN,
  portal_access_enabled BOOLEAN,
  permissions JSONB,
  user_id UUID,
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- School fields
  school_name TEXT,
  school_logo_url TEXT,
  school_address JSONB,
  school_phone TEXT,
  school_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow users to get their own staff data
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.school_id,
    s.staff_code,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.role,
    s.department,
    s.employment_type,
    s.hire_date,
    s.contract_end_date,
    s.compensation_model,
    s.base_salary,
    s.hourly_rate,
    s.session_rate,
    s.currency,
    s.specializations,
    s.max_weekly_hours,
    s.min_weekly_hours,
    s.date_of_birth,
    s.gender,
    s.nationality,
    s.national_id,
    s.address,
    s.emergency_contact,
    s.status,
    s.can_login,
    s.portal_access_enabled,
    s.permissions,
    s.user_id,
    s.avatar_url,
    s.notes,
    s.created_at,
    s.updated_at,
    -- School fields
    sc.name,
    sc.logo_url,
    sc.address,
    sc.phone,
    sc.email
  FROM public.staff s
  LEFT JOIN public.schools sc ON s.school_id = sc.id
  WHERE s.user_id = p_user_id
    AND s.portal_access_enabled = true;
END;
$$;

-- Function to check if a user is a staff member
CREATE OR REPLACE FUNCTION public.is_staff_member(p_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.staff 
    WHERE user_id = v_user_id 
      AND portal_access_enabled = true
  );
END;
$$;

-- Function to get staff permissions
CREATE OR REPLACE FUNCTION public.get_staff_permissions(p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_permissions JSONB;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT permissions
  INTO v_permissions
  FROM public.staff
  WHERE user_id = v_user_id
    AND portal_access_enabled = true;
  
  RETURN COALESCE(v_permissions, '{}'::jsonb);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_staff_with_school TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_member TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_permissions TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.get_staff_with_school IS 'Securely fetch staff data with school information for the authenticated user';
COMMENT ON FUNCTION public.is_staff_member IS 'Check if a user is an active staff member';
COMMENT ON FUNCTION public.get_staff_permissions IS 'Get staff permissions for the authenticated user';