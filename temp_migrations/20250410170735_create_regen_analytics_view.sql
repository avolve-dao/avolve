-- Migration: Create Regen Analytics Materialized View
-- Purpose: Provides analytics on user regenerative scores based on activity and engagement
-- Affected tables: Creates a materialized view that reads from multiple tables
-- Special considerations: This view is refreshed on a schedule via a trigger

-- Create a materialized view for faster querying of analytics data
create materialized view public.regen_analytics_mv as
with event_participation as (
  -- Calculate event participation metrics
  select
    ec.user_id,
    count(distinct ec.event_id) as total_events_completed,
    count(distinct case when e.event_date >= now() - interval '30 days' then ec.event_id end) as recent_events_completed,
    max(ec.completion_date) as last_event_completion,
    sum(ec.total_reward) as total_event_rewards
  from
    public.event_completions ec
    join public.events e on ec.event_id = e.id
  group by
    ec.user_id
),
token_activity as (
  -- Calculate token usage and activity metrics
  select
    tt.to_user_id as user_id,
    count(*) as total_transactions,
    count(case when tt.created_at >= now() - interval '30 days' then 1 end) as recent_transactions,
    sum(tt.amount) as total_tokens_received,
    max(tt.created_at) as last_transaction_date
  from
    public.token_transactions tt
  where
    tt.to_user_id is not null
  group by
    tt.to_user_id
),
streak_data as (
  -- Get streak information
  select
    user_id,
    current_daily_streak,
    max_daily_streak,
    last_claim_date
  from
    public.user_token_streaks
),
community_engagement as (
  -- Calculate community engagement metrics
  select
    user_id,
    count(distinct team_id) as team_count,
    count(distinct case when role = 'leader' then team_id end) as leadership_count,
    bool_or(case when role = 'leader' then true else false end) as is_leader,
    max(joined_at) as last_team_activity
  from
    public.team_members
  group by
    user_id
),
milestone_progress as (
  -- Calculate milestone completion metrics
  select
    user_id,
    count(*) as completed_milestones,
    count(case when completion_date >= now() - interval '30 days' then 1 end) as recent_milestones,
    max(completion_date) as last_milestone_completion
  from
    public.milestone_completions
  group by
    user_id
),
content_engagement as (
  -- Calculate content engagement metrics
  select
    user_id,
    count(*) as content_views,
    avg(duration_seconds) as avg_view_duration,
    sum(duration_seconds) as total_view_duration,
    max(viewed_at) as last_content_view
  from
    public.content_views
  group by
    user_id
),
contribution_metrics as (
  -- Calculate contribution metrics
  select
    user_id,
    count(*) as total_contributions,
    sum(case when contribution_type = 'content' then 1 else 0 end) as content_contributions,
    sum(case when contribution_type = 'code' then 1 else 0 end) as code_contributions,
    sum(case when contribution_type = 'community' then 1 else 0 end) as community_contributions,
    max(created_at) as last_contribution
  from
    public.user_contributions
  group by
    user_id
)
select
  u.id as user_id,
  u.display_name,
  u.created_at as joined_at,
  
  -- Calculate regen score based on multiple factors
  (
    coalesce(ep.total_events_completed, 0) * 5 +
    coalesce(ep.recent_events_completed, 0) * 10 +
    coalesce(ta.total_transactions, 0) * 2 +
    coalesce(ta.recent_transactions, 0) * 5 +
    coalesce(sd.current_daily_streak, 0) * 3 +
    coalesce(ce.team_count, 0) * 15 +
    coalesce(ce.leadership_count, 0) * 25 +
    coalesce(mp.completed_milestones, 0) * 8 +
    coalesce(mp.recent_milestones, 0) * 12 +
    coalesce(coe.content_views, 0) * 1 +
    coalesce(cm.total_contributions, 0) * 20
  ) as regen_score,
  
  -- Calculate regen level based on score thresholds
  case
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 1000 then 5
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 500 then 4
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 250 then 3
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 100 then 2
    else 1
  end as regen_level,
  
  -- Calculate next level threshold
  case
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 1000 then null -- Max level
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 500 then 1000
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 250 then 500
    when (
      coalesce(ep.total_events_completed, 0) * 5 +
      coalesce(ep.recent_events_completed, 0) * 10 +
      coalesce(ta.total_transactions, 0) * 2 +
      coalesce(ta.recent_transactions, 0) * 5 +
      coalesce(sd.current_daily_streak, 0) * 3 +
      coalesce(ce.team_count, 0) * 15 +
      coalesce(ce.leadership_count, 0) * 25 +
      coalesce(mp.completed_milestones, 0) * 8 +
      coalesce(mp.recent_milestones, 0) * 12 +
      coalesce(coe.content_views, 0) * 1 +
      coalesce(cm.total_contributions, 0) * 20
    ) >= 100 then 250
    else 100
  end as next_level_threshold,
  
  -- Component scores
  coalesce(ep.total_events_completed, 0) as event_count,
  coalesce(ep.recent_events_completed, 0) as recent_event_count,
  coalesce(sd.current_daily_streak, 0) as current_streak,
  coalesce(sd.max_daily_streak, 0) as max_streak,
  coalesce(mp.completed_milestones, 0) as milestone_count,
  coalesce(mp.recent_milestones, 0) as recent_milestone_count,
  coalesce(ce.team_count, 0) as team_count,
  coalesce(ce.is_leader, false) as is_leader,
  
  -- Engagement scores (0-100 scale)
  least(100, (coalesce(ep.recent_events_completed, 0) * 20 + 
         coalesce(sd.current_daily_streak, 0) * 5 + 
         coalesce(mp.recent_milestones, 0) * 15 + 
         coalesce(coe.content_views, 0) * 2)) as engagement_score,
  
  least(100, (coalesce(ce.team_count, 0) * 20 + 
         case when ce.is_leader then 30 else 0 end + 
         coalesce(cm.community_contributions, 0) * 10)) as community_engagement_score,
  
  least(100, (coalesce(cm.total_contributions, 0) * 15 + 
         coalesce(cm.content_contributions, 0) * 5 + 
         coalesce(cm.code_contributions, 0) * 10)) as contribution_score,
  
  -- Activity dates
  coalesce(ep.last_event_completion, u.created_at) as last_event_date,
  coalesce(ta.last_transaction_date, u.created_at) as last_token_date,
  coalesce(mp.last_milestone_completion, u.created_at) as last_milestone_date,
  coalesce(coe.last_content_view, u.created_at) as last_content_date,
  coalesce(cm.last_contribution, u.created_at) as last_contribution_date,
  
  -- Team status
  coalesce(ce.team_count, 0) > 0 as has_team,
  
  -- Last updated
  now() as calculated_at
from
  public.users u
  left join event_participation ep on u.id = ep.user_id
  left join token_activity ta on u.id = ta.user_id
  left join streak_data sd on u.id = sd.user_id
  left join community_engagement ce on u.id = ce.user_id
  left join milestone_progress mp on u.id = mp.user_id
  left join content_engagement coe on u.id = coe.user_id
  left join contribution_metrics cm on u.id = cm.user_id
where
  u.deleted_at is null;

-- Create index for faster lookups
create index if not exists regen_analytics_mv_user_id_idx on public.regen_analytics_mv (user_id);

-- Create function to refresh the materialized view
create or replace function public.refresh_regen_analytics()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  refresh materialized view public.regen_analytics_mv;
  return null;
end;
$$;

-- Create triggers to refresh the materialized view when relevant tables change
drop trigger if exists refresh_regen_analytics_event_completions on public.event_completions;
create trigger refresh_regen_analytics_event_completions
after insert or update or delete on public.event_completions
for each statement
execute function public.refresh_regen_analytics();

drop trigger if exists refresh_regen_analytics_token_transactions on public.token_transactions;
create trigger refresh_regen_analytics_token_transactions
after insert or update or delete on public.token_transactions
for each statement
execute function public.refresh_regen_analytics();

drop trigger if exists refresh_regen_analytics_milestone_completions on public.milestone_completions;
create trigger refresh_regen_analytics_milestone_completions
after insert or update or delete on public.milestone_completions
for each statement
execute function public.refresh_regen_analytics();

-- Enable row level security
alter materialized view public.regen_analytics_mv enable row level security;

-- Create policy for authenticated users to view only their own data
create policy "Users can view their own regen analytics"
  on public.regen_analytics_mv
  for select
  to authenticated
  using (auth.uid() = user_id);
  
-- Create policy for admins to view all data
create policy "Admins can view all regen analytics"
  on public.regen_analytics_mv
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
