-- Migration: Create user_balances table for tracking user token balances
-- Purpose: Enables type-safe queries and robust RBAC for token balances
-- Created: 2025-04-16 17:19:00 UTC

-- 1. Create the user_balances table
create table public.user_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  token_id uuid references public.tokens(id) not null,
  balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_balances enable row level security;

-- 3. RLS Policies
-- Allow SELECT for authenticated users (users can only see their own balances)
create policy "Select own balances (authenticated)" on public.user_balances
  for select using (auth.uid() = user_id);

-- Allow INSERT for authenticated users (users can only insert their own balances)
create policy "Insert own balances (authenticated)" on public.user_balances
  for insert with check (auth.uid() = user_id);

-- Allow UPDATE for authenticated users (users can only update their own balances)
create policy "Update own balances (authenticated)" on public.user_balances
  for update using (auth.uid() = user_id);

-- Allow DELETE for authenticated users (users can only delete their own balances)
create policy "Delete own balances (authenticated)" on public.user_balances
  for delete using (auth.uid() = user_id);

-- Allow SELECT for anon users (if needed, otherwise comment out)
-- create policy "Select balances (anon)" on public.user_balances
--   for select using (true);

-- Index for performance
create index on public.user_balances(user_id, token_id);

-- End of migration
