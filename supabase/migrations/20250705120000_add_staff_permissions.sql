-- Add permissions field to staff table
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS permissions jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_staff_permissions ON public.staff USING gin (permissions);

-- Comment on the new column
COMMENT ON COLUMN public.staff.permissions IS 'JSON object containing staff member permissions for role-based access control';

-- Update existing staff with default permissions based on their role
UPDATE public.staff
SET permissions = 
  CASE 
    WHEN role = 'admin' THEN 
      '{"can_view_all_students": true, "can_edit_students": true, "can_manage_enrollments": true, "can_mark_attendance": true, "can_view_finances": true, "can_manage_staff": true, "can_send_announcements": true}'::jsonb
    WHEN role = 'manager' THEN 
      '{"can_view_all_students": true, "can_edit_students": true, "can_manage_enrollments": true, "can_mark_attendance": true, "can_view_finances": true, "can_manage_staff": false, "can_send_announcements": true}'::jsonb
    WHEN role = 'teacher' THEN 
      '{"can_view_all_students": false, "can_edit_students": false, "can_manage_enrollments": false, "can_mark_attendance": true, "can_view_finances": false, "can_manage_staff": false, "can_send_announcements": false}'::jsonb
    WHEN role = 'support' THEN 
      '{"can_view_all_students": true, "can_edit_students": false, "can_manage_enrollments": false, "can_mark_attendance": false, "can_view_finances": false, "can_manage_staff": false, "can_send_announcements": false}'::jsonb
    ELSE 
      '{"can_view_all_students": false, "can_edit_students": false, "can_manage_enrollments": false, "can_mark_attendance": false, "can_view_finances": false, "can_manage_staff": false, "can_send_announcements": false}'::jsonb
  END
WHERE permissions IS NULL;