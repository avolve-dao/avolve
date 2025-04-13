-- avolve database functions
-- this file contains all the database functions for the avolve platform

-- function to release pending tokens (5% weekly)
create or replace function public.release_pending_tokens()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_release_percentage numeric := 0.05; -- 5% weekly release
  v_user_token record;
  v_release_amount numeric;
begin
  -- process each user token balance with pending tokens
  for v_user_token in
    select id, user_id, token_id, pending_release
    from public.user_tokens
    where pending_release > 0
  loop
    -- calculate release amount (5% of pending balance)
    v_release_amount := round(v_user_token.pending_release * v_release_percentage, 8);
    
    if v_release_amount > 0 then
      -- update user token balance
      update public.user_tokens
      set balance = balance + v_release_amount,
          pending_release = pending_release - v_release_amount
      where id = v_user_token.id;
      
      -- record the transaction
      insert into public.token_transactions (
        token_id,
        from_user_id,
        to_user_id,
        amount,
        transaction_type,
        reason
      ) values (
        v_user_token.token_id,
        null,
        v_user_token.user_id,
        v_release_amount,
        'pending_release',
        'Weekly token release (5%)'
      );
    end if;
  end loop;
end;
$$;

-- function to reward user with tokens
create or replace function public.reward_user(
  p_user_id uuid,
  p_token_symbol text,
  p_activity_type text,
  p_custom_amount numeric default null,
  p_custom_multiplier numeric default null
)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_reward_amount numeric;
  v_base_amount numeric;
  v_multiplier numeric;
  v_pending_amount numeric;
begin
  -- get token id from symbol
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    raise exception 'Token with symbol % not found', p_token_symbol;
  end if;
  
  -- determine reward amount
  if p_custom_amount is not null then
    v_base_amount := p_custom_amount;
  else
    -- get base amount from reward configuration
    select base_amount into v_base_amount
    from public.token_rewards
    where token_id = v_token_id and activity_type = p_activity_type and is_active = true;
    
    if v_base_amount is null then
      raise exception 'No active reward configuration found for token % and activity %', p_token_symbol, p_activity_type;
    end if;
  end if;
  
  -- apply multiplier
  v_multiplier := coalesce(p_custom_multiplier, 1);
  v_reward_amount := round(v_base_amount * v_multiplier, 8);
  
  -- 80% goes to pending release, 20% immediately available
  v_pending_amount := round(v_reward_amount * 0.8, 8);
  v_reward_amount := round(v_reward_amount * 0.2, 8);
  
  -- update user token balance
  update public.user_tokens
  set balance = balance + v_reward_amount,
      pending_release = pending_release + v_pending_amount
  where user_id = p_user_id and token_id = v_token_id;
  
  -- if no row was updated, insert one
  if not found then
    insert into public.user_tokens (user_id, token_id, balance, pending_release)
    values (p_user_id, v_token_id, v_reward_amount, v_pending_amount);
  end if;
  
  -- update total supply
  update public.tokens
  set total_supply = total_supply + v_reward_amount + v_pending_amount
  where id = v_token_id;
  
  -- record the transaction
  insert into public.token_transactions (
    token_id,
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    reason
  ) values (
    v_token_id,
    null,
    p_user_id,
    v_reward_amount + v_pending_amount,
    'reward',
    p_activity_type || ' reward (20% immediate, 80% pending)'
  );
  
  return v_reward_amount + v_pending_amount;
end;
$$;

-- function to transfer tokens between users
create or replace function public.transfer_tokens(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_token_symbol text,
  p_amount numeric,
  p_reason text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_from_balance numeric;
begin
  -- validate parameters
  if p_from_user_id = p_to_user_id then
    raise exception 'Cannot transfer tokens to yourself';
  end if;
  
  if p_amount <= 0 then
    raise exception 'Transfer amount must be greater than zero';
  end if;
  
  -- get token id from symbol
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    raise exception 'Token with symbol % not found', p_token_symbol;
  end if;
  
  -- check if sender has sufficient balance
  select balance into v_from_balance
  from public.user_tokens
  where user_id = p_from_user_id and token_id = v_token_id;
  
  if v_from_balance is null or v_from_balance < p_amount then
    raise exception 'Insufficient balance for transfer';
  end if;
  
  -- update sender balance
  update public.user_tokens
  set balance = balance - p_amount
  where user_id = p_from_user_id and token_id = v_token_id;
  
  -- update receiver balance
  update public.user_tokens
  set balance = balance + p_amount
  where user_id = p_to_user_id and token_id = v_token_id;
  
  -- if receiver doesn't have a balance record yet, create one
  if not found then
    insert into public.user_tokens (user_id, token_id, balance)
    values (p_to_user_id, v_token_id, p_amount);
  end if;
  
  -- record the transaction
  insert into public.token_transactions (
    token_id,
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    reason
  ) values (
    v_token_id,
    p_from_user_id,
    p_to_user_id,
    p_amount,
    'transfer',
    p_reason
  );
  
  return true;
end;
$$;

-- function to create a genius profile
create or replace function public.create_genius_profile(
  p_user_id uuid,
  p_genius_id text,
  p_avatar_url text default null,
  p_bio text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile_id uuid;
begin
  -- check if genius_id is already taken
  if exists (select 1 from public.genius_profiles where genius_id = p_genius_id) then
    raise exception 'Genius ID % is already taken', p_genius_id;
  end if;
  
  -- create the genius profile
  insert into public.genius_profiles (
    user_id,
    genius_id,
    avatar_url,
    bio
  ) values (
    p_user_id,
    p_genius_id,
    p_avatar_url,
    p_bio
  )
  returning id into v_profile_id;
  
  return v_profile_id;
end;
$$;

-- function to update degen_regen score
create or replace function public.update_degen_regen_score(
  p_user_id uuid,
  p_score_change integer
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_current_score integer;
  v_new_score integer;
begin
  -- get the profile id
  select id, degen_regen_score into v_profile_id, v_current_score
  from public.genius_profiles
  where user_id = p_user_id;
  
  if v_profile_id is null then
    raise exception 'Genius profile not found for user';
  end if;
  
  -- calculate new score
  v_new_score := v_current_score + p_score_change;
  
  -- ensure score stays within bounds
  if v_new_score < 0 then
    v_new_score := 0;
  elsif v_new_score > 100 then
    v_new_score := 100;
  end if;
  
  -- update the score
  update public.genius_profiles
  set degen_regen_score = v_new_score
  where id = v_profile_id;
  
  return v_new_score;
end;
$$;

-- function to award achievement
create or replace function public.award_achievement(
  p_user_id uuid,
  p_achievement_type text,
  p_title text,
  p_description text default null,
  p_points integer default 0,
  p_metadata jsonb default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_achievement_id uuid;
begin
  -- get the profile id
  select id into v_profile_id
  from public.genius_profiles
  where user_id = p_user_id;
  
  if v_profile_id is null then
    raise exception 'Genius profile not found for user';
  end if;
  
  -- create the achievement
  insert into public.genius_achievements (
    profile_id,
    achievement_type,
    title,
    description,
    points,
    metadata
  ) values (
    v_profile_id,
    p_achievement_type,
    p_title,
    p_description,
    p_points,
    p_metadata
  )
  returning id into v_achievement_id;
  
  -- update degen_regen score if points are provided
  if p_points != 0 then
    perform public.update_degen_regen_score(p_user_id, p_points);
  end if;
  
  return v_achievement_id;
end;
$$;

-- function to register for a meeting
create or replace function public.register_for_meeting(
  p_user_id uuid,
  p_meeting_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_participant_id uuid;
  v_route_id uuid;
  v_token_symbol text;
begin
  -- check if already registered
  select id into v_participant_id
  from public.meeting_participants
  where user_id = p_user_id and meeting_id = p_meeting_id;
  
  if v_participant_id is not null then
    return v_participant_id; -- already registered
  end if;
  
  -- get route and token information
  select r.id, r.token_symbol into v_route_id, v_token_symbol
  from public.weekly_meetings m
  join public.routes r on m.route_id = r.id
  where m.id = p_meeting_id;
  
  if v_route_id is null then
    raise exception 'Meeting not found';
  end if;
  
  -- register for the meeting
  insert into public.meeting_participants (
    meeting_id,
    user_id,
    status
  ) values (
    p_meeting_id,
    p_user_id,
    'registered'
  )
  returning id into v_participant_id;
  
  -- ensure user has a journey for this route
  if not exists (
    select 1 from public.user_journeys
    where user_id = p_user_id and route_id = v_route_id
  ) then
    -- get pillar id
    declare
      v_pillar_id uuid;
    begin
      select pillar_id into v_pillar_id
      from public.routes
      where id = v_route_id;
      
      -- create journey
      insert into public.user_journeys (
        user_id,
        pillar_id,
        route_id,
        status,
        started_at
      ) values (
        p_user_id,
        v_pillar_id,
        v_route_id,
        'in_progress',
        now()
      );
    end;
  end if;
  
  return v_participant_id;
end;
$$;

-- function to distribute meeting respect
create or replace function public.distribute_meeting_respect(
  p_meeting_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_route_id uuid;
  v_token_symbol text;
  v_fibonacci int[] := array[2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  v_participant record;
  v_rank integer;
  v_respect numeric;
begin
  -- get route and token information
  select r.id, r.token_symbol into v_route_id, v_token_symbol
  from public.weekly_meetings m
  join public.routes r on m.route_id = r.id
  where m.id = p_meeting_id;
  
  if v_route_id is null then
    raise exception 'Meeting not found';
  end if;
  
  -- process each participant with a rank
  for v_participant in
    select 
      user_id,
      rank
    from public.meeting_participants
    where meeting_id = p_meeting_id
    and rank is not null
    and status = 'present'
    order by rank
  loop
    -- calculate respect based on fibonacci sequence
    v_rank := v_participant.rank;
    
    if v_rank between 1 and 10 then
      v_respect := v_fibonacci[v_rank];
    else
      v_respect := 0; -- handle invalid ranks
    end if;
    
    -- award respect tokens
    if v_respect > 0 then
      -- use the reward_user function
      perform public.reward_user(
        v_participant.user_id,
        v_token_symbol,
        'meeting_contribution',
        v_respect
      );
      
      -- update the respect earned in the participant record
      update public.meeting_participants
      set respect_earned = v_respect
      where meeting_id = p_meeting_id
      and user_id = v_participant.user_id;
    end if;
  end loop;
  
  -- mark meeting as completed
  update public.weekly_meetings
  set status = 'completed'
  where id = p_meeting_id;
  
  -- mark groups as completed
  update public.meeting_groups
  set status = 'completed'
  where meeting_id = p_meeting_id;
  
  return true;
end;
$$;

-- function to get user token balances
create or replace function public.get_user_token_balances(
  p_user_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'token_symbol', t.symbol,
      'token_name', t.name,
      'balance', ut.balance,
      'staked_balance', ut.staked_balance,
      'pending_release', ut.pending_release,
      'total_balance', ut.balance + ut.staked_balance + ut.pending_release
    )
  ) into v_result
  from public.user_tokens ut
  join public.tokens t on ut.token_id = t.id
  where ut.user_id = p_user_id;
  
  return coalesce(v_result, '[]'::jsonb);
end;
$$;
