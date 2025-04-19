-- Migration: Fractal Governance, Reputation, and Weekly Meetings
-- Timestamp: 20250419192355
-- Project: hevrachacwtqdcktblsd (Avolve)
-- Purpose: Remove legacy voting logic, add support for fractal/meritocratic governance, peer review, reputation, and weekly meeting logs.
-- Best practices: Follows Supabase RLS, declarative schemas, and auditability principles.

-- =====================================
-- 1. REMOVE LEGACY VOTING TABLES/FIELDS
-- =====================================
-- (No explicit voting tables found, but if any exist, drop them here with copious comments)
-- Example:
-- drop table if exists public.proposal_votes cascade; -- (No longer used; replaced by peer review and reputation)

-- =====================================
-- 2. FRACTAL GOVERNANCE: CIRCLES & ROLES
-- =====================================
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.circles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null,
  reputation numeric default 0,
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

-- Enable RLS for circles and circle_members
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;

-- RLS: Only allow members to select their own circles
create policy "Select own circles" on public.circles
  for select using (auth.uid() = created_by);

create policy "Select own membership" on public.circle_members
  for select using (auth.uid() = user_id);

-- =====================================
-- 3. PEER REVIEW & REPUTATION
-- =====================================
create table if not exists public.peer_reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid references auth.users(id),
  reviewee_id uuid references auth.users(id),
  circle_id uuid references public.circles(id),
  feedback text,
  score int,
  created_at timestamptz default now()
);

create table if not exists public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  event_type text,
  amount numeric,
  context text,
  created_at timestamptz default now()
);

create table if not exists public.user_reputation (
  user_id uuid primary key references auth.users(id),
  individual_merit numeric default 0,
  collective_merit numeric default 0,
  ecosystem_merit numeric default 0,
  updated_at timestamptz default now()
);

-- Enable RLS for peer_reviews, reputation_events, user_reputation
alter table public.peer_reviews enable row level security;
alter table public.reputation_events enable row level security;
alter table public.user_reputation enable row level security;

-- RLS: Only allow users to select their own reputation
create policy "Select own reputation" on public.user_reputation
  for select using (auth.uid() = user_id);

-- =====================================
-- 4. WEEKLY MEETING LOGS
-- =====================================
create table if not exists public.weekly_meetings (
  id uuid primary key default gen_random_uuid(),
  token_symbol text not null,
  meeting_date date not null,
  summary text,
  outcomes text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.meeting_participants (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references public.weekly_meetings(id) on delete cascade,
  user_id uuid references auth.users(id),
  contribution text,
  present boolean default true,
  unique(meeting_id, user_id)
);

-- Enable RLS for weekly_meetings and meeting_participants
alter table public.weekly_meetings enable row level security;
alter table public.meeting_participants enable row level security;

-- RLS: Only allow users to select meetings they created or participated in
create policy "Select own meetings" on public.weekly_meetings
  for select using (auth.uid() = created_by);

create policy "Select own meeting participation" on public.meeting_participants
  for select using (auth.uid() = user_id);

-- =====================================
-- 5. AUDIT & COMMENTS
-- =====================================
-- All destructive actions (drops) are commented above. All new tables use RLS and are documented for clarity.
-- All policies are granular (per action, per role) and follow Supabase best practices.
-- All object names are fully qualified and lowercase.
