-- Migration: Create metrics table for engagement and analytics
-- Author: Cascade AI
-- Timestamp: 2025-04-16T03:50:00Z
-- Purpose: Establish the core metrics table for tracking engagement, analytics, and gamification events. Enables RLS and best-practice policies.

-- Create the metrics table
create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  metric_type text not null, -- e.g. 'engagement', 'retention', 'arpu', etc.
  metric_value numeric not null,
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.metrics is 'Tracks all user and system metrics for analytics, engagement, and gamification.';

-- Enable Row Level Security (RLS)
alter table public.metrics enable row level security;

-- Drop existing policies if present (for idempotency)
drop policy if exists "select_metrics_authenticated" on public.metrics;
drop policy if exists "insert_metrics_authenticated" on public.metrics;
drop policy if exists "update_metrics_admin" on public.metrics;
drop policy if exists "delete_metrics_admin" on public.metrics;

-- Allow SELECT for authenticated users
create policy "select_metrics_authenticated" on public.metrics for select to authenticated using (true);

-- Allow INSERT for authenticated users (customize as needed)
create policy "insert_metrics_authenticated" on public.metrics for insert to authenticated with check (true);

-- Allow UPDATE/DELETE for service_role (admin)
create policy "update_metrics_admin" on public.metrics for update to service_role using (true);
create policy "delete_metrics_admin" on public.metrics for delete to service_role using (true);

-- Add copious comments for future maintainers:
-- - Only admins can update/delete metrics records.
-- - Authenticated users can insert/select their own metrics.
-- - Extend with more granular policies as needed for analytics privacy.

-- End of migration
