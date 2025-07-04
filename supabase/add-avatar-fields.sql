-- Add avatar fields to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_uploaded_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.students.avatar_url IS 'URL to student avatar image in Supabase storage';
COMMENT ON COLUMN public.students.avatar_uploaded_at IS 'Timestamp when avatar was last uploaded';