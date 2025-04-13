-- Avolve Identity Schema
-- This schema defines the Genius ID system for tracking user identities and progress

-- Genius profiles table
create table public.genius_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  genius_id text unique not null,
  degen_regen_score integer not null default 0 check (degen_regen_score between 0 and 100),
  chain_account text unique, -- For future Psibase integration
  avatar_url text,
  bio text,
  current_state jsonb, -- For Current → Desired → Actions → Results tracking
  desired_state jsonb,
  action_plan jsonb,
  results jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Genius achievements table
create table public.genius_achievements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.genius_profiles(id) on delete cascade,
  achievement_type text not null,
  title text not null,
  description text,
  awarded_at timestamptz not null default now(),
  points integer not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now(),
  check (achievement_type in ('pillar_completion', 'route_completion', 'meeting_contribution', 'token_milestone', 'recruitment'))
);

-- Genius level definitions table
create table public.genius_level_definitions (
  id uuid primary key default gen_random_uuid(),
  level integer not null unique check (level between 1 and 100),
  title text not null,
  description text,
  min_score integer not null check (min_score between 0 and 100),
  max_score integer not null check (max_score between 0 and 100),
  benefits jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_score <= max_score)
);

-- Enable Row Level Security
alter table public.genius_profiles enable row level security;
alter table public.genius_achievements enable row level security;
alter table public.genius_level_definitions enable row level security;

-- Create RLS policies
-- Genius profiles are viewable by the owner and public (limited fields)
create policy "Genius profiles are viewable by everyone with limited fields"
  on public.genius_profiles for select
  using (true);

create policy "Genius profiles are manageable by the owner"
  on public.genius_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Genius achievements are viewable by everyone
create policy "Genius achievements are viewable by everyone"
  on public.genius_achievements for select
  using (true);

-- Genius level definitions are viewable by everyone
create policy "Genius level definitions are viewable by everyone"
  on public.genius_level_definitions for select
  using (true);
