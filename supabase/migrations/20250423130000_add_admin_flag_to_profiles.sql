-- Migration: Add admin flag to profiles
-- Generated: 2025-04-23T13:00:00Z
-- Purpose: Add an admin flag to the profiles table for role-based access control
-- Author: @avolve-dao

/**
 * This migration adds an is_admin boolean flag to the profiles table
 * to support role-based access control for administrative functions.
 */

-- Add is_admin column to profiles table
alter table public.profiles
  add column if not exists is_admin boolean default false;

-- Add comment to column
comment on column public.profiles.is_admin is 'Flag indicating if the user has admin privileges';

-- Create index for faster queries
create index if not exists idx_profiles_is_admin on public.profiles(is_admin);

-- Update RLS policies for admin-specific tables
-- For each admin-protected table, we'll create or update policies

-- Example for metrics table
drop policy if exists "Admins can access all metrics" on public.metrics;

create policy "Admins can access all metrics"
  on public.metrics
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- Create function to check if user is admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security invoker
set search_path = ''
stable
as $$
declare
  v_is_admin boolean;
begin
  select is_admin into v_is_admin
  from public.profiles
  where id = auth.uid();
  
  return coalesce(v_is_admin, false);
end;
$$;

-- Add comment to function
comment on function public.is_admin() is 'Checks if the current user has admin privileges';
