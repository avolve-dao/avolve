-- Migration: Create token_flows table for TokenVisualization
-- Purpose: Enables tracking and visualization of token movements between users
-- Created: 2025-04-22 15:20:24 UTC

-- 1. Create the token_flows table
create table public.token_flows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  source text not null,
  target text not null,
  amount numeric not null,
  token_type text not null,
  timestamp timestamp with time zone default now() not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.token_flows enable row level security;

-- 3. RLS Policies
-- Select: Allow authenticated users to read their own flows
create policy "Authenticated users can select their own token flows"
  on public.token_flows
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Select: Allow anon users to read no flows (for privacy)
create policy "Anon users cannot select token flows"
  on public.token_flows
  for select
  to anon
  using (false);

-- Insert: Only allow authenticated users to insert their own flows
create policy "Authenticated users can insert their own token flows"
  on public.token_flows
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Update: Only allow the flow owner to update their flow
create policy "Flow owners can update their token flows"
  on public.token_flows
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Delete: Only allow the flow owner to delete their flow
create policy "Flow owners can delete their token flows"
  on public.token_flows
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. Indexes for performance
create index if not exists idx_token_flows_user_id on public.token_flows(user_id);
create index if not exists idx_token_flows_token_type on public.token_flows(token_type);
create index if not exists idx_token_flows_timestamp on public.token_flows(timestamp);

-- End of migration
