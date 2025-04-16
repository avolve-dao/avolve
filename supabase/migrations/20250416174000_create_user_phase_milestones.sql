-- Migration: Create user_phase_milestones table for tracking completed milestones per user
-- Purpose: Enables type-safe queries for user milestone progress and engagement
-- Created: 2025-04-16 17:40:00 UTC

-- 1. Create the user_phase_milestones table
create table public.user_phase_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  milestone_id uuid not null,
  completed_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_phase_milestones enable row level security;

-- 3. RLS Policies
-- Allow SELECT for authenticated users (users can only see their own milestones)
create policy "Select own milestones (authenticated)" on public.user_phase_milestones
  for select using (auth.uid() = user_id);

-- Allow INSERT for authenticated users (users can only insert their own milestones)
create policy "Insert own milestones (authenticated)" on public.user_phase_milestones
  for insert with check (auth.uid() = user_id);

-- Allow UPDATE for authenticated users (users can only update their own milestones)
create policy "Update own milestones (authenticated)" on public.user_phase_milestones
  for update using (auth.uid() = user_id);

-- Allow DELETE for authenticated users (users can only delete their own milestones)
create policy "Delete own milestones (authenticated)" on public.user_phase_milestones
  for delete using (auth.uid() = user_id);

-- Index for performance
create index on public.user_phase_milestones(user_id, milestone_id);

-- End of migration
