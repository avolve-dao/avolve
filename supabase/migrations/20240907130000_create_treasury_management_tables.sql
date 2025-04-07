-- Migration: Create Treasury Management Tables
-- Purpose: Implement treasury management system for collective funds and governance
-- Affected tables: Creates treasury, treasury_proposals, proposal_votes tables
-- Special considerations: Core tables for the AVOICE component of the platform

-- Check if migration has already been applied
do $$
begin
  if public.is_migration_applied('20240907130000') then
    raise notice 'Migration 20240907130000 has already been applied';
    return;
  end if;
end $$;

-- Treasury table to track collective funds
create table if not exists public.treasury (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  balance numeric not null default 0 check (balance >= 0),
  allocation_percentage numeric not null default 0 check (allocation_percentage >= 0 and allocation_percentage <= 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Treasury transaction history
create table if not exists public.treasury_transactions (
  id uuid primary key default gen_random_uuid(),
  treasury_id uuid not null references public.treasury(id) on delete cascade,
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('deposit', 'withdrawal', 'allocation', 'transfer')),
  reference_id uuid,
  initiated_by uuid references auth.users(id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

-- Treasury proposals
create table if not exists public.treasury_proposals (
  id uuid primary key default gen_random_uuid(),
  treasury_id uuid not null references public.treasury(id) on delete cascade,
  title text not null,
  description text not null,
  amount numeric not null check (amount > 0),
  proposed_by uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('draft', 'active', 'approved', 'rejected', 'completed', 'cancelled')) default 'draft',
  voting_ends_at timestamptz,
  execution_deadline timestamptz,
  execution_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Proposal votes
create table if not exists public.proposal_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.treasury_proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vote text not null check (vote in ('yes', 'no', 'abstain')),
  respect_weight numeric not null default 1 check (respect_weight >= 0),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(proposal_id, user_id)
);

-- Treasury allocation records
create table if not exists public.treasury_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  treasury_id uuid not null references public.treasury(id) on delete cascade,
  amount numeric not null check (amount > 0),
  allocation_period timestamptz not null,
  created_at timestamptz not null default now(),
  unique(user_id, treasury_id, allocation_period)
);

-- Enable Row Level Security
alter table public.treasury enable row level security;
alter table public.treasury_transactions enable row level security;
alter table public.treasury_proposals enable row level security;
alter table public.proposal_votes enable row level security;
alter table public.treasury_allocations enable row level security;

-- Create RLS policies for treasury
create policy "Everyone can view treasury information"
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

create policy "Users with sufficient respect can create proposals"
  on public.treasury_proposals for insert
  using (
    auth.uid() in (
      select user_id from public.user_respect 
      where can_participate_in_treasury = true
    )
  );

create policy "Users can update their own draft proposals"
  on public.treasury_proposals for update
  using (
    auth.uid() = proposed_by and status = 'draft'
  );

create policy "Admins can manage all proposals"
  on public.treasury_proposals for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for proposal_votes
create policy "Everyone can view proposal votes"
  on public.proposal_votes for select
  using (true);

create policy "Users with sufficient respect can vote on proposals"
  on public.proposal_votes for insert
  using (
    auth.uid() in (
      select user_id from public.user_respect 
      where can_participate_in_treasury = true
    )
  );

create policy "Users can update their own votes"
  on public.proposal_votes for update
  using (
    auth.uid() = user_id
  );

create policy "Admins can manage all votes"
  on public.proposal_votes for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for treasury_allocations
create policy "Users can view their own allocations"
  on public.treasury_allocations for select
  using (auth.uid() = user_id);

create policy "Admins can view all allocations"
  on public.treasury_allocations for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Users can create their own allocations"
  on public.treasury_allocations for insert
  using (auth.uid() = user_id);

create policy "Admins can manage all allocations"
  on public.treasury_allocations for all
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create function to submit a treasury proposal
create or replace function public.submit_treasury_proposal(
  p_treasury_id uuid,
  p_title text,
  p_description text,
  p_amount numeric,
  p_voting_duration interval default interval '7 days',
  p_execution_deadline interval default interval '30 days',
  p_execution_details jsonb default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_can_participate boolean;
  v_proposal_id uuid;
  v_treasury_balance numeric;
begin
  -- Check if user can participate in treasury governance
  select can_participate_in_treasury into v_can_participate
  from public.user_respect
  where user_id = v_user_id;
  
  if not v_can_participate then
    raise exception 'User does not have sufficient respect to create proposals';
  end if;
  
  -- Check if treasury exists and has sufficient balance
  select balance into v_treasury_balance
  from public.treasury
  where id = p_treasury_id and is_active = true;
  
  if v_treasury_balance is null then
    raise exception 'Treasury not found or inactive';
  end if;
  
  if v_treasury_balance < p_amount then
    raise exception 'Treasury has insufficient balance for this proposal';
  end if;
  
  -- Create the proposal
  insert into public.treasury_proposals (
    treasury_id,
    title,
    description,
    amount,
    proposed_by,
    status,
    voting_ends_at,
    execution_deadline,
    execution_details
  ) values (
    p_treasury_id,
    p_title,
    p_description,
    p_amount,
    v_user_id,
    'active',
    now() + p_voting_duration,
    now() + p_execution_deadline,
    p_execution_details
  ) returning id into v_proposal_id;
  
  return v_proposal_id;
end;
$$;

-- Create function to vote on a proposal
create or replace function public.vote_on_proposal(
  p_proposal_id uuid,
  p_vote text,
  p_comment text default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_can_participate boolean;
  v_respect_weight numeric;
  v_proposal_status text;
  v_voting_ends_at timestamptz;
begin
  -- Check if user can participate in treasury governance
  select can_participate_in_treasury, respect_score into v_can_participate, v_respect_weight
  from public.user_respect
  where user_id = v_user_id;
  
  if not v_can_participate then
    raise exception 'User does not have sufficient respect to vote on proposals';
  end if;
  
  -- Check if proposal is active and voting period is still open
  select status, voting_ends_at into v_proposal_status, v_voting_ends_at
  from public.treasury_proposals
  where id = p_proposal_id;
  
  if v_proposal_status is null then
    raise exception 'Proposal not found';
  end if;
  
  if v_proposal_status != 'active' then
    raise exception 'Proposal is not active for voting';
  end if;
  
  if v_voting_ends_at < now() then
    raise exception 'Voting period has ended';
  end if;
  
  -- Record or update the vote
  insert into public.proposal_votes (
    proposal_id,
    user_id,
    vote,
    respect_weight,
    comment
  ) values (
    p_proposal_id,
    v_user_id,
    p_vote,
    v_respect_weight,
    p_comment
  )
  on conflict (proposal_id, user_id)
  do update set
    vote = excluded.vote,
    respect_weight = excluded.respect_weight,
    comment = excluded.comment,
    updated_at = now();
  
  return true;
end;
$$;

-- Create function to process proposal results
create or replace function public.process_proposal_results(
  p_proposal_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_proposal record;
  v_yes_votes numeric := 0;
  v_no_votes numeric := 0;
  v_abstain_votes numeric := 0;
  v_total_votes numeric := 0;
  v_result text;
  v_transaction_id uuid;
  v_response jsonb;
begin
  -- Get proposal details
  select * into v_proposal
  from public.treasury_proposals
  where id = p_proposal_id;
  
  if v_proposal is null then
    raise exception 'Proposal not found';
  end if;
  
  -- Only process active proposals with ended voting periods
  if v_proposal.status != 'active' or v_proposal.voting_ends_at > now() then
    return jsonb_build_object(
      'success', false,
      'message', 'Proposal is not ready for processing',
      'status', v_proposal.status,
      'voting_ends_at', v_proposal.voting_ends_at
    );
  end if;
  
  -- Calculate vote totals
  select
    coalesce(sum(respect_weight) filter (where vote = 'yes'), 0),
    coalesce(sum(respect_weight) filter (where vote = 'no'), 0),
    coalesce(sum(respect_weight) filter (where vote = 'abstain'), 0),
    coalesce(sum(respect_weight), 0)
  into
    v_yes_votes,
    v_no_votes,
    v_abstain_votes,
    v_total_votes
  from public.proposal_votes
  where proposal_id = p_proposal_id;
  
  -- Determine result (simple majority)
  if v_total_votes = 0 or v_yes_votes <= v_no_votes then
    v_result := 'rejected';
  else
    v_result := 'approved';
  end if;
  
  -- Update proposal status
  update public.treasury_proposals
  set
    status = v_result,
    updated_at = now()
  where id = p_proposal_id;
  
  -- If approved, reserve funds
  if v_result = 'approved' then
    -- Record treasury transaction
    insert into public.treasury_transactions (
      treasury_id,
      amount,
      transaction_type,
      reference_id,
      initiated_by,
      description
    ) values (
      v_proposal.treasury_id,
      -v_proposal.amount,
      'withdrawal',
      v_proposal.id,
      v_proposal.proposed_by,
      'Approved proposal: ' || v_proposal.title
    ) returning id into v_transaction_id;
    
    -- Update treasury balance
    update public.treasury
    set
      balance = balance - v_proposal.amount,
      updated_at = now()
    where id = v_proposal.treasury_id;
  end if;
  
  -- Prepare response
  v_response := jsonb_build_object(
    'success', true,
    'proposal_id', v_proposal.id,
    'result', v_result,
    'vote_counts', jsonb_build_object(
      'yes', v_yes_votes,
      'no', v_no_votes,
      'abstain', v_abstain_votes,
      'total', v_total_votes
    )
  );
  
  if v_result = 'approved' then
    v_response := v_response || jsonb_build_object(
      'transaction_id', v_transaction_id
    );
  end if;
  
  return v_response;
end;
$$;

-- Create function to allocate contributions to treasuries
create or replace function public.allocate_contribution_to_treasury(
  p_treasury_id uuid,
  p_amount numeric
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_available_balance numeric;
  v_allocation_period timestamptz;
  v_transaction_id uuid;
begin
  -- Check available balance
  select available_balance into v_available_balance
  from public.user_contributions
  where user_id = v_user_id;
  
  if v_available_balance is null or v_available_balance < p_amount then
    raise exception 'Insufficient available balance for allocation';
  end if;
  
  -- Set allocation period (current month)
  v_allocation_period := date_trunc('month', now());
  
  -- Record allocation
  insert into public.treasury_allocations (
    user_id,
    treasury_id,
    amount,
    allocation_period
  ) values (
    v_user_id,
    p_treasury_id,
    p_amount,
    v_allocation_period
  )
  on conflict (user_id, treasury_id, allocation_period)
  do update set
    amount = public.treasury_allocations.amount + p_amount,
    created_at = now();
  
  -- Update user's contribution balance
  update public.user_contributions
  set
    available_balance = available_balance - p_amount,
    allocated_balance = allocated_balance + p_amount,
    updated_at = now()
  where user_id = v_user_id;
  
  -- Add to treasury
  insert into public.treasury_transactions (
    treasury_id,
    amount,
    transaction_type,
    initiated_by,
    description
  ) values (
    p_treasury_id,
    p_amount,
    'allocation',
    v_user_id,
    'User contribution allocation'
  ) returning id into v_transaction_id;
  
  -- Update treasury balance
  update public.treasury
  set
    balance = balance + p_amount,
    updated_at = now()
  where id = p_treasury_id;
  
  return true;
end;
$$;

-- Create function to calculate respect based on contributions
create or replace function public.calculate_user_respect()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_users_updated integer := 0;
  v_user record;
  v_total_allocated numeric;
  v_respect_score numeric;
  v_level text;
  v_can_participate boolean;
begin
  -- Process each user
  for v_user in
    select distinct user_id
    from public.user_contributions
    where allocated_balance > 0
  loop
    -- Calculate total allocated over time
    select coalesce(sum(amount), 0) into v_total_allocated
    from public.treasury_allocations
    where user_id = v_user.user_id;
    
    -- Calculate respect score based on allocations
    -- This is a simple formula and can be adjusted as needed
    v_respect_score := sqrt(v_total_allocated);
    
    -- Determine level and participation eligibility
    if v_respect_score < 10 then
      v_level := 'newcomer';
      v_can_participate := false;
    elsif v_respect_score < 30 then
      v_level := 'contributor';
      v_can_participate := false;
    elsif v_respect_score < 60 then
      v_level := 'advocate';
      v_can_participate := true;
    elsif v_respect_score < 100 then
      v_level := 'steward';
      v_can_participate := true;
    else
      v_level := 'guardian';
      v_can_participate := true;
    end if;
    
    -- Update user respect
    insert into public.user_respect (
      user_id,
      respect_score,
      level,
      can_participate_in_treasury
    ) values (
      v_user.user_id,
      v_respect_score,
      v_level,
      v_can_participate
    )
    on conflict (user_id)
    do update set
      respect_score = v_respect_score,
      level = v_level,
      can_participate_in_treasury = v_can_participate,
      updated_at = now();
    
    v_users_updated := v_users_updated + 1;
  end loop;
  
  return v_users_updated;
end;
$$;

-- Create indexes for performance
create index if not exists idx_treasury_is_active on public.treasury (is_active);

create index if not exists idx_treasury_transactions_treasury_id on public.treasury_transactions (treasury_id);
create index if not exists idx_treasury_transactions_transaction_type on public.treasury_transactions (transaction_type);
create index if not exists idx_treasury_transactions_created_at on public.treasury_transactions (created_at);

create index if not exists idx_treasury_proposals_treasury_id on public.treasury_proposals (treasury_id);
create index if not exists idx_treasury_proposals_proposed_by on public.treasury_proposals (proposed_by);
create index if not exists idx_treasury_proposals_status on public.treasury_proposals (status);
create index if not exists idx_treasury_proposals_voting_ends_at on public.treasury_proposals (voting_ends_at);

create index if not exists idx_proposal_votes_proposal_id on public.proposal_votes (proposal_id);
create index if not exists idx_proposal_votes_user_id on public.proposal_votes (user_id);
create index if not exists idx_proposal_votes_vote on public.proposal_votes (vote);

create index if not exists idx_treasury_allocations_user_id on public.treasury_allocations (user_id);
create index if not exists idx_treasury_allocations_treasury_id on public.treasury_allocations (treasury_id);
create index if not exists idx_treasury_allocations_allocation_period on public.treasury_allocations (allocation_period);

-- Seed initial treasury data
insert into public.treasury (name, description, allocation_percentage, is_active)
values 
  ('Community Development', 'Funds for community-driven initiatives and events', 30, true),
  ('Platform Enhancement', 'Funds for improving platform features and user experience', 30, true),
  ('Education & Research', 'Funds for educational content and research projects', 20, true),
  ('Emergency Reserve', 'Reserved funds for unexpected expenses and opportunities', 10, true),
  ('Operational Expenses', 'Funds for day-to-day operations and maintenance', 10, true);

-- Record this migration
select public.record_migration(
  '20240907130000',
  'create_treasury_management_tables',
  'Created tables and functions for treasury management and governance'
);

-- Rollback script (commented out until needed)
/*
-- To rollback this migration:
drop function if exists public.calculate_user_respect();
drop function if exists public.allocate_contribution_to_treasury(uuid, numeric);
drop function if exists public.process_proposal_results(uuid);
drop function if exists public.vote_on_proposal(uuid, text, text);
drop function if exists public.submit_treasury_proposal(uuid, text, text, numeric, interval, interval, jsonb);
drop table if exists public.treasury_allocations;
drop table if exists public.proposal_votes;
drop table if exists public.treasury_proposals;
drop table if exists public.treasury_transactions;
drop table if exists public.treasury;
*/
