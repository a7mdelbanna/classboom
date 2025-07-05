-- Check the current data type of invite_token
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'staff' 
  AND column_name = 'invite_token';

-- If the above shows 'uuid' as data_type, run this fix:
-- First, drop any existing constraints/indexes
DROP INDEX IF EXISTS idx_staff_invite_token;
ALTER TABLE public.staff DROP CONSTRAINT IF EXISTS staff_invite_token_unique;

-- Change the column type from UUID to TEXT
ALTER TABLE public.staff 
ALTER COLUMN invite_token TYPE TEXT USING invite_token::TEXT;

-- Add UNIQUE constraint to ensure tokens are unique
ALTER TABLE public.staff
ADD CONSTRAINT staff_invite_token_unique UNIQUE (invite_token);

-- Recreate the index for performance
CREATE INDEX idx_staff_invite_token ON public.staff(invite_token) WHERE invite_token IS NOT NULL;

-- Verify the change
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.email,
  s.invite_token,
  s.invite_sent_at,
  s.can_login,
  s.portal_access_enabled,
  LENGTH(s.invite_token) as token_length,
  pg_typeof(s.invite_token) as token_type
FROM public.staff s
WHERE s.invite_token IS NOT NULL
ORDER BY s.invite_sent_at DESC;

-- Check if the specific token exists
SELECT 
  id,
  first_name,
  last_name,
  email,
  invite_token,
  can_login,
  portal_access_enabled
FROM public.staff
WHERE invite_token = '405b3c6820b09fa24397347636a78a554ec57953aa8315e95a20b3f361457a49';