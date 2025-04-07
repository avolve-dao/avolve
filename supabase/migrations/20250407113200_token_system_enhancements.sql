-- Migration: Token System Enhancements
-- Description: Enhances the token system with additional security features, transaction history, and gamification elements
-- Date: 2025-04-07

-- Add token_transactions table to track all token-related activities
create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  amount numeric not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('mint', 'transfer', 'burn', 'reward', 'stake', 'unstake')),
  status text not null check (status in ('pending', 'completed', 'failed', 'cancelled')) default 'completed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Add token_balances table for efficient balance tracking
create table if not exists public.token_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric not null default 0 check (balance >= 0),
  staked_balance numeric not null default 0 check (staked_balance >= 0),
  last_updated timestamptz not null default now(),
  unique(user_id, token_id)
);

-- Add token_rewards table to track reward opportunities
create table if not exists public.token_rewards (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  name text not null,
  description text,
  amount numeric not null check (amount > 0),
  reward_type text not null check (reward_type in ('achievement', 'contribution', 'referral', 'daily', 'challenge')),
  requirements jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  cooldown_period interval,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add token_reward_claims to track which users have claimed which rewards
create table if not exists public.token_reward_claims (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.token_rewards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid references public.token_transactions(id) on delete set null,
  claimed_at timestamptz not null default now(),
  unique(reward_id, user_id)
);

-- Add token_exchange_rates to track token values over time
create table if not exists public.token_exchange_rates (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  reference_token_id uuid references public.tokens(id) on delete cascade,
  rate numeric not null check (rate > 0),
  effective_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on all tables
alter table public.token_transactions enable row level security;
alter table public.token_balances enable row level security;
alter table public.token_rewards enable row level security;
alter table public.token_reward_claims enable row level security;
alter table public.token_exchange_rates enable row level security;

-- Create RLS policies

-- Token transactions - users can view their own transactions
create policy "Users can view their own token transactions"
on public.token_transactions for select
to authenticated
using (
  auth.uid() = from_user_id or 
  auth.uid() = to_user_id
);

-- Token balances - users can view their own balances
create policy "Users can view their own token balances"
on public.token_balances for select
to authenticated
using (auth.uid() = user_id);

-- Token rewards - anyone can view active rewards
create policy "Anyone can view active token rewards"
on public.token_rewards for select
using (is_active = true);

-- Token reward claims - users can view their own claims
create policy "Users can view their own reward claims"
on public.token_reward_claims for select
to authenticated
using (auth.uid() = user_id);

-- Token exchange rates - anyone can view exchange rates
create policy "Anyone can view token exchange rates"
on public.token_exchange_rates for select
using (true);

-- Create functions for token operations

-- Function to transfer tokens between users
create or replace function public.transfer_tokens(
  p_token_symbol text,
  p_to_user_id uuid,
  p_amount numeric
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_from_user_id uuid = auth.uid();
  v_from_balance numeric;
  v_transaction_id uuid;
  v_token_transferable boolean;
begin
  -- Check if user is authenticated
  if v_from_user_id is null then
    return json_build_object('success', false, 'message', 'Authentication required');
  end if;
  
  -- Get token ID and check if it's transferable
  select id, is_transferable into v_token_id, v_token_transferable
  from public.tokens
  where symbol = p_token_symbol and is_active = true;
  
  if v_token_id is null then
    return json_build_object('success', false, 'message', 'Invalid token symbol');
  end if;
  
  if not v_token_transferable then
    return json_build_object('success', false, 'message', 'This token is not transferable');
  end if;
  
  -- Check if recipient exists
  if not exists (select 1 from auth.users where id = p_to_user_id) then
    return json_build_object('success', false, 'message', 'Recipient user not found');
  end if;
  
  -- Check sender's balance
  select balance into v_from_balance
  from public.token_balances
  where user_id = v_from_user_id and token_id = v_token_id;
  
  if v_from_balance is null or v_from_balance < p_amount then
    return json_build_object('success', false, 'message', 'Insufficient balance');
  end if;
  
  -- Create transaction record
  insert into public.token_transactions (
    token_id, from_user_id, to_user_id, amount, transaction_type, status, completed_at
  ) values (
    v_token_id, v_from_user_id, p_to_user_id, p_amount, 'transfer', 'completed', now()
  ) returning id into v_transaction_id;
  
  -- Update balances
  -- Decrease sender balance
  update public.token_balances
  set balance = balance - p_amount, last_updated = now()
  where user_id = v_from_user_id and token_id = v_token_id;
  
  -- Increase or create recipient balance
  insert into public.token_balances (user_id, token_id, balance)
  values (p_to_user_id, v_token_id, p_amount)
  on conflict (user_id, token_id)
  do update set balance = public.token_balances.balance + p_amount, last_updated = now();
  
  -- Log security event
  insert into public.security_logs (
    user_id, event_type, severity, details
  ) values (
    v_from_user_id, 'token_transfer', 'info', 
    jsonb_build_object(
      'token_id', v_token_id,
      'recipient_id', p_to_user_id,
      'amount', p_amount,
      'transaction_id', v_transaction_id
    )
  );
  
  return json_build_object(
    'success', true, 
    'message', 'Transfer completed successfully',
    'transaction_id', v_transaction_id
  );
end;
$$;

-- Function to claim a token reward
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
  
  -- Check cooldown period if applicable
  if v_cooldown_period is not null then
    select claimed_at into v_last_claimed
    from public.token_reward_claims
    where reward_id = p_reward_id and user_id = v_user_id
    order by claimed_at desc
    limit 1;
    
    if v_last_claimed is not null and (now() - v_last_claimed) < v_cooldown_period then
      return json_build_object(
        'success', false, 
        'message', 'Reward is on cooldown',
        'available_at', v_last_claimed + v_cooldown_period
      );
    end if;
  end if;
  
  -- TODO: Add more specific requirement checks based on v_requirements jsonb
  -- This would depend on the specific gamification rules
  
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
  
  return json_build_object(
    'success', true, 
    'message', 'Reward claimed successfully',
    'transaction_id', v_transaction_id,
    'amount', v_amount
  );
end;
$$;

-- Function to get user's token balances
create or replace function public.get_user_token_balances(
  p_user_id uuid default null
)
returns table (
  token_symbol text,
  token_name text,
  balance numeric,
  staked_balance numeric,
  icon_url text,
  gradient_class text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  -- If no user_id provided, use the authenticated user
  v_user_id := coalesce(p_user_id, auth.uid());
  
  -- Check if user is authenticated or has permission
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  
  -- Only allow viewing other users' balances if you're viewing your own
  -- or if you're an admin (could add admin check here)
  if p_user_id is not null and p_user_id != auth.uid() then
    raise exception 'Permission denied';
  end if;
  
  return query
  select 
    t.symbol as token_symbol,
    t.name as token_name,
    b.balance,
    b.staked_balance,
    t.icon_url,
    t.gradient_class
  from 
    public.token_balances b
    join public.tokens t on b.token_id = t.id
  where 
    b.user_id = v_user_id
  order by 
    t.is_primary desc, t.name;
end;
$$;
