-- Avolve Token Economy Schema
-- This schema defines the token economy system for the Avolve platform

-- Tokens table
create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  symbol text unique not null,
  name text not null,
  description text,
  icon_url text,
  gradient_class text,
  total_supply numeric not null default 0,
  is_primary boolean not null default false,
  blockchain_contract text, -- For future Psibase integration
  chain_id text unique, -- For blockchain reference
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Token balances table
create table public.user_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric not null default 0 check (balance >= 0),
  staked_balance numeric not null default 0 check (staked_balance >= 0),
  pending_release numeric not null default 0 check (pending_release >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, token_id)
);

-- Token transactions table
create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  amount numeric not null check (amount > 0),
  transaction_type text not null,
  reason text,
  tx_hash text unique, -- For blockchain verification
  created_at timestamptz not null default now(),
  check (transaction_type in ('transfer', 'reward', 'mint', 'burn', 'stake', 'unstake', 'pending_release'))
);

-- Token rewards table
create table public.token_rewards (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  activity_type text not null,
  base_amount numeric not null check (base_amount >= 0),
  multiplier numeric not null default 1 check (multiplier >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (activity_type in ('meeting_attendance', 'meeting_contribution', 'content_creation', 'task_completion', 'recruitment'))
);

-- Token staking (HODL)
create table public.token_staking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  amount numeric not null check (amount > 0),
  lock_duration_days integer not null check (lock_duration_days >= 30),
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  status text not null default 'active',
  reward_rate numeric not null,
  reward_amount numeric not null default 0,
  tx_hash text, -- For blockchain staking reference
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('active', 'completed', 'cancelled'))
);

-- Enable Row Level Security
alter table public.tokens enable row level security;
alter table public.user_tokens enable row level security;
alter table public.token_transactions enable row level security;
alter table public.token_rewards enable row level security;
alter table public.token_staking enable row level security;

-- Create RLS policies
-- Tokens are viewable by everyone
create policy "Tokens are viewable by everyone"
  on public.tokens for select
  using (true);

-- User tokens are viewable by the owner and admins
create policy "User tokens are viewable by the owner"
  on public.user_tokens for select
  using (auth.uid() = user_id);

create policy "User tokens are viewable by admins"
  on public.user_tokens for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Token transactions are viewable by participants and admins
create policy "Token transactions are viewable by participants"
  on public.token_transactions for select
  using (
    auth.uid() = from_user_id or 
    auth.uid() = to_user_id
  );

create policy "Token transactions are viewable by admins"
  on public.token_transactions for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Token rewards are viewable by everyone
create policy "Token rewards are viewable by everyone"
  on public.token_rewards for select
  using (true);

-- Token staking is viewable by the owner and admins
create policy "Token staking is viewable by the owner"
  on public.token_staking for select
  using (auth.uid() = user_id);

create policy "Token staking is viewable by admins"
  on public.token_staking for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));
