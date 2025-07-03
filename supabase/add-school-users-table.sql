-- Create school_users table if it doesn't exist
-- This table is referenced in the RLS policies

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS public.school_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher', 'staff')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, user_id)
);

-- Enable RLS on school_users table
ALTER TABLE public.school_users ENABLE ROW LEVEL SECURITY;

-- Create policies for school_users table
CREATE POLICY "School owners can manage school users" ON public.school_users
FOR ALL
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own membership" ON public.school_users
FOR SELECT
USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_school_users_updated_at 
BEFORE UPDATE ON public.school_users 
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();