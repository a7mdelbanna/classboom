-- Fix invalid staff invitation tokens
-- This script cleans up any invalid tokens that might have been inserted

-- First, identify any invalid tokens (tokens containing non-hex characters)
-- Hex characters are 0-9 and a-f (case insensitive)
SELECT id, first_name, last_name, email, invite_token
FROM public.staff
WHERE invite_token IS NOT NULL 
  AND invite_token !~ '^[0-9a-fA-F]+$';

-- Clear invalid tokens (they'll need to be re-invited)
UPDATE public.staff
SET invite_token = NULL,
    invite_sent_at = NULL,
    can_login = false
WHERE invite_token IS NOT NULL 
  AND invite_token !~ '^[0-9a-fA-F]+$';

-- Also clear any tokens that are not 64 characters long
UPDATE public.staff
SET invite_token = NULL,
    invite_sent_at = NULL,
    can_login = false
WHERE invite_token IS NOT NULL 
  AND length(invite_token) != 64;

-- Report on cleaned up tokens
SELECT 
    COUNT(*) as cleaned_tokens,
    'Invalid tokens have been cleared. Please re-send invitations to affected staff members.' as message
FROM public.staff
WHERE invite_token IS NULL 
  AND invite_sent_at IS NOT NULL;