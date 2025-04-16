-- Migration: Network State Expansion for Avolve
-- Purpose: Enable advanced teams, archipelagos, memberships, collective actions, DAO/coop governance, and on-chain census
-- Author: Cascade AI
-- Date: 2025-04-15 23:10 UTC

/*
  This migration will:
    1. Create/expand tables for teams, archipelagos, memberships, collective actions
    2. Add network state metadata and progression logic
    3. Implement DAO/coop proposal & voting logic
    4. Add on-chain census views
    5. Ensure RLS and security best practices
*/

-- 1. Teams (Network Unions/Archipelagos)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  founder_id uuid references public.profiles(id),
  description text,
  type text default 'union', -- union, archipelago, network_state
  status text default 'active',
  created_at timestamptz default now(),
  milestone_level integer default 0,
  milestone_desc text,
  upgraded_at timestamptz,
  unique(name)
);

alter table public.teams enable row level security;
create policy "select_teams_anon" on public.teams for select to anon using (true);
create policy "select_teams_authenticated" on public.teams for select to authenticated using (true);
create policy "insert_teams_authenticated" on public.teams for insert to authenticated with check (true);
create policy "update_teams_authenticated" on public.teams for update to authenticated using (true);

-- 2. Team Memberships
create table if not exists public.team_memberships (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member', -- member, admin, founder
  joined_at timestamptz default now(),
  exited_at timestamptz,
  primary key (team_id, user_id)
);

alter table public.team_memberships enable row level security;
create policy "select_team_memberships_anon" on public.team_memberships for select to anon using (true);
create policy "select_team_memberships_authenticated" on public.team_memberships for select to authenticated using (true);
create policy "insert_team_memberships_authenticated" on public.team_memberships for insert to authenticated with check (true);
create policy "update_team_memberships_authenticated" on public.team_memberships for update to authenticated using (true);

-- 3. Collective Actions
create table if not exists public.collective_actions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  action_type text not null,
  description text,
  impact_score integer default 0,
  milestone boolean default false,
  created_at timestamptz default now()
);

alter table public.collective_actions enable row level security;
create policy "select_collective_actions_anon" on public.collective_actions for select to anon using (true);
create policy "select_collective_actions_authenticated" on public.collective_actions for select to authenticated using (true);
create policy "insert_collective_actions_authenticated" on public.collective_actions for insert to authenticated with check (true);
create policy "update_collective_actions_authenticated" on public.collective_actions for update to authenticated using (true);

-- 4. DAO/Coop Proposals
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  proposer_id uuid references public.profiles(id),
  title text not null,
  description text,
  status text default 'open', -- open, accepted, rejected, executed
  created_at timestamptz default now(),
  closed_at timestamptz
);

alter table public.proposals enable row level security;
create policy "select_proposals_anon" on public.proposals for select to anon using (true);
create policy "select_proposals_authenticated" on public.proposals for select to authenticated using (true);
create policy "insert_proposals_authenticated" on public.proposals for insert to authenticated with check (true);
create policy "update_proposals_authenticated" on public.proposals for update to authenticated using (true);

-- 5. DAO/Coop Voting
create table if not exists public.votes (
  proposal_id uuid references public.proposals(id) on delete cascade,
  voter_id uuid references public.profiles(id) on delete cascade,
  vote text not null, -- yes, no, abstain
  voted_at timestamptz default now(),
  primary key (proposal_id, voter_id)
);

alter table public.votes enable row level security;
create policy "select_votes_anon" on public.votes for select to anon using (true);
create policy "select_votes_authenticated" on public.votes for select to authenticated using (true);
create policy "insert_votes_authenticated" on public.votes for insert to authenticated with check (true);
create policy "update_votes_authenticated" on public.votes for update to authenticated using (true);

-- 6. On-Chain Census View (team stats)
create or replace view public.team_census as
select
  t.id as team_id,
  t.name,
  t.type,
  t.status,
  t.milestone_level,
  count(distinct m.user_id) as member_count,
  count(distinct a.id) as collective_actions,
  sum(a.impact_score) as total_impact
from public.teams t
left join public.team_memberships m on t.id = m.team_id and m.exited_at is null
left join public.collective_actions a on t.id = a.team_id
where t.status = 'active'
group by t.id, t.name, t.type, t.status, t.milestone_level;

-- 7. Triggers for Team/Archipelago Progression (Fibonacci rewards)
create or replace function public.reward_team_milestone_fib()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  milestone integer;
  reward integer;
begin
  -- Reward team and members on milestone
  milestone := new.milestone_level;
  reward := public.fibonacci(2 + milestone);
  insert into public.team_tokens (team_id, token_type, amount, source)
  values (new.id, 'SCQ', reward, 'team_milestone_fib');
  -- Reward all active members
  insert into public.tokens (user_id, token_type, amount, source)
  select user_id, 'SCQ', reward, 'team_milestone_fib'
  from public.team_memberships where team_id = new.id and exited_at is null;
  return new;
end;
$$;

drop trigger if exists trg_reward_team_milestone_fib on public.teams;
create trigger trg_reward_team_milestone_fib
  after update on public.teams
  for each row
  when (new.milestone_level > old.milestone_level)
  execute function public.reward_team_milestone_fib();

-- End of migration
