# Staff Portal RLS Fix Instructions

## Issue Summary
The staff portal is showing "Staff Profile Not Found" and "Failed to fetch school data" errors because the Row Level Security (RLS) policies are blocking staff members from accessing their own records and their school's data.

## Quick Fix Instructions

### Step 1: Apply the RLS Fix Migration
1. Go to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Run the following migrations in order:

#### First Migration: `20250705140000_comprehensive_staff_rls_fix.sql`
- This migration fixes all RLS policies for staff access
- Copy and paste the entire content from `/supabase/migrations/20250705140000_comprehensive_staff_rls_fix.sql`
- Execute the migration

#### Second Migration: `20250705141000_add_staff_rpc_functions.sql`
- This adds RPC functions that bypass RLS issues
- Copy and paste the entire content from `/supabase/migrations/20250705141000_add_staff_rpc_functions.sql`
- Execute the migration

### Step 2: Verify the Fix
Run the diagnostic script to verify everything is working:
1. In Supabase SQL Editor, run the queries from `/supabase/diagnose_staff_portal_issue.sql`
2. Check that each query returns appropriate data

### Step 3: Test Staff Portal
1. Log in as a staff member
2. Navigate to `/staff-portal`
3. Verify that the dashboard loads correctly

## Troubleshooting

### If staff still can't see their data:
1. Check if the staff member has `portal_access_enabled = true`
2. Verify the staff member has a valid `user_id` linked
3. Run this query to manually check:
```sql
-- Replace 'staff@email.com' with the actual email
SELECT * FROM public.staff WHERE email = 'staff@email.com';
```

### If the RPC function fails:
1. Make sure you've granted execute permissions:
```sql
GRANT EXECUTE ON FUNCTION public.get_staff_with_school TO authenticated;
```

### If policies conflict:
1. Drop all existing policies first:
```sql
-- Drop all staff policies
DROP POLICY IF EXISTS "Staff can read their own record by user_id" ON public.staff;
DROP POLICY IF EXISTS "Staff can view their own record" ON public.staff;
DROP POLICY IF EXISTS "Staff can update their own record" ON public.staff;

-- Drop all school policies  
DROP POLICY IF EXISTS "Schools can be read by school owner" ON public.schools;
DROP POLICY IF EXISTS "Staff can read their own school" ON public.schools;
DROP POLICY IF EXISTS "Staff can read their school" ON public.schools;
```

2. Then rerun the migration

## What These Fixes Do

1. **Comprehensive RLS Policies**: Ensures staff can read their own records and their school's data
2. **RPC Functions**: Provides a backup method to fetch data that bypasses RLS
3. **Proper Indexes**: Improves query performance for staff lookups
4. **Permission Grants**: Ensures authenticated users have the necessary permissions

## Quick Debug Checklist

- [ ] Staff member has `portal_access_enabled = true`
- [ ] Staff member has `user_id` set correctly
- [ ] Both migrations have been applied successfully
- [ ] No error messages in Supabase logs
- [ ] RPC function `get_staff_with_school` returns data

## Code Already Updated
The frontend code has already been updated to:
1. Use the RPC function as the primary method
2. Fall back to direct queries if RPC fails
3. Handle errors gracefully

No frontend code changes are needed - just apply the SQL migrations!