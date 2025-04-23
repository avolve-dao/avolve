-- Migration: Create achievements table if missing and add data column
-- Purpose: Ensure achievements table and 'data' property exist for achievement metadata
-- Created: 2025-04-22T19:57:52Z (UTC)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'achievements'
  ) THEN
    CREATE TABLE public.achievements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.profiles(id),
      category text NOT NULL,
      type text NOT NULL,
      awarded_at timestamptz NOT NULL DEFAULT now(),
      description text,
      data jsonb
    );
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'achievements'
      AND column_name = 'data'
  ) THEN
    ALTER TABLE public.achievements ADD COLUMN data jsonb;
  END IF;
END $$;
