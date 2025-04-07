-- Avolve Community Structure Schema
-- This schema defines the core pillars, routes, sections, and components of the Avolve platform

-- Pillars table (Superachiever, Superachievers, Supercivilization)
create table public.pillars (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  icon_url text,
  gradient_class text not null, -- Stone, Slate, Zinc gradients
  token_symbol text not null, -- SAP, SCQ, GEN
  display_order integer not null default 0,
  chain_id text unique, -- For future Psibase integration
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Routes table (Personal, Business, Supermind, etc.)
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  pillar_id uuid not null references public.pillars(id) on delete cascade,
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  icon_url text,
  gradient_class text not null, -- Color gradients specified
  token_symbol text not null, -- PSP, BSP, SMS, SPD, SHE, SSA, SBG
  day_of_week integer, -- For weekly events scheduling
  chain_id text unique, -- For future Psibase integration
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sections table (components of routes)
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(route_id, slug)
);

-- Components table (atomic learning/interaction units)
create table public.components (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  slug text not null,
  title text not null,
  subtitle text,
  description text,
  component_type text not null,
  content jsonb,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (component_type in ('lesson', 'challenge', 'assessment', 'reflection')),
  unique(section_id, slug)
);

-- User journey tracking
create table public.user_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pillar_id uuid not null references public.pillars(id) on delete cascade,
  route_id uuid references public.routes(id) on delete set null,
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('not_started', 'in_progress', 'completed')),
  unique(user_id, pillar_id, route_id)
);

-- User component progress tracking
create table public.user_component_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  current_state jsonb,
  desired_state jsonb,
  action_plan jsonb,
  results jsonb,
  status text not null default 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('not_started', 'in_progress', 'completed')),
  unique(user_id, component_id)
);

-- Enable Row Level Security
alter table public.pillars enable row level security;
alter table public.routes enable row level security;
alter table public.sections enable row level security;
alter table public.components enable row level security;
alter table public.user_journeys enable row level security;
alter table public.user_component_progress enable row level security;

-- Create RLS policies
-- Pillars, Routes, Sections, and Components are viewable by everyone
create policy "Pillars are viewable by everyone"
  on public.pillars for select
  using (true);

create policy "Routes are viewable by everyone"
  on public.routes for select
  using (true);

create policy "Sections are viewable by everyone"
  on public.sections for select
  using (true);

create policy "Components are viewable by everyone"
  on public.components for select
  using (true);

-- User journeys are only viewable by the owner
create policy "User journeys are viewable by the owner"
  on public.user_journeys for select
  using (auth.uid() = user_id);

create policy "User journeys are manageable by the owner"
  on public.user_journeys for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User component progress is only viewable by the owner
create policy "User component progress is viewable by the owner"
  on public.user_component_progress for select
  using (auth.uid() = user_id);

create policy "User component progress is manageable by the owner"
  on public.user_component_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
