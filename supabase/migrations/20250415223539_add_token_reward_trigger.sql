-- Migration: Add automatic token rewards for role actions
-- Purpose: Mint/transfer tokens to users for Subscriber/Participant/Contributor actions
-- Author: Cascade AI
-- Date: 2025-04-15 22:35 UTC

create or replace function public.reward_tokens_for_role_activity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  token_type text;
  token_amount numeric;
begin
  -- Example mapping logic (expand as needed)
  if new.role_type = 'subscriber' and new.action_type in ('subscribe', 'read') then
    token_type := 'SAP';
    token_amount := 1;
  elsif new.role_type = 'participant' and new.action_type in ('join_quest', 'comment') then
    token_type := 'PSP';
    token_amount := 2;
  elsif new.role_type = 'contributor' and new.action_type in ('propose', 'review') then
    token_type := 'SCQ';
    token_amount := 3;
  else
    -- No reward for other actions by default
    return new;
  end if;

  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, token_type, token_amount, 'role_activity');

  return new;
end;
$$;

drop trigger if exists trg_reward_tokens_for_role_activity on public.user_role_activity;

create trigger trg_reward_tokens_for_role_activity
after insert on public.user_role_activity
for each row
execute function public.reward_tokens_for_role_activity();

-- End of migration
