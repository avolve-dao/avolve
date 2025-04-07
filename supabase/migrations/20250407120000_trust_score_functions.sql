-- Migration: Trust Score Functions
-- Description: Functions to manage user trust scores and security levels
-- Date: 2025-04-07

-- Function to update a user's trust score
create or replace function public.update_trust_score(
  p_points integer,
  p_reason text,
  p_user_id uuid default null
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_current_score numeric;
  v_new_score numeric;
  v_current_level integer;
  v_new_level integer;
  v_level_changed boolean;
begin
  -- If no user_id provided, use the authenticated user
  v_user_id := coalesce(p_user_id, auth.uid());
  
  -- Check if user is authenticated or has permission
  if v_user_id is null then
    return json_build_object('success', false, 'message', 'Authentication required');
  end if;
  
  -- Only allow updating other users' scores if you're an admin (could add admin check here)
  if p_user_id is not null and p_user_id != auth.uid() then
    -- Check if user has admin privileges
    if not exists (
      select 1 
      from public.member_journey 
      where user_id = auth.uid() and current_level = 'full_member'
    ) then
      return json_build_object('success', false, 'message', 'Permission denied');
    end if;
  end if;
  
  -- Get current trust score and level
  select score, level into v_current_score, v_current_level
  from public.trust_scores
  where user_id = v_user_id;
  
  -- If user doesn't have a trust score yet, create one
  if v_current_score is null then
    insert into public.trust_scores (user_id, score, level)
    values (v_user_id, 0, 1)
    returning score, level into v_current_score, v_current_level;
  end if;
  
  -- Calculate new score
  v_new_score := v_current_score + p_points;
  
  -- Ensure score doesn't go below 0
  if v_new_score < 0 then
    v_new_score := 0;
  end if;
  
  -- Calculate new level based on score thresholds
  v_new_level := case
    when v_new_score >= 100 then 5
    when v_new_score >= 75 then 4
    when v_new_score >= 50 then 3
    when v_new_score >= 25 then 2
    else 1
  end;
  
  -- Check if level changed
  v_level_changed := v_new_level != v_current_level;
  
  -- Update trust score
  update public.trust_scores
  set 
    score = v_new_score,
    level = v_new_level,
    last_updated = now()
  where user_id = v_user_id;
  
  -- Log the trust score update
  insert into public.security_logs (
    user_id,
    event_type,
    severity,
    details
  ) values (
    v_user_id,
    'trust_score_updated',
    'info',
    jsonb_build_object(
      'previous_score', v_current_score,
      'new_score', v_new_score,
      'points_change', p_points,
      'reason', p_reason,
      'previous_level', v_current_level,
      'new_level', v_new_level,
      'level_changed', v_level_changed
    )
  );
  
  -- If level increased, grant rewards
  if v_level_changed and v_new_level > v_current_level then
    -- Insert level-up rewards here if needed
    -- For example, token rewards, badges, etc.
    
    -- Log the level up
    insert into public.security_logs (
      user_id,
      event_type,
      severity,
      details
    ) values (
      v_user_id,
      'trust_level_increased',
      'info',
      jsonb_build_object(
        'previous_level', v_current_level,
        'new_level', v_new_level
      )
    );
  end if;
  
  return json_build_object(
    'success', true,
    'previous_score', v_current_score,
    'new_score', v_new_score,
    'points_change', p_points,
    'previous_level', v_current_level,
    'new_level', v_new_level,
    'level_changed', v_level_changed
  );
end;
$$;

-- Function to check if a user meets a minimum trust level
create or replace function public.check_trust_level(
  p_min_level integer,
  p_user_id uuid default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_level integer;
begin
  -- If no user_id provided, use the authenticated user
  v_user_id := coalesce(p_user_id, auth.uid());
  
  -- Check if user is authenticated
  if v_user_id is null then
    return false;
  end if;
  
  -- Get user's trust level
  select level into v_level
  from public.trust_scores
  where user_id = v_user_id;
  
  -- If user doesn't have a trust score, return false
  if v_level is null then
    return false;
  end if;
  
  -- Check if user meets the minimum level
  return v_level >= p_min_level;
end;
$$;

-- Function to get a user's trust score and level
create or replace function public.get_trust_score(
  p_user_id uuid default null
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_score numeric;
  v_level integer;
  v_next_level_threshold numeric;
  v_progress numeric;
begin
  -- If no user_id provided, use the authenticated user
  v_user_id := coalesce(p_user_id, auth.uid());
  
  -- Check if user is authenticated or has permission
  if v_user_id is null then
    return json_build_object('success', false, 'message', 'Authentication required');
  end if;
  
  -- Only allow viewing other users' scores if you're an admin or the same user
  if p_user_id is not null and p_user_id != auth.uid() then
    -- Check if user has admin privileges
    if not exists (
      select 1 
      from public.member_journey 
      where user_id = auth.uid() and current_level = 'full_member'
    ) then
      return json_build_object('success', false, 'message', 'Permission denied');
    end if;
  end if;
  
  -- Get trust score and level
  select score, level into v_score, v_level
  from public.trust_scores
  where user_id = v_user_id;
  
  -- If user doesn't have a trust score yet, return defaults
  if v_score is null then
    return json_build_object(
      'success', true,
      'score', 0,
      'level', 1,
      'next_level_threshold', 25,
      'progress', 0
    );
  end if;
  
  -- Calculate next level threshold and progress
  v_next_level_threshold := case
    when v_level = 1 then 25
    when v_level = 2 then 50
    when v_level = 3 then 75
    when v_level = 4 then 100
    else null
  end;
  
  -- Calculate progress to next level (as percentage)
  if v_next_level_threshold is not null then
    v_progress := case
      when v_level = 1 then (v_score / 25) * 100
      when v_level = 2 then ((v_score - 25) / 25) * 100
      when v_level = 3 then ((v_score - 50) / 25) * 100
      when v_level = 4 then ((v_score - 75) / 25) * 100
      else 100
    end;
  else
    v_progress := 100;
  end if;
  
  return json_build_object(
    'success', true,
    'score', v_score,
    'level', v_level,
    'next_level_threshold', v_next_level_threshold,
    'progress', v_progress
  );
end;
$$;
