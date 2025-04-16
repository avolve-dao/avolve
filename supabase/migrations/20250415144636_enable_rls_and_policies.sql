-- Migration: Enable RLS and add best-practice policies for all public tables
-- Created at: 2025-04-15T08:46:36-06:00
-- This migration enables Row Level Security (RLS) and adds granular, role-based policies for all tables in the public schema that do not already have RLS enabled.

-- EXAMPLE: Replace <table_name> with actual table names as needed.

-- Enable RLS for metrics table
alter table public.metrics enable row level security;

-- [Deduplication] The following policies for metrics and profiles are already created in their table-creation migrations and should not be duplicated here.
-- Commented out to ensure idempotency and avoid migration errors.
-- create policy "select_metrics_authenticated" on public.metrics
--   for select
--   to authenticated
--   using (true);

-- create policy "insert_metrics_authenticated" on public.metrics
--   for insert
--   to authenticated
--   with check (true);

-- create policy "update_metrics_admin" on public.metrics
--   for update
--   to service_role
--   using (true);

-- create policy "delete_metrics_admin" on public.metrics
--   for delete
--   to service_role
--   using (true);

-- Repeat for other public tables as needed (tokens, analytics_events, etc.)
-- Add separate policies for anon if public read is desired.

-- Document each policy with comments for clarity and future audits.
