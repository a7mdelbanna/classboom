-- ClassBoom Core Database Setup
-- This creates the multi-tenant architecture for ClassBoom

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ClassBoom schools registry in public schema
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  schema_name TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  subscription_plan TEXT DEFAULT 'trial',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial'))
);

-- Create ClassBoom subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT NOT NULL, -- monthly, yearly
  features JSONB NOT NULL,
  max_students INTEGER,
  max_teachers INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ClassBoom plans
INSERT INTO public.subscription_plans (name, code, price, interval, features, max_students, max_teachers) VALUES
  ('Free Trial', 'trial', 0, 'monthly', '{"sessions": 10, "students": 5, "messaging": false, "analytics": false}', 5, 1),
  ('Starter', 'starter', 29, 'monthly', '{"sessions": "unlimited", "students": 50, "messaging": true, "analytics": false}', 50, 3),
  ('Professional', 'professional', 79, 'monthly', '{"sessions": "unlimited", "students": 200, "messaging": true, "analytics": true}', 200, 10),
  ('Enterprise', 'enterprise', 199, 'monthly', '{"sessions": "unlimited", "students": "unlimited", "messaging": true, "analytics": true}', NULL, NULL);

-- Function to create a new ClassBoom school schema
CREATE OR REPLACE FUNCTION public.create_classboom_school_schema(
  p_school_name TEXT,
  p_owner_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_schema_name TEXT;
  v_school_id UUID;
BEGIN
  -- Generate unique schema name
  v_school_id := uuid_generate_v4();
  v_schema_name := 'school_' || REPLACE(v_school_id::TEXT, '-', '_');
  
  -- Create the schema
  EXECUTE format('CREATE SCHEMA %I', v_schema_name);
  
  -- Create tables in the new schema
  EXECUTE format('
    CREATE TABLE %I.users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      auth_id UUID UNIQUE,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar_url TEXT,
      phone TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      metadata JSONB DEFAULT ''{}''::jsonb,
      
      CONSTRAINT valid_role CHECK (role IN (''admin'', ''teacher'', ''student'', ''parent''))
    )', v_schema_name);
  
  EXECUTE format('
    CREATE TABLE %I.students (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES %I.users(id) ON DELETE CASCADE,
      student_code TEXT UNIQUE,
      date_of_birth DATE,
      grade_level TEXT,
      emergency_contact JSONB,
      medical_info JSONB,
      parent_info JSONB,
      enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status TEXT DEFAULT ''active'',
      notes TEXT,
      
      CONSTRAINT valid_status CHECK (status IN (''active'', ''inactive'', ''graduated'', ''dropped''))
    )', v_schema_name, v_schema_name);
  
  EXECUTE format('
    CREATE TABLE %I.courses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      description TEXT,
      teacher_id UUID REFERENCES %I.users(id),
      capacity INTEGER,
      duration_minutes INTEGER DEFAULT 60,
      color TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      settings JSONB DEFAULT ''{}''::jsonb
    )', v_schema_name, v_schema_name);
  
  EXECUTE format('
    CREATE TABLE %I.subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES %I.students(id) ON DELETE CASCADE,
      course_id UUID REFERENCES %I.courses(id) ON DELETE CASCADE,
      start_date DATE NOT NULL,
      end_date DATE,
      sessions_per_week INTEGER DEFAULT 1,
      session_duration INTEGER DEFAULT 60,
      price DECIMAL(10, 2),
      payment_type TEXT DEFAULT ''monthly'',
      auto_renew BOOLEAN DEFAULT true,
      status TEXT DEFAULT ''active'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      CONSTRAINT valid_payment_type CHECK (payment_type IN (''monthly'', ''quarterly'', ''yearly'', ''per_session'')),
      CONSTRAINT valid_subscription_status CHECK (status IN (''active'', ''paused'', ''cancelled'', ''expired''))
    )', v_schema_name, v_schema_name, v_schema_name);
  
  EXECUTE format('
    CREATE TABLE %I.sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      subscription_id UUID REFERENCES %I.subscriptions(id) ON DELETE CASCADE,
      scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
      duration_minutes INTEGER DEFAULT 60,
      status TEXT DEFAULT ''scheduled'',
      teacher_id UUID REFERENCES %I.users(id),
      room TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      CONSTRAINT valid_session_status CHECK (status IN (''scheduled'', ''completed'', ''cancelled'', ''no_show'', ''rescheduled''))
    )', v_schema_name, v_schema_name, v_schema_name);
  
  EXECUTE format('
    CREATE TABLE %I.attendance (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_id UUID REFERENCES %I.sessions(id) ON DELETE CASCADE,
      student_id UUID REFERENCES %I.students(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      checked_in_at TIMESTAMP WITH TIME ZONE,
      checked_out_at TIMESTAMP WITH TIME ZONE,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      CONSTRAINT valid_attendance_status CHECK (status IN (''present'', ''absent'', ''late'', ''excused''))
    )', v_schema_name, v_schema_name, v_schema_name);
  
  EXECUTE format('
    CREATE TABLE %I.payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      student_id UUID REFERENCES %I.students(id) ON DELETE CASCADE,
      subscription_id UUID REFERENCES %I.subscriptions(id),
      amount DECIMAL(10, 2) NOT NULL,
      currency TEXT DEFAULT ''USD'',
      payment_method TEXT,
      status TEXT DEFAULT ''pending'',
      due_date DATE,
      paid_at TIMESTAMP WITH TIME ZONE,
      reference_number TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      CONSTRAINT valid_payment_status CHECK (status IN (''pending'', ''paid'', ''overdue'', ''cancelled'', ''refunded''))
    )', v_schema_name, v_schema_name, v_schema_name);
  
  -- Create indexes for performance
  EXECUTE format('CREATE INDEX idx_%s_users_auth_id ON %I.users(auth_id)', v_schema_name, v_schema_name);
  EXECUTE format('CREATE INDEX idx_%s_sessions_scheduled ON %I.sessions(scheduled_at)', v_schema_name, v_schema_name);
  EXECUTE format('CREATE INDEX idx_%s_payments_student ON %I.payments(student_id)', v_schema_name, v_schema_name);
  
  -- Insert the school into the registry
  INSERT INTO public.schools (id, name, schema_name, owner_id, trial_ends_at)
  VALUES (v_school_id, p_school_name, v_schema_name, p_owner_id, NOW() + INTERVAL '14 days');
  
  -- Create the admin user in the school schema
  EXECUTE format('
    INSERT INTO %I.users (auth_id, email, full_name, role)
    SELECT %L, email, COALESCE(raw_user_meta_data->>''full_name'', email), ''admin''
    FROM auth.users
    WHERE id = %L
  ', v_schema_name, p_owner_id, p_owner_id);
  
  RETURN v_schema_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's school schema
CREATE OR REPLACE FUNCTION public.get_user_school_schema(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_schema_name TEXT;
BEGIN
  -- First check if user is a school owner
  SELECT schema_name INTO v_schema_name
  FROM public.schools
  WHERE owner_id = p_user_id;
  
  IF v_schema_name IS NOT NULL THEN
    RETURN v_schema_name;
  END IF;
  
  -- If not owner, check each school schema for the user
  FOR v_schema_name IN 
    SELECT schema_name FROM public.schools
  LOOP
    EXECUTE format('
      SELECT 1 FROM %I.users WHERE auth_id = %L
    ', v_schema_name, p_user_id);
    
    IF FOUND THEN
      RETURN v_schema_name;
    END IF;
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for public.schools
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School owners can view their school" ON public.schools
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "School owners can update their school" ON public.schools
  FOR UPDATE USING (owner_id = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();