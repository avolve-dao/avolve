-- Core tables for the Avolve platform
-- This file defines the main tables in the public schema

-- Create an enum for user roles
create type public.user_role_type as enum (
  'subscriber',
  'participant',
  'contributor',
  'associate',
  'builder',
  'partner'
);

-- Roles table - defines all user and admin roles
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role_type public.user_role_type not null,
  description text,
  is_admin boolean not null default false,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User roles table - assigns roles to users
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id),
  expires_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, role_id)
);

-- Tokens table - defines all token types
create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  symbol text not null unique,
  name text not null,
  description text,
  gradient_class text,
  icon_url text,
  is_primary boolean not null default false,
  is_transferable boolean not null default false,
  parent_token_id uuid references public.tokens(id),
  min_role_id uuid references public.roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User tokens table - tracks token ownership
create table public.user_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric not null default 0,
  staked_balance numeric not null default 0,
  pending_release numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, token_id)
);

-- Token transactions table - tracks token transfers
create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  amount numeric not null,
  transaction_type text not null,
  reason text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Content pillars
create table public.pillars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  slug text not null unique,
  icon_url text,
  gradient_class text,
  display_order int not null default 0,
  is_active boolean not null default true,
  token_symbol text references public.tokens(symbol),
  min_role_id uuid references public.roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Content sections within pillars
create table public.sections (
  id uuid primary key default gen_random_uuid(),
  pillar_id uuid not null references public.pillars(id) on delete cascade,
  title text not null,
  description text,
  slug text not null,
  icon_url text,
  gradient_class text,
  display_order int not null default 0,
  is_active boolean not null default true,
  token_symbol text references public.tokens(symbol),
  min_role_id uuid references public.roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pillar_id, slug)
);

-- Content components within sections
create table public.components (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  title text not null,
  description text,
  slug text not null,
  content_type text not null,
  content jsonb not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  is_introductory boolean not null default false,
  token_symbol text references public.tokens(symbol),
  min_role_id uuid references public.roles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(section_id, slug)
);

-- User progress tracking
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  progress_percentage int not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, component_id)
);

-- User achievements
create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null,
  earned_at timestamptz,
  claimed_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- User activity logs for analytics and gamification
create table public.user_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
