-- Quick fix: Add only the missing authentication columns to students table
-- Run this in Supabase SQL Editor

-- First check what columns we already have
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'students'
  AND column_name IN ('user_id', 'can_login', 'invite_token', 'invite_sent_at', 'account_created_at')
ORDER BY column_name;

-- Add the missing columns (if they don't exist)
DO $$ 
BEGIN
  -- Add user_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'user_id') THEN
    ALTER TABLE public.students ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;

  -- Add can_login if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'can_login') THEN
    ALTER TABLE public.students ADD COLUMN can_login BOOLEAN DEFAULT false;
  END IF;

  -- Add invite_token if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'invite_token') THEN
    ALTER TABLE public.students ADD COLUMN invite_token TEXT UNIQUE;
  END IF;

  -- Add invite_sent_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'invite_sent_at') THEN
    ALTER TABLE public.students ADD COLUMN invite_sent_at TIMESTAMPTZ;
  END IF;

  -- Add account_created_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'account_created_at') THEN
    ALTER TABLE public.students ADD COLUMN account_created_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for faster token lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_students_invite_token ON public.students(invite_token) WHERE invite_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id) WHERE user_id IS NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'students'
  AND column_name IN ('user_id', 'can_login', 'invite_token', 'invite_sent_at', 'account_created_at')
ORDER BY column_name;