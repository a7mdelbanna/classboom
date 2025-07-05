-- Ensure staff can be read by their own user_id even when not authenticated yet
DROP POLICY IF EXISTS "Staff can view their own record" ON public.staff;

CREATE POLICY "Staff can view their own record" 
ON public.staff 
FOR SELECT 
TO authenticated
USING (
  auth.uid() = user_id
);

-- Also allow staff to update their own record (for portal access)
DROP POLICY IF EXISTS "Staff can update their own record" ON public.staff;

CREATE POLICY "Staff can update their own record"
ON public.staff
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure schools can be read by staff members
DROP POLICY IF EXISTS "Staff can read their school" ON public.schools;

CREATE POLICY "Staff can read their school"
ON public.schools
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT school_id 
    FROM public.staff 
    WHERE user_id = auth.uid()
  )
);