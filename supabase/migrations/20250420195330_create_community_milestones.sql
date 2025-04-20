-- Migration: Create community_milestones table for milestone tracking
-- Created: 2025-04-20 19:53:30 UTC
-- Purpose: This migration creates the community_milestones table to support milestone tracking for the Avolve platform.
-- Affected: Creates table, enables RLS, adds policies for select/insert/update for anon and authenticated roles

-- 1. Create the table
create table public.community_milestones (
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
create policy "Allow select for anon on community_milestones"
  on public.community_milestones
  for select
  to anon
  using (true);

-- Select policy for authenticated
create policy "Allow select for authenticated on community_milestones"
  on public.community_milestones
  for select
  to authenticated
  using (true);

-- Insert policy for anon
create policy "Allow insert for anon on community_milestones"
  on public.community_milestones
  for insert
  to anon
  with check (true);

-- Insert policy for authenticated
create policy "Allow insert for authenticated on community_milestones"
  on public.community_milestones
  for insert
  to authenticated
  with check (true);

-- Update policy for anon
create policy "Allow update for anon on community_milestones"
  on public.community_milestones
  for update
  to anon
  using (true);

-- Update policy for authenticated
create policy "Allow update for authenticated on community_milestones"
  on public.community_milestones
  for update
  to authenticated
  using (true);

-- Note: No delete policy is added for safety. Add if needed with proper review.
