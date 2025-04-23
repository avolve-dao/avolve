-- 20250420225445_create_feature_flags_table.sql
-- Purpose: Create a feature_flags table to support feature flagging in the app and unblock failing tests.
-- Affects: public.feature_flags
-- Notes: Enables RLS, sets up granular policies for select/insert/update/delete for anon and authenticated roles.

-- 1. Create the feature_flags table
create table if not exists public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- the flag key, e.g. 'new_dashboard'
  value jsonb not null,     -- flag value (can be boolean, rollout % etc)
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.feature_flags enable row level security;

-- 3. RLS Policies
-- Select: allow all (for public feature flagging)
create policy "Allow select for anon" on public.feature_flags
  for select using (true);

create policy "Allow select for authenticated" on public.feature_flags
  for select using (true);

-- Insert: only for authenticated users
create policy "Allow insert for authenticated" on public.feature_flags
  for insert to authenticated
  with check (auth.role() = 'authenticated');

-- Update: only for authenticated users
create policy "Allow update for authenticated" on public.feature_flags
  for update to authenticated using (auth.role() = 'authenticated');

-- Delete: only for authenticated users
create policy "Allow delete for authenticated" on public.feature_flags
  for delete to authenticated using (auth.role() = 'authenticated');

-- 4. Trigger to update updated_at on change
create or replace function public.update_feature_flags_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger update_feature_flags_updated_at_trigger
before update on public.feature_flags
for each row
execute function public.update_feature_flags_updated_at();
