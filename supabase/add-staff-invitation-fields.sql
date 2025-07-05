-- Add staff invitation tracking fields
-- These fields are needed for the staff portal invitation system

-- Add invitation tracking fields to staff table
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS invite_token text UNIQUE,
ADD COLUMN IF NOT EXISTS invite_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS account_created_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS can_login boolean DEFAULT false;

-- Add index for invite token lookups
CREATE INDEX IF NOT EXISTS idx_staff_invite_token ON public.staff(invite_token) WHERE invite_token IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.staff.invite_token IS 'Secure hex token (64 chars) used for staff portal invitation activation';
COMMENT ON COLUMN public.staff.invite_sent_at IS 'Timestamp when portal invitation was sent';
COMMENT ON COLUMN public.staff.account_created_at IS 'Timestamp when staff member activated their portal account';
COMMENT ON COLUMN public.staff.can_login IS 'Whether staff member can access their portal (invitation sent)';

-- Update RLS policies to include invitation fields
-- (The existing RLS policies should already cover these fields, but we'll ensure they're explicit)

-- Ensure staff can see their own invitation status
CREATE POLICY IF NOT EXISTS "Staff can view own invitation status" ON public.staff
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Ensure school admins can manage invitations
CREATE POLICY IF NOT EXISTS "School admins can manage staff invitations" ON public.staff
    FOR UPDATE USING (
        school_id IN (
            SELECT schools.id 
            FROM public.schools 
            WHERE schools.owner_id = auth.uid()
        )
    );