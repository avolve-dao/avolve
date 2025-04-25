-- Migration: Create initialize_user_onboarding function
-- Generated: 2025-04-23T12:15:00Z
-- Purpose: Create a transactional function to handle user onboarding initialization
-- Author: @avolve-dao

/**
 * Initialize user onboarding in a transaction
 * 
 * This function handles all initialization steps for a new user in a single transaction:
 * 1. Assigns default tokens and balances
 * 2. Assigns default roles
 * 3. Creates initial phase milestones
 * 4. Sets up onboarding tracking
 * 
 * @param p_user_id - The UUID of the user to initialize
 * @returns JSON with status and user_id
 */
create or replace function public.initialize_user_onboarding(p_user_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  -- Validate input
  if p_user_id is null then
    raise exception 'User ID cannot be null';
  end if;
  
  -- Check if user exists
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User with ID % does not exist', p_user_id;
  end if;
  
  -- Begin transaction
  -- All operations will succeed or fail together
  
  -- 1. Assign default tokens/balances
  insert into public.user_balances (user_id, token_id, balance)
  values 
    (p_user_id, 'GEN', 1),
    (p_user_id, 'SAP', 5),
    (p_user_id, 'SCQ', 3)
  on conflict (user_id, token_id) 
  do update set balance = public.user_balances.balance + excluded.balance;
  
  -- 2. Assign default roles
  insert into public.user_roles (user_id, role_id)
  values (p_user_id, 'default_onboarded')
  on conflict (user_id, role_id) do nothing;
  
  -- 3. Initialize onboarding quests/milestones
  insert into public.user_phase_milestones (user_id, phase_id, completed)
  values 
    (p_user_id, 'onboarding', false),
    (p_user_id, 'welcome', false),
    (p_user_id, 'first_post', false)
  on conflict (user_id, phase_id) do nothing;
  
  -- 4. Create onboarding tracking record
  insert into public.user_onboarding (user_id, completed_steps)
  values (p_user_id, '{}')
  on conflict (user_id) do nothing;
  
  -- 5. Set feature flags for new user
  insert into public.feature_flags (user_id, flag_name, enabled)
  values
    (p_user_id, 'supercivilization_feed', true),
    (p_user_id, 'peer_recognition', true),
    (p_user_id, 'personal_progress', true),
    (p_user_id, 'community_milestones', true)
  on conflict (user_id, flag_name) do nothing;
  
  -- Return success result
  v_result := jsonb_build_object(
    'status', 'success',
    'user_id', p_user_id,
    'timestamp', now()
  );
  
  return v_result;
exception
  when others then
    -- Log the error
    insert into public.error_logs (
      function_name,
      error_message,
      context
    ) values (
      'initialize_user_onboarding',
      SQLERRM,
      jsonb_build_object('user_id', p_user_id)
    );
    
    -- Re-raise the exception
    raise;
end;
$$;
