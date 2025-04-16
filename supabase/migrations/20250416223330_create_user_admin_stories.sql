-- Migration: Create user_admin_stories table for contextual user/admin stories
-- Purpose: Store stories shared by users and admins to surface in the UI by context (pillar, canvas, experiment)
-- Affects: Creates new table, enables RLS, and adds policies for select/insert
-- Special: Replaces any previous 'mentor_stories' concept with user/admin distinction

-- 1. Create user_admin_stories table
create table if not exists public.user_admin_stories (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('user', 'admin')),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  avatar_url text,
  story text not null,
  context text, -- e.g., 'canvas:123', 'experiment:456', 'individual'
  created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.user_admin_stories enable row level security;

-- 3. RLS Policies
-- Allow select for all (public stories)
create policy "Allow select for all" on public.user_admin_stories
  for select using (true);

-- Allow insert for authenticated users (user and admin stories)
create policy "Allow insert for authenticated" on public.user_admin_stories
  for insert to authenticated with check (auth.uid() = author_id);

-- Allow insert for anon only if type = 'user' (optional, for open feedback)
create policy "Allow insert for anon user stories" on public.user_admin_stories
  for insert to anon with check (type = 'user');

-- (Optional) Allow update/delete for author only (admin check removed for now)
-- TODO: Revisit admin support for update/delete in the future
create policy "Allow update for author" on public.user_admin_stories
  for update using (auth.uid() = author_id);
create policy "Allow delete for author" on public.user_admin_stories
  for delete using (auth.uid() = author_id);

-- 4. Index for context filtering
create index if not exists idx_user_admin_stories_context on public.user_admin_stories(context);

-- 5. Comments
comment on table public.user_admin_stories is 'Stories shared by users and admins, surfaced by context for transparency and learning.';
comment on column public.user_admin_stories.type is 'Type of story: user or admin.';
comment on column public.user_admin_stories.context is 'Context for surfacing the story (e.g., pillar, canvas, experiment).';
