-- Migration: Enhance Token Distribution
-- Purpose: Implement token distribution mechanisms and enhance token functionality
-- Affected tables: Creates token_distribution, token_earning_rules tables and enhances existing token tables
-- Special considerations: Core tables for the AVAULT component of the platform

-- Check if migration has already been applied
do $$
begin
  if public.is_migration_applied('20240907124000') then
    raise notice 'Migration 20240907124000 has already been applied';
    return;
  end if;
end $$;

-- Token distribution schedule
create table if not exists public.token_distribution_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  amount numeric not null check (amount > 0),
  distribution_type text not null check (distribution_type in ('membership', 'achievement', 'contribution', 'manual')),
  frequency text not null check (frequency in ('one_time', 'daily', 'weekly', 'monthly')),
  next_distribution_date timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Token earning rules
create table if not exists public.token_earning_rules (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  activity_type text not null,
  base_amount numeric not null check (base_amount >= 0),
  is_tesla_369_boosted boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(token_id, activity_type)
);

-- Token usage history
create table if not exists public.token_usage_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  amount numeric not null check (amount > 0),
  usage_type text not null,
  feature_accessed text,
  created_at timestamptz not null default now()
);

-- Token value history
create table if not exists public.token_value_history (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  reference_token_id uuid references public.tokens(id) on delete set null,
  value numeric not null check (value > 0),
  recorded_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.token_distribution_schedule enable row level security;
alter table public.token_earning_rules enable row level security;
alter table public.token_usage_history enable row level security;
alter table public.token_value_history enable row level security;

-- Create RLS policies for token_distribution_schedule
create policy "Users can view their own distribution schedule"
  on public.token_distribution_schedule for select
  using (auth.uid() = user_id);

create policy "Admins can view all distribution schedules"
  on public.token_distribution_schedule for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Admins can manage distribution schedules"
  on public.token_distribution_schedule for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for token_earning_rules
create policy "Everyone can view token earning rules"
  on public.token_earning_rules for select
  using (true);

create policy "Admins can manage token earning rules"
  on public.token_earning_rules for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for token_usage_history
create policy "Users can view their own token usage history"
  on public.token_usage_history for select
  using (auth.uid() = user_id);

create policy "Admins can view all token usage history"
  on public.token_usage_history for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for token_value_history
create policy "Everyone can view token value history"
  on public.token_value_history for select
  using (true);

create policy "Admins can manage token value history"
  on public.token_value_history for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create function to schedule monthly token distribution for membership
create or replace function public.schedule_membership_token_distribution(
  p_user_id uuid,
  p_token_symbol text default 'GEN',
  p_amount numeric default 100
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_schedule_id uuid;
  v_next_distribution_date timestamptz;
begin
  -- Validate inputs
  if p_user_id is null or p_token_symbol is null or p_amount is null or p_amount <= 0 then
    raise exception 'User ID, token symbol, and positive amount are required';
  end if;
  
  -- Get token ID
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if not found then
    raise exception 'Token with symbol % not found', p_token_symbol;
  end if;
  
  -- Calculate next distribution date (start of next month)
  v_next_distribution_date := date_trunc('month', now() + interval '1 month');
  
  -- Create or update distribution schedule
  insert into public.token_distribution_schedule (
    user_id,
    token_id,
    amount,
    distribution_type,
    frequency,
    next_distribution_date,
    is_active
  ) values (
    p_user_id,
    v_token_id,
    p_amount,
    'membership',
    'monthly',
    v_next_distribution_date,
    true
  )
  on conflict (user_id, token_id, distribution_type, frequency)
  do update set
    amount = p_amount,
    next_distribution_date = v_next_distribution_date,
    is_active = true,
    updated_at = now()
  returning id into v_schedule_id;
  
  return v_schedule_id;
end;
$$;

-- Create function to process token distributions
create or replace function public.process_token_distributions()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_distributions_processed integer := 0;
  v_distribution record;
  v_tesla_multiplier numeric;
begin
  -- Process all due distributions
  for v_distribution in
    select *
    from public.token_distribution_schedule
    where is_active = true
    and next_distribution_date <= now()
  loop
    -- Apply Tesla 3-6-9 multiplier if token has digital root of 3, 6, or 9
    select 
      case 
        when is_tesla_369 then 
          case digital_root
            when 3 then 1.3
            when 6 then 1.6
            when 9 then 1.9
            else 1.0
          end
        else 1.0
      end into v_tesla_multiplier
    from public.tokens
    where id = v_distribution.token_id;
    
    -- Distribute tokens to user
    insert into public.token_transactions (
      token_id,
      to_user_id,
      amount,
      transaction_type,
      reason
    ) values (
      v_distribution.token_id,
      v_distribution.user_id,
      v_distribution.amount * v_tesla_multiplier,
      'distribution',
      case v_distribution.distribution_type
        when 'membership' then 'Monthly membership token distribution'
        when 'achievement' then 'Achievement reward'
        when 'contribution' then 'Contribution reward'
        when 'manual' then 'Manual distribution'
        else 'Token distribution'
      end
    );
    
    -- Update or create user token balance
    insert into public.user_tokens (
      user_id,
      token_id,
      balance
    ) values (
      v_distribution.user_id,
      v_distribution.token_id,
      v_distribution.amount * v_tesla_multiplier
    )
    on conflict (user_id, token_id)
    do update set
      balance = public.user_tokens.balance + (v_distribution.amount * v_tesla_multiplier),
      updated_at = now();
    
    -- Update next distribution date based on frequency
    update public.token_distribution_schedule
    set
      next_distribution_date = case v_distribution.frequency
        when 'one_time' then null
        when 'daily' then v_distribution.next_distribution_date + interval '1 day'
        when 'weekly' then v_distribution.next_distribution_date + interval '1 week'
        when 'monthly' then v_distribution.next_distribution_date + interval '1 month'
      end,
      is_active = case v_distribution.frequency
        when 'one_time' then false
        else true
      end,
      updated_at = now()
    where
      id = v_distribution.id;
    
    v_distributions_processed := v_distributions_processed + 1;
  end loop;
  
  return v_distributions_processed;
end;
$$;

-- Create function to earn tokens for activity
create or replace function public.earn_tokens_for_activity(
  p_user_id uuid,
  p_activity_type text,
  p_metadata jsonb default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_result jsonb := '{"success": false, "tokens_earned": []}'::jsonb;
  v_rule record;
  v_token record;
  v_tesla_multiplier numeric;
  v_earned_amount numeric;
  v_transaction_id uuid;
begin
  -- Validate inputs
  if p_user_id is null or p_activity_type is null then
    raise exception 'User ID and activity type are required';
  end if;
  
  -- Process each earning rule for the activity type
  for v_rule in
    select er.*, t.symbol, t.is_tesla_369, t.digital_root
    from public.token_earning_rules er
    join public.tokens t on er.token_id = t.id
    where er.activity_type = p_activity_type
    and er.is_active = true
  loop
    -- Apply Tesla 3-6-9 multiplier if enabled and token qualifies
    if v_rule.is_tesla_369_boosted and v_rule.is_tesla_369 then
      v_tesla_multiplier := case v_rule.digital_root
        when 3 then 1.3
        when 6 then 1.6
        when 9 then 1.9
        else 1.0
      end;
    else
      v_tesla_multiplier := 1.0;
    end if;
    
    -- Calculate earned amount
    v_earned_amount := v_rule.base_amount * v_tesla_multiplier;
    
    -- Record token transaction
    insert into public.token_transactions (
      token_id,
      to_user_id,
      amount,
      transaction_type,
      reason
    ) values (
      v_rule.token_id,
      p_user_id,
      v_earned_amount,
      'earning',
      'Earned for activity: ' || p_activity_type
    ) returning id into v_transaction_id;
    
    -- Update or create user token balance
    insert into public.user_tokens (
      user_id,
      token_id,
      balance
    ) values (
      p_user_id,
      v_rule.token_id,
      v_earned_amount
    )
    on conflict (user_id, token_id)
    do update set
      balance = public.user_tokens.balance + v_earned_amount,
      updated_at = now();
    
    -- Add to result
    v_result := jsonb_set(
      v_result,
      '{tokens_earned}',
      coalesce(v_result->'tokens_earned', '[]'::jsonb) || jsonb_build_object(
        'token', v_rule.symbol,
        'amount', v_earned_amount,
        'transaction_id', v_transaction_id
      )
    );
  end loop;
  
  -- Update success flag if any tokens were earned
  if jsonb_array_length(v_result->'tokens_earned') > 0 then
    v_result := jsonb_set(v_result, '{success}', 'true'::jsonb);
  end if;
  
  return v_result;
end;
$$;

-- Create function to record token usage
create or replace function public.record_token_usage(
  p_user_id uuid,
  p_token_symbol text,
  p_amount numeric,
  p_usage_type text,
  p_feature_accessed text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_usage_id uuid;
  v_current_balance numeric;
begin
  -- Validate inputs
  if p_user_id is null or p_token_symbol is null or p_amount is null or p_amount <= 0 or p_usage_type is null then
    raise exception 'User ID, token symbol, positive amount, and usage type are required';
  end if;
  
  -- Get token ID
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if not found then
    raise exception 'Token with symbol % not found', p_token_symbol;
  end if;
  
  -- Check if user has sufficient balance
  select balance into v_current_balance
  from public.user_tokens
  where user_id = p_user_id and token_id = v_token_id;
  
  if v_current_balance is null or v_current_balance < p_amount then
    raise exception 'Insufficient token balance';
  end if;
  
  -- Record usage
  insert into public.token_usage_history (
    user_id,
    token_id,
    amount,
    usage_type,
    feature_accessed
  ) values (
    p_user_id,
    v_token_id,
    p_amount,
    p_usage_type,
    p_feature_accessed
  ) returning id into v_usage_id;
  
  -- Update user token balance
  update public.user_tokens
  set
    balance = balance - p_amount,
    updated_at = now()
  where
    user_id = p_user_id and token_id = v_token_id;
  
  -- Record transaction
  insert into public.token_transactions (
    token_id,
    from_user_id,
    amount,
    transaction_type,
    reason
  ) values (
    v_token_id,
    p_user_id,
    p_amount,
    'usage',
    'Used for ' || p_usage_type || ': ' || coalesce(p_feature_accessed, '')
  );
  
  return v_usage_id;
end;
$$;

-- Create function to update token values based on sacred geometry
create or replace function public.update_token_values()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_tokens_updated integer := 0;
  v_token record;
  v_gen_token_id uuid;
  v_value numeric;
begin
  -- Get GEN token ID (reference token)
  select id into v_gen_token_id
  from public.tokens
  where symbol = 'GEN';
  
  if not found then
    raise exception 'GEN token not found';
  end if;
  
  -- Update values for all tokens
  for v_token in
    select id, symbol, token_level, is_tesla_369, digital_root, fibonacci_weight, golden_ratio_multiplier
    from public.tokens
  loop
    -- Calculate value based on sacred geometry principles
    v_value := public.calculate_token_value(v_token.id, v_gen_token_id);
    
    -- Record token value
    insert into public.token_value_history (
      token_id,
      reference_token_id,
      value
    ) values (
      v_token.id,
      v_gen_token_id,
      v_value
    );
    
    v_tokens_updated := v_tokens_updated + 1;
  end loop;
  
  return v_tokens_updated;
end;
$$;

-- Create indexes for performance
create index if not exists idx_token_distribution_schedule_user_id on public.token_distribution_schedule (user_id);
create index if not exists idx_token_distribution_schedule_token_id on public.token_distribution_schedule (token_id);
create index if not exists idx_token_distribution_schedule_next_date on public.token_distribution_schedule (next_distribution_date);
create index if not exists idx_token_distribution_schedule_is_active on public.token_distribution_schedule (is_active);

create index if not exists idx_token_earning_rules_token_id on public.token_earning_rules (token_id);
create index if not exists idx_token_earning_rules_activity_type on public.token_earning_rules (activity_type);
create index if not exists idx_token_earning_rules_is_active on public.token_earning_rules (is_active);

create index if not exists idx_token_usage_history_user_id on public.token_usage_history (user_id);
create index if not exists idx_token_usage_history_token_id on public.token_usage_history (token_id);
create index if not exists idx_token_usage_history_usage_type on public.token_usage_history (usage_type);
create index if not exists idx_token_usage_history_created_at on public.token_usage_history (created_at);

create index if not exists idx_token_value_history_token_id on public.token_value_history (token_id);
create index if not exists idx_token_value_history_recorded_at on public.token_value_history (recorded_at);

-- Seed token earning rules
insert into public.token_earning_rules (token_id, activity_type, base_amount, is_tesla_369_boosted)
select 
  t.id,
  activity_type,
  base_amount,
  true
from 
  public.tokens t,
  (values
    ('content_completion', 5),
    ('forum_post', 2),
    ('comment', 1),
    ('daily_login', 1),
    ('profile_completion', 10),
    ('referral', 20),
    ('feedback_submission', 5),
    ('survey_completion', 10),
    ('challenge_completion', 15)
  ) as activities(activity_type, base_amount)
where 
  t.symbol = 'GEN';

-- Record this migration
select public.record_migration(
  '20240907124000',
  'enhance_token_distribution',
  'Created tables and functions for token distribution, earning, usage, and value tracking'
);

-- Rollback script (commented out until needed)
/*
-- To rollback this migration:
drop function if exists public.update_token_values();
drop function if exists public.record_token_usage(uuid, text, numeric, text, text);
drop function if exists public.earn_tokens_for_activity(uuid, text, jsonb);
drop function if exists public.process_token_distributions();
drop function if exists public.schedule_membership_token_distribution(uuid, text, numeric);
drop table if exists public.token_value_history;
drop table if exists public.token_usage_history;
drop table if exists public.token_earning_rules;
drop table if exists public.token_distribution_schedule;
*/
