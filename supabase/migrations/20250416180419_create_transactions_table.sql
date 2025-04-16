-- Migration: Create transactions table for token earning analytics
-- Purpose: Track all token transactions for users, enabling analytics and earning rate calculations
-- Created: 2025-04-16 18:04:19 UTC

-- Table creation
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('earn', 'spend', 'transfer')),
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.transactions enable row level security;

-- RLS: Only allow users to see their own transactions (either as sender or receiver)
create policy "Users can view their own transactions" on public.transactions
  for select using (
    auth.uid() = from_user_id or auth.uid() = to_user_id
  );

-- RLS: Only allow users to insert transactions for themselves as sender or receiver
create policy "Users can insert their own transactions" on public.transactions
  for insert with check (
    auth.uid() = from_user_id or auth.uid() = to_user_id
  );

-- RLS: Only allow users to update their own transactions
create policy "Users can update their own transactions" on public.transactions
  for update using (
    auth.uid() = from_user_id or auth.uid() = to_user_id
  );

-- RLS: Only allow users to delete their own transactions
create policy "Users can delete their own transactions" on public.transactions
  for delete using (
    auth.uid() = from_user_id or auth.uid() = to_user_id
  );

-- RLS: Admins can manage all transactions (if you have an admin role, add a policy here)
-- (Add a separate policy for service_role or admin if needed)

-- Index for faster queries
create index if not exists idx_transactions_user on public.transactions (from_user_id, to_user_id, created_at);

-- End of migration
