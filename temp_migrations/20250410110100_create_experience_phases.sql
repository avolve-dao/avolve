-- Migration: Create Experience Phases Schema
-- Description: Sets up tables and functions for tracking user progression through experience phases
-- across all three pillars (superachiever, superachievers, supercivilization)
-- Copyright (c) 2025 Avolve DAO. All rights reserved.

-- Create enum for experience phases
create type public.experience_phase as enum (
  'discover',
  'onboard',
  'scaffold',
  'endgame'
);

-- Create table for user pillar progress
create table public.user_pillar_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pillar text not null check (pillar in ('superachiever', 'superachievers', 'supercivilization')),
  current_phase experience_phase not null default 'discover',
  phase_progress integer not null default 0 check (phase_progress between 0 and 100),
  unlocked_features jsonb not null default '[]'::jsonb,
  completed_milestones jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensure one record per user per pillar
  unique (user_id, pillar)
);

-- Create table for phase transition history
create table public.user_phase_transitions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pillar text not null check (pillar in ('superachiever', 'superachievers', 'supercivilization')),
  from_phase experience_phase not null,
  to_phase experience_phase not null,
  transitioned_at timestamptz not null default now(),
  
  -- Add index for faster queries
  constraint valid_transition check (from_phase <> to_phase)
);

-- Create table for phase milestones
create table public.phase_milestones (
  id uuid primary key default uuid_generate_v4(),
  pillar text not null check (pillar in ('superachiever', 'superachievers', 'supercivilization')),
  phase experience_phase not null,
  name text not null,
  description text not null,
  required_for_advancement boolean not null default true,
  token_reward integer,
  token_type text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create table for user milestone progress
create table public.user_milestone_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_id uuid not null references public.phase_milestones(id) on delete cascade,
  is_completed boolean not null default false,
  progress integer not null default 0 check (progress between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensure one record per user per milestone
  unique (user_id, milestone_id)
);

-- Create table for phase requirements
create table public.phase_requirements (
  id uuid primary key default uuid_generate_v4(),
  pillar text not null check (pillar in ('superachiever', 'superachievers', 'supercivilization')),
  phase experience_phase not null,
  phase_milestone_threshold integer not null default 1,
  token_requirements jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensure one record per pillar per phase
  unique (pillar, phase)
);

-- Function to update user phase
create or replace function public.update_user_phase()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Logic to determine if a user should progress to next phase
  -- based on completed milestones and other criteria
  
  if (select count(*) from public.user_milestone_progress 
      where user_id = new.user_id 
      and is_completed = true
      and milestone_id in (
        select id from public.phase_milestones
        where pillar = new.pillar
        and phase = new.current_phase
        and required_for_advancement = true
      )) >= (select phase_milestone_threshold 
            from public.phase_requirements 
            where pillar = new.pillar 
            and phase = new.current_phase) then
    
    -- Determine the next phase
    new.current_phase := (
      case new.current_phase
        when 'discover' then 'onboard'
        when 'onboard' then 'scaffold'
        when 'scaffold' then 'endgame'
        else new.current_phase
      end
    );
    
    -- Reset phase progress for the new phase
    new.phase_progress := 0;
    
    -- Record the phase transition
    insert into public.user_phase_transitions(
      user_id, pillar, from_phase, to_phase, transitioned_at
    ) values (
      new.user_id, new.pillar, old.current_phase, new.current_phase, now()
    );
  end if;
  
  -- Always update the updated_at timestamp
  new.updated_at := now();
  
  return new;
end;
$$;

-- Create trigger for phase updates
create trigger user_phase_update_trigger
before update on public.user_pillar_progress
for each row
when (old.current_phase is distinct from new.current_phase or old.phase_progress is distinct from new.phase_progress)
execute function public.update_user_phase();

-- Function to initialize user progress for new users
create or replace function public.initialize_user_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Create initial progress records for all pillars
  insert into public.user_pillar_progress (user_id, pillar, current_phase)
  values
    (new.id, 'superachiever', 'discover'),
    (new.id, 'superachievers', 'discover'),
    (new.id, 'supercivilization', 'discover');
  
  return new;
end;
$$;

-- Create trigger to initialize user progress on user creation
create trigger on_user_created
after insert on auth.users
for each row
execute function public.initialize_user_progress();

-- Enable Row Level Security
alter table public.user_pillar_progress enable row level security;
alter table public.user_phase_transitions enable row level security;
alter table public.user_milestone_progress enable row level security;

-- Create policies for user pillar progress
create policy "Users can view their own progress"
  on public.user_pillar_progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own progress"
  on public.user_pillar_progress for update
  using (auth.uid() = user_id);

-- Create policies for user phase transitions
create policy "Users can view their own phase transitions"
  on public.user_phase_transitions for select
  using (auth.uid() = user_id);

-- Create policies for user milestone progress
create policy "Users can view their own milestone progress"
  on public.user_milestone_progress for select
  using (auth.uid() = user_id);

create policy "Users can update their own milestone progress"
  on public.user_milestone_progress for update
  using (auth.uid() = user_id);

-- Create policies for phase milestones (public read)
create policy "Anyone can view phase milestones"
  on public.phase_milestones for select
  using (true);

-- Create policies for phase requirements (public read)
create policy "Anyone can view phase requirements"
  on public.phase_requirements for select
  using (true);

-- Insert initial phase requirements
insert into public.phase_requirements (pillar, phase, phase_milestone_threshold)
values
  ('superachiever', 'discover', 3),
  ('superachiever', 'onboard', 5),
  ('superachiever', 'scaffold', 7),
  ('superachievers', 'discover', 3),
  ('superachievers', 'onboard', 5),
  ('superachievers', 'scaffold', 7),
  ('supercivilization', 'discover', 3),
  ('supercivilization', 'onboard', 5),
  ('supercivilization', 'scaffold', 7);

-- Add comments for better documentation
comment on table public.user_pillar_progress is 'Tracks user progress through experience phases for each pillar';
comment on table public.user_phase_transitions is 'Records history of user phase transitions';
comment on table public.phase_milestones is 'Defines milestones required for each phase';
comment on table public.user_milestone_progress is 'Tracks user progress on phase milestones';
comment on table public.phase_requirements is 'Defines requirements for advancing to the next phase';
