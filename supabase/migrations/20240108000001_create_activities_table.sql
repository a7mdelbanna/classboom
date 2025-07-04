-- Run this in Supabase SQL Editor to create the activities table

-- Create activities table for tracking user actions
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'student_added',
    'student_updated', 
    'student_deleted',
    'student_invited',
    'class_created',
    'class_updated',
    'class_deleted',
    'payment_received',
    'settings_updated'
  )),
  entity_type TEXT CHECK (entity_type IN ('student', 'class', 'payment', 'settings')),
  entity_id UUID,
  entity_name TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_school_id_created_at ON public.activities(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS policies - school owners can only see their own school's activities
CREATE POLICY "School owners can view their school activities" ON public.activities
  FOR SELECT
  USING (
    school_id IN (
      SELECT id FROM schools WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can create activities" ON public.activities
  FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT id FROM schools WHERE owner_id = auth.uid()
    )
  );

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity(
  p_school_id UUID,
  p_user_id UUID,
  p_user_name TEXT,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_name TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activities (
    school_id,
    user_id,
    user_name,
    action_type,
    entity_type,
    entity_id,
    entity_name,
    description,
    metadata
  ) VALUES (
    p_school_id,
    p_user_id,
    p_user_name,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_description,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION log_activity TO authenticated;

-- Verify the table was created
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'activities'
) as activities_table_exists;