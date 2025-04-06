-- Migration: create_safe_migration_functions
-- Description: Creates safe functions for common migration operations
-- Created at: 2025-04-06 10:57:56 UTC
-- Author: System

-- SECURITY NOTICE: The previous exec_sql function was removed due to SQL injection vulnerability
-- This file creates safer alternatives for specific migration operations

-- Function to safely add a column to a table if it doesn't exist
create or replace function public.safe_add_column(
  p_table_name text,
  p_schema_name text,
  p_column_name text,
  p_column_type text,
  p_column_default text default null,
  p_is_nullable boolean default true
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_column_exists boolean;
  v_sql text;
begin
  -- Check if column exists
  select exists(
    select 1 from information_schema.columns 
    where table_schema = p_schema_name
    and table_name = p_table_name
    and column_name = p_column_name
  ) into v_column_exists;
  
  -- Add column if it doesn't exist
  if not v_column_exists then
    v_sql := format('alter table %I.%I add column %I %s', 
                    p_schema_name, p_table_name, p_column_name, p_column_type);
    
    -- Add default if provided
    if p_column_default is not null then
      v_sql := v_sql || format(' default %s', p_column_default);
    end if;
    
    -- Add not null constraint if required
    if not p_is_nullable then
      v_sql := v_sql || ' not null';
    end if;
    
    execute v_sql;
  end if;
end;
$$;

-- Function to safely create an index if it doesn't exist
create or replace function public.safe_create_index(
  p_index_name text,
  p_table_name text,
  p_schema_name text,
  p_column_names text[],
  p_is_unique boolean default false
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_index_exists boolean;
  v_sql text;
  v_columns text;
begin
  -- Check if index exists
  select exists(
    select 1 from pg_indexes
    where schemaname = p_schema_name
    and tablename = p_table_name
    and indexname = p_index_name
  ) into v_index_exists;
  
  -- Create index if it doesn't exist
  if not v_index_exists then
    -- Convert array of column names to comma-separated string
    select string_agg(quote_ident(column_name), ', ')
    from unnest(p_column_names) as column_name
    into v_columns;
    
    -- Build SQL statement
    v_sql := format('create %s index %I on %I.%I (%s)',
                   case when p_is_unique then 'unique' else '' end,
                   p_index_name, p_schema_name, p_table_name, v_columns);
    
    execute v_sql;
  end if;
end;
$$;

-- Add comments for documentation
comment on function public.safe_add_column(text, text, text, text, text, boolean) is 
  'Safely adds a column to a table if it doesn''t exist. Uses SECURITY INVOKER to run with caller''s permissions.';

comment on function public.safe_create_index(text, text, text, text[], boolean) is 
  'Safely creates an index on a table if it doesn''t exist. Uses SECURITY INVOKER to run with caller''s permissions.';

-- Create policy to restrict access to authenticated users
revoke all on function public.safe_add_column(text, text, text, text, text, boolean) from public;
grant execute on function public.safe_add_column(text, text, text, text, text, boolean) to authenticated;

revoke all on function public.safe_create_index(text, text, text, text[], boolean) from public;
grant execute on function public.safe_create_index(text, text, text, text[], boolean) to authenticated;
