-- Migration: Add Journey and Core Tables for Avolve Platform
-- Timestamp: 20250414223500
-- Purpose: Introduce tables for the Three Keys (Personal Success Puzzle, Business Success Puzzle, Supermind Superpowers), Four Cores (Superpuzzle Developments, Superhuman Enhancements, Supersociety Advancements, Supergenius Breakthroughs), and related user progress tracking. Includes RLS policies for security.

-- =========================
-- PERSONAL SUCCESS PUZZLE
-- =========================
create table public.personal_success_puzzle (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  health_score numeric,
  wealth_score numeric,
  peace_score numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- BUSINESS SUCCESS PUZZLE
-- =========================
create table public.business_success_puzzle (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  front_stage_score numeric,
  back_stage_score numeric,
  bottom_line_score numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- SUPERMIND SUPERPOWERS
-- =========================
create table public.supermind_superpowers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_state text,
  desired_state text,
  action_plan text,
  results text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- SUPERPUZZLE DEVELOPMENTS
-- =========================
create table public.superpuzzle_developments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  academy_score numeric,
  company_score numeric,
  ecosystem_score numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- SUPERHUMAN ENHANCEMENTS
-- =========================
create table public.superhuman_enhancements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  academy_progress numeric,
  university_progress numeric,
  institute_progress numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- SUPERSOCIETY ADVANCEMENTS
-- =========================
create table public.supersociety_advancements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_progress numeric,
  community_progress numeric,
  country_progress numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- SUPERGENIUS BREAKTHROUGHS
-- =========================
create table public.supergenius_breakthroughs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venture_progress numeric,
  enterprise_progress numeric,
  industry_progress numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- USER MILESTONES (if not present)
-- =========================
create table if not exists public.user_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_name text not null,
  milestone_description text,
  achieved_at timestamptz not null default now(),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================
-- COMPONENT PROGRESS (if not present)
-- =========================
create table if not exists public.component_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  component_name text not null,
  component_description text,
  status text not null,
  updated_at timestamptz not null default now(),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================
-- RLS POLICIES
-- =========================
-- Enable RLS and add policies for all new tables

alter table public.personal_success_puzzle enable row level security;
create policy "Select own personal_success_puzzle" on public.personal_success_puzzle for select using (auth.uid() = user_id);
create policy "Insert own personal_success_puzzle" on public.personal_success_puzzle for insert with check (auth.uid() = user_id);
create policy "Update own personal_success_puzzle" on public.personal_success_puzzle for update using (auth.uid() = user_id);

alter table public.business_success_puzzle enable row level security;
create policy "Select own business_success_puzzle" on public.business_success_puzzle for select using (auth.uid() = user_id);
create policy "Insert own business_success_puzzle" on public.business_success_puzzle for insert with check (auth.uid() = user_id);
create policy "Update own business_success_puzzle" on public.business_success_puzzle for update using (auth.uid() = user_id);

alter table public.supermind_superpowers enable row level security;
create policy "Select own supermind_superpowers" on public.supermind_superpowers for select using (auth.uid() = user_id);
create policy "Insert own supermind_superpowers" on public.supermind_superpowers for insert with check (auth.uid() = user_id);
create policy "Update own supermind_superpowers" on public.supermind_superpowers for update using (auth.uid() = user_id);

alter table public.superpuzzle_developments enable row level security;
create policy "Select own superpuzzle_developments" on public.superpuzzle_developments for select using (auth.uid() = user_id);
create policy "Insert own superpuzzle_developments" on public.superpuzzle_developments for insert with check (auth.uid() = user_id);
create policy "Update own superpuzzle_developments" on public.superpuzzle_developments for update using (auth.uid() = user_id);

alter table public.superhuman_enhancements enable row level security;
create policy "Select own superhuman_enhancements" on public.superhuman_enhancements for select using (auth.uid() = user_id);
create policy "Insert own superhuman_enhancements" on public.superhuman_enhancements for insert with check (auth.uid() = user_id);
create policy "Update own superhuman_enhancements" on public.superhuman_enhancements for update using (auth.uid() = user_id);

alter table public.supersociety_advancements enable row level security;
create policy "Select own supersociety_advancements" on public.supersociety_advancements for select using (auth.uid() = user_id);
create policy "Insert own supersociety_advancements" on public.supersociety_advancements for insert with check (auth.uid() = user_id);
create policy "Update own supersociety_advancements" on public.supersociety_advancements for update using (auth.uid() = user_id);

alter table public.supergenius_breakthroughs enable row level security;
create policy "Select own supergenius_breakthroughs" on public.supergenius_breakthroughs for select using (auth.uid() = user_id);
create policy "Insert own supergenius_breakthroughs" on public.supergenius_breakthroughs for insert with check (auth.uid() = user_id);
create policy "Update own supergenius_breakthroughs" on public.supergenius_breakthroughs for update using (auth.uid() = user_id);

alter table public.user_milestones enable row level security;
create policy "Select own user_milestones" on public.user_milestones for select using (auth.uid() = user_id);
create policy "Insert own user_milestones" on public.user_milestones for insert with check (auth.uid() = user_id);
create policy "Update own user_milestones" on public.user_milestones for update using (auth.uid() = user_id);

alter table public.component_progress enable row level security;
create policy "Select own component_progress" on public.component_progress for select using (auth.uid() = user_id);
create policy "Insert own component_progress" on public.component_progress for insert with check (auth.uid() = user_id);
create policy "Update own component_progress" on public.component_progress for update using (auth.uid() = user_id);

-- End of migration
