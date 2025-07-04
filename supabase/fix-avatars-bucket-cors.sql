-- First, delete the existing bucket if it exists (to recreate with proper settings)
DELETE FROM storage.buckets WHERE id = 'avatars';

-- Create avatars bucket with proper CORS settings
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true, -- Public bucket so avatars can be viewed
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
);

-- Update bucket settings for CORS
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
WHERE id = 'avatars';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload avatars for their school's students" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars for their school's students" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars for their school's students" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Create new RLS policies with proper permissions
-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to update avatars
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to delete avatars
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars');

-- Allow public to view avatars
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');