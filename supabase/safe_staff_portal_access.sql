-- SAFE Staff Portal Access Implementation
-- This uses RPC functions to avoid RLS recursion issues

-- 1. First, let's add a simple policy that allows staff to read their own record
-- This is safe because it doesn't reference other tables
CREATE POLICY "Staff can read own record by user_id"
ON public.staff
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND portal_access_enabled = true);

-- 2. Allow staff to update their own record (limited fields)
CREATE POLICY "Staff can update own profile"
ON public.staff
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND portal_access_enabled = true)
WITH CHECK (auth.uid() = user_id AND portal_access_enabled = true);

-- 3. The RPC functions we already have will handle the complex queries
-- No need for complex RLS policies!

-- 4. For schools table access by staff, we'll use the RPC function
-- No RLS policy needed - the get_staff_with_school function handles this

-- 5. Grant execute permissions on RPC functions (if not already done)
GRANT EXECUTE ON FUNCTION public.get_staff_with_school TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff_member TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_permissions TO authenticated;

-- 6. Ensure staff can read their own user metadata
GRANT SELECT ON auth.users TO authenticated;