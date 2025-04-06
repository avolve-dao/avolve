-- Avolve Database Schema
-- This file provides a complete SQL representation of the Avolve database schema
-- Last updated: April 6, 2025

-- Tokens table - Stores information about all tokens in the system
create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  symbol text not null unique,
  name text not null,
  description text,
  icon_url text,
  gradient_class text,
  total_supply numeric not null default 0,
  is_primary boolean not null default false,
  blockchain_contract text,
  chain_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean default true,
  is_transferable boolean default true,
  transfer_fee numeric default 0,
  parent_token_id uuid references public.tokens(id)
);

-- Enable Row Level Security
alter table public.tokens enable row level security;

-- Create policy for anon users to view tokens
create policy "Tokens are viewable by everyone" 
  on public.tokens for select 
  using (true);

-- User Tokens table - Tracks token ownership for each user
create table public.user_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric not null default 0,
  staked_balance numeric not null default 0,
  pending_release numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_updated timestamptz default now(),
  unique(user_id, token_id)
);

-- Enable Row Level Security
alter table public.user_tokens enable row level security;

-- Create policy for users to view their own tokens
create policy "Users can view their own tokens" 
  on public.user_tokens for select 
  using (auth.uid() = user_id);

-- Create policy for users to update their own tokens
create policy "Users can update their own tokens" 
  on public.user_tokens for update
  using (auth.uid() = user_id);

-- Token Transactions table - Records all token transactions
create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  amount numeric not null,
  transaction_type text not null,
  reason text,
  tx_hash text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.token_transactions enable row level security;

-- Create policy for users to view transactions they're involved in
create policy "Users can view their own transactions" 
  on public.token_transactions for select 
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- Pillars table - Represents the three main pillars of the platform
create table public.pillars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  icon text,
  gradient_class text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  token_symbol text,
  chain_id text
);

-- Enable Row Level Security
alter table public.pillars enable row level security;

-- Create policy for everyone to view pillars
create policy "Pillars are viewable by everyone" 
  on public.pillars for select 
  using (true);

-- Sections table - Represents sections within pillars
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  pillar_id uuid not null references public.pillars(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text,
  description text,
  icon text,
  gradient_class text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  token_symbol text,
  chain_id text,
  unique(pillar_id, slug)
);

-- Enable Row Level Security
alter table public.sections enable row level security;

-- Create policy for everyone to view sections
create policy "Sections are viewable by everyone" 
  on public.sections for select 
  using (true);

-- Components table - Represents components within sections
create table public.components (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text,
  description text,
  icon text,
  gradient_class text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  token_symbol text,
  chain_id text,
  unique(section_id, slug)
);

-- Enable Row Level Security
alter table public.components enable row level security;

-- Create policy for everyone to view components
create policy "Components are viewable by everyone" 
  on public.components for select 
  using (true);

-- User Progress table - Tracks user progress through pillars, sections, and components
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null, -- 'pillar', 'section', or 'component'
  entity_id uuid not null,
  progress numeric not null default 0,
  completed boolean not null default false,
  last_activity timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entity_type, entity_id)
);

-- Enable Row Level Security
alter table public.user_progress enable row level security;

-- Create policy for users to view their own progress
create policy "Users can view their own progress" 
  on public.user_progress for select 
  using (auth.uid() = user_id);

-- Create policy for users to update their own progress
create policy "Users can update their own progress" 
  on public.user_progress for update
  using (auth.uid() = user_id);

-- Token Hierarchy function - Returns the token hierarchy
create or replace function public.get_token_hierarchy()
returns table (
  id uuid,
  symbol text,
  name text,
  description text,
  gradient_class text,
  is_primary boolean,
  parent_token_id uuid,
  parent_symbol text,
  level int
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  with recursive token_tree as (
    -- Base case: get all root tokens (those without a parent)
    select 
      t.id,
      t.symbol,
      t.name,
      t.description,
      t.gradient_class,
      t.is_primary,
      t.parent_token_id,
      null::text as parent_symbol,
      0 as level
    from public.tokens t
    where t.parent_token_id is null
    
    union all
    
    -- Recursive case: get all child tokens
    select 
      c.id,
      c.symbol,
      c.name,
      c.description,
      c.gradient_class,
      c.is_primary,
      c.parent_token_id,
      p.symbol as parent_symbol,
      p.level + 1 as level
    from public.tokens c
    join token_tree p on p.id = c.parent_token_id
  )
  select * from token_tree
  order by level, symbol;
end;
$$;

-- Token Balance Check function - Checks if a user has sufficient token balance
create or replace function public.has_sufficient_token_balance(
  p_user_id uuid,
  p_token_symbol text,
  p_required_amount numeric
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_balance numeric;
begin
  -- Get the token ID for the given symbol
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return false; -- Token does not exist
  end if;
  
  -- Get the user's balance for this token
  select balance into v_balance
  from public.user_tokens
  where user_id = p_user_id and token_id = v_token_id;
  
  -- If the user does not have this token, balance is 0
  if v_balance is null then
    return false;
  end if;
  
  -- Check if balance is sufficient
  return v_balance >= p_required_amount;
end;
$$;

-- Token Ownership Check function - Checks if a user has a specific token
create or replace function public.has_token(
  p_user_id uuid,
  p_token_symbol text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_has_token boolean;
begin
  -- Get the token ID for the given symbol
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return false; -- Token does not exist
  end if;
  
  -- Check if the user has this token with a positive balance
  select exists(
    select 1
    from public.user_tokens
    where user_id = p_user_id 
    and token_id = v_token_id
    and balance > 0
  ) into v_has_token;
  
  return v_has_token;
end;
$$;

-- Resource Access Check function - Checks if a user has access to a resource
create or replace function public.has_access_to_resource(
  p_user_id uuid,
  p_resource_type text,
  p_resource_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_symbol text;
begin
  -- Determine the required token based on the resource type and ID
  case p_resource_type
    when 'pillar' then
      select token_symbol into v_token_symbol
      from public.pillars
      where id = p_resource_id;
    
    when 'section' then
      select token_symbol into v_token_symbol
      from public.sections
      where id = p_resource_id;
    
    when 'component' then
      select token_symbol into v_token_symbol
      from public.components
      where id = p_resource_id;
    
    else
      return false; -- Unknown resource type
  end case;
  
  if v_token_symbol is null then
    return false; -- Resource does not exist or does not have a token requirement
  end if;
  
  -- Check if the user has the required token
  return public.has_token(p_user_id, v_token_symbol);
end;
$$;

-- Transfer Token function - Transfers tokens from one user to another
create or replace function public.transfer_token(
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
  v_transfer_fee numeric;
  v_from_balance numeric;
  v_is_transferable boolean;
begin
  -- Get the token ID and transfer fee for the given symbol
  select id, transfer_fee, is_transferable into v_token_id, v_transfer_fee, v_is_transferable
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return false; -- Token does not exist
  end if;
  
  if not v_is_transferable then
    return false; -- Token is not transferable
  end if;
  
  -- Get the sender's balance for this token
  select balance into v_from_balance
  from public.user_tokens
  where user_id = p_from_user_id and token_id = v_token_id;
  
  -- If the sender does not have this token or insufficient balance, return false
  if v_from_balance is null or v_from_balance < (p_amount + v_transfer_fee) then
    return false;
  end if;
  
  -- Begin transaction
  begin
    -- Update sender's balance
    update public.user_tokens
    set balance = balance - (p_amount + v_transfer_fee),
        updated_at = now(),
        last_updated = now()
    where user_id = p_from_user_id and token_id = v_token_id;
    
    -- Update or insert recipient's balance
    insert into public.user_tokens (user_id, token_id, balance)
    values (p_to_user_id, v_token_id, p_amount)
    on conflict (user_id, token_id) do update
    set balance = public.user_tokens.balance + p_amount,
        updated_at = now(),
        last_updated = now();
    
    -- Record the transaction
    insert into public.token_transactions (
      token_id, from_user_id, to_user_id, amount, transaction_type, reason
    )
    values (
      v_token_id, p_from_user_id, p_to_user_id, p_amount, 'transfer', p_reason
    );
    
    -- If there's a transfer fee, record it as a separate transaction
    if v_transfer_fee > 0 then
      insert into public.token_transactions (
        token_id, from_user_id, to_user_id, amount, transaction_type, reason
      )
      values (
        v_token_id, p_from_user_id, null, v_transfer_fee, 'fee', 'Transfer fee for ' || p_token_symbol
      );
    end if;
    
    return true;
  exception
    when others then
      -- Rollback in case of any error
      return false;
  end;
end;
$$;

-- Mint Token function - Mints new tokens to a user
create or replace function public.mint_token(
  p_to_user_id uuid,
  p_token_symbol text,
  p_amount numeric,
  p_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_total_supply numeric;
begin
  -- Get the token ID and total supply for the given symbol
  select id, total_supply into v_token_id, v_total_supply
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return false; -- Token does not exist
  end if;
  
  -- Begin transaction
  begin
    -- Update token total supply
    update public.tokens
    set total_supply = total_supply + p_amount,
        updated_at = now()
    where id = v_token_id;
    
    -- Update or insert recipient's balance
    insert into public.user_tokens (user_id, token_id, balance)
    values (p_to_user_id, v_token_id, p_amount)
    on conflict (user_id, token_id) do update
    set balance = public.user_tokens.balance + p_amount,
        updated_at = now(),
        last_updated = now();
    
    -- Record the transaction
    insert into public.token_transactions (
      token_id, from_user_id, to_user_id, amount, transaction_type, reason
    )
    values (
      v_token_id, null, p_to_user_id, p_amount, 'mint', p_reason
    );
    
    return true;
  exception
    when others then
      -- Rollback in case of any error
      return false;
  end;
end;
$$;

-- Burn Token function - Burns tokens from a user
create or replace function public.burn_token(
  p_from_user_id uuid,
  p_token_symbol text,
  p_amount numeric,
  p_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_from_balance numeric;
begin
  -- Get the token ID for the given symbol
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return false; -- Token does not exist
  end if;
  
  -- Get the user's balance for this token
  select balance into v_from_balance
  from public.user_tokens
  where user_id = p_from_user_id and token_id = v_token_id;
  
  -- If the user does not have this token or insufficient balance, return false
  if v_from_balance is null or v_from_balance < p_amount then
    return false;
  end if;
  
  -- Begin transaction
  begin
    -- Update token total supply
    update public.tokens
    set total_supply = total_supply - p_amount,
        updated_at = now()
    where id = v_token_id;
    
    -- Update user's balance
    update public.user_tokens
    set balance = balance - p_amount,
        updated_at = now(),
        last_updated = now()
    where user_id = p_from_user_id and token_id = v_token_id;
    
    -- Record the transaction
    insert into public.token_transactions (
      token_id, from_user_id, to_user_id, amount, transaction_type, reason
    )
    values (
      v_token_id, p_from_user_id, null, p_amount, 'burn', p_reason
    );
    
    return true;
  exception
    when others then
      -- Rollback in case of any error
      return false;
  end;
end;
$$;

-- Stake Token function - Stakes tokens for a user
create or replace function public.stake_token(
  p_user_id uuid,
  p_token_symbol text,
  p_amount numeric
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
  -- Get the token ID for the given symbol
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return false; -- Token does not exist
  end if;
  
  -- Get the user's balance for this token
  select balance into v_from_balance
  from public.user_tokens
  where user_id = p_user_id and token_id = v_token_id;
  
  -- If the user does not have this token or insufficient balance, return false
  if v_from_balance is null or v_from_balance < p_amount then
    return false;
  end if;
  
  -- Begin transaction
  begin
    -- Update user's balance
    update public.user_tokens
    set balance = balance - p_amount,
        staked_balance = staked_balance + p_amount,
        updated_at = now(),
        last_updated = now()
    where user_id = p_user_id and token_id = v_token_id;
    
    -- Record the transaction
    insert into public.token_transactions (
      token_id, from_user_id, to_user_id, amount, transaction_type, reason
    )
    values (
      v_token_id, p_user_id, p_user_id, p_amount, 'stake', 'Staked ' || p_token_symbol
    );
    
    return true;
  exception
    when others then
      -- Rollback in case of any error
      return false;
  end;
end;
$$;

-- Unstake Token function - Unstakes tokens for a user
create or replace function public.unstake_token(
  p_user_id uuid,
  p_token_symbol text,
  p_amount numeric
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_staked_balance numeric;
begin
  -- Get the token ID for the given symbol
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return false; -- Token does not exist
  end if;
  
  -- Get the user's staked balance for this token
  select staked_balance into v_staked_balance
  from public.user_tokens
  where user_id = p_user_id and token_id = v_token_id;
  
  -- If the user does not have this token staked or insufficient staked balance, return false
  if v_staked_balance is null or v_staked_balance < p_amount then
    return false;
  end if;
  
  -- Begin transaction
  begin
    -- Update user's balance
    update public.user_tokens
    set balance = balance + p_amount,
        staked_balance = staked_balance - p_amount,
        updated_at = now(),
        last_updated = now()
    where user_id = p_user_id and token_id = v_token_id;
    
    -- Record the transaction
    insert into public.token_transactions (
      token_id, from_user_id, to_user_id, amount, transaction_type, reason
    )
    values (
      v_token_id, p_user_id, p_user_id, p_amount, 'unstake', 'Unstaked ' || p_token_symbol
    );
    
    return true;
  exception
    when others then
      -- Rollback in case of any error
      return false;
  end;
end;
$$;

-- Get User Tokens function - Gets all tokens owned by a user
create or replace function public.get_user_tokens(p_user_id uuid)
returns table (
  token_id uuid,
  token_symbol text,
  token_name text,
  balance numeric,
  staked_balance numeric,
  pending_release numeric,
  gradient_class text,
  parent_token_id uuid,
  parent_token_symbol text
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
    t.gradient_class,
    t.parent_token_id,
    pt.symbol as parent_token_symbol
  from 
    public.user_tokens ut
    join public.tokens t on ut.token_id = t.id
    left join public.tokens pt on t.parent_token_id = pt.id
  where 
    ut.user_id = p_user_id
  order by 
    t.symbol;
end;
$$;

-- Get User Progress function - Gets a user's progress through pillars, sections, and components
create or replace function public.get_user_progress(p_user_id uuid)
returns table (
  entity_type text,
  entity_id uuid,
  entity_name text,
  progress numeric,
  completed boolean,
  last_activity timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  select 
    up.entity_type,
    up.entity_id,
    case 
      when up.entity_type = 'pillar' then (select title from public.pillars where id = up.entity_id)
      when up.entity_type = 'section' then (select title from public.sections where id = up.entity_id)
      when up.entity_type = 'component' then (select title from public.components where id = up.entity_id)
      else 'Unknown'
    end as entity_name,
    up.progress,
    up.completed,
    up.last_activity
  from 
    public.user_progress up
  where 
    up.user_id = p_user_id
  order by 
    up.entity_type,
    up.last_activity desc;
end;
$$;

-- Update User Progress function - Updates a user's progress for a specific entity
create or replace function public.update_user_progress(
  p_user_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_progress numeric,
  p_completed boolean default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_entity_exists boolean;
  v_completed boolean := p_completed;
begin
  -- Validate entity exists
  case p_entity_type
    when 'pillar' then
      select exists(select 1 from public.pillars where id = p_entity_id) into v_entity_exists;
    when 'section' then
      select exists(select 1 from public.sections where id = p_entity_id) into v_entity_exists;
    when 'component' then
      select exists(select 1 from public.components where id = p_entity_id) into v_entity_exists;
    else
      return false; -- Invalid entity type
  end case;
  
  if not v_entity_exists then
    return false; -- Entity does not exist
  end if;
  
  -- If completed is not specified, determine based on progress
  if v_completed is null then
    v_completed := (p_progress >= 100);
  end if;
  
  -- Update or insert progress
  insert into public.user_progress (
    user_id, entity_type, entity_id, progress, completed, last_activity
  )
  values (
    p_user_id, p_entity_type, p_entity_id, p_progress, v_completed, now()
  )
  on conflict (user_id, entity_type, entity_id) do update
  set 
    progress = p_progress,
    completed = v_completed,
    last_activity = now(),
    updated_at = now();
  
  return true;
end;
$$;

-- Indexes for performance
create index if not exists idx_tokens_symbol on public.tokens(symbol);
create index if not exists idx_tokens_parent_id on public.tokens(parent_token_id);
create index if not exists idx_user_tokens_user_id on public.user_tokens(user_id);
create index if not exists idx_user_tokens_token_id on public.user_tokens(token_id);
create index if not exists idx_token_transactions_token_id on public.token_transactions(token_id);
create index if not exists idx_token_transactions_from_user_id on public.token_transactions(from_user_id);
create index if not exists idx_token_transactions_to_user_id on public.token_transactions(to_user_id);
create index if not exists idx_pillars_slug on public.pillars(slug);
create index if not exists idx_pillars_token_symbol on public.pillars(token_symbol);
create index if not exists idx_sections_pillar_id on public.sections(pillar_id);
create index if not exists idx_sections_slug on public.sections(slug);
create index if not exists idx_sections_token_symbol on public.sections(token_symbol);
create index if not exists idx_components_section_id on public.components(section_id);
create index if not exists idx_components_slug on public.components(slug);
create index if not exists idx_components_token_symbol on public.components(token_symbol);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);
create index if not exists idx_user_progress_entity_id on public.user_progress(entity_id);
create index if not exists idx_user_progress_entity_type on public.user_progress(entity_type);
