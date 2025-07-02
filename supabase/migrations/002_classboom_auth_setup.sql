-- ClassBoom Authentication Setup
-- This handles user registration and authentication flow

-- Function to handle new ClassBoom user signup
CREATE OR REPLACE FUNCTION public.handle_classboom_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_school_schema TEXT;
  v_is_school_owner BOOLEAN;
BEGIN
  -- Check if this is a school owner signup (has school_name in metadata)
  v_is_school_owner := NEW.raw_user_meta_data->>'school_name' IS NOT NULL;
  
  IF v_is_school_owner THEN
    -- Create a new school for this owner
    v_school_schema := public.create_classboom_school_schema(
      NEW.raw_user_meta_data->>'school_name',
      NEW.id
    );
    
    -- Update user metadata with school schema
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || 
        jsonb_build_object('school_schema', v_school_schema, 'role', 'school_owner')
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signups
CREATE OR REPLACE TRIGGER on_classboom_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_classboom_signup();

-- Function to add user to existing school
CREATE OR REPLACE FUNCTION public.add_user_to_classboom_school(
  p_user_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_school_schema TEXT,
  p_invite_code TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_auth_user_id UUID;
BEGIN
  -- Validate role
  IF p_role NOT IN ('admin', 'teacher', 'student', 'parent') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;
  
  -- Validate school exists
  IF NOT EXISTS (SELECT 1 FROM public.schools WHERE schema_name = p_school_schema) THEN
    RAISE EXCEPTION 'School not found';
  END IF;
  
  -- Check if user already exists in auth
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = p_user_email;
  
  -- Generate user ID
  v_user_id := uuid_generate_v4();
  
  -- Add user to school schema
  EXECUTE format('
    INSERT INTO %I.users (id, auth_id, email, full_name, role)
    VALUES (%L, %L, %L, %L, %L)
  ', p_school_schema, v_user_id, v_auth_user_id, p_user_email, p_full_name, p_role);
  
  -- If auth user exists, update their metadata
  IF v_auth_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || 
        jsonb_build_object('school_schema', p_school_schema, 'role', p_role)
    WHERE id = v_auth_user_id;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle ClassBoom user login
CREATE OR REPLACE FUNCTION public.handle_classboom_login(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_school_schema TEXT;
  v_user_role TEXT;
  v_school_info RECORD;
BEGIN
  -- Get user's school schema
  v_school_schema := public.get_user_school_schema(p_user_id);
  
  IF v_school_schema IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not associated with any ClassBoom school'
    );
  END IF;
  
  -- Get user role from school schema
  EXECUTE format('
    SELECT role FROM %I.users WHERE auth_id = %L
  ', v_school_schema, p_user_id) INTO v_user_role;
  
  -- Get school information
  SELECT id, name, subscription_plan, subscription_status, trial_ends_at
  INTO v_school_info
  FROM public.schools
  WHERE schema_name = v_school_schema;
  
  -- Update user metadata
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || 
      jsonb_build_object(
        'school_schema', v_school_schema,
        'role', v_user_role,
        'school_id', v_school_info.id,
        'school_name', v_school_info.name
      )
  WHERE id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'school_schema', v_school_schema,
    'role', v_user_role,
    'school', jsonb_build_object(
      'id', v_school_info.id,
      'name', v_school_info.name,
      'subscription_plan', v_school_info.subscription_plan,
      'subscription_status', v_school_info.subscription_status,
      'trial_ends_at', v_school_info.trial_ends_at
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for ClassBoom user profiles
CREATE OR REPLACE VIEW public.classboom_user_profiles AS
SELECT 
  u.id as user_id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'school_schema' as school_schema,
  u.raw_user_meta_data->>'role' as role,
  u.raw_user_meta_data->>'school_name' as school_name,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u;

-- RLS for the view
ALTER VIEW public.classboom_user_profiles SET (security_invoker = on);

-- Function to check if email exists in ClassBoom
CREATE OR REPLACE FUNCTION public.check_classboom_email_exists(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE email = p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate ClassBoom invite code
CREATE OR REPLACE FUNCTION public.validate_classboom_invite(
  p_invite_code TEXT
) RETURNS JSONB AS $$
DECLARE
  v_result RECORD;
BEGIN
  -- This is a placeholder for invite code validation
  -- In production, you'd check against an invites table
  
  -- For now, return mock data for testing
  IF p_invite_code = 'DEMO2024' THEN
    RETURN jsonb_build_object(
      'valid', true,
      'school_name', 'Demo School',
      'school_schema', 'school_demo',
      'role', 'teacher'
    );
  END IF;
  
  RETURN jsonb_build_object('valid', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;