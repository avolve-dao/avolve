-- Create user_onboarding table to track onboarding progress
-- This migration adds support for saving and resuming the onboarding process

-- Create the user_onboarding table
create table if not exists public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_steps text[] default '{}',
  last_step text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  -- Add a unique constraint to ensure one record per user
  constraint user_onboarding_user_id_key unique (user_id)
);

-- Add helpful comments
comment on table public.user_onboarding is 'Tracks user onboarding progress and completed steps';
comment on column public.user_onboarding.completed_steps is 'Array of completed onboarding step keys';
comment on column public.user_onboarding.last_step is 'The key of the last completed step';

-- Create index for faster lookups
create index if not exists user_onboarding_user_id_idx on public.user_onboarding (user_id);

-- Enable row level security
alter table public.user_onboarding enable row level security;

-- Create RLS policies
-- Users can only view their own onboarding progress
create policy "Users can view their own onboarding progress"
  on public.user_onboarding
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can only update their own onboarding progress
create policy "Users can update their own onboarding progress"
  on public.user_onboarding
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Users can only insert their own onboarding progress
create policy "Users can insert their own onboarding progress"
  on public.user_onboarding
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Create trigger to update the updated_at column
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for updated_at
drop trigger if exists set_user_onboarding_updated_at on public.user_onboarding;
create trigger set_user_onboarding_updated_at
  before update on public.user_onboarding
  for each row
  execute function public.handle_updated_at();

-- Create function to update user onboarding progress
create or replace function public.update_onboarding_progress(
  p_step text,
  p_completed boolean default true
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_completed_steps text[];
  v_result jsonb;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Get current completed steps
  select completed_steps into v_completed_steps
  from public.user_onboarding
  where user_id = v_user_id;
  
  -- If no record exists, create one
  if v_completed_steps is null then
    v_completed_steps := '{}';
  end if;
  
  -- Add or remove the step
  if p_completed then
    -- Add step if not already in the array
    if not v_completed_steps @> array[p_step] then
      v_completed_steps := array_append(v_completed_steps, p_step);
    end if;
  else
    -- Remove step if in the array
    if v_completed_steps @> array[p_step] then
      v_completed_steps := array_remove(v_completed_steps, p_step);
    end if;
  end if;
  
  -- Insert or update the record
  insert into public.user_onboarding (user_id, completed_steps, last_step)
  values (v_user_id, v_completed_steps, p_step)
  on conflict (user_id)
  do update set
    completed_steps = v_completed_steps,
    last_step = p_step,
    updated_at = now()
  returning jsonb_build_object(
    'user_id', user_id,
    'completed_steps', completed_steps,
    'last_step', last_step
  ) into v_result;
  
  return v_result;
end;
$$;

-- Create API endpoint for updating onboarding progress
create or replace function public.get_onboarding_progress()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_result jsonb;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  
  -- Get onboarding progress
  select jsonb_build_object(
    'user_id', user_id,
    'completed_steps', completed_steps,
    'last_step', last_step,
    'created_at', created_at,
    'updated_at', updated_at
  ) into v_result
  from public.user_onboarding
  where user_id = v_user_id;
  
  -- Return empty object if no record exists
  if v_result is null then
    v_result := jsonb_build_object(
      'user_id', v_user_id,
      'completed_steps', '{}',
      'last_step', null
    );
  end if;
  
  return v_result;
end;
$$;
