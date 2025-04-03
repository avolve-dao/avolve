-- Migration: initial_schema
-- Description: Sets up the initial database schema for the Avolve application
-- Created at: 2025-04-03 19:19:54 UTC
-- Author: System

-- enable necessary extensions
create extension if not exists "uuid-ossp";

-- create profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- enable row level security
alter table public.profiles enable row level security;

-- create profile update function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

-- create trigger for new users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- create update_updated_at function
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- update the "updated_at" column on row modification
  new.updated_at := now();
  return new;
end;
$$;

-- create trigger for updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- create rls policies for profiles
-- policy for anon users to view profiles
create policy "Profiles are viewable by anonymous users"
  on public.profiles
  for select
  to anon
  using (true);

-- policy for authenticated users to view profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

-- policy for users to update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- comments for future reference
comment on table public.profiles is 'User profile information for the application';
comment on column public.profiles.id is 'References the auth.users uuid';
comment on column public.profiles.username is 'Unique username for the user';
comment on column public.profiles.avatar_url is 'URL to the user''s avatar image';
