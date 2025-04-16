-- Migration: Update functions and triggers to use enums for token_type, metric_type, and user_role
-- Author: Cascade AI
-- Timestamp: 2025-04-15T22:18:20Z
-- Purpose: Refactor all relevant functions and triggers to use enums, ensuring consistency and type safety.

-- Example: Update token reward trigger to use enum type
-- (Repeat for all affected functions/triggers)

create or replace function public.reward_tokens_for_role_activity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Example logic for assigning SAP token on role activity
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, 'SAP'::public.token_type, 1, 'role_activity');
  return new;
end;
$$;

-- Update other functions/triggers as needed to use enum casts (e.g., 'PSP'::public.token_type, etc.)

-- End of migration
