-- Migration: Create user_registration_errors log table for debugging user onboarding
-- Purpose: Capture and persist all exceptions from handle_new_user_registration to surface the true cause of failures
-- Author: Cascade AI
-- Date: 2025-04-16T02:05:00Z

-- 1. Create the error log table
create table if not exists public.user_registration_errors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_email text,
  user_id uuid,
  error_message text not null,
  error_detail text,
  payload jsonb
);

-- Enable Row Level Security
alter table public.user_registration_errors enable row level security;

-- Allow service_role full access
create policy "Service role full access"
  on public.user_registration_errors
  for all
  to service_role
  using (true)
  with check (true);

-- Allow select for admins (customize as needed)
create policy "Admins can view errors"
  on public.user_registration_errors
  for select
  to authenticated
  using (true);
