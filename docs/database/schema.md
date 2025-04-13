# Avolve Database Schema and Best Practices

Copyright © 2025 Avolve DAO. All rights reserved.

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Tables](#core-tables)
3. [Authentication](#authentication)
4. [Experience System](#experience-system)
5. [Token System](#token-system)
6. [Best Practices](#best-practices)
7. [Optimization](#optimization)

## Schema Overview

The Avolve database is built on PostgreSQL with Supabase extensions. It implements:

- Row Level Security (RLS)
- Real-time subscriptions
- Full-text search
- PostGIS for spatial data
- Vector embeddings for AI features

## Core Tables

### Users and Profiles

```sql
create table public.profiles (
  id uuid references auth.users primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

### Experience System

```sql
create type public.experience_phase as enum (
  'discovery',
  'onboarding',
  'scaffolding',
  'endgame'
);

create table public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  pillar text not null,
  phase experience_phase not null default 'discovery',
  progress integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, pillar)
);

-- Enable RLS
alter table public.user_progress enable row level security;

-- Create policies
create policy "Users can view own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);
```

## Authentication

### Custom Claims

```sql
create function public.get_custom_claims(user_id uuid)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  select 
    jsonb_build_object(
      'roles', array_agg(distinct role),
      'permissions', array_agg(distinct permission)
    )
  into result
  from public.user_roles ur
  join public.role_permissions rp on ur.role = rp.role
  where ur.user_id = get_custom_claims.user_id;
  
  return result;
end;
$$;
```

## Experience System

### Phase Transitions

```sql
create function public.transition_phase(
  p_user_id uuid,
  p_pillar text,
  p_new_phase experience_phase
)
returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  -- Validate current phase
  perform validate_phase_transition(p_user_id, p_pillar, p_new_phase);
  
  -- Update phase
  update public.user_progress
  set 
    phase = p_new_phase,
    updated_at = now()
  where 
    user_id = p_user_id 
    and pillar = p_pillar;
    
  -- Record transition
  insert into public.phase_transitions (
    user_id,
    pillar,
    from_phase,
    to_phase
  )
  values (
    p_user_id,
    p_pillar,
    (select phase from public.user_progress where user_id = p_user_id and pillar = p_pillar),
    p_new_phase
  );
end;
$$;
```

## Token System

### Token Operations

```sql
create function public.transfer_tokens(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount numeric,
  p_token_type text
)
returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  -- Check balance
  if not exists (
    select 1 
    from public.token_balances 
    where user_id = p_from_user_id 
    and token_type = p_token_type 
    and balance >= p_amount
  ) then
    raise exception 'Insufficient balance';
  end if;
  
  -- Perform transfer
  insert into public.token_transactions (
    from_user_id,
    to_user_id,
    amount,
    token_type
  )
  values (
    p_from_user_id,
    p_to_user_id,
    p_amount,
    p_token_type
  );
end;
$$;
```

## Best Practices

### 1. Security

- Always enable RLS on tables
- Use security invoker for functions
- Set search_path = '' to prevent SQL injection
- Use prepared statements
- Implement proper validation

### 2. Performance

- Create appropriate indexes
- Use materialized views for complex queries
- Implement efficient pagination
- Use proper data types
- Regular VACUUM and maintenance

### 3. Data Integrity

- Use foreign keys
- Implement CHECK constraints
- Use transactions for multi-step operations
- Add appropriate uniqueness constraints

## Optimization

### 1. Indexing Strategy

```sql
-- Create indexes for frequently queried columns
create index idx_user_progress_user_pillar 
  on public.user_progress (user_id, pillar);

create index idx_token_transactions_from_user 
  on public.token_transactions (from_user_id, created_at desc);
```

### 2. Materialized Views

```sql
create materialized view public.user_stats as
select 
  user_id,
  count(distinct pillar) as active_pillars,
  max(phase) as highest_phase,
  avg(progress) as avg_progress
from public.user_progress
group by user_id;

-- Refresh schedule
create function public.refresh_user_stats()
returns void
language plpgsql security definer
as $$
begin
  refresh materialized view concurrently public.user_stats;
end;
$$;
```

### 3. Partitioning

```sql
-- Partition large tables by date
create table public.activity_logs (
  id uuid primary key,
  user_id uuid references auth.users,
  action text,
  created_at timestamptz
) partition by range (created_at);

-- Create monthly partitions
create table activity_logs_y2025m01 partition of activity_logs
  for values from ('2025-01-01') to ('2025-02-01');
```

## Monitoring

### 1. Query Performance

```sql
-- Create extension for query analysis
create extension pg_stat_statements;

-- Monitor slow queries
select 
  query,
  calls,
  total_exec_time / calls as avg_exec_time,
  rows / calls as avg_rows
from pg_stat_statements
order by total_exec_time desc
limit 10;
```

### 2. Table Statistics

```sql
-- Monitor table sizes and bloat
select
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename) - pg_relation_size(schemaname || '.' || tablename)) as index_size
from pg_tables
where schemaname = 'public'
order by pg_total_relation_size(schemaname || '.' || tablename) desc;
```

## Backup and Recovery

### 1. Backup Strategy

```bash
# Daily backups
supabase db dump -f backup_$(date +%Y%m%d).sql

# Point-in-time recovery
supabase db restore backup_20250101.sql
```

### 2. Monitoring Backups

```sql
-- Monitor backup status
select
  pid,
  current_timestamp - xact_start as xact_age,
  query
from pg_stat_activity
where query like '%backup%'
  or query like '%pg_dump%';
```

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Database Migration Guide](/docs/database/migrations.md)
- [Performance Tuning Guide](/docs/database/performance.md)

## License

Copyright © 2025 Avolve DAO. All rights reserved.
