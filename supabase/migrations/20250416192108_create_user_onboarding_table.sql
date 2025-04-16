-- Migration: Create user_onboarding table for onboarding state tracking
-- Purpose: Track onboarding progress for each user for a delightful, personalized onboarding experience
-- Affected: public.user_onboarding
-- Created: 2025-04-16T19:21:08Z

-- 1. Create table
create table public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_steps text[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.user_onboarding enable row level security;

-- 3. RLS Policies
-- Allow users to select, insert, and update their own onboarding row
create policy "Allow select own onboarding" on public.user_onboarding
  for select using (auth.uid() = user_id);

create policy "Allow insert own onboarding" on public.user_onboarding
  for insert with check (auth.uid() = user_id);

create policy "Allow update own onboarding" on public.user_onboarding
  for update using (auth.uid() = user_id);

-- Admin policies for onboarding management
create policy "Allow admin manage onboarding" on public.user_onboarding
  for all using (exists (
    select 1 from auth.users u
    where u.id = auth.uid() and (u.role = 'admin' or u.role = 'service_role')
  ));

-- 4. Index for fast lookups
create index on public.user_onboarding(user_id);

-- 5. Comments
comment on table public.user_onboarding is 'Tracks onboarding progress for each user.';
comment on column public.user_onboarding.completed_steps is 'Array of completed onboarding step keys.';
comment on column public.user_onboarding.completed_at is 'Timestamp when onboarding was fully completed.';
