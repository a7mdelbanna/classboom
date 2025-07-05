-- Create courses table with RLS policies
-- This table will store institution-specific courses that admins can manage

-- Create the courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name varchar(255) NOT NULL,
    description text,
    category varchar(100),
    level varchar(100),
    duration_hours integer,
    max_capacity integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON public.courses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for SELECT: Users can view courses from their school
CREATE POLICY "Users can view courses from their school" ON public.courses
    FOR SELECT USING (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy for INSERT: Users can create courses for their school
CREATE POLICY "Users can create courses for their school" ON public.courses
    FOR INSERT WITH CHECK (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy for UPDATE: Users can update courses from their school
CREATE POLICY "Users can update courses from their school" ON public.courses
    FOR UPDATE USING (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Policy for DELETE: Users can delete courses from their school
CREATE POLICY "Users can delete courses from their school" ON public.courses
    FOR DELETE USING (
        school_id IN (
            SELECT id FROM public.schools 
            WHERE owner_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_school_id ON public.courses(school_id);
CREATE INDEX IF NOT EXISTS idx_courses_school_active ON public.courses(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);

-- Add some helpful comments
COMMENT ON TABLE public.courses IS 'Institution-specific courses that can be managed by school admins';
COMMENT ON COLUMN public.courses.school_id IS 'References the school this course belongs to';
COMMENT ON COLUMN public.courses.name IS 'Course name (e.g., "Advanced Mathematics", "Piano Lessons")';
COMMENT ON COLUMN public.courses.description IS 'Detailed course description';
COMMENT ON COLUMN public.courses.category IS 'Course category (e.g., "core_subjects", "electives", "instruments")';
COMMENT ON COLUMN public.courses.level IS 'Course level (e.g., "Beginner", "Intermediate", "Advanced", "Grade 1")';
COMMENT ON COLUMN public.courses.duration_hours IS 'Typical duration in hours for this course';
COMMENT ON COLUMN public.courses.max_capacity IS 'Maximum number of students for this course';
COMMENT ON COLUMN public.courses.is_active IS 'Whether this course is currently offered';