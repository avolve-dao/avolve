-- Migration: Create user_activity_log table if missing
-- Purpose: Log user activities for feeds, notifications, and analytics
-- Created: 2025-04-22T20:00:00Z (UTC)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_activity_log'
  ) THEN
    CREATE TABLE public.user_activity_log (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES public.profiles(id),
      activity_type text NOT NULL,
      activity_data jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at);
  END IF;
END $$;
