-- Migration: Create tokens table for tracking user tokens and types
-- Purpose: Enables type-safe queries and robust RBAC for token management
-- Created: 2025-04-16 17:25:00 UTC

-- 1. Create the tokens table
drop table if exists public.tokens cascade;
create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  token_type public.token_type not null,
  amount numeric not null default 0,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.tokens enable row level security;

-- 3. RLS Policies
-- Allow SELECT for authenticated users (users can only see their own tokens)
create policy "Select own tokens (authenticated)" on public.tokens
  for select using (auth.uid() = user_id);

-- Allow INSERT for authenticated users (users can only insert their own tokens)
create policy "Insert own tokens (authenticated)" on public.tokens
  for insert with check (auth.uid() = user_id);

-- Allow UPDATE for authenticated users (users can only update their own tokens)
create policy "Update own tokens (authenticated)" on public.tokens
  for update using (auth.uid() = user_id);

-- Allow DELETE for authenticated users (users can only delete their own tokens)
create policy "Delete own tokens (authenticated)" on public.tokens
  for delete using (auth.uid() = user_id);

-- Index for performance
create index on public.tokens(user_id, token_type);

-- End of migration
