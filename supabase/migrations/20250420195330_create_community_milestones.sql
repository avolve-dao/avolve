-- Migration: Create community_milestones table for milestone tracking
-- Created: 2025-04-20 19:53:30 UTC
-- Purpose: This migration creates the community_milestones table to support milestone tracking for the Avolve platform.
-- Affected: Creates table, enables RLS, adds policies for select/insert/update for anon and authenticated roles

-- 1. Create the table
create table if not exists public.community_milestones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target integer not null,
  current integer not null default 0,
  reward text not null,
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.community_milestones enable row level security;

-- 3. RLS Policies
-- Select policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_milestones'
      AND policyname = 'Allow select for anon on community_milestones'
  ) THEN
    CREATE POLICY "Allow select for anon on community_milestones"
      ON public.community_milestones
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Select policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_milestones'
      AND policyname = 'Allow select for authenticated on community_milestones'
  ) THEN
    CREATE POLICY "Allow select for authenticated on community_milestones"
      ON public.community_milestones
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Insert policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_milestones'
      AND policyname = 'Allow insert for anon on community_milestones'
  ) THEN
    CREATE POLICY "Allow insert for anon on community_milestones"
      ON public.community_milestones
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Insert policy for authenticated
-- The following policy may already exist from previous migrations or local dev runs.
-- To prevent migration errors, comment out if duplicate.
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_policies
--     WHERE schemaname = 'public'
--       AND tablename = 'community_milestones'
--       AND policyname = 'Allow insert for authenticated on community_milestones'
--   ) THEN
--     CREATE POLICY "Allow insert for authenticated on community_milestones"
--       ON public.community_milestones
--       FOR INSERT
--       TO authenticated
--       WITH CHECK (true);
--   END IF;
-- END $$;

-- Update policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_milestones'
      AND policyname = 'Allow update for anon on community_milestones'
  ) THEN
    CREATE POLICY "Allow update for anon on community_milestones"
      ON public.community_milestones
      FOR UPDATE
      TO anon
      USING (true);
  END IF;
END $$;

-- Update policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_milestones'
      AND policyname = 'Allow update for authenticated on community_milestones'
  ) THEN
    CREATE POLICY "Allow update for authenticated on community_milestones"
      ON public.community_milestones
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Note: No delete policy is added for safety. Add if needed with proper review.
