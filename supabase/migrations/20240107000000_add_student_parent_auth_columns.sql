-- Add authentication columns to students table
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS can_login BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_students_invite_token ON public.students(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id) WHERE user_id IS NOT NULL;

-- Add RLS policy for students to read their own record
CREATE POLICY "Students can read their own record" ON public.students
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create parent_accounts table
CREATE TABLE IF NOT EXISTS public.parent_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create parents table for school-specific parent records
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  user_id UUID REFERENCES auth.users(id),
  can_login BOOLEAN DEFAULT false,
  invite_token TEXT UNIQUE,
  invite_sent_at TIMESTAMPTZ,
  account_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, email)
);

-- Create parent-student relationship table
CREATE TABLE IF NOT EXISTS public.parent_student_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('father', 'mother', 'guardian')),
  is_primary BOOLEAN DEFAULT false,
  can_access_grades BOOLEAN DEFAULT true,
  can_access_attendance BOOLEAN DEFAULT true,
  can_access_payments BOOLEAN DEFAULT true,
  can_communicate BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Enable RLS on new tables
ALTER TABLE public.parent_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_relationships ENABLE ROW LEVEL SECURITY;

-- RLS policies for parent_accounts
CREATE POLICY "Parent accounts can read their own record" ON public.parent_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policies for parents (school-scoped)
CREATE POLICY "School owners can manage parents" ON public.parents
  FOR ALL
  USING (
    school_id IN (
      SELECT id FROM schools WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Parents can read their own record" ON public.parents
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policies for parent_student_relationships
CREATE POLICY "School owners can manage relationships" ON public.parent_student_relationships
  FOR ALL
  USING (
    parent_id IN (
      SELECT p.id FROM parents p
      JOIN schools s ON p.school_id = s.id
      WHERE s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their relationships" ON public.parent_student_relationships
  FOR SELECT
  USING (
    parent_id IN (
      SELECT id FROM parents WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_parents_school_id ON public.parents(school_id);
CREATE INDEX IF NOT EXISTS idx_parents_user_id ON public.parents(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parents_invite_token ON public.parents(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parent_student_relationships_parent_id ON public.parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_relationships_student_id ON public.parent_student_relationships(student_id);