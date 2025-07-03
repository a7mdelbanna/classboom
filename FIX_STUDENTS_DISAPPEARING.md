# 🚨 URGENT: Fix for Students Disappearing Issue

## The Problem
Students are being created successfully but then disappear from the UI after a few seconds. This is happening because Row Level Security (RLS) policies are missing on the `students` table.

## Why This Happens
1. When you create a student, it's saved to the database
2. RLS is enabled on the students table
3. But there are NO policies defining who can see/edit students
4. So Supabase blocks ALL access to the students table
5. Result: Students "disappear" (they're still in the database, just not accessible)

## The Solution

### Option 1: Quick Fix (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hokgyujgsvdfhpfrorsu/sql/new
2. Copy and paste this SQL:

```sql
-- Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;
DROP POLICY IF EXISTS "Enable update for users based on school_id" ON public.students;
DROP POLICY IF EXISTS "Enable delete for users based on school_id" ON public.students;

-- Allow users to SELECT students from schools they own
CREATE POLICY "Enable read access for all users" ON public.students
FOR SELECT USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Allow users to INSERT students to schools they own
CREATE POLICY "Enable insert for authenticated users only" ON public.students
FOR INSERT WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Allow users to UPDATE students in schools they own
CREATE POLICY "Enable update for users based on school_id" ON public.students
FOR UPDATE USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);

-- Allow users to DELETE students from schools they own
CREATE POLICY "Enable delete for users based on school_id" ON public.students
FOR DELETE USING (
  school_id IN (
    SELECT id FROM public.schools WHERE owner_id = auth.uid()
  )
);
```

3. Click "Run" button
4. You should see "Success. No rows returned"
5. Refresh your ClassBoom app - students should now appear!

### Option 2: Use the Prepared SQL File
1. Open `supabase/simple-students-rls-fix.sql` in this project
2. Copy the entire contents
3. Paste in Supabase SQL Editor and run

### Option 3: Temporary Workaround (NOT for production)
If you need to disable RLS temporarily for testing:
```sql
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
```
⚠️ WARNING: This makes ALL students visible to ALL users - only for testing!

## Verify the Fix Worked
After running the SQL, run this query to check:
```sql
SELECT COUNT(*) as visible_students FROM public.students;
```

You should now see the count of students in your school.

## Prevention
This issue occurred because the initial database setup didn't include RLS policies for the students table. The fix above adds proper policies that ensure:
- Users can only see students from their own school
- Users can only create/edit/delete students in their own school
- Complete data isolation between schools

## Still Having Issues?
1. Make sure you're logged in as the school owner
2. Check that your school record exists: `SELECT * FROM public.schools WHERE owner_id = auth.uid();`
3. Verify students have correct school_id: `SELECT id, school_id, first_name FROM public.students;`

---
After applying this fix, your students will persist properly in the database and UI! 🎉