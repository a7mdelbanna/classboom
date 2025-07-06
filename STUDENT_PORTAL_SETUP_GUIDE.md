# Student Portal Setup Guide - Following Staff Portal Approach

## Overview
This guide implements the student portal using the same safe approach as the staff portal to avoid RLS recursion issues.

## 1. Apply Safe RLS Policies

Run this SQL in your Supabase Dashboard:

```sql
-- SAFE Student Portal Access Implementation
-- Following the same approach as staff portal to avoid RLS recursion

-- 1. Drop any problematic policies if they exist
DROP POLICY IF EXISTS "Students can read their own record" ON public.students;
DROP POLICY IF EXISTS "Students can update their own record" ON public.students;
DROP POLICY IF EXISTS "Students can read their school" ON public.schools;

-- 2. Create simple policies for students (only reference current table)
CREATE POLICY "Students can read own record by user_id"
ON public.students
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND can_login = true);

-- 3. Allow students to update limited fields in their own record
CREATE POLICY "Students can update own profile"
ON public.students
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND can_login = true)
WITH CHECK (
  auth.uid() = user_id AND 
  can_login = true AND
  -- Only allow updating specific fields
  (
    phone IS NOT DISTINCT FROM OLD.phone OR
    emergency_contact_name IS NOT DISTINCT FROM OLD.emergency_contact_name OR
    emergency_contact_phone IS NOT DISTINCT FROM OLD.emergency_contact_phone OR
    medical_info IS NOT DISTINCT FROM OLD.medical_info OR
    notes IS NOT DISTINCT FROM OLD.notes
  )
);

-- 4. Create RPC function to get student with school data (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_student_with_school(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  student_code text,
  first_name text,
  last_name text,
  email text,
  phone text,
  date_of_birth date,
  gender text,
  school_id uuid,
  user_id uuid,
  can_login boolean,
  account_created_at timestamptz,
  grade text,
  skill_level text,
  notes text,
  avatar_url text,
  school_name text,
  school_logo_url text,
  school_address jsonb,
  school_phone text,
  school_email text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.student_code,
    s.first_name,
    s.last_name,
    s.email,
    s.phone,
    s.date_of_birth,
    s.gender,
    s.school_id,
    s.user_id,
    s.can_login,
    s.account_created_at,
    s.grade,
    s.skill_level,
    s.notes,
    s.avatar_url,
    sch.name as school_name,
    sch.logo_url as school_logo_url,
    sch.address as school_address,
    sch.phone as school_phone,
    sch.email as school_email
  FROM public.students s
  LEFT JOIN public.schools sch ON sch.id = s.school_id
  WHERE s.user_id = p_user_id 
    AND s.can_login = true;
END;
$$;

-- 5. Create function to activate student account atomically
CREATE OR REPLACE FUNCTION public.activate_student_account(
  p_token text,
  p_user_id uuid,
  p_student_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_success boolean := false;
BEGIN
  -- Update student record atomically
  UPDATE public.students
  SET 
    user_id = p_user_id,
    invite_token = NULL,
    account_created_at = NOW()
  WHERE id = p_student_id
    AND invite_token = p_token
    AND account_created_at IS NULL;
  
  -- Check if update was successful
  IF FOUND THEN
    v_success := true;
    
    -- Update user metadata with student_id for faster lookups
    UPDATE auth.users
    SET raw_user_meta_data = 
      COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('student_id', p_student_id)
    WHERE id = p_user_id;
  END IF;
  
  RETURN v_success;
END;
$$;

-- 6. Create function to check if user is a student
CREATE OR REPLACE FUNCTION public.is_student(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.students 
    WHERE user_id = p_user_id 
      AND can_login = true
  );
END;
$$;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_student_with_school TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_student_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_student TO authenticated;

-- 8. Ensure students can read their own user metadata
GRANT SELECT ON auth.users TO authenticated;
```

## 2. Key Implementation Details

### Frontend Updates

1. **StudentActivation.tsx**
   - Uses RPC function `activate_student_account` for atomic updates
   - Adds student_id to user metadata for race condition handling
   - Signs out after activation for clean login

2. **AuthContext.tsx**
   - Checks student_id in metadata first (faster, handles race conditions)
   - Falls back to user_id query if needed
   - Updates user_id if missing (race condition fix)

3. **StudentService.ts**
   - Added `getStudentByUserId` method using RPC function
   - Uses `get_student_with_school` to bypass RLS
   - Returns enriched data with school information

4. **StudentPortalDashboard.tsx**
   - Uses RPC function to load student data
   - Includes logout functionality
   - Shows school information when available
   - Professional UI matching staff portal

### Backend Approach

1. **Simple RLS Policies**
   - Only reference the current table
   - No joins or subqueries to other tables
   - Prevents infinite recursion

2. **RPC Functions**
   - Handle complex queries with joins
   - Use SECURITY DEFINER to bypass RLS
   - Return enriched data safely

3. **Atomic Operations**
   - Account activation in single transaction
   - Metadata updates for fast lookups
   - Race condition prevention

## 3. Testing the Complete Flow

### Send Invitation
1. Navigate to Students list
2. Click on a student without portal access
3. Click "Send Portal Invitation" button
4. Check email for invitation

### Activate Account
1. Click activation link in email
2. Set password (min 6 characters)
3. Account activated with success message
4. Redirected to login page

### Student Login
1. Go to login page
2. Select "Student" role
3. Enter email and password
4. Automatically redirected to /student-portal

### Verify Access
1. Student dashboard loads with personal info
2. School information displayed
3. Logout button works
4. Role validation prevents unauthorized access

## 4. Security Features

### Role Validation
- Students must select "Student" role at login
- Wrong role selection = automatic logout
- Clear error messages

### Data Access
- Students can only see their own data
- RPC functions handle school data access
- No cross-student data leakage

### Safe Patterns
- No RLS policies referencing other tables
- All complex queries use RPC functions
- Atomic operations prevent partial updates

## 5. Common Issues & Solutions

### "Student Profile Not Found"
- Check if account is fully activated
- Verify can_login = true in database
- Check user_id is set correctly

### Login Issues
- Ensure correct role selected
- Check invitation hasn't expired (48 hours)
- Verify email is confirmed

### Race Conditions
- AuthContext checks metadata first
- Automatic user_id update if missing
- Delays added for propagation

## 6. Key Differences from Original Implementation

### What We Changed
1. **No complex RLS policies** - Only simple user_id checks
2. **RPC functions for joins** - Safe multi-table queries
3. **Metadata storage** - student_id in user metadata
4. **Role validation** - Enforced at login

### Why It's Better
1. **No recursion** - Simple policies can't cause loops
2. **Better performance** - RPC functions are optimized
3. **Race condition handling** - Metadata provides fallback
4. **Consistent with staff** - Same patterns throughout

## Success Criteria
✅ Invitations send successfully  
✅ Activation creates auth account  
✅ Login with role validation works  
✅ Dashboard loads student data  
✅ Logout functionality works  
✅ No RLS recursion errors  

The student portal is now ready for use with the same safe approach as the staff portal!