-- Migration: Create journey_posts table for TransformationWall
-- Purpose: Enables journaling and transformation wall features for users
-- Created: 2025-04-22 15:03:49 UTC

-- 1. Create the journey_posts table
create table public.journey_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  journey_type text not null, -- e.g. 'personal', 'business', 'supermind'
  journey_focus text not null, -- e.g. 'personal', 'business', 'supermind'
  engagement_score int default 0 not null,
  regen_score int default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.journey_posts enable row level security;

-- 3. RLS Policies
-- Select: Allow authenticated users to read all posts
create policy "Authenticated users can select journey posts"
  on public.journey_posts
  for select
  to authenticated
  using (true);

-- Select: Allow anon users to read all posts (if desired, otherwise comment out)
create policy "Anon users can select journey posts"
  on public.journey_posts
  for select
  to anon
  using (true);

-- Insert: Only allow authenticated users to insert their own posts
create policy "Authenticated users can insert their own journey posts"
  on public.journey_posts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Update: Only allow the post owner to update their post
create policy "Post owners can update their journey posts"
  on public.journey_posts
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Delete: Only allow the post owner to delete their post
create policy "Post owners can delete their journey posts"
  on public.journey_posts
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. Indexes for performance
create index if not exists idx_journey_posts_user_id on public.journey_posts(user_id);
create index if not exists idx_journey_posts_journey_type on public.journey_posts(journey_type);
create index if not exists idx_journey_posts_created_at on public.journey_posts(created_at);

-- 5. Triggers for updated_at
create or replace function public.update_journey_post_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_journey_post_updated_at
before update on public.journey_posts
for each row
execute function public.update_journey_post_updated_at();

-- End of migration
