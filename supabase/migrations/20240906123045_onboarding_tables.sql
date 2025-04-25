-- Migration to create tables for the enhanced onboarding experience
-- This supports the "quick identity/intention setup" and "fast first unlock" features
-- as described in the MVP launch plan

-- Create user_onboarding table to track onboarding progress
create table if not exists public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_steps text[] default '{}',
  last_step text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add comment to the table
comment on table public.user_onboarding is 'Tracks user onboarding progress through the streamlined onboarding flow';

-- Create user_intentions table to store user intentions
create table if not exists public.user_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intentions text[] default '{}',
  intention_statement text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

-- Add comment to the table
comment on table public.user_intentions is 'Stores user intentions selected during onboarding to personalize their experience';

-- Create user_features table to track feature unlocks
create table if not exists public.user_features (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_key text not null,
  enabled boolean default false,
  unlocked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, feature_key)
);

-- Add comment to the table
comment on table public.user_features is 'Tracks which features are unlocked for each user';

-- Enable Row Level Security for all tables
alter table public.user_onboarding enable row level security;
alter table public.user_intentions enable row level security;
alter table public.user_features enable row level security;

-- Create RLS policies for user_onboarding
create policy "Users can view their own onboarding progress"
  on public.user_onboarding for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own onboarding progress"
  on public.user_onboarding for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own onboarding progress"
  on public.user_onboarding for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create RLS policies for user_intentions
create policy "Users can view their own intentions"
  on public.user_intentions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own intentions"
  on public.user_intentions for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own intentions"
  on public.user_intentions for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create RLS policies for user_features
create policy "Users can view their own feature unlocks"
  on public.user_features for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own feature unlocks"
  on public.user_features for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own feature unlocks"
  on public.user_features for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create function to check if a user can unlock a feature
create or replace function public.can_unlock_feature(p_feature_key text, p_user_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  feature_exists boolean;
  user_eligible boolean;
begin
  -- Check if the feature exists and is available for unlock
  select exists(
    select 1 
    from public.available_features 
    where feature_key = p_feature_key 
    and is_active = true
  ) into feature_exists;
  
  if not feature_exists then
    return false;
  end if;
  
  -- Check if the user meets requirements to unlock this feature
  -- This is a simplified version - in a real implementation, you would
  -- check against specific requirements for each feature
  select exists(
    select 1 
    from public.user_onboarding 
    where user_id = p_user_id 
    and array_length(completed_steps, 1) >= 2
  ) into user_eligible;
  
  return user_eligible;
end;
$$;

-- Add comment to the function
comment on function public.can_unlock_feature is 'Checks if a user is eligible to unlock a specific feature';

-- Create table for available features
create table if not exists public.available_features (
  id uuid primary key default gen_random_uuid(),
  feature_key text unique not null,
  display_name text not null,
  description text,
  is_active boolean default true,
  unlock_requirements jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add comment to the table
comment on table public.available_features is 'Catalog of available features that users can unlock';

-- Enable Row Level Security for available_features
alter table public.available_features enable row level security;

-- Create RLS policies for available_features
create policy "Everyone can view available features"
  on public.available_features for select
  to anon, authenticated
  using (true);

-- Insert initial available features
insert into public.available_features (feature_key, display_name, description, unlock_requirements)
values 
  ('supercivilization_feed', 'Supercivilization Feed', 'Access the community feed with prompted posts and micro-rewards', '{"onboarding_complete": true}'),
  ('progress_tracker', 'Personal Progress Tracker', 'Track your growth and achievements on your journey', '{"onboarding_complete": true, "posts": 3}'),
  ('community_connect', 'Community Connect', 'Connect with like-minded individuals in the community', '{"onboarding_complete": true, "days_active": 7}');
