-- Migration: Create Token Flow Analytics View
-- Purpose: Analyzes token transactions and provides insights into token economy health
-- Affected tables: Creates a view that reads from token_transactions and related tables
-- Special considerations: This view is used for analytics dashboards and AI recommendations

-- Create a view for token flow analytics
create view public.token_flow_view as
with daily_transactions as (
  -- Aggregate transactions by day
  select
    date_trunc('day', created_at) as transaction_date,
    token_id,
    count(*) as transaction_count,
    sum(amount) as total_amount,
    count(distinct from_user_id) as unique_senders,
    count(distinct to_user_id) as unique_receivers
  from
    public.token_transactions
  where
    created_at >= now() - interval '90 days'
  group by
    date_trunc('day', created_at),
    token_id
),
token_velocity as (
  -- Calculate token velocity (how quickly tokens change hands)
  select
    token_id,
    date_trunc('day', created_at) as transaction_date,
    count(*) as daily_transactions,
    count(*) / nullif(count(distinct to_user_id), 0) as transactions_per_user,
    sum(amount) / nullif(count(*), 0) as avg_transaction_size
  from
    public.token_transactions
  where
    created_at >= now() - interval '90 days'
  group by
    token_id,
    date_trunc('day', created_at)
),
token_distribution as (
  -- Calculate token distribution metrics
  select
    ub.token_id,
    count(*) as holder_count,
    avg(ub.balance) as avg_balance,
    percentile_cont(0.5) within group (order by ub.balance) as median_balance,
    max(ub.balance) as max_balance,
    min(ub.balance) as min_balance,
    stddev(ub.balance) as balance_stddev,
    sum(ub.balance) as total_supply
  from
    public.user_balances ub
  group by
    ub.token_id
),
token_activity_by_type as (
  -- Analyze transactions by transaction type
  select
    token_id,
    transaction_type,
    count(*) as transaction_count,
    sum(amount) as total_amount,
    avg(amount) as avg_amount
  from
    public.token_transactions
  where
    created_at >= now() - interval '90 days'
  group by
    token_id,
    transaction_type
),
token_burn_rate as (
  -- Calculate token burn rate (tokens removed from circulation)
  select
    token_id,
    date_trunc('day', created_at) as burn_date,
    sum(amount) as burned_amount
  from
    public.token_transactions
  where
    created_at >= now() - interval '90 days'
    and to_user_id is null
    and transaction_type = 'burn'
  group by
    token_id,
    date_trunc('day', created_at)
),
token_mint_rate as (
  -- Calculate token mint rate (new tokens created)
  select
    token_id,
    date_trunc('day', created_at) as mint_date,
    sum(amount) as minted_amount
  from
    public.token_transactions
  where
    created_at >= now() - interval '90 days'
    and from_user_id is null
    and transaction_type = 'mint'
  group by
    token_id,
    date_trunc('day', created_at)
),
token_health_metrics as (
  -- Calculate token economy health metrics
  select
    dt.token_id,
    t.symbol,
    t.name,
    t.token_type,
    t.description,
    
    -- Transaction volume metrics
    sum(dt.transaction_count) as total_transactions_90d,
    sum(dt.total_amount) as total_volume_90d,
    avg(dt.transaction_count) as avg_daily_transactions,
    avg(dt.total_amount) as avg_daily_volume,
    
    -- User engagement metrics
    avg(dt.unique_senders) as avg_daily_active_senders,
    avg(dt.unique_receivers) as avg_daily_active_receivers,
    max(dt.unique_senders + dt.unique_receivers) as max_daily_active_users,
    
    -- Token velocity metrics
    avg(tv.transactions_per_user) as avg_transactions_per_user,
    avg(tv.avg_transaction_size) as avg_transaction_size,
    
    -- Supply metrics
    coalesce(sum(tmr.minted_amount), 0) as total_minted_90d,
    coalesce(sum(tbr.burned_amount), 0) as total_burned_90d,
    coalesce(sum(tmr.minted_amount), 0) - coalesce(sum(tbr.burned_amount), 0) as net_supply_change_90d,
    
    -- Distribution metrics
    td.holder_count,
    td.avg_balance,
    td.median_balance,
    td.max_balance,
    td.total_supply,
    
    -- Concentration metrics (Gini coefficient approximation)
    td.balance_stddev / nullif(td.avg_balance, 0) as balance_inequality,
    
    -- Health score calculation (0-100 scale)
    least(100, greatest(0, 
      50 + -- Base score
      -- Positive factors
      (case when avg(dt.transaction_count) > 10 then 10 else avg(dt.transaction_count) end) + -- Active usage
      (case when avg(dt.unique_receivers) > 5 then 10 else avg(dt.unique_receivers) * 2 end) + -- User adoption
      (case when td.holder_count > 100 then 10 else td.holder_count / 10 end) + -- Distribution
      -- Negative factors
      (case when td.balance_stddev / nullif(td.avg_balance, 0) > 3 then -20 else 0 end) + -- Penalize high inequality
      (case when coalesce(sum(tmr.minted_amount), 0) > coalesce(sum(tbr.burned_amount), 0) * 3 then -10 else 0 end) -- Penalize inflation
    )) as token_health_score
  from
    daily_transactions dt
    join public.tokens t on dt.token_id = t.id
    left join token_velocity tv on dt.token_id = tv.token_id and dt.transaction_date = tv.transaction_date
    left join token_distribution td on dt.token_id = td.token_id
    left join token_burn_rate tbr on dt.token_id = tbr.token_id
    left join token_mint_rate tmr on dt.token_id = tmr.token_id
  group by
    dt.token_id,
    t.symbol,
    t.name,
    t.token_type,
    t.description,
    td.holder_count,
    td.avg_balance,
    td.median_balance,
    td.max_balance,
    td.balance_stddev,
    td.total_supply
)
select
  thm.*,
  
  -- Token usage breakdown
  jsonb_agg(
    jsonb_build_object(
      'transaction_type', tat.transaction_type,
      'count', tat.transaction_count,
      'total_amount', tat.total_amount,
      'percentage', (tat.transaction_count * 100.0 / nullif(thm.total_transactions_90d, 0))
    )
  ) as usage_breakdown,
  
  -- Token health classification
  case
    when thm.token_health_score >= 80 then 'Excellent'
    when thm.token_health_score >= 60 then 'Good'
    when thm.token_health_score >= 40 then 'Fair'
    when thm.token_health_score >= 20 then 'Poor'
    else 'Critical'
  end as health_status,
  
  -- Recommendations based on health metrics
  case
    when thm.token_health_score < 40 then
      jsonb_build_array(
        case
          when thm.avg_daily_transactions < 5 then 
            'Increase token utility through more platform features'
          else 'Consider adjusting token economics'
        end,
        case
          when thm.balance_inequality > 3 then
            'Implement mechanisms to improve token distribution'
          else 'Review token allocation strategy'
        end
      )
    else jsonb_build_array()
  end as improvement_recommendations,
  
  -- Last updated timestamp
  now() as calculated_at
from
  token_health_metrics thm
  left join token_activity_by_type tat on thm.token_id = tat.token_id
group by
  thm.token_id,
  thm.symbol,
  thm.name,
  thm.token_type,
  thm.description,
  thm.total_transactions_90d,
  thm.total_volume_90d,
  thm.avg_daily_transactions,
  thm.avg_daily_volume,
  thm.avg_daily_active_senders,
  thm.avg_daily_active_receivers,
  thm.max_daily_active_users,
  thm.avg_transactions_per_user,
  thm.avg_transaction_size,
  thm.total_minted_90d,
  thm.total_burned_90d,
  thm.net_supply_change_90d,
  thm.holder_count,
  thm.avg_balance,
  thm.median_balance,
  thm.max_balance,
  thm.total_supply,
  thm.balance_inequality,
  thm.token_health_score;

-- Enable row level security
alter view public.token_flow_view enable row level security;

-- Create policy for admins to view all data
create policy "Admins can view token flow analytics"
  on public.token_flow_view
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role in ('admin', 'analyst')
    )
  );

-- Create function to get token health summary for a specific user
create or replace function public.get_user_token_health(user_id_param uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result jsonb;
begin
  -- Check if user has permission to access this data
  if (auth.uid() <> user_id_param) and not exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'analyst')
  ) then
    raise exception 'Permission denied';
  end if;
  
  -- Get token health summary for tokens the user holds
  select jsonb_agg(
    jsonb_build_object(
      'token_id', tfw.token_id,
      'symbol', tfw.symbol,
      'name', tfw.name,
      'health_score', tfw.token_health_score,
      'health_status', tfw.health_status,
      'user_balance', ub.balance,
      'total_supply', tfw.total_supply,
      'user_percentage', (ub.balance * 100.0 / nullif(tfw.total_supply, 0))
    )
  )
  into result
  from public.token_flow_view tfw
  join public.user_balances ub on tfw.token_id = ub.token_id
  where ub.user_id = user_id_param;
  
  return coalesce(result, '[]'::jsonb);
end;
$$;
