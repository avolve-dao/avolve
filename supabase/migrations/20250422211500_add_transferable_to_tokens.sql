-- Migration: Add transferable column to tokens table if missing
-- Purpose: Allow tokens to be marked as transferable or not for business logic
-- Created: 2025-04-22T21:15:00Z (UTC)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'tokens'
      AND column_name = 'transferable'
  ) THEN
    ALTER TABLE public.tokens ADD COLUMN transferable boolean DEFAULT true;
    COMMENT ON COLUMN public.tokens.transferable IS 'Indicates if the token can be transferred between users';
  END IF;
END $$;
