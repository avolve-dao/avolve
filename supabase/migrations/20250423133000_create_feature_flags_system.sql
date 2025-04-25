-- Migration: Enhance feature flags system
-- Generated: 2025-04-23T13:30:00Z
-- Purpose: Enhance the existing feature flags system for gradual feature rollout
-- Author: @avolve-dao

/**
 * This migration enhances the existing feature_flags table and related functions
 * to support the invitation-only onboarding and progressive feature unlocking
 * strategy outlined in the Avolve MVP launch plan.
 */

-- First, let's add the new columns we need to the existing feature_flags table
alter table public.feature_flags 
  add column if not exists enabled boolean not null default true,
  add column if not exists percentage_rollout integer check (percentage_rollout between 0 and 100),
  add column if not exists user_ids uuid[] default '{}',
  add column if not exists user_roles text[] default '{}',
  add column if not exists token_requirements jsonb default '{}';

-- Add comments to table and columns
comment on table public.feature_flags is 'Feature flags for controlling feature visibility and rollout';
comment on column public.feature_flags.id is 'Unique identifier for the feature flag';
comment on column public.feature_flags.key is 'Unique name/key for the feature flag';
comment on column public.feature_flags.description is 'Description of what the feature flag controls';
comment on column public.feature_flags.value is 'Configuration value for the feature flag';
comment on column public.feature_flags.enabled is 'Whether the feature is enabled globally';
comment on column public.feature_flags.percentage_rollout is 'Percentage of users who should see this feature (0-100)';
comment on column public.feature_flags.user_ids is 'Specific user IDs who should see this feature';
comment on column public.feature_flags.user_roles is 'User roles who should see this feature';
comment on column public.feature_flags.token_requirements is 'Token requirements to unlock this feature (e.g. {"SAP": 10})';
comment on column public.feature_flags.created_at is 'When the feature flag was created';
comment on column public.feature_flags.updated_at is 'When the feature flag was last updated';

-- Create indexes for performance
create index if not exists idx_feature_flags_key on public.feature_flags(key);
create index if not exists idx_feature_flags_enabled on public.feature_flags(enabled);

-- Enable RLS if not already enabled
alter table public.feature_flags enable row level security;

-- Create RLS policies (will be skipped if they already exist)
do $$
begin
  -- Everyone (authenticated and anon) can read feature flags
  if not exists (
    select 1 from pg_policies 
    where tablename = 'feature_flags' 
    and policyname = 'Anyone can read feature flags'
  ) then
    create policy "Anyone can read feature flags"
      on public.feature_flags
      for select
      to authenticated, anon
      using (true);
  end if;

  -- Only admins can modify feature flags
  if not exists (
    select 1 from pg_policies 
    where tablename = 'feature_flags' 
    and policyname = 'Only admins can modify feature flags'
  ) then
    create policy "Only admins can modify feature flags"
      on public.feature_flags
      for all
      to authenticated
      using (
        exists (
          select 1 from public.profiles
          where profiles.id = auth.uid()
          and profiles.is_admin = true
        )
      );
  end if;
end;
$$;

-- Create function to check if a feature is enabled for a user
create or replace function public.is_feature_enabled(
  p_feature_key text,
  p_user_id uuid default auth.uid()
)
returns boolean
language plpgsql
security invoker
set search_path = ''
stable
as $$
declare
  v_feature record;
  v_user_roles text[];
  v_user_tokens jsonb;
  v_token_type text;
  v_token_requirement int;
  v_token_balance int;
  v_user_hash int;
  v_percentage_bucket int;
  v_is_enabled boolean;
begin
  -- Get feature flag
  select 
    ff.*,
    coalesce((ff.value->>'enabled')::boolean, ff.enabled) as effective_enabled
  into v_feature
  from public.feature_flags ff
  where ff.key = p_feature_key;
  
  -- If feature doesn't exist or is disabled globally, return false
  if v_feature is null or not v_feature.effective_enabled then
    return false;
  end if;
  
  -- Check if user is in the explicit user list
  if p_user_id = any(v_feature.user_ids) then
    return true;
  end if;
  
  -- Check user roles if applicable
  if array_length(v_feature.user_roles, 1) > 0 then
    -- Get user roles
    select array_agg(role) into v_user_roles
    from public.user_roles
    where user_id = p_user_id;
    
    -- Check if user has any of the required roles
    if v_user_roles && v_feature.user_roles then
      return true;
    end if;
  end if;
  
  -- Check token requirements if applicable
  if v_feature.token_requirements != '{}' then
    -- Get user token balances
    select jsonb_object_agg(token_type, balance) into v_user_tokens
    from public.get_user_token_balances(p_user_id);
    
    -- Check each token requirement
    for v_token_type, v_token_requirement in 
      select key, (value::text)::int from jsonb_each(v_feature.token_requirements)
    loop
      -- Get user's balance for this token type
      v_token_balance := (v_user_tokens->v_token_type)::int;
      
      -- If user doesn't have enough tokens, return false
      if v_token_balance is null or v_token_balance < v_token_requirement then
        return false;
      end if;
    end loop;
    
    -- If we got here, user meets all token requirements
    return true;
  end if;
  
  -- Check percentage rollout if applicable
  if v_feature.percentage_rollout is not null and v_feature.percentage_rollout < 100 then
    -- Create a consistent hash for this user and feature combination
    v_user_hash := ('x' || substr(md5(p_user_id::text || p_feature_key), 1, 8))::bit(32)::int;
    
    -- Get a number between 0-99 based on the hash
    v_percentage_bucket := v_user_hash % 100;
    
    -- Check if user is in the rollout percentage
    return v_percentage_bucket < v_feature.percentage_rollout;
  end if;
  
  -- If no specific conditions are set, the feature is enabled for everyone
  return true;
end;
$$;

-- Add comment to function
comment on function public.is_feature_enabled(text, uuid) is 'Checks if a feature is enabled for a specific user based on various criteria';

-- Create function to get all features enabled for a user
create or replace function public.get_enabled_features(
  p_user_id uuid default auth.uid()
)
returns table (
  key text,
  description text
)
language plpgsql
security invoker
set search_path = ''
stable
as $$
begin
  return query
    select 
      ff.key,
      ff.description
    from 
      public.feature_flags ff
    where 
      public.is_feature_enabled(ff.key, p_user_id);
end;
$$;

-- Add comment to function
comment on function public.get_enabled_features(uuid) is 'Returns all features enabled for a specific user';

-- Insert initial feature flags for MVP launch
insert into public.feature_flags (key, description, enabled, token_requirements, value)
values 
  ('supercivilization_feed', 'Access to the Supercivilization Feed', true, '{}', '{"enabled": true}'::jsonb),
  ('peer_recognition', 'Ability to send and receive peer recognition', true, '{}', '{"enabled": true}'::jsonb),
  ('personal_progress', 'View personal progress and achievements', true, '{}', '{"enabled": true}'::jsonb),
  ('collective_progress', 'View collective progress bar', true, '{}', '{"enabled": true}'::jsonb),
  ('token_system', 'View and use the token system', true, '{}', '{"enabled": true}'::jsonb),
  ('invite_friends', 'Ability to invite friends to the platform', true, '{"GEN": 10}', '{"enabled": true}'::jsonb),
  ('boost_posts', 'Ability to boost posts for more visibility', true, '{"SAP": 20}', '{"enabled": true}'::jsonb),
  ('advanced_analytics', 'Access to advanced personal analytics', true, '{"SCQ": 15}', '{"enabled": true}'::jsonb),
  ('community_proposals', 'Create and vote on community proposals', false, '{"PSP": 25, "SCQ": 20}', '{"enabled": false}'::jsonb),
  ('mentorship', 'Access to mentorship features', false, '{"SHE": 30}', '{"enabled": false}'::jsonb),
  ('governance_voting', 'Participate in platform governance', false, '{"GEN": 50, "SAP": 30, "SCQ": 30}', '{"enabled": false}'::jsonb)
on conflict (key) 
do update set
  description = excluded.description,
  token_requirements = excluded.token_requirements,
  value = excluded.value;

-- Create trigger to update the updated_at timestamp if it doesn't already exist
do $$
begin
  if not exists (
    select 1 from pg_trigger 
    where tgname = 'update_feature_flags_updated_at'
  ) then
    execute '
    create or replace function public.update_feature_flags_updated_at()
    returns trigger
    language plpgsql
    security invoker
    set search_path = ''''
    as $func$
    begin
      new.updated_at = now();
      return new;
    end;
    $func$;

    create trigger update_feature_flags_updated_at
    before update on public.feature_flags
    for each row
    execute function public.update_feature_flags_updated_at();
    ';
  end if;
end;
$$;
