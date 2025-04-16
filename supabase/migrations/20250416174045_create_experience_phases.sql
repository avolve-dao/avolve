-- Migration: Create experience_phases table for defining and ordering user journey phases
-- Purpose: Enables type-safe queries and flexible definition of experience phases
-- Created: 2025-04-16 17:40:45 UTC

-- 1. Create the experience_phases table
create table public.experience_phases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sequence integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.experience_phases enable row level security;

-- 3. RLS Policies
-- Allow SELECT for all users (public phases)
create policy "Select all phases (authenticated)" on public.experience_phases
  for select using (true);
create policy "Select all phases (anon)" on public.experience_phases
  for select using (true);

-- Allow INSERT, UPDATE, DELETE for any authenticated user
create policy "Authenticated manage phases" on public.experience_phases
  for all using (auth.role() = 'authenticated');

-- Index for ordering
create index on public.experience_phases(sequence);

-- End of migration
