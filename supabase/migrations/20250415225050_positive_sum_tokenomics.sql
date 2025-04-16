-- Migration: Enhance tokenomics for advanced positive-sum rewards
-- Purpose: Add group quest, mentorship, and collaboration token rewards. Ensure all mechanics are strictly positive-sum.
-- Author: Cascade AI
-- Date: 2025-04-15 22:50 UTC

/*
  This migration introduces new triggers and functions to:
    - Mint tokens for all participants in group quests
    - Reward both mentor and mentee in mentorship events
    - Reward all collaborators in collaborative actions
  All reward logic is strictly positive-sum. No tokens are ever deducted or burned.
*/

-- 1. Group Quest Completion: Reward all participants
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
  end loop;
  return new;
end;
$$;

-- The following lines are commented out because group_quests does not exist in the schema
-- drop trigger if exists trg_reward_tokens_for_group_quest on public.group_quests;
-- create trigger trg_reward_tokens_for_group_quest
--   after update on public.group_quests
--   for each row
--   when (new.status = 'completed' and old.status is distinct from 'completed')
--   execute function public.reward_tokens_for_group_quest();

-- 2. Mentorship Event: Reward both mentor and mentee
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
  return new;
end;
$$;

-- The following lines are commented out because mentorships does not exist in the schema
-- drop trigger if exists trg_reward_tokens_for_mentorship on public.mentorships;
-- create trigger trg_reward_tokens_for_mentorship
--   after insert on public.mentorships
--   for each row
--   execute function public.reward_tokens_for_mentorship();

-- 3. Collaboration Event: Reward all collaborators
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
  end loop;
  return new;
end;
$$;

-- The following lines are commented out because collaborations does not exist in the schema
-- drop trigger if exists trg_reward_tokens_for_collaboration on public.collaborations;
-- create trigger trg_reward_tokens_for_collaboration
--   after update on public.collaborations
--   for each row
--   when (new.status = 'completed' and old.status is distinct from 'completed')
--   execute function public.reward_tokens_for_collaboration();

-- All logic above is strictly positive-sum: tokens are only minted for positive actions.
-- No tokens are ever deducted or burned. All rewards are collaborative or personal bests.

-- End of migration
