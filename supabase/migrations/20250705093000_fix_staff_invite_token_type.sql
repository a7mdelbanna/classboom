-- Fix staff invite_token field type from UUID to TEXT
-- The generateInvitationToken() method generates a 64-character hex string, not a UUID

-- First, drop the existing index
DROP INDEX IF EXISTS idx_staff_invite_token;

-- Change the column type from UUID to TEXT
ALTER TABLE public.staff 
ALTER COLUMN invite_token TYPE TEXT USING invite_token::TEXT;

-- Add UNIQUE constraint to ensure tokens are unique
ALTER TABLE public.staff
ADD CONSTRAINT staff_invite_token_unique UNIQUE (invite_token);

-- Recreate the index for performance
CREATE INDEX idx_staff_invite_token ON public.staff(invite_token) WHERE invite_token IS NOT NULL;

-- Update the comment to reflect the correct type
COMMENT ON COLUMN public.staff.invite_token IS 'Secure hex token (64 chars) used for staff portal invitation activation';