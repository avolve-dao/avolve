-- Migration: Create token_ownership table for live token admin features
-- Created: 2025-04-16T21:32:58 UTC
-- Purpose: Ensure codebase and database are in sync for live, real-world token management

-- Table: public.token_ownership
-- Tracks which user owns which tokens and their balances

create table if not exists public.token_ownership (
  token_id uuid references public.tokens(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  balance numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (token_id, user_id)
);

-- Enable Row Level Security (RLS) for security best practices
alter table public.token_ownership enable row level security;

-- RLS Policy: Allow select for authenticated users (adjust as needed)
create policy "Allow authenticated select on token_ownership" on public.token_ownership
  for select
  to authenticated
  using (true);

-- RLS Policy: Allow insert for admins only
create policy "Allow admin insert on token_ownership" on public.token_ownership
  for insert
  to authenticated
  with check (exists (
    select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'
  ));

-- RLS Policy: Allow update for admins only
create policy "Allow admin update on token_ownership" on public.token_ownership
  for update
  to authenticated
  using (exists (
    select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'
  ));

-- RLS Policy: Allow delete for admins only
create policy "Allow admin delete on token_ownership" on public.token_ownership
  for delete
  to authenticated
  using (exists (
    select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'
  ));

-- Index for fast lookup
create index if not exists idx_token_ownership_user_id on public.token_ownership(user_id);
create index if not exists idx_token_ownership_token_id on public.token_ownership(token_id);
