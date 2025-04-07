-- Migration: Create Token Utility Functions
-- Purpose: Add utility functions for working with the token system
-- Affected tables: tokens, user_tokens, token_transactions
-- Special considerations: These functions follow security best practices for Supabase

-- Function to get the digital root of a number (Tesla's vortex mathematics)
create or replace function public.get_digital_root(num numeric)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if num <= 0 then 
    return 0;
  end if;
  
  if num % 9 = 0 then 
    return 9;
  end if;
  
  return num % 9;
end;
$$;

-- Function to check if a number belongs to Tesla's 3-6-9 pattern
create or replace function public.is_tesla_369_number(num numeric)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  root integer;
begin
  select public.get_digital_root(num) into root;
  return root = 3 or root = 6 or root = 9;
end;
$$;

-- Function to get token family based on digital root
create or replace function public.get_token_family(num numeric)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  root integer;
begin
  select public.get_digital_root(num) into root;
  
  if root in (3, 6, 9) then
    return 'family_369';
  elsif root in (1, 4, 7) then
    return 'family_147';
  elsif root in (2, 5, 8) then
    return 'family_258';
  else
    return null;
  end if;
end;
$$;

-- Function to transfer tokens between users
create or replace function public.transfer_tokens(
  from_user_id uuid,
  to_user_id uuid,
  token_symbol text,
  amount numeric,
  reason text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_from_balance numeric;
  v_transaction_id uuid;
begin
  -- Check parameters
  if from_user_id = to_user_id then
    raise exception 'Cannot transfer tokens to the same user';
  end if;
  
  if amount <= 0 then
    raise exception 'Transfer amount must be greater than zero';
  end if;
  
  -- Get token ID
  select id into v_token_id
  from public.tokens
  where symbol = token_symbol;
  
  if v_token_id is null then
    raise exception 'Token with symbol % not found', token_symbol;
  end if;
  
  -- Check if sender has sufficient balance
  select balance into v_from_balance
  from public.user_tokens
  where user_id = from_user_id and token_id = v_token_id;
  
  if v_from_balance is null or v_from_balance < amount then
    raise exception 'Insufficient balance';
  end if;
  
  -- Update sender balance
  update public.user_tokens
  set balance = balance - amount
  where user_id = from_user_id and token_id = v_token_id;
  
  -- Update or insert recipient balance
  insert into public.user_tokens (user_id, token_id, balance)
  values (to_user_id, v_token_id, amount)
  on conflict (user_id, token_id) 
  do update set balance = public.user_tokens.balance + amount;
  
  -- Record transaction
  insert into public.token_transactions (
    token_id,
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    reason
  )
  values (
    v_token_id,
    from_user_id,
    to_user_id,
    amount,
    'transfer',
    reason
  )
  returning id into v_transaction_id;
  
  return true;
end;
$$;

-- Function to mint new tokens (admin only)
create or replace function public.mint_tokens(
  admin_user_id uuid,
  to_user_id uuid,
  token_symbol text,
  amount numeric,
  reason text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_is_admin boolean;
  v_transaction_id uuid;
begin
  -- Check if user is admin
  select (raw_user_meta_data->>'is_admin')::boolean into v_is_admin
  from auth.users
  where id = admin_user_id;
  
  if not v_is_admin then
    raise exception 'Only admins can mint tokens';
  end if;
  
  -- Check parameters
  if amount <= 0 then
    raise exception 'Mint amount must be greater than zero';
  end if;
  
  -- Get token ID
  select id into v_token_id
  from public.tokens
  where symbol = token_symbol;
  
  if v_token_id is null then
    raise exception 'Token with symbol % not found', token_symbol;
  end if;
  
  -- Update token total supply
  update public.tokens
  set total_supply = total_supply + amount
  where id = v_token_id;
  
  -- Update or insert recipient balance
  insert into public.user_tokens (user_id, token_id, balance)
  values (to_user_id, v_token_id, amount)
  on conflict (user_id, token_id) 
  do update set balance = public.user_tokens.balance + amount;
  
  -- Record transaction
  insert into public.token_transactions (
    token_id,
    to_user_id,
    amount,
    transaction_type,
    reason
  )
  values (
    v_token_id,
    to_user_id,
    amount,
    'mint',
    reason
  )
  returning id into v_transaction_id;
  
  return true;
end;
$$;

-- Function to burn tokens (admin only)
create or replace function public.burn_tokens(
  admin_user_id uuid,
  from_user_id uuid,
  token_symbol text,
  amount numeric,
  reason text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_is_admin boolean;
  v_from_balance numeric;
  v_transaction_id uuid;
begin
  -- Check if user is admin
  select (raw_user_meta_data->>'is_admin')::boolean into v_is_admin
  from auth.users
  where id = admin_user_id;
  
  if not v_is_admin then
    raise exception 'Only admins can burn tokens';
  end if;
  
  -- Check parameters
  if amount <= 0 then
    raise exception 'Burn amount must be greater than zero';
  end if;
  
  -- Get token ID
  select id into v_token_id
  from public.tokens
  where symbol = token_symbol;
  
  if v_token_id is null then
    raise exception 'Token with symbol % not found', token_symbol;
  end if;
  
  -- Check if user has sufficient balance
  select balance into v_from_balance
  from public.user_tokens
  where user_id = from_user_id and token_id = v_token_id;
  
  if v_from_balance is null or v_from_balance < amount then
    raise exception 'Insufficient balance';
  end if;
  
  -- Update token total supply
  update public.tokens
  set total_supply = total_supply - amount
  where id = v_token_id;
  
  -- Update user balance
  update public.user_tokens
  set balance = balance - amount
  where user_id = from_user_id and token_id = v_token_id;
  
  -- Record transaction
  insert into public.token_transactions (
    token_id,
    from_user_id,
    amount,
    transaction_type,
    reason
  )
  values (
    v_token_id,
    from_user_id,
    amount,
    'burn',
    reason
  )
  returning id into v_transaction_id;
  
  return true;
end;
$$;

-- Function to reward user with tokens based on activity
create or replace function public.reward_user_activity(
  user_id uuid,
  activity_type text,
  activity_details jsonb default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_rewards record;
  v_transaction_id uuid;
  v_tesla_multiplier numeric;
  v_result jsonb := '{"success": false, "rewards": []}'::jsonb;
  v_reward_count integer := 0;
begin
  -- Apply Tesla 3-6-9 multiplier if user ID has a digital root of 3, 6, or 9
  select 
    case 
      when public.is_tesla_369_number(('x' || replace(user_id::text, '-', ''))::bit(128)::bigint) then 
        case public.get_digital_root(('x' || replace(user_id::text, '-', ''))::bit(128)::bigint)
          when 3 then 1.3
          when 6 then 1.6
          when 9 then 1.9
          else 1.0
        end
      else 1.0
    end into v_tesla_multiplier;

  -- Process each reward type for the activity
  for v_rewards in (
    select 
      tr.token_id,
      t.symbol as token_symbol,
      tr.base_amount,
      tr.multiplier,
      (tr.base_amount * tr.multiplier * v_tesla_multiplier) as total_amount
    from 
      public.token_rewards tr
      join public.tokens t on tr.token_id = t.id
    where 
      tr.activity_type = reward_user_activity.activity_type
      and tr.is_active = true
  ) loop
    -- Update token balance for user
    insert into public.user_tokens (user_id, token_id, balance)
    values (reward_user_activity.user_id, v_rewards.token_id, v_rewards.total_amount)
    on conflict (user_id, token_id) 
    do update set balance = public.user_tokens.balance + v_rewards.total_amount;
    
    -- Record transaction
    insert into public.token_transactions (
      token_id,
      to_user_id,
      amount,
      transaction_type,
      reason
    )
    values (
      v_rewards.token_id,
      reward_user_activity.user_id,
      v_rewards.total_amount,
      'reward',
      'Activity reward: ' || reward_user_activity.activity_type || 
      case when activity_details is not null then 
        ' - ' || activity_details::text
      else '' end
    )
    returning id into v_transaction_id;
    
    -- Add to result
    v_result := jsonb_set(
      v_result, 
      array['rewards'], 
      coalesce(v_result->'rewards', '[]'::jsonb) || 
      jsonb_build_object(
        'token', v_rewards.token_symbol,
        'amount', v_rewards.total_amount,
        'transaction_id', v_transaction_id
      )
    );
    
    v_reward_count := v_reward_count + 1;
  end loop;
  
  -- Update result status
  if v_reward_count > 0 then
    v_result := jsonb_set(v_result, array['success'], 'true'::jsonb);
  end if;
  
  -- Check for achievements
  v_result := jsonb_set(
    v_result,
    array['achievements'],
    (
      select 
        coalesce(jsonb_agg(
          jsonb_build_object(
            'id', achievement_id,
            'name', achievement_name,
            'token', token_symbol
          )
        ), '[]'::jsonb)
      from 
        public.check_token_achievements(reward_user_activity.user_id)
    )
  );
  
  return v_result;
end;
$$;

-- Function to get user token balances with sacred geometry attributes
create or replace function public.get_user_token_balances(user_id uuid)
returns table (
  token_id uuid,
  token_symbol text,
  token_name text,
  balance numeric,
  staked_balance numeric,
  pending_release numeric,
  token_level integer,
  is_tesla_369 boolean,
  digital_root integer,
  token_family text,
  fibonacci_weight numeric,
  golden_ratio_multiplier numeric,
  sacred_value numeric
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select
    t.id as token_id,
    t.symbol as token_symbol,
    t.name as token_name,
    ut.balance,
    ut.staked_balance,
    ut.pending_release,
    t.token_level,
    t.is_tesla_369,
    t.digital_root,
    t.token_family::text,
    t.fibonacci_weight,
    t.golden_ratio_multiplier,
    public.calculate_token_value(t.id) as sacred_value
  from
    public.tokens t
    join public.user_tokens ut on t.id = ut.token_id
  where
    ut.user_id = get_user_token_balances.user_id
  order by
    t.token_level desc, t.is_tesla_369 desc, t.symbol;
end;
$$;

-- Function to get token hierarchy with sacred geometry attributes
create or replace function public.get_token_hierarchy(root_symbol text default null)
returns table (
  id uuid,
  symbol text,
  name text,
  parent_id uuid,
  parent_symbol text,
  token_level integer,
  digital_root integer,
  is_tesla_369 boolean,
  token_family text,
  fibonacci_weight numeric,
  golden_ratio_multiplier numeric,
  depth integer,
  path uuid[],
  symbol_path text[]
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  with recursive token_tree as (
    -- Base case: tokens without parents or the specified root token
    select 
      t.id, 
      t.symbol, 
      t.name, 
      t.parent_token_id as parent_id,
      p.symbol as parent_symbol,
      t.token_level, 
      t.digital_root,
      t.is_tesla_369,
      t.token_family::text,
      t.fibonacci_weight,
      t.golden_ratio_multiplier,
      array[t.id] as path,
      array[t.symbol] as symbol_path,
      0 as depth
    from 
      public.tokens t
      left join public.tokens p on t.parent_token_id = p.id
    where 
      (root_symbol is null and t.parent_token_id is null)
      or (t.symbol = root_symbol)
    
    union all
    
    -- Recursive case: tokens with parents
    select 
      t.id, 
      t.symbol, 
      t.name, 
      t.parent_token_id as parent_id,
      p.symbol as parent_symbol,
      t.token_level, 
      t.digital_root,
      t.is_tesla_369,
      t.token_family::text,
      t.fibonacci_weight,
      t.golden_ratio_multiplier,
      tt.path || t.id,
      tt.symbol_path || t.symbol,
      tt.depth + 1
    from 
      public.tokens t
      join token_tree tt on t.parent_token_id = tt.id
      left join public.tokens p on t.parent_token_id = p.id
  )
  select * from token_tree
  order by depth, token_level desc, is_tesla_369 desc, symbol;
end;
$$;
