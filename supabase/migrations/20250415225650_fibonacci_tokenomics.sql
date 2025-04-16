-- Migration: Implement Fibonacci-based, positive-sum tokenomics for Avolve
-- Purpose: Reward Subscribers, Participants, Contributors, and Teams using the Fibonacci sequence; ensure all rewards are additive and collaborative
-- Author: Cascade AI
-- Date: 2025-04-15 22:56 UTC

/*
  This migration introduces:
    - A Fibonacci sequence function for reward calculation
    - Updated triggers/functions to reward role actions using Fibonacci numbers
    - Team matching rewards: teams receive a fraction of member rewards
    - Group event reward logic: participants are ranked and rewarded per Fibonacci
  All logic is strictly positive-sum. No tokens are ever deducted or burned.
*/

-- 1. Fibonacci sequence function
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

-- 2. Update reward trigger for role activity (uses Fibonacci)
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
  -- Subscribers: low Fibonacci rewards for basic actions
  if new.role_type = 'subscriber' and new.action_type in ('subscribe', 'read') then
    token_type := 'SAP';
    fib_index := 2; -- fibonacci(2) = 1
  -- Participants: moderate Fibonacci rewards
  elsif new.role_type = 'participant' and new.action_type in ('join_quest', 'comment') then
    token_type := 'PSP';
    fib_index := 3; -- fibonacci(3) = 2
  -- Contributors: higher Fibonacci rewards
  elsif new.role_type = 'contributor' and new.action_type in ('propose', 'review', 'lead', 'team_up') then
    token_type := 'SCQ';
    fib_index := 5; -- fibonacci(5) = 5
  else
    return new;
  end if;
  token_amount := public.fibonacci(fib_index);
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, token_type, token_amount, 'role_activity_fib');

  -- Team matching: if contributor is in a team, team gets 50% of tokens
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

-- 3. Group event rewards: rank participants and reward by Fibonacci
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
  -- Assume group_event_participants table with columns (event_id, user_id, rank)
  for r in select user_id, rank from public.group_event_participants where event_id = new.event_id loop
    insert into public.tokens (user_id, token_type, amount, source)
    values (r.user_id, 'SCQ', public.fibonacci(2 + r.rank), 'group_event_fib');
    -- Teams: if user is in a team, team gets 50% of tokens
    if exists (select 1 from public.users where id = r.user_id and team_id is not null) then
      insert into public.team_tokens (team_id, token_type, amount, source)
      select team_id, 'SCQ', round(public.fibonacci(2 + r.rank) * 0.5), 'group_event_team_match'
      from public.users where id = r.user_id;
    end if;
  end loop;
  return new;
end;
$$;

-- The following lines are commented out because group_events does not exist in the schema
-- drop trigger if exists trg_reward_tokens_for_group_event_fib on public.group_events;
-- create trigger trg_reward_tokens_for_group_event_fib
--   after update on public.group_events
--   for each row
--   when (new.status = 'completed' and old.status is distinct from 'completed')
--   execute function public.reward_tokens_for_group_event_fib();

-- All logic above is strictly positive-sum and collaborative.
-- End of migration
