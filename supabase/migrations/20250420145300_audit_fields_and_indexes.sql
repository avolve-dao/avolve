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
create index if not exists idx_proposals_team_id on public.proposals(team_id);
create index if not exists idx_collective_actions_team_id on public.collective_actions(team_id);
create index if not exists idx_group_events_team_id on public.group_events(team_id);
create index if not exists idx_team_tokens_team_id on public.team_tokens(team_id);
create index if not exists idx_team_tokens_token_id on public.team_tokens(token_id);
create index if not exists idx_teams_name on public.teams(name);
create index if not exists idx_profiles_email on public.profiles(user_email);

-- =============================
-- 3. Add comments for audit and review
-- =============================
comment on column public.proposals.created_at is 'Timestamp when the proposal was created (for auditability)';
comment on column public.proposals.updated_at is 'Timestamp when the proposal was last updated (for auditability)';
comment on column public.collective_actions.created_at is 'Timestamp when the action was created (for auditability)';
comment on column public.collective_actions.updated_at is 'Timestamp when the action was last updated (for auditability)';
comment on column public.group_events.created_at is 'Timestamp when the group event was created (for auditability)';
comment on column public.group_events.updated_at is 'Timestamp when the group event was last updated (for auditability)';
comment on column public.team_tokens.created_at is 'Timestamp when the team token was created (for auditability)';
comment on column public.team_tokens.updated_at is 'Timestamp when the team token was last updated (for auditability)';
comment on column public.teams.created_at is 'Timestamp when the team was created (for auditability)';
comment on column public.teams.updated_at is 'Timestamp when the team was last updated (for auditability)';
comment on column public.profiles.created_at is 'Timestamp when the profile was created (for auditability)';
comment on column public.profiles.updated_at is 'Timestamp when the profile was last updated (for auditability)';

-- =============================
-- 4. Document rationale
-- =============================
-- All production tables must have audit fields and indexes for traceability, analytics, and security.
-- This migration brings all tables to a consistent, production-ready state for review.

-- End of migration
