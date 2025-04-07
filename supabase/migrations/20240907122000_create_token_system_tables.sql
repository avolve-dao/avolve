-- Migration: Create Token System Tables
-- Purpose: Implement the foundation for the Avolve tokenomics system
-- Affected tables: Creates tokens, user_tokens, token_transactions tables
-- Special considerations: Incorporates sacred geometry principles and Tesla's 3-6-9 patterns

-- Check if migration has already been applied
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = '_migration_history') then
    if exists (select 1 from public._migration_history where version = '20240907122000') then
      raise notice 'Migration 20240907122000 has already been applied';
      return;
    end if;
  end if;
end $$;

-- Create migration tracking function if it doesn't exist
create or replace function public.is_migration_applied(p_version text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = '_migration_history') then
    return false;
  end if;
  
  return exists (
    select 1 
    from public._migration_history 
    where version = p_version
  );
end;
$$;

-- Create migration recording function if it doesn't exist
create or replace function public.record_migration(
  p_version text,
  p_name text,
  p_description text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Create migration history table if it doesn't exist
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = '_migration_history') then
    create table public._migration_history (
      id uuid primary key default gen_random_uuid(),
      version text not null unique,
      name text not null,
      description text,
      applied_at timestamptz not null default now()
    );
  end if;
  
  -- Record the migration
  insert into public._migration_history (version, name, description)
  values (p_version, p_name, p_description);
end;
$$;

-- Function to calculate digital root (used for Tesla 3-6-9 pattern)
create or replace function public.calculate_digital_root(p_number numeric)
returns integer
language plpgsql
security invoker
set search_path = ''
immutable
as $$
declare
  v_sum integer;
  v_digits text;
begin
  -- Convert to text to process digits
  v_digits := p_number::text;
  
  -- Initial sum
  v_sum := 0;
  
  -- Sum all digits
  for i in 1..length(v_digits) loop
    v_sum := v_sum + (substring(v_digits from i for 1))::integer;
  end loop;
  
  -- If sum is greater than 9, recursively calculate until single digit
  if v_sum > 9 then
    return public.calculate_digital_root(v_sum);
  end if;
  
  return v_sum;
end;
$$;

-- Function to calculate token value based on sacred geometry principles
create or replace function public.calculate_token_value(
  p_token_id uuid,
  p_reference_token_id uuid default null
)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token record;
  v_reference_value numeric := 1.0;
  v_value numeric;
begin
  -- Get token details
  select * into v_token
  from public.tokens
  where id = p_token_id;
  
  if v_token is null then
    raise exception 'Token not found';
  end if;
  
  -- Get reference token value if provided
  if p_reference_token_id is not null then
    -- For simplicity, we're using a fixed reference value
    -- In a real system, this could be based on market data or other factors
    v_reference_value := 1.0;
  end if;
  
  -- Calculate value based on sacred geometry principles
  -- Token level (1-3) affects base value
  -- Fibonacci weight applies a multiplier based on position in sequence
  -- Golden ratio adds another dimension of value
  -- Tesla 3-6-9 pattern applies special multipliers for tokens with digital roots of 3, 6, or 9
  
  v_value := v_reference_value * 
             (v_token.token_level * 3) * 
             v_token.fibonacci_weight * 
             v_token.golden_ratio_multiplier;
             
  -- Apply Tesla 3-6-9 pattern multiplier
  if v_token.is_tesla_369 then
    case v_token.digital_root
      when 3 then v_value := v_value * 1.3;
      when 6 then v_value := v_value * 1.6;
      when 9 then v_value := v_value * 1.9;
      else v_value := v_value;
    end case;
  end if;
  
  return v_value;
end;
$$;

-- Tokens table
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  symbol text not null unique,
  description text,
  token_level integer not null check (token_level between 1 and 3),
  is_tesla_369 boolean not null default false,
  digital_root integer,
  fibonacci_weight numeric not null default 1.0 check (fibonacci_weight > 0),
  golden_ratio_multiplier numeric not null default 1.618 check (golden_ratio_multiplier > 0),
  total_supply numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User tokens table
create table if not exists public.user_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, token_id)
);

-- Token transactions table
create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  amount numeric not null check (amount > 0),
  transaction_type text not null,
  reason text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.tokens enable row level security;
alter table public.user_tokens enable row level security;
alter table public.token_transactions enable row level security;

-- Create RLS policies for tokens
create policy "Everyone can view tokens"
  on public.tokens for select
  using (true);

create policy "Admins can manage tokens"
  on public.tokens for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for user_tokens
create policy "Users can view their own token balances"
  on public.user_tokens for select
  using (auth.uid() = user_id);

create policy "Admins can view all token balances"
  on public.user_tokens for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for token_transactions
create policy "Users can view transactions they're involved in"
  on public.token_transactions for select
  using (
    auth.uid() = from_user_id or 
    auth.uid() = to_user_id
  );

create policy "Admins can view all transactions"
  on public.token_transactions for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Admins can manage transactions"
  on public.token_transactions for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create function to transfer tokens between users
create or replace function public.transfer_tokens(
  p_to_user_id uuid,
  p_token_symbol text,
  p_amount numeric,
  p_reason text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_from_user_id uuid := auth.uid();
  v_token_id uuid;
  v_from_balance numeric;
  v_transaction_id uuid;
begin
  -- Validate inputs
  if v_from_user_id is null or p_to_user_id is null or p_token_symbol is null or p_amount is null or p_amount <= 0 then
    raise exception 'Invalid transfer parameters';
  end if;
  
  -- Get token ID
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if not found then
    raise exception 'Token with symbol % not found', p_token_symbol;
  end if;
  
  -- Check sender's balance
  select balance into v_from_balance
  from public.user_tokens
  where user_id = v_from_user_id and token_id = v_token_id;
  
  if v_from_balance is null or v_from_balance < p_amount then
    raise exception 'Insufficient token balance';
  end if;
  
  -- Create transaction record
  insert into public.token_transactions (
    token_id,
    from_user_id,
    to_user_id,
    amount,
    transaction_type,
    reason
  ) values (
    v_token_id,
    v_from_user_id,
    p_to_user_id,
    p_amount,
    'transfer',
    p_reason
  ) returning id into v_transaction_id;
  
  -- Update sender's balance
  update public.user_tokens
  set
    balance = balance - p_amount,
    updated_at = now()
  where
    user_id = v_from_user_id and token_id = v_token_id;
  
  -- Update or create recipient's balance
  insert into public.user_tokens (
    user_id,
    token_id,
    balance
  ) values (
    p_to_user_id,
    v_token_id,
    p_amount
  )
  on conflict (user_id, token_id)
  do update set
    balance = public.user_tokens.balance + p_amount,
    updated_at = now();
  
  return v_transaction_id;
end;
$$;

-- Create indexes for performance
create index if not exists idx_tokens_symbol on public.tokens (symbol);
create index if not exists idx_tokens_level on public.tokens (token_level);
create index if not exists idx_tokens_tesla_369 on public.tokens (is_tesla_369);

create index if not exists idx_user_tokens_user_id on public.user_tokens (user_id);
create index if not exists idx_user_tokens_token_id on public.user_tokens (token_id);

create index if not exists idx_token_transactions_token_id on public.token_transactions (token_id);
create index if not exists idx_token_transactions_from_user_id on public.token_transactions (from_user_id);
create index if not exists idx_token_transactions_to_user_id on public.token_transactions (to_user_id);
create index if not exists idx_token_transactions_created_at on public.token_transactions (created_at);
create index if not exists idx_token_transactions_type on public.token_transactions (transaction_type);

-- Seed token data based on Avolve's token structure
insert into public.tokens (
  name, 
  symbol, 
  description, 
  token_level, 
  is_tesla_369, 
  digital_root, 
  fibonacci_weight, 
  golden_ratio_multiplier
)
values
  -- Level 3 (Supercivilization)
  ('Genesis', 'GEN', 'Primary token for the Avolve ecosystem', 3, true, 9, 8.0, 1.618),
  
  -- Level 2 (Superachievers)
  ('Superachiever Quotient', 'SCQ', 'Token for collective journey of transformation', 2, true, 3, 5.0, 1.618),
  ('Superpuzzle Development', 'SPD', 'Token for conceiving, believing, and achieving', 2, true, 6, 5.0, 1.618),
  ('Superhuman Enhancement', 'SHE', 'Token for super enhanced individuals', 2, false, 6, 5.0, 1.618),
  ('Supersociety Advancement', 'SSA', 'Token for super advanced collectives', 2, false, 3, 5.0, 1.618),
  ('Supergenius Breakthrough', 'SGB', 'Token for super balanced ecosystems', 2, true, 9, 5.0, 1.618),
  
  -- Level 1 (Superachiever)
  ('Superachiever Progress', 'SAP', 'Token for individual journey of transformation', 1, true, 3, 3.0, 1.618),
  ('Personal Success Puzzle', 'PSP', 'Token for greater personal successes', 1, false, 7, 3.0, 1.618),
  ('Business Success Puzzle', 'BSP', 'Token for greater business successes', 1, false, 8, 3.0, 1.618),
  ('Supermind Superpowers', 'SMS', 'Token for going further, faster, and forever', 1, true, 6, 3.0, 1.618);

-- Record this migration
select public.record_migration(
  '20240907122000',
  'create_token_system_tables',
  'Created tables and functions for the token system with sacred geometry principles'
);

-- Rollback script (commented out until needed)
/*
-- To rollback this migration:
drop function if exists public.transfer_tokens(uuid, text, numeric, text);
drop function if exists public.calculate_token_value(uuid, uuid);
drop function if exists public.calculate_digital_root(numeric);
drop table if exists public.token_transactions;
drop table if exists public.user_tokens;
drop table if exists public.tokens;
*/
