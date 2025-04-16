-- Migration: Add dynamic user role activity tracking and points view
-- Purpose: Track all user actions by role type for dynamic role assignment and gamified progression.
-- Author: Cascade AI
-- Date: 2025-04-15 22:26 UTC

-- Create user_role_activity table
create table if not exists public.user_role_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  role_type text not null check (role_type in ('subscriber', 'participant', 'contributor')),
  action_type text not null,
  context jsonb,
  created_at timestamp with time zone default now()
);

comment on table public.user_role_activity is 'Tracks every meaningful user action, mapped to a role type for dynamic role assignment and gamification.';

alter table public.user_role_activity enable row level security;

-- Example RLS: Allow users to insert/select their own activity (refine for production)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_role_activity'
      and policyname = 'Allow select own activity'
  ) then
    execute $policy$
      create policy "Allow select own activity" on public.user_role_activity
        for select using (auth.uid()::uuid = user_id);
    $policy$;
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_role_activity'
      and policyname = 'Allow insert own activity'
  ) then
    execute $policy$
      create policy "Allow insert own activity" on public.user_role_activity
        for insert with check (auth.uid()::uuid = user_id);
    $policy$;
  end if;
end $$;

-- Create user_role_points view
create or replace view public.user_role_points as
select
  user_id,
  role_type,
  count(*) as points,
  max(created_at) as last_action_at
from public.user_role_activity
group by user_id, role_type;

comment on view public.user_role_points is 'Aggregates user actions by role type to assign dynamic roles and track progression.';

-- End of migration
