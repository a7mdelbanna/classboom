-- Create students table in public schema for RLS-based multi-tenancy
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  grade TEXT,
  class TEXT,
  address TEXT,
  medical_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graduated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_student_status CHECK (status IN ('active', 'inactive', 'graduated', 'suspended')),
  CONSTRAINT unique_student_code_per_school UNIQUE (school_id, student_code)
);

-- Create indexes for performance
CREATE INDEX idx_students_school_id ON public.students(school_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_email ON public.students(email);
CREATE INDEX idx_students_student_code ON public.students(student_code);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- School owners can view all students in their school
CREATE POLICY "School owners can view their students" ON public.students
  FOR SELECT USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- School owners can create students in their school
CREATE POLICY "School owners can create students" ON public.students
  FOR INSERT WITH CHECK (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- School owners can update students in their school
CREATE POLICY "School owners can update students" ON public.students
  FOR UPDATE USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- School owners can delete students from their school
CREATE POLICY "School owners can delete students" ON public.students
  FOR DELETE USING (
    school_id IN (
      SELECT id FROM public.schools WHERE owner_id = auth.uid()
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();