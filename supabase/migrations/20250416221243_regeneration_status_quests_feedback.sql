-- Migration: Add regeneration status, quest, feedback, and mentor story tables for Avolve
-- Purpose: Support Degen → Regen journey tracking, personalized quests, user feedback, and mentor/admin story sharing
-- Created: 20250416T221243Z (UTC)

-- 1. Add regeneration_status to users and groups
alter table public.profiles add column if not exists regeneration_status text default 'degen';

create table if not exists public.group_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  regeneration_status text default 'degen',
  created_at timestamptz default now()
);

-- 2. Quests and quest progress tracking
create table if not exists public.quests (
  id uuid primary key default gen_random_uuid(),
  pillar text not null, -- 'personal', 'collective', 'ecosystem'
  title text not null,
  description text,
  token_type text, -- e.g. 'PSP', 'BSP', etc.
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.quest_progress (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid references public.quests(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  status text default 'not_started', -- 'not_started', 'in_progress', 'completed'
  started_at timestamptz,
  completed_at timestamptz
);

-- 3. User feedback and experiment participation
create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  context text, -- e.g. 'token_claim', 'onboarding', 'quest', etc.
  feedback text,
  created_at timestamptz default now()
);

create table if not exists public.experiment_participation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  experiment_name text,
  participated_at timestamptz default now(),
  result text
);

-- 4. Mentor/admin stories
create table if not exists public.mentor_stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  story text not null,
  tags text[],
  created_at timestamptz default now()
);

-- Enable RLS and basic policies for new tables
alter table public.quests enable row level security;
alter table public.quest_progress enable row level security;
alter table public.user_feedback enable row level security;
alter table public.experiment_participation enable row level security;
alter table public.mentor_stories enable row level security;

-- RLS: Only allow users to select/insert/update/delete their own feedback, quest_progress, experiment_participation, and mentor_stories by default
create policy "User can manage own quest_progress" on public.quest_progress for all using (user_id = auth.uid());
create policy "User can manage own feedback" on public.user_feedback for all using (user_id = auth.uid());
create policy "User can manage own experiment_participation" on public.experiment_participation for all using (user_id = auth.uid());
create policy "User can manage own mentor_stories" on public.mentor_stories for all using (author_id = auth.uid());

-- Admins can manage all for moderation
create policy "Admin can manage all quest_progress" on public.quest_progress for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin can manage all feedback" on public.user_feedback for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin can manage all experiment_participation" on public.experiment_participation for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin can manage all mentor_stories" on public.mentor_stories for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));

-- Quests: anyone can select, only admins can insert/update/delete
create policy "Anyone can select quests" on public.quests for select using (true);
create policy "Admin can manage all quests" on public.quests for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));

-- Indexes for performance
create index if not exists idx_quest_progress_user_id on public.quest_progress(user_id);
create index if not exists idx_user_feedback_user_id on public.user_feedback(user_id);
create index if not exists idx_experiment_participation_user_id on public.experiment_participation(user_id);
create index if not exists idx_mentor_stories_author_id on public.mentor_stories(author_id);

-- Comments and documentation
comment on column public.profiles.regeneration_status is 'Tracks user''s current Degen → Regen state: degen, transitional, regen';
comment on table public.quests is 'Quests for each pillar (personal, collective, ecosystem) and token type.';
comment on table public.quest_progress is 'Tracks user progress on quests.';
comment on table public.user_feedback is 'User feedback on actions, quests, onboarding, etc.';
comment on table public.experiment_participation is 'Tracks user participation in experiments.';
comment on table public.mentor_stories is 'Mentor/admin stories and lessons for context-aware learning.';
