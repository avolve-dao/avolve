-- Update metrics table to include standardized metric types and details field
-- This migration modifies the metrics table to better support analytics and tracking

-- Add metric_type enum if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_type where typname = 'metric_type') then
    create type public.metric_type as enum (
      'activation',
      'engagement',
      'retention',
      'arpu',
      'conversion',
      'growth',
      'custom'
    );
  end if;
end$$;

-- Add new columns to metrics table
alter table public.metrics 
  add column if not exists metric_type public.metric_type not null default 'custom',
  add column if not exists metric_value numeric not null default 1,
  add column if not exists details jsonb,
  add column if not exists recorded_at timestamp with time zone default now();

-- Drop old event_type and event_data columns if they exist
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'metrics' and column_name = 'event_type') then
    alter table public.metrics drop column event_type;
  end if;
  
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'metrics' and column_name = 'event_data') then
    alter table public.metrics drop column event_data;
  end if;
end$$;

-- Add index for metric_type for better query performance
create index if not exists metrics_metric_type_idx on public.metrics(metric_type);

-- Add index for user_id and metric_type combination
create index if not exists metrics_user_metric_type_idx on public.metrics(user_id, metric_type);

-- Add function to record metrics
create or replace function public.record_metric(
  p_metric_type public.metric_type,
  p_metric_value numeric default 1,
  p_details jsonb default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_metric_id uuid;
begin
  -- Check if user is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Insert metric
  insert into public.metrics (
    user_id,
    metric_type,
    metric_value,
    details,
    notes,
    recorded_at
  ) values (
    auth.uid(),
    p_metric_type,
    p_metric_value,
    p_details,
    p_notes,
    now()
  )
  returning id into v_metric_id;

  return jsonb_build_object(
    'id', v_metric_id,
    'metric_type', p_metric_type,
    'metric_value', p_metric_value,
    'recorded_at', now()
  );
end;
$$;
