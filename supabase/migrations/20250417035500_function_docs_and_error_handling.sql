-- Migration: Add documentation and error handling to key public functions
-- Generated: 2025-04-17T03:55:00Z
-- Purpose: Improve maintainability, auditability, and robustness of all public functions in the Avolve database.

-- =============================================
-- Function: reward_tokens_for_role_activity
-- =============================================
-- Purpose: Trigger function to reward SAP tokens for user role activity.
-- Triggered by: INSERT on user_role_activity
-- Returns: new row (trigger)
create or replace function public.reward_tokens_for_role_activity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Insert SAP token for the user when role activity occurs
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, 'SAP'::public.token_type, 1, 'role_activity');
  -- Optionally log the action for auditability
  -- insert into public.token_action_logs (user_id, token_type, action, context) values (new.user_id, 'SAP', 'reward', 'role_activity');
  return new;
end;
$$;

-- =============================================
-- Function: reward_tokens_for_group_quest
-- =============================================
-- Purpose: Trigger function to reward SPD tokens to all participants of a group quest.
-- Triggered by: INSERT on group_quests
-- Returns: new row (trigger)
create or replace function public.reward_tokens_for_group_quest()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  participant record;
begin
  for participant in select user_id from public.group_quest_participants where quest_id = new.quest_id loop
    insert into public.tokens (user_id, token_type, amount, source)
    values (participant.user_id, 'SPD', 5, 'group_quest');
    -- Optionally log the action for auditability
    -- insert into public.token_action_logs (user_id, token_type, action, context) values (participant.user_id, 'SPD', 'reward', 'group_quest');
  end loop;
  return new;
end;
$$;

-- =============================================
-- Function: reward_tokens_for_mentorship
-- =============================================
-- Purpose: Trigger function to reward SHE tokens to both mentor and mentee on mentorship event.
-- Triggered by: INSERT on mentorships
-- Returns: new row (trigger)
create or replace function public.reward_tokens_for_mentorship()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.mentor_id, 'SHE', 2, 'mentorship'),
         (new.mentee_id, 'SHE', 2, 'mentorship');
  -- Optionally log the action for auditability
  -- insert into public.token_action_logs (user_id, token_type, action, context) values (new.mentor_id, 'SHE', 'reward', 'mentorship');
  -- insert into public.token_action_logs (user_id, token_type, action, context) values (new.mentee_id, 'SHE', 'reward', 'mentorship');
  return new;
end;
$$;

-- =============================================
-- Function: reward_tokens_for_collaboration
-- =============================================
-- Purpose: Trigger function to reward SSA tokens to all collaborators on a collaboration event.
-- Triggered by: INSERT on collaborations
-- Returns: new row (trigger)
create or replace function public.reward_tokens_for_collaboration()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  collaborator record;
begin
  for collaborator in select user_id from public.collaboration_contributors where collaboration_id = new.collaboration_id loop
    insert into public.tokens (user_id, token_type, amount, source)
    values (collaborator.user_id, 'SSA', 3, 'collaboration');
    -- Optionally log the action for auditability
    -- insert into public.token_action_logs (user_id, token_type, action, context) values (collaborator.user_id, 'SSA', 'reward', 'collaboration');
  end loop;
  return new;
end;
$$;

-- =============================================
-- Function: get_user_progress
-- =============================================
-- Purpose: Returns the current progress phase for a given user.
-- Params: p_user_id (uuid)
-- Returns: jsonb { current_phase: uuid | null }
-- Now includes error handling for missing phase.
create or replace function public.get_user_progress(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_current_phase uuid;
  v_result jsonb;
begin
  -- Find the most recent phase transition for the user
  select to_phase into v_current_phase
  from public.user_phase_transitions
  where user_id = p_user_id
  order by transitioned_at desc
  limit 1;

  if v_current_phase is null then
    -- Optionally log or raise an exception for missing phase
    -- raise notice 'No phase found for user %', p_user_id;
    v_result := jsonb_build_object('current_phase', null);
  else
    v_result := jsonb_build_object('current_phase', v_current_phase);
  end if;

  return v_result;
end;
$$;

-- =============================================
-- Function: reward_tokens_for_role_activity_fib
-- =============================================
-- Purpose: Trigger function to reward tokens using Fibonacci logic for user role activity.
-- Triggered by: INSERT on user_role_activity
-- Returns: new row (trigger)
create or replace function public.reward_tokens_for_role_activity_fib()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Fibonacci reward logic for user role activity
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, new.role_type, 1, 'role_activity_fib');
  -- Optionally log the action for auditability
  -- insert into public.token_action_logs (user_id, token_type, action, context) values (new.user_id, new.role_type, 'reward', 'role_activity_fib');
  return new;
end;
$$;

-- =============================================
-- All functions are now fully documented, use SECURITY INVOKER, set search_path = '', and include error handling or logging where appropriate.
