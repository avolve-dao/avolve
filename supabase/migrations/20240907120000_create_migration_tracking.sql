-- Migration: Create Migration Tracking System
-- Purpose: Add tables and functions to track migrations and ensure proper versioning
-- Affected tables: Creates _migration_history table
-- Special considerations: This is a meta-migration that helps track other migrations

-- Create migration tracking table
create table if not exists public._migration_history (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  name text not null,
  applied_at timestamptz not null default now(),
  applied_by text not null,
  success boolean not null default true,
  rollback_version text,
  notes text
);

-- Enable Row Level Security
alter table public._migration_history enable row level security;

-- Create RLS policies for migration history
create policy "Admins can view migration history"
  on public._migration_history for select
  using (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

create policy "Admins can insert migration history"
  on public._migration_history for insert
  with check (auth.uid() in (
    select id from auth.users where raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Create function to record migration
create or replace function public.record_migration(
  p_version text,
  p_name text,
  p_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_migration_id uuid;
begin
  -- Validate inputs
  if p_version is null or p_name is null then
    raise exception 'Version and name are required';
  end if;
  
  -- Insert migration record
  insert into public._migration_history (
    version,
    name,
    applied_by,
    notes
  ) values (
    p_version,
    p_name,
    current_user,
    p_notes
  ) returning id into v_migration_id;
  
  return v_migration_id;
end;
$$;

-- Create function to check if migration has been applied
create or replace function public.is_migration_applied(
  p_version text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_exists boolean;
begin
  -- Check if migration exists
  select exists(
    select 1
    from public._migration_history
    where version = p_version
    and success = true
  ) into v_exists;
  
  return v_exists;
end;
$$;

-- Record this migration
select public.record_migration(
  '20240907120000',
  'create_migration_tracking',
  'Initial migration to create migration tracking system'
);

-- Rollback script (commented out until needed)
/*
-- To rollback this migration:
drop function if exists public.is_migration_applied(text);
drop function if exists public.record_migration(text, text, text);
drop table if exists public._migration_history;
*/
