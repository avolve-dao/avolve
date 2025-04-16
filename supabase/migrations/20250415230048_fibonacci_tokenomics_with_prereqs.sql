-- Migration: Fibonacci Tokenomics with Prerequisites
-- Purpose: Create missing tables and columns, then implement Fibonacci-based, positive-sum tokenomics for Avolve
-- Author: Cascade AI
-- Date: 2025-04-15 23:00 UTC

/*
  This migration will:
    1. Create prerequisite tables/columns if missing:
       - group_events
       - group_event_participants
       - team_tokens
       - team_id on profiles
    2. Add RLS and policies for all new tables
    3. Implement Fibonacci sequence function
    4. Add/update triggers/functions for role, team, and group rewards
*/

-- 1. Create group_events table
create table if not exists public.group_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text default 'pending',
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Enable RLS
alter table public.group_events enable row level security;

-- Policies (will fail if already exist; remove manually if re-running)
drop policy if exists "select_group_events_anon" on public.group_events;
create policy "select_group_events_anon" on public.group_events for select to anon using (true);
drop policy if exists "select_group_events_authenticated" on public.group_events;
create policy "select_group_events_authenticated" on public.group_events for select to authenticated using (true);
drop policy if exists "insert_group_events_authenticated" on public.group_events;
create policy "insert_group_events_authenticated" on public.group_events for insert to authenticated with check (true);
drop policy if exists "update_group_events_authenticated" on public.group_events;
create policy "update_group_events_authenticated" on public.group_events for update to authenticated using (true);

-- 2. Create group_event_participants table
create table if not exists public.group_event_participants (
  event_id uuid references public.group_events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  rank integer not null,
  primary key (event_id, user_id)
);

alter table public.group_event_participants enable row level security;
drop policy if exists "select_group_event_participants_anon" on public.group_event_participants;
create policy "select_group_event_participants_anon" on public.group_event_participants for select to anon using (true);
drop policy if exists "select_group_event_participants_authenticated" on public.group_event_participants;
create policy "select_group_event_participants_authenticated" on public.group_event_participants for select to authenticated using (true);
drop policy if exists "insert_group_event_participants_authenticated" on public.group_event_participants;
create policy "insert_group_event_participants_authenticated" on public.group_event_participants for insert to authenticated with check (true);
drop policy if exists "update_group_event_participants_authenticated" on public.group_event_participants;
create policy "update_group_event_participants_authenticated" on public.group_event_participants for update to authenticated using (true);

-- 3. Add team_id to profiles if not exists
alter table public.profiles add column if not exists team_id uuid;

-- 4. Create team_tokens table
create table if not exists public.team_tokens (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null,
  token_type text not null,
  amount integer not null,
  source text,
  created_at timestamptz default now()
);

alter table public.team_tokens enable row level security;
drop policy if exists "select_team_tokens_anon" on public.team_tokens;
create policy "select_team_tokens_anon" on public.team_tokens for select to anon using (true);
drop policy if exists "select_team_tokens_authenticated" on public.team_tokens;
create policy "select_team_tokens_authenticated" on public.team_tokens for select to authenticated using (true);
drop policy if exists "insert_team_tokens_authenticated" on public.team_tokens;
create policy "insert_team_tokens_authenticated" on public.team_tokens for insert to authenticated with check (true);

-- 5. Fibonacci sequence function
create or replace function public.fibonacci(n integer)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  a integer := 0;
  b integer := 1;
  temp integer;
  i integer := 0;
begin
  if n < 0 then
    raise exception 'n must be non-negative';
  end if;
  while i < n loop
    temp := a + b;
    a := b;
    b := temp;
    i := i + 1;
  end loop;
  return a;
end;
$$;

-- 6. Reward trigger for role activity (uses Fibonacci)
create or replace function public.reward_tokens_for_role_activity_fib()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  token_type text;
  fib_index integer;
  token_amount integer;
begin
  if new.role_type = 'subscriber' and new.action_type in ('subscribe', 'read') then
    token_type := 'SAP';
    fib_index := 2;
  elsif new.role_type = 'participant' and new.action_type in ('join_quest', 'comment') then
    token_type := 'PSP';
    fib_index := 3;
  elsif new.role_type = 'contributor' and new.action_type in ('propose', 'review', 'lead', 'team_up') then
    token_type := 'SCQ';
    fib_index := 5;
  else
    return new;
  end if;
  token_amount := public.fibonacci(fib_index);
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, token_type, token_amount, 'role_activity_fib');
  if new.role_type = 'contributor' and new.team_id is not null then
    insert into public.team_tokens (team_id, token_type, amount, source)
    values (new.team_id, token_type, round(token_amount * 0.5), 'team_match');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reward_tokens_for_role_activity_fib on public.user_role_activity;
create trigger trg_reward_tokens_for_role_activity_fib
  after insert on public.user_role_activity
  for each row
  execute function public.reward_tokens_for_role_activity_fib();

-- 7. Group event rewards: rank participants and reward by Fibonacci
create or replace function public.reward_tokens_for_group_event_fib()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r record;
  rank integer;
begin
  for r in select user_id, rank from public.group_event_participants where event_id = new.id loop
    insert into public.tokens (user_id, token_type, amount, source)
    values (r.user_id, 'SCQ', public.fibonacci(2 + r.rank), 'group_event_fib');
    if exists (select 1 from public.profiles where id = r.user_id and team_id is not null) then
      insert into public.team_tokens (team_id, token_type, amount, source)
      select team_id, 'SCQ', round(public.fibonacci(2 + r.rank) * 0.5), 'group_event_team_match'
      from public.profiles where id = r.user_id;
    end if;
  end loop;
  return new;
end;
$$;

drop trigger if exists trg_reward_tokens_for_group_event_fib on public.group_events;
create trigger trg_reward_tokens_for_group_event_fib
  after update on public.group_events
  for each row
  when (new.status = 'completed' and old.status is distinct from 'completed')
  execute function public.reward_tokens_for_group_event_fib();

-- End of migration
