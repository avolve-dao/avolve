-- Migration: Token Reward Functions
-- Description: Functions to support the token rewards system
-- Date: 2025-04-07

-- Function to get available rewards for the current user
create or replace function public.get_available_rewards()
returns table (
  id uuid,
  token_id uuid,
  token_symbol text,
  token_name text,
  name text,
  description text,
  amount numeric,
  reward_type text,
  requirements jsonb,
  is_active boolean,
  cooldown_period interval,
  is_claimed boolean,
  can_claim boolean,
  next_available timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid = auth.uid();
begin
  -- Check if user is authenticated
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  
  return query
  with user_claims as (
    select 
      c.reward_id,
      max(c.claimed_at) as last_claimed_at
    from 
      public.token_reward_claims c
    where 
      c.user_id = v_user_id
    group by 
      c.reward_id
  )
  select 
    r.id,
    r.token_id,
    t.symbol as token_symbol,
    t.name as token_name,
    r.name,
    r.description,
    r.amount,
    r.reward_type,
    r.requirements,
    r.is_active,
    r.cooldown_period,
    -- Check if the reward has been claimed
    case 
      when uc.reward_id is not null and 
           (r.cooldown_period is null or r.reward_type != 'daily') 
      then true
      else false
    end as is_claimed,
    -- Check if the reward can be claimed
    case
      -- For one-time rewards, check if it's been claimed
      when r.cooldown_period is null and uc.reward_id is not null then false
      -- For repeatable rewards, check cooldown period
      when r.cooldown_period is not null and uc.last_claimed_at is not null and 
           (now() - uc.last_claimed_at) < r.cooldown_period then false
      -- Otherwise, it's claimable
      else true
    end as can_claim,
    -- Calculate when the reward will be available again
    case
      when r.cooldown_period is not null and uc.last_claimed_at is not null
      then uc.last_claimed_at + r.cooldown_period
      else null
    end as next_available
  from 
    public.token_rewards r
    join public.tokens t on r.token_id = t.id
    left join user_claims uc on r.id = uc.reward_id
  where 
    r.is_active = true
  order by 
    r.reward_type, r.name;
end;
$$;

-- Function to check if a user meets the requirements for a reward
create or replace function public.check_reward_requirements(
  p_user_id uuid,
  p_requirements jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meets_requirements boolean = true;
  v_requirement_type text;
  v_requirement_value jsonb;
  v_user_level text;
  v_user_trust_score numeric;
  v_user_contribution_count integer;
  v_user_verification_status boolean;
begin
  -- Loop through all requirements
  for v_requirement_type, v_requirement_value in select * from jsonb_each(p_requirements) loop
    case v_requirement_type
      -- Check member level requirement
      when 'member_level' then
        select current_level into v_user_level
        from public.member_journey
        where user_id = p_user_id;
        
        if v_user_level is null or v_user_level != v_requirement_value#>>'{}' then
          v_meets_requirements = false;
        end if;
      
      -- Check trust score requirement
      when 'trust_score' then
        select score into v_user_trust_score
        from public.trust_scores
        where user_id = p_user_id;
        
        if v_user_trust_score is null or v_user_trust_score < (v_requirement_value#>>'{}'::text)::numeric then
          v_meets_requirements = false;
        end if;
      
      -- Check contribution count requirement
      when 'contribution_count' then
        select contribution_count into v_user_contribution_count
        from public.member_journey
        where user_id = p_user_id;
        
        if v_user_contribution_count is null or v_user_contribution_count < (v_requirement_value#>>'{}'::text)::integer then
          v_meets_requirements = false;
        end if;
      
      -- Check human verification requirement
      when 'verified_human' then
        select is_verified into v_user_verification_status
        from public.human_verifications
        where user_id = p_user_id;
        
        if v_user_verification_status is null or v_user_verification_status != (v_requirement_value#>>'{}'::text)::boolean then
          v_meets_requirements = false;
        end if;
      
      -- Add more requirement types as needed
      
      else
        -- Unknown requirement type, consider it not met
        v_meets_requirements = false;
    end case;
    
    -- If any requirement is not met, we can exit early
    if not v_meets_requirements then
      return false;
    end if;
  end loop;
  
  return v_meets_requirements;
end;
$$;

-- Modify the claim_token_reward function to use the check_reward_requirements function
create or replace function public.claim_token_reward(
  p_reward_id uuid
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid = auth.uid();
  v_token_id uuid;
  v_amount numeric;
  v_reward_type text;
  v_requirements jsonb;
  v_cooldown_period interval;
  v_last_claimed timestamptz;
  v_transaction_id uuid;
  v_meets_requirements boolean;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    return json_build_object('success', false, 'message', 'Authentication required');
  end if;
  
  -- Get reward details
  select 
    token_id, amount, reward_type, requirements, cooldown_period
  into 
    v_token_id, v_amount, v_reward_type, v_requirements, v_cooldown_period
  from public.token_rewards
  where id = p_reward_id and is_active = true;
  
  if v_token_id is null then
    return json_build_object('success', false, 'message', 'Invalid or inactive reward');
  end if;
  
  -- Check if the reward has been claimed before
  select claimed_at into v_last_claimed
  from public.token_reward_claims
  where reward_id = p_reward_id and user_id = v_user_id
  order by claimed_at desc
  limit 1;
  
  -- For one-time rewards, check if already claimed
  if v_cooldown_period is null and v_last_claimed is not null then
    return json_build_object(
      'success', false, 
      'message', 'This reward can only be claimed once'
    );
  end if;
  
  -- For repeatable rewards, check cooldown period
  if v_cooldown_period is not null and v_last_claimed is not null and (now() - v_last_claimed) < v_cooldown_period then
    return json_build_object(
      'success', false, 
      'message', 'Reward is on cooldown',
      'available_at', v_last_claimed + v_cooldown_period
    );
  end if;
  
  -- Check if user meets the requirements
  if v_requirements is not null and jsonb_array_length(v_requirements) > 0 then
    select public.check_reward_requirements(v_user_id, v_requirements) into v_meets_requirements;
    
    if not v_meets_requirements then
      return json_build_object(
        'success', false, 
        'message', 'You do not meet the requirements for this reward'
      );
    end if;
  end if;
  
  -- Create transaction record
  insert into public.token_transactions (
    token_id, to_user_id, amount, transaction_type, status, completed_at,
    metadata
  ) values (
    v_token_id, v_user_id, v_amount, 'reward', 'completed', now(),
    jsonb_build_object('reward_id', p_reward_id, 'reward_type', v_reward_type)
  ) returning id into v_transaction_id;
  
  -- Record the claim
  insert into public.token_reward_claims (
    reward_id, user_id, transaction_id
  ) values (
    p_reward_id, v_user_id, v_transaction_id
  );
  
  -- Update user balance
  insert into public.token_balances (user_id, token_id, balance)
  values (v_user_id, v_token_id, v_amount)
  on conflict (user_id, token_id)
  do update set balance = public.token_balances.balance + v_amount, last_updated = now();
  
  -- Log the reward claim
  insert into public.security_logs (
    user_id, event_type, severity, details
  ) values (
    v_user_id, 'token_reward_claimed', 'info', 
    jsonb_build_object(
      'reward_id', p_reward_id,
      'reward_type', v_reward_type,
      'amount', v_amount,
      'transaction_id', v_transaction_id
    )
  );
  
  return json_build_object(
    'success', true, 
    'message', 'Reward claimed successfully',
    'transaction_id', v_transaction_id,
    'amount', v_amount
  );
end;
$$;
