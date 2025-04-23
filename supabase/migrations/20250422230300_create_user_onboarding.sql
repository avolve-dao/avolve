-- Migration: Create user_onboarding table
-- Purpose: Track onboarding status, step, and completion for each user
-- Created: 2025-04-22 23:03:00 UTC
--
-- This migration creates the public.user_onboarding table with RLS enabled and granular policies for onboarding flows.

-- 1. Create the user_onboarding table
create table public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  step integer not null default 0, -- Current onboarding step
  started_at timestamptz not null default now(), -- When onboarding started
  updated_at timestamptz not null default now(), -- Last update
  completed_at timestamptz, -- When onboarding completed (nullable)
  is_completed boolean not null default false, -- True if onboarding completed
  constraint unique_user_onboarding unique (user_id)
);

comment on table public.user_onboarding is 'Tracks onboarding step, status, and lifecycle for each user.';
comment on column public.user_onboarding.user_id is 'FK to profiles.id; each user has at most one onboarding row.';
comment on column public.user_onboarding.step is 'Current onboarding step for the user.';
comment on column public.user_onboarding.started_at is 'Timestamp when onboarding started.';
comment on column public.user_onboarding.updated_at is 'Timestamp of last onboarding update.';
comment on column public.user_onboarding.completed_at is 'Timestamp when onboarding completed (nullable).';
comment on column public.user_onboarding.is_completed is 'True if onboarding is completed.';

-- 2. Enable Row Level Security
alter table public.user_onboarding enable row level security;

-- 3. RLS Policies
-- Allow users to select their own onboarding status
create policy "Select own onboarding status (authenticated)"
  on public.user_onboarding
  for select
  using (auth.uid() = user_id);

-- Allow users to insert their onboarding row
create policy "Insert own onboarding row (authenticated)"
  on public.user_onboarding
  for insert
  with check (auth.uid() = user_id);

-- Allow users to update their onboarding row
create policy "Update own onboarding row (authenticated)"
  on public.user_onboarding
  for update
  using (auth.uid() = user_id);

-- Allow users to delete their onboarding row (if needed)
create policy "Delete own onboarding row (authenticated)"
  on public.user_onboarding
  for delete
  using (auth.uid() = user_id);

-- (Optional) Allow anon users to insert onboarding row if onboarding starts before authentication
-- Uncomment if needed:
-- create policy "Insert onboarding row (anon)"
--   on public.user_onboarding
--   for insert
--   with check (true);

-- 4. Indexes
create unique index if not exists idx_user_onboarding_user_id on public.user_onboarding(user_id);

-- 5. Audit and security notes
-- - RLS ensures only the user can access their onboarding status.
-- - All actions are restricted to the row matching auth.uid().
-- - Admins can be granted additional access via separate policies if needed.
