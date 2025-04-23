-- Migration: Create supercivilization_feed and collective_progress tables for MVP
-- Purpose: Enable feed, personal progress, and collective progress features for the /supercivilization route
-- Date: 2025-04-23
-- Author: Cascade AI

-- 1. Create supercivilization_feed table
create table if not exists public.supercivilization_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  reactions int not null default 0,
  badge text,
  is_seeded boolean not null default false
);

-- Enable Row Level Security (RLS)
alter table public.supercivilization_feed enable row level security;

-- RLS Policies for supercivilization_feed
-- Select: Allow authenticated users to read all feed posts
create policy "Authenticated users can select feed posts" on public.supercivilization_feed
  for select using (auth.role() = 'authenticated');

-- Insert: Allow only authenticated users to insert their own posts
create policy "Authenticated users can insert their own posts" on public.supercivilization_feed
  for insert with check (auth.uid() = user_id);

-- Update: Allow users to update only their own posts
create policy "Authenticated users can update own posts" on public.supercivilization_feed
  for update using (auth.uid() = user_id);

-- Delete: Allow users to delete only their own posts
create policy "Authenticated users can delete own posts" on public.supercivilization_feed
  for delete using (auth.uid() = user_id);

-- 2. Create collective_progress table
create table if not exists public.collective_progress (
  id serial primary key,
  week_start date not null,
  actions_completed int not null default 0,
  updated_at timestamptz not null default now(),
  constraint unique_week unique (week_start)
);

-- Enable RLS for collective_progress
alter table public.collective_progress enable row level security;

-- RLS Policies for collective_progress
-- Select: Allow all authenticated users to view progress
create policy "Authenticated users can select collective progress" on public.collective_progress
  for select using (auth.role() = 'authenticated');

-- Update/Insert: Only service_role can update/insert
create policy "Service role can modify collective progress" on public.collective_progress
  for all using (auth.role() = 'service_role');

-- 3. Indexes for performance
create index if not exists idx_supercivilization_feed_created_at on public.supercivilization_feed (created_at desc);
create index if not exists idx_collective_progress_week_start on public.collective_progress (week_start);

-- 4. Comments
-- The supercivilization_feed table powers the community feed for intentions, wins, and questions.
-- The collective_progress table tracks weekly community achievements for the progress bar.
-- RLS policies ensure only authenticated users can interact with feed and view progress, and only the service role can update collective stats.
