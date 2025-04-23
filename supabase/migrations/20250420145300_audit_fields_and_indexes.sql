-- Migration: Ensure audit fields and indexes for all public tables
-- Timestamp: 20250420145300 UTC
-- Purpose: Guarantee every production table has created_at, updated_at, and all relevant indexes for auditability, analytics, and performance. This is a final audit migration for Fellowship review readiness.

-- =============================
-- 1. Add created_at and updated_at fields where missing
-- =============================
-- (Skip if already present)

alter table if exists public.proposals add column if not exists created_at timestamptz not null default now();
alter table if exists public.proposals add column if not exists updated_at timestamptz not null default now();

alter table if exists public.collective_actions add column if not exists created_at timestamptz not null default now();
alter table if exists public.collective_actions add column if not exists updated_at timestamptz not null default now();

alter table if exists public.group_events add column if not exists created_at timestamptz not null default now();
alter table if exists public.group_events add column if not exists updated_at timestamptz not null default now();

alter table if exists public.team_tokens add column if not exists created_at timestamptz not null default now();
alter table if exists public.team_tokens add column if not exists updated_at timestamptz not null default now();

alter table if exists public.teams add column if not exists created_at timestamptz not null default now();
alter table if exists public.teams add column if not exists updated_at timestamptz not null default now();

alter table if exists public.profiles add column if not exists created_at timestamptz not null default now();
alter table if exists public.profiles add column if not exists updated_at timestamptz not null default now();

-- =============================
-- 2. Add indexes for foreign keys and frequently queried columns
-- =============================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'proposals') THEN
    CREATE INDEX IF NOT EXISTS idx_proposals_team_id ON public.proposals(team_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'collective_actions') THEN
    CREATE INDEX IF NOT EXISTS idx_collective_actions_team_id ON public.collective_actions(team_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_events') THEN
    CREATE INDEX IF NOT EXISTS idx_group_events_team_id ON public.group_events(team_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_tokens') THEN
    CREATE INDEX IF NOT EXISTS idx_team_tokens_team_id ON public.team_tokens(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_tokens_token_id ON public.team_tokens(token_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    CREATE INDEX IF NOT EXISTS idx_teams_name ON public.teams(name);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(user_email);

-- =============================
-- 3. Add comments for audit and review
-- =============================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'proposals') THEN
    COMMENT ON COLUMN public.proposals.created_at IS 'Timestamp when the proposal was created (for auditability)';
    COMMENT ON COLUMN public.proposals.updated_at IS 'Timestamp when the proposal was last updated (for auditability)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'collective_actions') THEN
    COMMENT ON COLUMN public.collective_actions.created_at IS 'Timestamp when the collective action was created (for auditability)';
    COMMENT ON COLUMN public.collective_actions.updated_at IS 'Timestamp when the collective action was last updated (for auditability)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_events') THEN
    COMMENT ON COLUMN public.group_events.created_at IS 'Timestamp when the group event was created (for auditability)';
    COMMENT ON COLUMN public.group_events.updated_at IS 'Timestamp when the group event was last updated (for auditability)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_tokens') THEN
    COMMENT ON COLUMN public.team_tokens.created_at IS 'Timestamp when the team token was created (for auditability)';
    COMMENT ON COLUMN public.team_tokens.updated_at IS 'Timestamp when the team token was last updated (for auditability)';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    COMMENT ON COLUMN public.teams.created_at IS 'Timestamp when the team was created (for auditability)';
    COMMENT ON COLUMN public.teams.updated_at IS 'Timestamp when the team was last updated (for auditability)';
  END IF;
END $$;

comment on column public.profiles.created_at is 'Timestamp when the profile was created (for auditability)';
comment on column public.profiles.updated_at is 'Timestamp when the profile was last updated (for auditability)';

-- =============================
-- 4. Document rationale
-- =============================
-- All production tables must have audit fields and indexes for traceability, analytics, and security.
-- This migration brings all tables to a consistent, production-ready state for review.

-- End of migration
