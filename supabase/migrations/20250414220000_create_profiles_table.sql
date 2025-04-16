-- Migration: Create profiles table for user accounts
-- Author: Cascade AI
-- Timestamp: 2025-04-15T22:10:00Z
-- Purpose: Establish the core user profiles table for the Avolve platform. Enables RLS and best-practice policies.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_email text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Stores core user profile information for all registered users.';

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Allow SELECT/INSERT/UPDATE for the profile owner
create policy "select_own_profile" on public.profiles for select using (auth.uid() = id);
create policy "insert_own_profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update_own_profile" on public.profiles for update using (auth.uid() = id);

-- Allow admin/service_role full access
create policy "admin_full_access" on public.profiles for all to service_role using (true);

-- Add copious comments for future maintainers:
-- - Only profile owners can select, insert, or update their own profile.
-- - Admins (service_role) have full access for support and moderation.
-- - Extend with more granular policies as needed.

-- End of migration
