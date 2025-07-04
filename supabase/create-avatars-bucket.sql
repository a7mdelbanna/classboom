-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true, -- Public bucket so avatars can be viewed
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for avatars bucket
-- Allow authenticated users to upload avatars for their school's students
CREATE POLICY "Users can upload avatars for their school's students" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IN (
    SELECT s.owner_id 
    FROM public.schools s
    INNER JOIN public.students st ON st.school_id = s.id
    WHERE st.id::text = SPLIT_PART(name, '/', 2)
  )
);

-- Allow authenticated users to update avatars for their school's students
CREATE POLICY "Users can update avatars for their school's students" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() IN (
    SELECT s.owner_id 
    FROM public.schools s
    INNER JOIN public.students st ON st.school_id = s.id
    WHERE st.id::text = SPLIT_PART(name, '/', 2)
  )
);

-- Allow authenticated users to delete avatars for their school's students
CREATE POLICY "Users can delete avatars for their school's students" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid() IN (
    SELECT s.owner_id 
    FROM public.schools s
    INNER JOIN public.students st ON st.school_id = s.id
    WHERE st.id::text = SPLIT_PART(name, '/', 2)
  )
);

-- Allow public to view avatars (since it's a public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');