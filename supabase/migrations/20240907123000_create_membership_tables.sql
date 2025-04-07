-- Migration: Create Membership Tables
-- Purpose: Implement tables for tracking membership, payments, and value delivery
-- Affected tables: Creates memberships, payment_history, value_metrics tables
-- Special considerations: Core tables for the AVALUE component of the platform

-- Check if migration has already been applied
do $$
begin
  if public.is_migration_applied('20240907123000') then
    raise notice 'Migration 20240907123000 has already been applied';
    return;
  end if;
end $$;

-- Membership table
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('active', 'inactive', 'pending', 'cancelled')),
  plan text not null default 'standard',
  monthly_fee numeric not null default 100 check (monthly_fee >= 0),
  start_date timestamptz not null default now(),
  next_billing_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payment history
create table if not exists public.payment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount > 0),
  payment_type text not null check (payment_type in ('membership_fee', 'additional_contribution')),
  payment_method text not null,
  status text not null check (status in ('succeeded', 'failed', 'pending', 'refunded')),
  transaction_id text,
  created_at timestamptz not null default now()
);

-- Value metrics table to track value delivered to members
create table if not exists public.value_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_type text not null,
  metric_value numeric not null,
  description text,
  recorded_at timestamptz not null default now()
);

-- Value summary view
create or replace view public.user_value_summary as
select
  user_id,
  sum(case when payment_type = 'membership_fee' and status = 'succeeded' then amount else 0 end) as total_membership_fees,
  sum(case when payment_type = 'additional_contribution' and status = 'succeeded' then amount else 0 end) as total_contributions,
  (select sum(metric_value) from public.value_metrics where value_metrics.user_id = payment_history.user_id) as total_value_received
from
  public.payment_history
group by
  user_id;

-- Enable Row Level Security
alter table public.memberships enable row level security;
alter table public.payment_history enable row level security;
alter table public.value_metrics enable row level security;

-- Create RLS policies for memberships
create policy "Users can view their own membership"
  on public.memberships for select
  using (auth.uid() = user_id);

create policy "Admins can view all memberships"
  on public.memberships for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Admins can insert memberships"
  on public.memberships for insert
  with check (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Admins can update memberships"
  on public.memberships for update
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for payment_history
create policy "Users can view their own payment history"
  on public.payment_history for select
  using (auth.uid() = user_id);

create policy "Admins can view all payment history"
  on public.payment_history for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Admins can insert payment history"
  on public.payment_history for insert
  with check (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create RLS policies for value_metrics
create policy "Users can view their own value metrics"
  on public.value_metrics for select
  using (auth.uid() = user_id);

create policy "Admins can view all value metrics"
  on public.value_metrics for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Admins can insert value metrics"
  on public.value_metrics for insert
  with check (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create function to record membership payment
create or replace function public.record_membership_payment(
  p_user_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_transaction_id text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_payment_id uuid;
  v_next_billing_date timestamptz;
begin
  -- Validate inputs
  if p_user_id is null or p_amount is null or p_payment_method is null then
    raise exception 'User ID, amount, and payment method are required';
  end if;
  
  -- Calculate next billing date (1 month from now)
  v_next_billing_date := (now() + interval '1 month')::date;
  
  -- Insert payment record
  insert into public.payment_history (
    user_id,
    amount,
    payment_type,
    payment_method,
    status,
    transaction_id
  ) values (
    p_user_id,
    p_amount,
    'membership_fee',
    p_payment_method,
    'succeeded',
    p_transaction_id
  ) returning id into v_payment_id;
  
  -- Update membership status and next billing date
  update public.memberships
  set 
    status = 'active',
    next_billing_date = v_next_billing_date,
    updated_at = now()
  where 
    user_id = p_user_id;
  
  -- If no membership record exists, create one
  if not found then
    insert into public.memberships (
      user_id,
      status,
      monthly_fee,
      start_date,
      next_billing_date
    ) values (
      p_user_id,
      'active',
      p_amount,
      now(),
      v_next_billing_date
    );
  end if;
  
  return v_payment_id;
end;
$$;

-- Create function to record additional contribution
create or replace function public.record_contribution(
  p_user_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_transaction_id text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_payment_id uuid;
begin
  -- Validate inputs
  if p_user_id is null or p_amount is null or p_payment_method is null then
    raise exception 'User ID, amount, and payment method are required';
  end if;
  
  -- Insert payment record
  insert into public.payment_history (
    user_id,
    amount,
    payment_type,
    payment_method,
    status,
    transaction_id
  ) values (
    p_user_id,
    p_amount,
    'additional_contribution',
    p_payment_method,
    'succeeded',
    p_transaction_id
  ) returning id into v_payment_id;
  
  return v_payment_id;
end;
$$;

-- Create function to record value delivered to member
create or replace function public.record_value_delivered(
  p_user_id uuid,
  p_metric_type text,
  p_metric_value numeric,
  p_description text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_metric_id uuid;
begin
  -- Validate inputs
  if p_user_id is null or p_metric_type is null or p_metric_value is null then
    raise exception 'User ID, metric type, and metric value are required';
  end if;
  
  -- Insert value metric record
  insert into public.value_metrics (
    user_id,
    metric_type,
    metric_value,
    description
  ) values (
    p_user_id,
    p_metric_type,
    p_metric_value,
    p_description
  ) returning id into v_metric_id;
  
  return v_metric_id;
end;
$$;

-- Create indexes for performance
create index if not exists idx_memberships_user_id on public.memberships (user_id);
create index if not exists idx_memberships_status on public.memberships (status);
create index if not exists idx_memberships_next_billing_date on public.memberships (next_billing_date);

create index if not exists idx_payment_history_user_id on public.payment_history (user_id);
create index if not exists idx_payment_history_payment_type on public.payment_history (payment_type);
create index if not exists idx_payment_history_status on public.payment_history (status);
create index if not exists idx_payment_history_created_at on public.payment_history (created_at);

create index if not exists idx_value_metrics_user_id on public.value_metrics (user_id);
create index if not exists idx_value_metrics_metric_type on public.value_metrics (metric_type);
create index if not exists idx_value_metrics_recorded_at on public.value_metrics (recorded_at);

-- Record this migration
select public.record_migration(
  '20240907123000',
  'create_membership_tables',
  'Created tables for membership, payment history, and value metrics'
);

-- Rollback script (commented out until needed)
/*
-- To rollback this migration:
drop function if exists public.record_value_delivered(uuid, text, numeric, text);
drop function if exists public.record_contribution(uuid, numeric, text, text);
drop function if exists public.record_membership_payment(uuid, numeric, text, text);
drop view if exists public.user_value_summary;
drop table if exists public.value_metrics;
drop table if exists public.payment_history;
drop table if exists public.memberships;
*/
