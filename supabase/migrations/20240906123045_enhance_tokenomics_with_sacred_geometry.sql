-- Migration: Enhance Tokenomics with Sacred Geometry and Tesla's 3-6-9 Patterns
-- Purpose: Add token hierarchy, relationships, and sacred geometry attributes to the tokenomics system
-- Affected tables: tokens, user_tokens, token_transactions
-- Special considerations: Preserves existing data while adding new functionality

-- Add token hierarchy and sacred geometry attributes to tokens table
alter table public.tokens 
  add column if not exists parent_token_id uuid references public.tokens(id) on delete set null,
  add column if not exists token_level integer not null default 1 check (token_level between 1 and 9),
  add column if not exists digital_root integer generated always as (
    case 
      when symbol ~ '^[A-Za-z0-9]+$' then 
        case 
          when ascii(substring(symbol from 1 for 1)) % 9 = 0 then 9
          else ascii(substring(symbol from 1 for 1)) % 9
        end
      else 0
    end
  ) stored,
  add column if not exists is_tesla_369 boolean generated always as (
    digital_root in (3, 6, 9)
  ) stored,
  add column if not exists fibonacci_weight numeric generated always as (
    case token_level
      when 1 then 1
      when 2 then 1
      when 3 then 2
      when 4 then 3
      when 5 then 5
      when 6 then 8
      when 7 then 13
      when 8 then 21
      when 9 then 34
      else 1
    end
  ) stored,
  add column if not exists golden_ratio_multiplier numeric generated always as (
    power(1.618, token_level)
  ) stored;

-- Add token family categorization
create type public.token_family as enum ('family_369', 'family_147', 'family_258');

alter table public.tokens
  add column if not exists token_family public.token_family generated always as (
    case 
      when digital_root in (3, 6, 9) then 'family_369'::public.token_family
      when digital_root in (1, 4, 7) then 'family_147'::public.token_family
      when digital_root in (2, 5, 8) then 'family_258'::public.token_family
    end
  ) stored;

-- Create token hierarchy view for easier querying
create or replace view public.token_hierarchy as
with recursive token_tree as (
  -- Base case: tokens without parents (root tokens)
  select 
    id, 
    symbol, 
    name, 
    parent_token_id, 
    token_level, 
    digital_root,
    is_tesla_369,
    token_family,
    fibonacci_weight,
    golden_ratio_multiplier,
    array[id] as path,
    array[symbol] as symbol_path,
    0 as depth
  from 
    public.tokens
  where 
    parent_token_id is null
  
  union all
  
  -- Recursive case: tokens with parents
  select 
    t.id, 
    t.symbol, 
    t.name, 
    t.parent_token_id, 
    t.token_level, 
    t.digital_root,
    t.is_tesla_369,
    t.token_family,
    t.fibonacci_weight,
    t.golden_ratio_multiplier,
    tt.path || t.id,
    tt.symbol_path || t.symbol,
    tt.depth + 1
  from 
    public.tokens t
  join 
    token_tree tt on t.parent_token_id = tt.id
)
select * from token_tree;

-- Add token exchange rates table for token value relationships
create table if not exists public.token_exchange_rates (
  id uuid primary key default gen_random_uuid(),
  base_token_id uuid not null references public.tokens(id) on delete cascade,
  quote_token_id uuid not null references public.tokens(id) on delete cascade,
  rate numeric not null check (rate > 0),
  is_sacred_ratio boolean not null default false,
  sacred_ratio_type text,
  effective_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(base_token_id, quote_token_id, effective_date),
  check (base_token_id != quote_token_id),
  check (sacred_ratio_type is null or sacred_ratio_type in ('golden_ratio', 'fibonacci', 'tesla_369'))
);

-- Add token achievements table for gamification
create table if not exists public.token_achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  token_id uuid not null references public.tokens(id) on delete cascade,
  required_balance numeric not null check (required_balance > 0),
  reward_token_id uuid references public.tokens(id) on delete set null,
  reward_amount numeric check (reward_amount > 0),
  is_tesla_369_achievement boolean not null default false,
  achievement_level integer not null check (achievement_level between 1 and 9),
  icon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add user achievements tracking
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.token_achievements(id) on delete cascade,
  achieved_at timestamptz not null default now(),
  reward_claimed boolean not null default false,
  reward_claimed_at timestamptz,
  unique(user_id, achievement_id)
);

-- Enable Row Level Security on new tables
alter table public.token_exchange_rates enable row level security;
alter table public.token_achievements enable row level security;
alter table public.user_achievements enable row level security;

-- Create RLS policies for token exchange rates
create policy "Token exchange rates are viewable by everyone"
  on public.token_exchange_rates for select
  using (true);

-- Create RLS policies for token achievements
create policy "Token achievements are viewable by everyone"
  on public.token_achievements for select
  using (true);

-- Create RLS policies for user achievements
create policy "User achievements are viewable by the owner"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "User achievements are viewable by admins"
  on public.user_achievements for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create function to calculate token value based on sacred geometry principles
create or replace function public.calculate_token_value(token_id uuid, reference_token_id uuid default null)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  base_value numeric;
  token_level integer;
  is_tesla_369 boolean;
  fibonacci_weight numeric;
  golden_ratio_multiplier numeric;
  reference_token_symbol text;
  token_symbol text;
  result numeric;
begin
  -- Get token details
  select 
    t.token_level, 
    t.is_tesla_369, 
    t.fibonacci_weight, 
    t.golden_ratio_multiplier,
    t.symbol
  into 
    token_level, 
    is_tesla_369, 
    fibonacci_weight, 
    golden_ratio_multiplier,
    token_symbol
  from 
    public.tokens t
  where 
    t.id = token_id;
  
  -- If reference token is provided, get its symbol
  if reference_token_id is not null then
    select symbol into reference_token_symbol
    from public.tokens
    where id = reference_token_id;
    
    -- Try to get exchange rate from token_exchange_rates
    select rate into base_value
    from public.token_exchange_rates
    where base_token_id = token_id
    and quote_token_id = reference_token_id
    order by effective_date desc
    limit 1;
    
    -- If no exchange rate found, calculate based on sacred geometry
    if base_value is null then
      base_value := 1.0;
    end if;
  else
    -- Default base value if no reference token
    base_value := 1.0;
  end if;
  
  -- Apply sacred geometry multipliers
  result := base_value;
  
  -- Apply fibonacci weight
  result := result * fibonacci_weight;
  
  -- Apply golden ratio multiplier
  result := result * golden_ratio_multiplier;
  
  -- Apply Tesla 3-6-9 bonus if applicable
  if is_tesla_369 then
    result := result * 3.0;
  end if;
  
  return result;
end;
$$;

-- Create function to check if a user has achieved a token achievement
create or replace function public.check_token_achievements(user_id uuid)
returns table (
  achievement_id uuid,
  achievement_name text,
  token_symbol text,
  reward_amount numeric,
  reward_token_symbol text
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  with user_token_balances as (
    select 
      ut.token_id, 
      t.symbol as token_symbol, 
      ut.balance
    from 
      public.user_tokens ut
      join public.tokens t on ut.token_id = t.id
    where 
      ut.user_id = check_token_achievements.user_id
  ),
  eligible_achievements as (
    select 
      ta.id as achievement_id,
      ta.name as achievement_name,
      t.symbol as token_symbol,
      ta.reward_amount,
      rt.symbol as reward_token_symbol
    from 
      public.token_achievements ta
      join public.tokens t on ta.token_id = t.id
      left join public.tokens rt on ta.reward_token_id = rt.id
      join user_token_balances utb on ta.token_id = utb.token_id
    where 
      utb.balance >= ta.required_balance
      and not exists (
        select 1 
        from public.user_achievements ua 
        where ua.user_id = check_token_achievements.user_id 
        and ua.achievement_id = ta.id
      )
  )
  select * from eligible_achievements;
end;
$$;

-- Create function to claim achievement rewards
create or replace function public.claim_achievement_reward(user_id uuid, achievement_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  reward_token_id uuid;
  reward_amount numeric;
  achievement_exists boolean;
  already_claimed boolean;
begin
  -- Check if achievement exists and is eligible
  select 
    exists(
      select 1 
      from public.token_achievements ta
      join public.user_tokens ut on ta.token_id = ut.token_id
      where ta.id = claim_achievement_reward.achievement_id
      and ut.user_id = claim_achievement_reward.user_id
      and ut.balance >= ta.required_balance
    ) into achievement_exists;
  
  if not achievement_exists then
    return false;
  end if;
  
  -- Check if already claimed
  select exists(
    select 1 
    from public.user_achievements ua
    where ua.user_id = claim_achievement_reward.user_id
    and ua.achievement_id = claim_achievement_reward.achievement_id
    and ua.reward_claimed = true
  ) into already_claimed;
  
  if already_claimed then
    return false;
  end if;
  
  -- Get reward details
  select ta.reward_token_id, ta.reward_amount
  into reward_token_id, reward_amount
  from public.token_achievements ta
  where ta.id = claim_achievement_reward.achievement_id;
  
  -- Record achievement if not already recorded
  insert into public.user_achievements (user_id, achievement_id, reward_claimed, reward_claimed_at)
  values (claim_achievement_reward.user_id, claim_achievement_reward.achievement_id, true, now())
  on conflict (user_id, achievement_id) 
  do update set reward_claimed = true, reward_claimed_at = now()
  where public.user_achievements.user_id = claim_achievement_reward.user_id
  and public.user_achievements.achievement_id = claim_achievement_reward.achievement_id;
  
  -- Award tokens if reward exists
  if reward_token_id is not null and reward_amount > 0 then
    -- Add tokens to user balance
    insert into public.user_tokens (user_id, token_id, balance)
    values (claim_achievement_reward.user_id, reward_token_id, reward_amount)
    on conflict (user_id, token_id) 
    do update set balance = public.user_tokens.balance + reward_amount;
    
    -- Record transaction
    insert into public.token_transactions (
      token_id, 
      to_user_id, 
      amount, 
      transaction_type, 
      reason
    )
    values (
      reward_token_id, 
      claim_achievement_reward.user_id, 
      reward_amount, 
      'reward', 
      'Achievement reward: ' || (select name from public.token_achievements where id = claim_achievement_reward.achievement_id)
    );
  end if;
  
  return true;
end;
$$;
