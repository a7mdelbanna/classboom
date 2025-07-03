-- Add authentication fields to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS can_login BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invite_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMP WITH TIME ZONE;

-- Add unique constraint on email when user_id is set (student has an account)
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_email_unique 
ON public.students(email) 
WHERE user_id IS NOT NULL;

-- Create parent accounts table
CREATE TABLE IF NOT EXISTS public.parent_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  occupation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create parent-student relationship table (many-to-many)
CREATE TABLE IF NOT EXISTS public.parent_student_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.parent_accounts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'parent', -- parent, guardian, other
  is_primary BOOLEAN DEFAULT false,
  can_access_grades BOOLEAN DEFAULT true,
  can_access_attendance BOOLEAN DEFAULT true,
  can_access_payments BOOLEAN DEFAULT true,
  can_communicate BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_invite_token ON public.students(invite_token);
CREATE INDEX IF NOT EXISTS idx_parent_accounts_user_id ON public.parent_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent_id ON public.parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student_id ON public.parent_student_relationships(student_id);

-- Enable RLS on new tables
ALTER TABLE public.parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parent_accounts
-- Parents can view their own account
CREATE POLICY "Parents can view own account" ON public.parent_accounts
  FOR SELECT USING (user_id = auth.uid());

-- Parents can update their own account
CREATE POLICY "Parents can update own account" ON public.parent_accounts
  FOR UPDATE USING (user_id = auth.uid());

-- School owners can view parent accounts of students in their school
CREATE POLICY "School owners can view parent accounts" ON public.parent_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_relationships psr
      JOIN public.students s ON s.id = psr.student_id
      JOIN public.schools sch ON sch.id = s.school_id
      WHERE psr.parent_id = parent_accounts.id
      AND sch.owner_id = auth.uid()
    )
  );

-- RLS Policies for parent_student_relationships
-- Parents can view their own relationships
CREATE POLICY "Parents can view own relationships" ON public.parent_student_relationships
  FOR SELECT USING (
    parent_id IN (
      SELECT id FROM public.parent_accounts WHERE user_id = auth.uid()
    )
  );

-- School owners can view and manage relationships for their students
CREATE POLICY "School owners can view relationships" ON public.parent_student_relationships
  FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.schools sch ON sch.id = s.school_id
      WHERE sch.owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can create relationships" ON public.parent_student_relationships
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.schools sch ON sch.id = s.school_id
      WHERE sch.owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can update relationships" ON public.parent_student_relationships
  FOR UPDATE USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.schools sch ON sch.id = s.school_id
      WHERE sch.owner_id = auth.uid()
    )
  );

CREATE POLICY "School owners can delete relationships" ON public.parent_student_relationships
  FOR DELETE USING (
    student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.schools sch ON sch.id = s.school_id
      WHERE sch.owner_id = auth.uid()
    )
  );

-- Update RLS policies for students table to allow students to view their own profile
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT USING (user_id = auth.uid());

-- Allow parents to view their children's profiles
CREATE POLICY "Parents can view children profiles" ON public.students
  FOR SELECT USING (
    id IN (
      SELECT psr.student_id 
      FROM public.parent_student_relationships psr
      JOIN public.parent_accounts pa ON pa.id = psr.parent_id
      WHERE pa.user_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_parent_accounts_updated_at
  BEFORE UPDATE ON public.parent_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parent_student_relationships_updated_at
  BEFORE UPDATE ON public.parent_student_relationships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create student auth account
CREATE OR REPLACE FUNCTION public.create_student_auth_account(
  p_student_id UUID,
  p_password TEXT
)
RETURNS jsonb AS $$
DECLARE
  v_student RECORD;
  v_user_id UUID;
  v_result jsonb;
BEGIN
  -- Get student details
  SELECT * INTO v_student
  FROM public.students
  WHERE id = p_student_id
  AND email IS NOT NULL
  AND user_id IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Student not found, already has account, or missing email'
    );
  END IF;
  
  -- Create auth user (this would be done via Supabase client in practice)
  -- For now, we'll just prepare the data structure
  v_result := jsonb_build_object(
    'success', true,
    'student_id', p_student_id,
    'email', v_student.email,
    'message', 'Ready to create auth account'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to link parent to students using student codes
CREATE OR REPLACE FUNCTION public.link_parent_to_students(
  p_parent_user_id UUID,
  p_student_codes TEXT[]
)
RETURNS jsonb AS $$
DECLARE
  v_parent_id UUID;
  v_student RECORD;
  v_linked_count INTEGER := 0;
  v_errors jsonb := '[]'::jsonb;
BEGIN
  -- Get or create parent account
  SELECT id INTO v_parent_id
  FROM public.parent_accounts
  WHERE user_id = p_parent_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Parent account not found'
    );
  END IF;
  
  -- Link each student
  FOREACH v_student_code IN ARRAY p_student_codes
  LOOP
    BEGIN
      -- Find student by code
      SELECT * INTO v_student
      FROM public.students
      WHERE student_code = v_student_code;
      
      IF FOUND THEN
        -- Create relationship
        INSERT INTO public.parent_student_relationships (
          parent_id,
          student_id,
          is_primary
        ) VALUES (
          v_parent_id,
          v_student.id,
          v_linked_count = 0 -- First student is primary
        )
        ON CONFLICT (parent_id, student_id) DO NOTHING;
        
        v_linked_count := v_linked_count + 1;
      ELSE
        v_errors := v_errors || jsonb_build_object(
          'code', v_student_code,
          'error', 'Student not found'
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors || jsonb_build_object(
        'code', v_student_code,
        'error', SQLERRM
      );
    END;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'linked_count', v_linked_count,
    'errors', v_errors
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;