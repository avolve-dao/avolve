-- Migration: Create Recommendation Interactions Table
-- Purpose: Tracks user interactions with AI recommendations for improving future suggestions
-- Affected tables: Creates a new table for recommendation interaction tracking
-- Special considerations: This table is used to improve AI recommendation quality

-- Create recommendation interactions table
create table public.recommendation_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recommendation_id text not null,
  action text not null,
  interaction_date timestamp with time zone not null default now(),
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

-- Add comment
comment on table public.recommendation_interactions is 'Tracks user interactions with AI recommendations';

-- Create indexes for faster queries
create index recommendation_interactions_user_id_idx on public.recommendation_interactions(user_id);
create index recommendation_interactions_recommendation_id_idx on public.recommendation_interactions(recommendation_id);
create index recommendation_interactions_action_idx on public.recommendation_interactions(action);
create index recommendation_interactions_interaction_date_idx on public.recommendation_interactions(interaction_date);

-- Enable row level security
alter table public.recommendation_interactions enable row level security;

-- Create policy for users to insert their own interactions
create policy "Users can insert their own recommendation interactions"
  on public.recommendation_interactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create policy for users to view their own interactions
create policy "Users can view their own recommendation interactions"
  on public.recommendation_interactions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Create policy for admins to view all interactions
create policy "Admins can view all recommendation interactions"
  on public.recommendation_interactions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Create function to get recommendation effectiveness for a user
create or replace function public.get_recommendation_effectiveness(user_id_param uuid)
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
  
  -- Calculate recommendation effectiveness metrics
  select jsonb_build_object(
    'total_recommendations', count(distinct recommendation_id),
    'total_interactions', count(*),
    'interaction_rate', count(*) / nullif(count(distinct recommendation_id), 0),
    'action_breakdown', jsonb_object_agg(
      action, 
      jsonb_build_object(
        'count', count(*),
        'percentage', (count(*) * 100.0 / nullif(total_count, 0))
      )
    ),
    'recent_trend', recent_trend
  )
  into result
  from (
    select 
      ri.action,
      count(*) over () as total_count,
      (
        select jsonb_build_object(
          'last_7_days', count(*) filter (where interaction_date >= now() - interval '7 days'),
          'previous_7_days', count(*) filter (where interaction_date >= now() - interval '14 days' and interaction_date < now() - interval '7 days'),
          'growth_percentage', (
            count(*) filter (where interaction_date >= now() - interval '7 days') * 100.0 / 
            nullif(count(*) filter (where interaction_date >= now() - interval '14 days' and interaction_date < now() - interval '7 days'), 0)
          ) - 100
        )
        from public.recommendation_interactions
        where user_id = user_id_param
      ) as recent_trend
    from public.recommendation_interactions ri
    where ri.user_id = user_id_param
  ) subquery
  group by recent_trend;
  
  return coalesce(result, '{}'::jsonb);
end;
$$;
