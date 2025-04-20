-- Migration: Create community_milestones, milestone_contributions, teams, team_members, assists
-- Purpose: Enable positive-sum, collaborative gamification for Avolve
-- Created: 2025-04-20 17:39 UTC

/*
  This migration introduces the core tables for community-centric, positive-sum gamification:
  - community_milestones: Tracks global goals and rewards for the entire user base.
  - milestone_contributions: Tracks individual user contributions to milestones.
  - teams: Enables users to form teams for collaborative achievement.
  - team_members: Associates users with teams.
  - assists: Tracks when users help each other, rewarding mutual support.
  All tables have RLS enabled and are documented for clarity and security.
*/

-- 1. Create community_milestones table
create table if not exists public.community_milestones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  target bigint not null, -- The goal (e.g., "10000 challenges completed")
  current bigint not null default 0, -- Progress so far
  reward text, -- Description of reward for milestone
  achieved_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.community_milestones enable row level security;

-- Public select policy
create policy "Allow select for all roles on community_milestones"
  on public.community_milestones
  for select
  using (true);

-- Authenticated insert policy
create policy "Allow insert for authenticated on community_milestones"
  on public.community_milestones
  for insert
  to authenticated
  with check (true);

-- Authenticated update policy
create policy "Allow update for authenticated on community_milestones"
  on public.community_milestones
  for update
  to authenticated
  using (true)
  with check (true);

-- 2. Create milestone_contributions table
create table if not exists public.milestone_contributions (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid references public.community_milestones(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  amount bigint not null,
  contributed_at timestamp with time zone default now()
);

alter table public.milestone_contributions enable row level security;

create policy "Allow select for all roles on milestone_contributions"
  on public.milestone_contributions
  for select
  using (true);

create policy "Allow insert for authenticated on milestone_contributions"
  on public.milestone_contributions
  for insert
  to authenticated
  with check (true);

-- 3. Create teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

alter table public.teams enable row level security;

create policy "Allow select for all roles on teams"
  on public.teams
  for select
  using (true);

create policy "Allow insert for authenticated on teams"
  on public.teams
  for insert
  to authenticated
  with check (true);

-- 4. Create team_members table
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamp with time zone default now()
);

alter table public.team_members enable row level security;

create policy "Allow select for all roles on team_members"
  on public.team_members
  for select
  using (true);

create policy "Allow insert for authenticated on team_members"
  on public.team_members
  for insert
  to authenticated
  with check (true);

-- 5. Create assists table
create table if not exists public.assists (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  description text,
  assisted_at timestamp with time zone default now()
);

alter table public.assists enable row level security;

create policy "Allow select for all roles on assists"
  on public.assists
  for select
  using (true);

create policy "Allow insert for authenticated on assists"
  on public.assists
  for insert
  to authenticated
  with check (true);

-- End of migration
