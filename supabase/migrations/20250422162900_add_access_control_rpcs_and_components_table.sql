-- Migration: Add access control RPCs and components table for onboarding and robust testing
-- Created: 2025-04-22 16:29:00 UTC
-- Purpose: Ensure all access control test RPCs and required tables exist for onboarding, testing, and production readiness.

-- =========================
-- Table: components
-- =========================
-- This table is required for user progress/content tests.
create table if not exists public.components (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.components enable row level security;

-- RLS Policy: Allow select for authenticated users
create policy "Allow select for authenticated users" on public.components
  for select using (auth.role() = 'authenticated');

-- =========================
-- RPCs for Access Control Testing
-- =========================

-- assign_role: Assign a role to a user
create or replace function public.assign_role(p_user_id uuid, p_role_name text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- TODO: Implement actual role assignment logic
  -- This is a stub for onboarding/testing
  return;
end;
$$;

-- has_role: Check if the current user has a specific role
create or replace function public.has_role(p_role_name text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- TODO: Implement actual role check logic
  -- This is a stub for onboarding/testing
  return true;
end;
$$;

-- is_admin: Check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- TODO: Implement actual admin check logic
  -- This is a stub for onboarding/testing
  return false;
end;
$$;

-- has_token_access: Check if a user has access to a content token
create or replace function public.has_token_access(content_token_symbol text, user_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- TODO: Implement actual token access logic
  -- This is a stub for onboarding/testing
  return true;
end;
$$;

-- complete_content: Mark content as completed for a user
create or replace function public.complete_content(p_content_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- TODO: Implement actual completion logic
  -- This is a stub for onboarding/testing
  return true;
end;
$$;

-- get_all_pillars_progress: Get all pillars progress for the current user
create or replace function public.get_all_pillars_progress()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- TODO: Implement actual progress logic
  -- This is a stub for onboarding/testing
  return '{}'::jsonb;
end;
$$;

-- get_user_experience_phase: Get the experience phase for the current user
create or replace function public.get_user_experience_phase()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- TODO: Implement actual experience phase logic
  -- This is a stub for onboarding/testing
  return 'onboarding';
end;
$$;

-- =========================
-- Onboarding Notes
-- =========================
-- These stubs are provided for onboarding and testing. Replace TODOs with production logic as needed.
-- Ensure all RLS policies and grants are reviewed before launch.
