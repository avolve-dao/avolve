-- Migration: 20250410155000_enhance_token_system.sql
-- Purpose: Enhance token visualization and rewards system
-- Created: 2025-04-10
-- Author: Avolve DAO

-- Create token flow rates view to track daily token earnings and spending
create or replace view public.token_flow_rates as
select 
  user_id,
  token_id,
  sum(case 
    when to_user_id = user_id then amount
    when from_user_id = user_id then -amount
    else 0
  end) as flow_rate
from (
  select 
    t.to_user_id as user_id,
    t.token_id,
    t.to_user_id,
    t.from_user_id,
    avg(t.amount) as amount
  from public.transactions t
  where 
    t.created_at > now() - interval '7 days'
  group by 
    t.to_user_id, t.token_id, t.to_user_id, t.from_user_id
  
  union all
  
  select 
    t.from_user_id as user_id,
    t.token_id,
    t.to_user_id,
    t.from_user_id,
    avg(t.amount) as amount
  from public.transactions t
  where 
    t.created_at > now() - interval '7 days'
    and t.from_user_id is not null
  group by 
    t.from_user_id, t.token_id, t.to_user_id, t.from_user_id
) as combined
group by user_id, token_id;

comment on view public.token_flow_rates is 'View to calculate average daily token flow rates (earnings and spending) based on the last 7 days of transactions';

-- Create achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  token_id uuid not null references public.tokens(id),
  token_amount integer not null,
  requirement text not null,
  requirement_value integer not null,
  created_at timestamptz not null default now(),
  
  constraint achievements_token_amount_positive check (token_amount > 0),
  constraint achievements_requirement_value_positive check (requirement_value > 0)
);

comment on table public.achievements is 'Achievements that users can complete to earn token rewards';
comment on column public.achievements.title is 'Title of the achievement';
comment on column public.achievements.description is 'Description of the achievement and how to complete it';
comment on column public.achievements.token_id is 'ID of the token awarded for completing the achievement';
comment on column public.achievements.token_amount is 'Amount of tokens awarded for completing the achievement';
comment on column public.achievements.requirement is 'Description of the requirement to complete the achievement';
comment on column public.achievements.requirement_value is 'Numeric value required to complete the achievement';

-- Enable RLS on achievements table
alter table public.achievements enable row level security;

-- Create policy for achievements table
create policy "Anyone can view achievements"
  on public.achievements
  for select
  to authenticated, anon
  using (true);

-- Create user achievements table to track progress
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  achievement_id uuid not null references public.achievements(id),
  progress integer not null default 0,
  completed boolean not null default false,
  claimed boolean not null default false,
  updated_at timestamptz not null default now(),
  
  constraint user_achievements_unique unique (user_id, achievement_id),
  constraint user_achievements_progress_non_negative check (progress >= 0)
);

comment on table public.user_achievements is 'Tracks user progress towards achievements';
comment on column public.user_achievements.user_id is 'ID of the user';
comment on column public.user_achievements.achievement_id is 'ID of the achievement';
comment on column public.user_achievements.progress is 'Current progress towards completing the achievement';
comment on column public.user_achievements.completed is 'Whether the achievement has been completed';
comment on column public.user_achievements.claimed is 'Whether the reward has been claimed';

-- Enable RLS on user_achievements table
alter table public.user_achievements enable row level security;

-- Create policies for user_achievements table
create policy "Users can view their own achievement progress"
  on public.user_achievements
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all user achievement progress"
  on public.user_achievements
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Create daily claims table
create table if not exists public.daily_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  token_symbol text not null,
  amount integer not null,
  claimed boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  
  constraint daily_claims_amount_positive check (amount > 0)
);

comment on table public.daily_claims is 'Daily token claims available to users';
comment on column public.daily_claims.user_id is 'ID of the user';
comment on column public.daily_claims.token_symbol is 'Symbol of the token to claim';
comment on column public.daily_claims.amount is 'Amount of tokens to claim';
comment on column public.daily_claims.claimed is 'Whether the claim has been claimed';
comment on column public.daily_claims.expires_at is 'When the claim expires';

-- Enable RLS on daily_claims table
alter table public.daily_claims enable row level security;

-- Create policies for daily_claims table
create policy "Users can view their own daily claims"
  on public.daily_claims
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all daily claims"
  on public.daily_claims
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Create user_token_streaks table
create table if not exists public.user_token_streaks (
  user_id uuid primary key references auth.users(id),
  current_daily_streak integer not null default 0,
  longest_daily_streak integer not null default 0,
  last_claim_date timestamptz,
  last_streak_reward_claimed boolean not null default false,
  updated_at timestamptz not null default now(),
  
  constraint user_token_streaks_current_daily_streak_non_negative check (current_daily_streak >= 0),
  constraint user_token_streaks_longest_daily_streak_non_negative check (longest_daily_streak >= 0)
);

comment on table public.user_token_streaks is 'Tracks user token claim streaks';
comment on column public.user_token_streaks.user_id is 'ID of the user';
comment on column public.user_token_streaks.current_daily_streak is 'Current daily streak count';
comment on column public.user_token_streaks.longest_daily_streak is 'Longest daily streak achieved';
comment on column public.user_token_streaks.last_claim_date is 'Date of the last claim';
comment on column public.user_token_streaks.last_streak_reward_claimed is 'Whether the last streak milestone reward has been claimed';

-- Enable RLS on user_token_streaks table
alter table public.user_token_streaks enable row level security;

-- Create policies for user_token_streaks table
create policy "Users can view their own token streaks"
  on public.user_token_streaks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all user token streaks"
  on public.user_token_streaks
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Create function to claim daily token
create or replace function public.claim_daily_token(
  claim_id_param uuid,
  user_id_param uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  claim_record public.daily_claims;
  token_id_var uuid;
  streak_record public.user_token_streaks;
  last_claim_date date;
  current_date date := current_date;
  streak_bonus float := 1.0;
begin
  -- Check if the claim exists and belongs to the user
  select * into claim_record
  from public.daily_claims
  where id = claim_id_param
    and user_id = user_id_param
    and not claimed
    and expires_at > now();
    
  if claim_record is null then
    raise exception 'Claim not found or already claimed or expired';
  end if;
  
  -- Get the token ID from the symbol
  select id into token_id_var
  from public.tokens
  where symbol = claim_record.token_symbol;
  
  if token_id_var is null then
    raise exception 'Token not found';
  end if;
  
  -- Get or create streak record
  select * into streak_record
  from public.user_token_streaks
  where user_id = user_id_param;
  
  if streak_record is null then
    insert into public.user_token_streaks (user_id, current_daily_streak, longest_daily_streak)
    values (user_id_param, 1, 1)
    returning * into streak_record;
  else
    -- Check if this is a consecutive day
    last_claim_date := date(streak_record.last_claim_date);
    
    if last_claim_date is null or last_claim_date < current_date - interval '1 day' then
      -- Streak broken, reset to 1
      update public.user_token_streaks
      set current_daily_streak = 1,
          last_claim_date = now(),
          last_streak_reward_claimed = false
      where user_id = user_id_param;
    elsif last_claim_date = current_date - interval '1 day' then
      -- Streak continues
      update public.user_token_streaks
      set current_daily_streak = current_daily_streak + 1,
          longest_daily_streak = greatest(longest_daily_streak, current_daily_streak + 1),
          last_claim_date = now(),
          last_streak_reward_claimed = case 
            when (current_daily_streak + 1) % 3 = 0 then false
            else last_streak_reward_claimed
          end
      where user_id = user_id_param
      returning * into streak_record;
    elsif last_claim_date = current_date then
      -- Already claimed today, but still process the claim
      -- No streak update needed
      null;
    end if;
  end if;
  
  -- Calculate streak bonus
  if streak_record.current_daily_streak >= 12 then
    streak_bonus := 2.2;
  elsif streak_record.current_daily_streak >= 9 then
    streak_bonus := 1.9;
  elsif streak_record.current_daily_streak >= 6 then
    streak_bonus := 1.6;
  elsif streak_record.current_daily_streak >= 3 then
    streak_bonus := 1.3;
  end if;
  
  -- Mark claim as claimed
  update public.daily_claims
  set claimed = true
  where id = claim_id_param;
  
  -- Add tokens to user balance with streak bonus
  insert into public.transactions (
    from_user_id,
    to_user_id,
    token_id,
    amount,
    transaction_type,
    description
  ) values (
    null,
    user_id_param,
    token_id_var,
    round(claim_record.amount * streak_bonus),
    'daily_claim',
    'Daily token claim with ' || streak_record.current_daily_streak || ' day streak (' || streak_bonus || 'x bonus)'
  );
  
  -- Update user balance
  insert into public.user_balances (user_id, token_id, balance)
  values (
    user_id_param,
    token_id_var,
    round(claim_record.amount * streak_bonus)
  )
  on conflict (user_id, token_id)
  do update set
    balance = public.user_balances.balance + round(claim_record.amount * streak_bonus),
    updated_at = now();
  
  return true;
end;
$$;

-- Create function to claim streak reward
create or replace function public.claim_streak_reward(
  user_id_param uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  streak_record public.user_token_streaks;
  gen_token_id uuid;
  streak_bonus float := 1.0;
  base_amount int := 50;
begin
  -- Get streak record
  select * into streak_record
  from public.user_token_streaks
  where user_id = user_id_param;
  
  if streak_record is null then
    raise exception 'No streak record found for user';
  end if;
  
  -- Check if eligible for streak reward
  if streak_record.current_daily_streak % 3 != 0 then
    raise exception 'Not eligible for streak reward yet';
  end if;
  
  -- Check if already claimed
  if streak_record.last_streak_reward_claimed then
    raise exception 'Streak reward already claimed';
  end if;
  
  -- Get GEN token ID
  select id into gen_token_id
  from public.tokens
  where symbol = 'GEN';
  
  if gen_token_id is null then
    raise exception 'GEN token not found';
  end if;
  
  -- Calculate streak bonus
  if streak_record.current_daily_streak >= 12 then
    streak_bonus := 2.2;
  elsif streak_record.current_daily_streak >= 9 then
    streak_bonus := 1.9;
  elsif streak_record.current_daily_streak >= 6 then
    streak_bonus := 1.6;
  elsif streak_record.current_daily_streak >= 3 then
    streak_bonus := 1.3;
  end if;
  
  -- Mark streak reward as claimed
  update public.user_token_streaks
  set last_streak_reward_claimed = true
  where user_id = user_id_param;
  
  -- Add tokens to user balance
  insert into public.transactions (
    from_user_id,
    to_user_id,
    token_id,
    amount,
    transaction_type,
    description
  ) values (
    null,
    user_id_param,
    gen_token_id,
    round(base_amount * streak_bonus),
    'streak_reward',
    streak_record.current_daily_streak || '-day streak reward (' || streak_bonus || 'x bonus)'
  );
  
  -- Update user balance
  insert into public.user_balances (user_id, token_id, balance)
  values (
    user_id_param,
    gen_token_id,
    round(base_amount * streak_bonus)
  )
  on conflict (user_id, token_id)
  do update set
    balance = public.user_balances.balance + round(base_amount * streak_bonus),
    updated_at = now();
  
  return true;
end;
$$;

-- Create function to claim achievement reward
create or replace function public.claim_achievement_reward(
  user_achievement_id_param uuid,
  user_id_param uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  achievement_record public.user_achievements;
  achievement_data public.achievements;
begin
  -- Get achievement record
  select * into achievement_record
  from public.user_achievements
  where id = user_achievement_id_param
    and user_id = user_id_param;
  
  if achievement_record is null then
    raise exception 'Achievement record not found';
  end if;
  
  -- Check if completed
  if not achievement_record.completed then
    raise exception 'Achievement not completed yet';
  end if;
  
  -- Check if already claimed
  if achievement_record.claimed then
    raise exception 'Achievement reward already claimed';
  end if;
  
  -- Get achievement data
  select * into achievement_data
  from public.achievements
  where id = achievement_record.achievement_id;
  
  if achievement_data is null then
    raise exception 'Achievement data not found';
  end if;
  
  -- Mark achievement as claimed
  update public.user_achievements
  set claimed = true
  where id = user_achievement_id_param;
  
  -- Add tokens to user balance
  insert into public.transactions (
    from_user_id,
    to_user_id,
    token_id,
    amount,
    transaction_type,
    description
  ) values (
    null,
    user_id_param,
    achievement_data.token_id,
    achievement_data.token_amount,
    'achievement_reward',
    'Achievement reward: ' || achievement_data.title
  );
  
  -- Update user balance
  insert into public.user_balances (user_id, token_id, balance)
  values (
    user_id_param,
    achievement_data.token_id,
    achievement_data.token_amount
  )
  on conflict (user_id, token_id)
  do update set
    balance = public.user_balances.balance + achievement_data.token_amount,
    updated_at = now();
  
  return true;
end;
$$;

-- Function to get user token flow rates
create or replace function public.get_user_token_flow_rates(
  user_id_param uuid
)
returns table (
  token_id uuid,
  flow_rate float
)
language sql
security invoker
set search_path = ''
as $$
  select 
    token_id,
    flow_rate
  from public.token_flow_rates
  where user_id = user_id_param;
$$;
