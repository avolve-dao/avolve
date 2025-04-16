-- Migration: Create or update get_user_progress function to return current_phase
-- Purpose: Ensure the function returns a 'current_phase' property for use in AI Insights and other features
-- Created: 2025-04-16 17:50:00 UTC

-- Drop the function if it exists (for idempotency)
drop function if exists public.get_user_progress(uuid);

-- Create the function
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

  v_result := jsonb_build_object(
    'current_phase', v_current_phase
  );

  return v_result;
end;
$$;

-- End of migration
