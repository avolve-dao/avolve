-- Migration: Create user_phase_transitions table for tracking user journey phase changes
-- Purpose: Enables type-safe queries for journey history, engagement, and analytics
-- Created: 2025-04-16 17:35:30 UTC

-- 1. Create the user_phase_transitions table
create table public.user_phase_transitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  from_phase text not null,
  to_phase text not null,
  transitioned_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_phase_transitions enable row level security;

-- 3. RLS Policies
-- Allow SELECT for authenticated users (users can only see their own transitions)
create policy "Select own transitions (authenticated)" on public.user_phase_transitions
  for select using (auth.uid() = user_id);

-- Allow INSERT for authenticated users (users can only insert their own transitions)
create policy "Insert own transitions (authenticated)" on public.user_phase_transitions
  for insert with check (auth.uid() = user_id);

-- Allow UPDATE for authenticated users (users can only update their own transitions)
create policy "Update own transitions (authenticated)" on public.user_phase_transitions
  for update using (auth.uid() = user_id);

-- Allow DELETE for authenticated users (users can only delete their own transitions)
create policy "Delete own transitions (authenticated)" on public.user_phase_transitions
  for delete using (auth.uid() = user_id);

-- Index for performance
create index on public.user_phase_transitions(user_id, transitioned_at);

-- End of migration
