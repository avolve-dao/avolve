-- Migration: Create invitations table for invitation-only registration
-- Purpose: Enforce invitation-only sign-up for production
-- Created: 2025-04-15 04:57:46 UTC

-- Table: invitations
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  invite_code text unique,
  used boolean not null default false,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  invited_by uuid references auth.users(id)
);

-- Enable Row Level Security (RLS)
alter table public.invitations enable row level security;

-- Allow only admin role to insert/select/update/delete by default (customize as needed)
create policy "Allow admin full access" on public.invitations
  for all using (auth.role() = 'service_role');

-- Allow select for registration flow (customize for registration API security)
create policy "Allow select for registration" on public.invitations
  for select using (true);

-- Note: Adjust policies as needed for your workflow and security model.
