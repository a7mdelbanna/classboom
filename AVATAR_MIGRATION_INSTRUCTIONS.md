# Avatar Feature Migration Instructions

## ⚠️ IMPORTANT: Manual SQL Execution Required

The avatar upload feature requires database changes that must be run manually in your Supabase dashboard.

## Steps to Apply Migrations:

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/hokgyujgsvdfhpfrorsu/sql/new

2. **Run the following SQL queries in order:**

### Query 1: Add Avatar Fields to Students Table
```sql
-- Add avatar fields to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_uploaded_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN public.students.avatar_url IS 'URL to student avatar image in Supabase storage';
COMMENT ON COLUMN public.students.avatar_uploaded_at IS 'Timestamp when avatar was last uploaded';
```

### Query 2: Create Avatars Storage Bucket
```sql
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
```

## After Running Migrations:

Run this command to verify the migrations were applied successfully:
```bash
node scripts/run-avatar-migrations.js
```

You should see:
- ✅ Avatar fields already exist in students table!
- ✅ Avatars storage bucket exists!

## Testing the Feature:

1. Navigate to any student's profile page
2. Click the camera icon to upload an avatar
3. Select an image, crop it, and upload
4. The avatar should appear on the student card and profile

## Troubleshooting:

If you encounter issues:
- Check the browser console for errors
- Verify the storage bucket policies are applied
- Ensure the user has proper permissions to upload files