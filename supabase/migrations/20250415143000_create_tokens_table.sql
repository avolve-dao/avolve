-- Migration: Create tokens table for Avolve platform
-- Purpose: Define the core tokens table for tracking all token types, amounts, sources, and user associations
-- Created at: 2025-04-15T14:30:00Z

create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  token_type public.token_type not null, -- enum for type safety
  amount numeric not null check (amount >= 0),
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tokens is 'Tracks all token balances, types, and sources for each user.';

-- Enable Row Level Security (RLS) for the tokens table
alter table public.tokens enable row level security;

-- Add indexes for performance
create index if not exists idx_tokens_user_id on public.tokens(user_id);
create index if not exists idx_tokens_token_type on public.tokens(token_type);

-- Add copious comments for clarity and future audits
