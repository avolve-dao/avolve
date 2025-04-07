-- Main schema file for the Avolve platform
-- This file organizes the database structure according to Supabase's declarative schema approach

-- Set up extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_graphql";
create extension if not exists "pg_stat_statements";
create extension if not exists "pgcrypto";

-- Set up schemas
create schema if not exists public;
create schema if not exists auth;
create schema if not exists extensions;
create schema if not exists storage;

-- Import public schema
\ir public/tables.sql
\ir public/policies.sql
\ir public/functions.sql

-- Set up default privileges
alter default privileges in schema public grant all on tables to postgres, service_role;
alter default privileges in schema public grant all on functions to postgres, service_role;
alter default privileges in schema public grant all on sequences to postgres, service_role;

-- Set up public schema permissions
grant usage on schema public to anon, authenticated;

-- Ensure RLS is enabled
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.tokens enable row level security;
alter table public.user_tokens enable row level security;
alter table public.token_transactions enable row level security;
alter table public.pillars enable row level security;
alter table public.sections enable row level security;
alter table public.components enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_activity_logs enable row level security;
