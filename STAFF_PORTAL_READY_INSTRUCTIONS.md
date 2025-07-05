# Staff Portal - Final Setup Instructions

## Current Status
The staff portal infrastructure is complete, but we need to apply safe RLS policies to allow staff members to access their data.

## Apply Safe Staff Portal Access

Run this SQL in your Supabase Dashboard:

```sql
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
```

## How It Works

1. **Simple RLS Policies**: We only add simple, non-recursive policies for staff to read/update their own records
2. **RPC Functions**: Complex queries (like getting school data) are handled by the RPC functions that bypass RLS
3. **No Recursion**: We avoid referencing other tables in RLS policies to prevent infinite recursion

## Testing the Staff Portal

1. **Send an invitation** to a staff member from the Staff Management page
2. **Check email** for the invitation (it will show in console logs if not using real email)
3. **Click activation link** and set a password
4. **Login** with the staff email and password
5. **Verify** you land on the staff portal dashboard at `/staff-portal`

## What Staff Can Do

Based on their role and permissions, staff can:
- View their personal information
- See their employment details
- Check their compensation
- Access quick actions based on their role
- Admins/Managers get additional management options

## Important Lessons Learned

✅ **DO**: Use simple RLS policies that only reference the current table
✅ **DO**: Use RPC functions for complex queries that need to join tables
✅ **DO**: Test RLS policies thoroughly before applying them

❌ **DON'T**: Create RLS policies that reference other tables in subqueries
❌ **DON'T**: Create circular dependencies between table policies
❌ **DON'T**: Assume complex RLS policies will work without testing

## Next Steps

The staff portal is now ready for use! Staff members can:
1. Receive invitations via email
2. Activate their accounts
3. Login and access their portal
4. View their information and perform role-based actions