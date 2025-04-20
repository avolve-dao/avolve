-- Migration: Ensure audit fields and indexes for all public tables (schema-accurate)
-- Timestamp: 20250420150030 UTC
-- Purpose: Guarantee every production table has created_at, updated_at, and all relevant indexes for auditability, analytics, and performance. Schema references are accurate to your current Supabase project.

-- =============================
-- 1. Add created_at and updated_at fields where missing
-- =============================
-- (Skip if already present)

alter table if exists public.profiles add column if not exists created_at timestamptz not null default now();
alter table if exists public.profiles add column if not exists updated_at timestamptz not null default now();

alter table if exists public.tokens add column if not exists created_at timestamptz not null default now();
alter table if exists public.tokens add column if not exists updated_at timestamptz not null default now();

alter table if exists public.token_ownership add column if not exists created_at timestamptz not null default now();
alter table if exists public.token_ownership add column if not exists updated_at timestamptz not null default now();

alter table if exists public.metrics add column if not exists created_at timestamptz not null default now();
alter table if exists public.metrics add column if not exists updated_at timestamptz not null default now();

alter table if exists public.user_phase_transitions add column if not exists created_at timestamptz not null default now();
alter table if exists public.user_phase_transitions add column if not exists updated_at timestamptz not null default now();

alter table if exists public.user_phase_milestones add column if not exists created_at timestamptz not null default now();
alter table if exists public.user_phase_milestones add column if not exists updated_at timestamptz not null default now();

alter table if exists public.user_admin_stories add column if not exists created_at timestamptz not null default now();
alter table if exists public.user_admin_stories add column if not exists updated_at timestamptz not null default now();

alter table if exists public.user_role_activity add column if not exists created_at timestamptz not null default now();
alter table if exists public.user_role_activity add column if not exists updated_at timestamptz not null default now();

alter table if exists public.meeting_participants add column if not exists created_at timestamptz not null default now();
alter table if exists public.meeting_participants add column if not exists updated_at timestamptz not null default now();

alter table if exists public.weekly_meetings add column if not exists created_at timestamptz not null default now();
alter table if exists public.weekly_meetings add column if not exists updated_at timestamptz not null default now();

-- =============================
-- 2. Add indexes for foreign keys and frequently queried columns
-- =============================
create index if not exists idx_tokens_user_id on public.tokens(user_id);
create index if not exists idx_token_ownership_user_id on public.token_ownership(user_id);
create index if not exists idx_metrics_user_id on public.metrics(user_id);
create index if not exists idx_user_phase_transitions_user_id on public.user_phase_transitions(user_id);
create index if not exists idx_user_phase_milestones_user_id on public.user_phase_milestones(user_id);
create index if not exists idx_user_admin_stories_author_id on public.user_admin_stories(author_id);
create index if not exists idx_user_role_activity_user_id on public.user_role_activity(user_id);
create index if not exists idx_meeting_participants_meeting_id on public.meeting_participants(meeting_id);
create index if not exists idx_meeting_participants_user_id on public.meeting_participants(user_id);

-- =============================
-- 3. Add comments for audit and review
-- =============================
comment on column public.profiles.created_at is 'Timestamp when the profile was created (for auditability)';
comment on column public.profiles.updated_at is 'Timestamp when the profile was last updated (for auditability)';
comment on column public.tokens.created_at is 'Timestamp when the token was created (for auditability)';
comment on column public.tokens.updated_at is 'Timestamp when the token was last updated (for auditability)';
comment on column public.token_ownership.created_at is 'Timestamp when the token ownership was created (for auditability)';
comment on column public.token_ownership.updated_at is 'Timestamp when the token ownership was last updated (for auditability)';
comment on column public.metrics.created_at is 'Timestamp when the metrics row was created (for auditability)';
comment on column public.metrics.updated_at is 'Timestamp when the metrics row was last updated (for auditability)';
comment on column public.user_phase_transitions.created_at is 'Timestamp when the phase transition was created (for auditability)';
comment on column public.user_phase_transitions.updated_at is 'Timestamp when the phase transition was last updated (for auditability)';
comment on column public.user_phase_milestones.created_at is 'Timestamp when the phase milestone was created (for auditability)';
comment on column public.user_phase_milestones.updated_at is 'Timestamp when the phase milestone was last updated (for auditability)';
comment on column public.user_admin_stories.created_at is 'Timestamp when the admin story was created (for auditability)';
comment on column public.user_admin_stories.updated_at is 'Timestamp when the admin story was last updated (for auditability)';
comment on column public.user_role_activity.created_at is 'Timestamp when the user role activity was created (for auditability)';
comment on column public.user_role_activity.updated_at is 'Timestamp when the user role activity was last updated (for auditability)';
comment on column public.meeting_participants.created_at is 'Timestamp when the meeting participant row was created (for auditability)';
comment on column public.meeting_participants.updated_at is 'Timestamp when the meeting participant row was last updated (for auditability)';
comment on column public.weekly_meetings.created_at is 'Timestamp when the weekly meeting was created (for auditability)';
comment on column public.weekly_meetings.updated_at is 'Timestamp when the weekly meeting was last updated (for auditability)';

-- =============================
-- 4. Document rationale
-- =============================
-- All production tables must have audit fields and indexes for traceability, analytics, and security.
-- This migration brings all tables to a consistent, production-ready state for review.

-- End of migration
