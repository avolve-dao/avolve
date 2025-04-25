-- Migration: Update metrics table
-- Generated: 2025-04-23T12:55:00Z
-- Purpose: Update the metrics table to support enhanced analytics
-- Author: @avolve-dao

/**
 * This migration updates the existing metrics table to add support
 * for event tracking and metadata storage for analytics.
 */

-- Add new columns to metrics table
alter table public.metrics 
  add column if not exists event text,
  add column if not exists timestamp timestamptz default now(),
  add column if not exists metadata jsonb default '{}'::jsonb;

-- Update existing columns with default values
update public.metrics
set event = metric_type::text,
    timestamp = recorded_at
where event is null;

-- Make event column not null after populating data
alter table public.metrics 
  alter column event set not null;

-- Add comment to table
comment on table public.metrics is 'Tracks user activity and system events for analytics';

-- Add comments to columns
comment on column public.metrics.id is 'Unique identifier for the metric';
comment on column public.metrics.event is 'Name of the event (e.g., login, recognition_sent)';
comment on column public.metrics.user_id is 'User who triggered the event, if applicable';
comment on column public.metrics.timestamp is 'When the event occurred';
comment on column public.metrics.metadata is 'Additional data about the event in JSON format';
comment on column public.metrics.created_at is 'When the record was created';

-- Create index for faster queries
create index if not exists idx_metrics_event on public.metrics(event);
create index if not exists idx_metrics_timestamp on public.metrics(timestamp);

-- Enable RLS if not already enabled
alter table public.metrics enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can insert their own metrics" on public.metrics;
drop policy if exists "Users can view their own metrics" on public.metrics;
drop policy if exists "Users can update their own metrics" on public.metrics;
drop policy if exists "Users can delete their own metrics" on public.metrics;
drop policy if exists "Admins can access all metrics" on public.metrics;

-- Create RLS policies
-- Only authenticated users can insert metrics
create policy "Users can insert their own metrics"
  on public.metrics
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only authenticated users can select their own metrics
create policy "Users can view their own metrics"
  on public.metrics
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Only authenticated users can update their own metrics
create policy "Users can update their own metrics"
  on public.metrics
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Only authenticated users can delete their own metrics
create policy "Users can delete their own metrics"
  on public.metrics
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Admin users can access all metrics (using admin table)
-- This assumes there's an admin_users table or similar
-- If not, this policy can be adjusted later
create policy "Service role can access all metrics"
  on public.metrics
  for all
  to service_role;
