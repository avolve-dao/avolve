-- Migration: Create Contribution Allocation Tables
-- Purpose: Implement tables for tracking user contributions, allocations, and the respect system
-- Affected tables: Creates user_contributions, allocation_categories, user_allocations, user_respect, respect_transactions
-- Special considerations: Core tables for the AVOICE component of the platform

-- Check if migration has already been applied
do $$
begin
  if public.is_migration_applied('20240907125000') then
    raise notice 'Migration 20240907125000 has already been applied';
    return;
  end if;
end $$;

-- User contribution balance
create table if not exists public.user_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_contributed numeric not null default 0 check (total_contributed >= 0),
  available_balance numeric not null default 0 check (available_balance >= 0),
  allocated_balance numeric not null default 0 check (allocated_balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Allocation categories
create table if not exists public.allocation_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User allocations
create table if not exists public.user_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.allocation_categories(id) on delete cascade,
  amount numeric not null check (amount > 0),
  allocation_date timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'processed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Respect/merit tracking
create table if not exists public.user_respect (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  respect_score numeric not null default 0 check (respect_score >= 0),
  level text not null default 'newcomer',
  can_participate_in_treasury boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Respect earning history
create table if not exists public.respect_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- Treasury table
create table if not exists public.treasury (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  balance numeric not null default 0 check (balance >= 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Treasury transactions
create table if not exists public.treasury_transactions (
  id uuid primary key default gen_random_uuid(),
  treasury_id uuid not null references public.treasury(id) on delete cascade,
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('deposit', 'withdrawal', 'allocation')),
  description text,
  performed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Treasury proposals
create table if not exists public.treasury_proposals (
  id uuid primary key default gen_random_uuid(),
  treasury_id uuid not null references public.treasury(id) on delete cascade,
  title text not null,
  description text not null,
  amount numeric not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'executed')),
  proposed_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Treasury votes
create table if not exists public.treasury_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.treasury_proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote text not null check (vote in ('approve', 'reject')),
  created_at timestamptz not null default now(),
  unique(proposal_id, user_id)
);

-- Enable Row Level Security
alter table public.user_contributions enable row level security;
alter table public.allocation_categories enable row level security;
alter table public.user_allocations enable row level security;
alter table public.user_respect enable row level security;
alter table public.respect_transactions enable row level security;
alter table public.treasury enable row level security;
alter table public.treasury_transactions enable row level security;
alter table public.treasury_proposals enable row level security;
alter table public.treasury_votes enable row level security;

-- Create RLS policies for user_contributions
create policy "Users can view their own contributions"
  on public.user_contributions for select
  using (auth.uid() = user_id);

create policy "Admins can view all contributions"
  on public.user_contributions for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for allocation_categories
create policy "Everyone can view allocation categories"
  on public.allocation_categories for select
  using (true);

create policy "Admins can manage allocation categories"
  on public.allocation_categories for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for user_allocations
create policy "Users can view their own allocations"
  on public.user_allocations for select
  using (auth.uid() = user_id);

create policy "Users can create their own allocations"
  on public.user_allocations for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all allocations"
  on public.user_allocations for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for user_respect
create policy "Users can view their own respect"
  on public.user_respect for select
  using (auth.uid() = user_id);

create policy "Everyone can view other users' respect level"
  on public.user_respect for select
  using (true);

create policy "Admins can manage respect"
  on public.user_respect for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for respect_transactions
create policy "Users can view their own respect transactions"
  on public.respect_transactions for select
  using (auth.uid() = user_id);

create policy "Admins can view all respect transactions"
  on public.respect_transactions for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for treasury
create policy "Everyone can view treasury"
  on public.treasury for select
  using (true);

create policy "Admins can manage treasury"
  on public.treasury for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for treasury_transactions
create policy "Everyone can view treasury transactions"
  on public.treasury_transactions for select
  using (true);

create policy "Admins can manage treasury transactions"
  on public.treasury_transactions for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for treasury_proposals
create policy "Everyone can view treasury proposals"
  on public.treasury_proposals for select
  using (true);

create policy "Qualified users can create treasury proposals"
  on public.treasury_proposals for insert
  with check (auth.uid() = proposed_by and exists(
    select 1 from public.user_respect
    where user_id = auth.uid()
    and can_participate_in_treasury = true
  ));

-- Create RLS policies for treasury_votes
create policy "Users can view all votes"
  on public.treasury_votes for select
  using (true);

create policy "Qualified users can vote on proposals"
  on public.treasury_votes for insert
  with check (auth.uid() = user_id and exists(
    select 1 from public.user_respect
    where user_id = auth.uid()
    and can_participate_in_treasury = true
  ));

-- Create function to record contribution
create or replace function public.record_user_contribution(
  p_user_id uuid,
  p_amount numeric
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_contribution_id uuid;
begin
  -- Validate inputs
  if p_user_id is null or p_amount is null or p_amount <= 0 then
    raise exception 'User ID and positive amount are required';
  end if;
  
  -- Update or insert user contribution record
  insert into public.user_contributions (
    user_id,
    total_contributed,
    available_balance
  ) values (
    p_user_id,
    p_amount,
    p_amount
  )
  on conflict (user_id) do update set
    total_contributed = public.user_contributions.total_contributed + p_amount,
    available_balance = public.user_contributions.available_balance + p_amount,
    updated_at = now()
  returning id into v_contribution_id;
  
  -- Record payment as additional contribution
  perform public.record_contribution(
    p_user_id,
    p_amount,
    'bank_transfer',
    null
  );
  
  -- Award respect points for contribution
  perform public.award_respect(
    p_user_id,
    p_amount * 0.1, -- 10% of contribution amount as respect
    'Financial contribution',
    'contribution',
    v_contribution_id
  );
  
  return v_contribution_id;
end;
$$;

-- Create function to allocate funds
create or replace function public.allocate_funds(
  p_user_id uuid,
  p_category_id uuid,
  p_amount numeric
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_allocation_id uuid;
  v_available_balance numeric;
begin
  -- Validate inputs
  if p_user_id is null or p_category_id is null or p_amount is null or p_amount <= 0 then
    raise exception 'User ID, category ID, and positive amount are required';
  end if;
  
  -- Check if category exists and is active
  if not exists(select 1 from public.allocation_categories where id = p_category_id and is_active = true) then
    raise exception 'Category does not exist or is not active';
  end if;
  
  -- Check if user has sufficient balance
  select available_balance into v_available_balance
  from public.user_contributions
  where user_id = p_user_id;
  
  if v_available_balance is null or v_available_balance < p_amount then
    raise exception 'Insufficient balance for allocation';
  end if;
  
  -- Create allocation record
  insert into public.user_allocations (
    user_id,
    category_id,
    amount,
    status
  ) values (
    p_user_id,
    p_category_id,
    p_amount,
    'pending'
  ) returning id into v_allocation_id;
  
  -- Update user contribution balance
  update public.user_contributions
  set
    available_balance = available_balance - p_amount,
    allocated_balance = allocated_balance + p_amount,
    updated_at = now()
  where
    user_id = p_user_id;
  
  -- Award respect points for allocation
  perform public.award_respect(
    p_user_id,
    p_amount * 0.05, -- 5% of allocation amount as respect
    'Fund allocation',
    'allocation',
    v_allocation_id
  );
  
  return v_allocation_id;
end;
$$;

-- Create function to award respect
create or replace function public.award_respect(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_reference_type text default null,
  p_reference_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_transaction_id uuid;
  v_new_score numeric;
  v_new_level text;
  v_can_participate boolean;
begin
  -- Validate inputs
  if p_user_id is null or p_amount is null or p_reason is null then
    raise exception 'User ID, amount, and reason are required';
  end if;
  
  -- Insert respect transaction
  insert into public.respect_transactions (
    user_id,
    amount,
    reason,
    reference_type,
    reference_id
  ) values (
    p_user_id,
    p_amount,
    p_reason,
    p_reference_type,
    p_reference_id
  ) returning id into v_transaction_id;
  
  -- Update user respect score
  update public.user_respect
  set
    respect_score = respect_score + p_amount,
    updated_at = now()
  where
    user_id = p_user_id
  returning respect_score into v_new_score;
  
  -- If no record exists, create one
  if v_new_score is null then
    insert into public.user_respect (
      user_id,
      respect_score
    ) values (
      p_user_id,
      p_amount
    )
    returning respect_score into v_new_score;
  end if;
  
  -- Determine new level and treasury participation based on score
  if v_new_score >= 1000 then
    v_new_level := 'elder';
    v_can_participate := true;
  elsif v_new_score >= 500 then
    v_new_level := 'steward';
    v_can_participate := true;
  elsif v_new_score >= 250 then
    v_new_level := 'contributor';
    v_can_participate := false;
  elsif v_new_score >= 100 then
    v_new_level := 'member';
    v_can_participate := false;
  else
    v_new_level := 'newcomer';
    v_can_participate := false;
  end if;
  
  -- Update level and treasury participation
  update public.user_respect
  set
    level = v_new_level,
    can_participate_in_treasury = v_can_participate
  where
    user_id = p_user_id;
  
  return v_transaction_id;
end;
$$;

-- Create function to process treasury proposal
create or replace function public.process_treasury_proposal(
  p_proposal_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_proposal record;
  v_approve_count integer;
  v_reject_count integer;
  v_qualified_users integer;
  v_approval_threshold numeric;
begin
  -- Get proposal details
  select * into v_proposal
  from public.treasury_proposals
  where id = p_proposal_id;
  
  if not found then
    raise exception 'Proposal not found';
  end if;
  
  if v_proposal.status != 'pending' then
    raise exception 'Proposal is not pending';
  end if;
  
  -- Count votes
  select
    count(*) filter (where vote = 'approve'),
    count(*) filter (where vote = 'reject')
  into
    v_approve_count,
    v_reject_count
  from
    public.treasury_votes
  where
    proposal_id = p_proposal_id;
  
  -- Count qualified users
  select count(*) into v_qualified_users
  from public.user_respect
  where can_participate_in_treasury = true;
  
  -- Calculate approval threshold (50% of qualified users)
  v_approval_threshold := v_qualified_users * 0.5;
  
  -- Determine outcome
  if v_approve_count >= v_approval_threshold then
    -- Approve and execute proposal
    update public.treasury_proposals
    set
      status = 'approved',
      updated_at = now()
    where
      id = p_proposal_id;
    
    -- Record treasury transaction
    insert into public.treasury_transactions (
      treasury_id,
      amount,
      transaction_type,
      description,
      performed_by
    ) values (
      v_proposal.treasury_id,
      v_proposal.amount,
      'allocation',
      'Approved proposal: ' || v_proposal.title,
      v_proposal.proposed_by
    );
    
    -- Update treasury balance
    update public.treasury
    set
      balance = balance - v_proposal.amount,
      updated_at = now()
    where
      id = v_proposal.treasury_id;
    
    return true;
  elsif v_reject_count >= v_approval_threshold then
    -- Reject proposal
    update public.treasury_proposals
    set
      status = 'rejected',
      updated_at = now()
    where
      id = p_proposal_id;
    
    return true;
  else
    -- Not enough votes yet
    return false;
  end if;
end;
$$;

-- Create indexes for performance
create index if not exists idx_user_contributions_user_id on public.user_contributions (user_id);
create index if not exists idx_allocation_categories_is_active on public.allocation_categories (is_active);
create index if not exists idx_user_allocations_user_id on public.user_allocations (user_id);
create index if not exists idx_user_allocations_category_id on public.user_allocations (category_id);
create index if not exists idx_user_allocations_status on public.user_allocations (status);
create index if not exists idx_user_respect_user_id on public.user_respect (user_id);
create index if not exists idx_user_respect_level on public.user_respect (level);
create index if not exists idx_user_respect_can_participate on public.user_respect (can_participate_in_treasury);
create index if not exists idx_respect_transactions_user_id on public.respect_transactions (user_id);
create index if not exists idx_treasury_proposals_status on public.treasury_proposals (status);
create index if not exists idx_treasury_proposals_proposed_by on public.treasury_proposals (proposed_by);
create index if not exists idx_treasury_votes_proposal_id on public.treasury_votes (proposal_id);
create index if not exists idx_treasury_votes_user_id on public.treasury_votes (user_id);

-- Seed initial allocation categories
insert into public.allocation_categories (name, description)
values
  ('Platform Development', 'Funding for core platform features and improvements'),
  ('Content Creation', 'Funding for educational content and resources'),
  ('Community Events', 'Funding for virtual and in-person community gatherings'),
  ('Marketing & Growth', 'Funding for platform promotion and user acquisition'),
  ('Research & Innovation', 'Funding for exploring new ideas and technologies');

-- Create main treasury
insert into public.treasury (name, description, balance)
values ('Main Treasury', 'Primary treasury for the Avolve platform', 0);

-- Record this migration
select public.record_migration(
  '20240907125000',
  'create_contribution_allocation_tables',
  'Created tables for user contributions, allocations, respect system, and treasury management'
);

-- Rollback script (commented out until needed)
/*
-- To rollback this migration:
drop function if exists public.process_treasury_proposal(uuid);
drop function if exists public.award_respect(uuid, numeric, text, text, uuid);
drop function if exists public.allocate_funds(uuid, uuid, numeric);
drop function if exists public.record_user_contribution(uuid, numeric);
drop table if exists public.treasury_votes;
drop table if exists public.treasury_proposals;
drop table if exists public.treasury_transactions;
drop table if exists public.treasury;
drop table if exists public.respect_transactions;
drop table if exists public.user_respect;
drop table if exists public.user_allocations;
drop table if exists public.allocation_categories;
drop table if exists public.user_contributions;
*/
