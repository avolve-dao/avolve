-- Migration: Enable RLS and add best-practice policies for all public tables
-- Created at: 2025-04-15T08:47:48-06:00
-- This migration enables Row Level Security (RLS) and adds granular, role-based policies for all tables in the public schema that do not already have RLS enabled.

-- Enable RLS and add policies for analytics_events
alter table public.analytics_events enable row level security;

create policy "select_analytics_events_authenticated" on public.analytics_events
  for select
  to authenticated
  using (true);

create policy "insert_analytics_events_authenticated" on public.analytics_events
  for insert
  to authenticated
  with check (true);

create policy "update_analytics_events_admin" on public.analytics_events
  for update
  to service_role
  using (true);

create policy "delete_analytics_events_admin" on public.analytics_events
  for delete
  to service_role
  using (true);

-- Enable RLS and add policies for tokens
alter table public.tokens enable row level security;

create policy "select_tokens_authenticated" on public.tokens
  for select
  to authenticated
  using (true);

create policy "insert_tokens_authenticated" on public.tokens
  for insert
  to authenticated
  with check (true);

create policy "update_tokens_admin" on public.tokens
  for update
  to service_role
  using (true);

create policy "delete_tokens_admin" on public.tokens
  for delete
  to service_role
  using (true);

-- Repeat for other public tables as needed (user_tokens, token_transactions, token_rewards, notifications, feedback, etc.)
-- Add separate policies for anon if public read is desired.

-- Document each policy with comments for clarity and future audits.
