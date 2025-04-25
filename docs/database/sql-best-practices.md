# SQL Best Practices for Avolve

_Last updated: 2025-04-23_

This document outlines the SQL best practices and standards for the Avolve platform. Following these guidelines ensures security, performance, and maintainability of our database functions and migrations.

## Database Function Standards

All PostgreSQL functions in the Avolve database must adhere to these standards:

### 1. Security Model

#### Use `SECURITY INVOKER` by Default

Functions should run with the permissions of the user invoking the function, not the function creator:

```sql
create or replace function public.get_user_progress(p_user_id uuid)
returns jsonb
language plpgsql
security invoker  -- Always use SECURITY INVOKER
set search_path = ''
as $$
begin
  -- Function body
end;
$$;
```

Only use `SECURITY DEFINER` when absolutely necessary, and document the rationale:

```sql
-- SECURITY DEFINER used here because this function needs to access tables
-- that the invoking user doesn't have direct access to, specifically for
-- admin reporting purposes.
create or replace function admin.generate_user_report(...)
security definer
set search_path = ''
as $$
```

### 2. Search Path Safety

#### Always Set Empty Search Path

Every function must explicitly set an empty search path to prevent schema injection attacks:

```sql
create or replace function public.my_function(...)
returns ...
language plpgsql
security invoker
set search_path = ''  -- Always include this
as $$
```

#### Use Fully Qualified Names

Always use fully qualified names for all database objects:

```sql
-- Good: Fully qualified names
select * from public.profiles where id = p_user_id;

-- Bad: Unqualified names
select * from profiles where id = p_user_id;
```

### 3. Type Safety

#### Explicit Input and Output Types

Always specify explicit types for function parameters and return values:

```sql
-- Good: Explicit types
create or replace function public.get_token_balance(
  p_user_id uuid,
  p_token_type text
) returns numeric
as $$

-- Bad: Implicit types
create or replace function public.get_token_balance(p_user_id, p_token_type)
returns numeric
as $$
```

#### Use Appropriate Function Volatility

Declare functions with the appropriate volatility:

- `IMMUTABLE`: For functions that always return the same output for the same input and have no side effects
- `STABLE`: For functions that return the same output for the same input within a transaction but may change between transactions
- `VOLATILE` (default): For functions that can return different results on successive calls with the same arguments

```sql
create or replace function public.format_username(username text)
returns text
language sql
immutable  -- This function always returns the same result for the same input
set search_path = ''
as $$
  select lower(trim(username));
$$;
```

### 4. Error Handling

#### Comprehensive Error Handling

Include error handling in all functions:

```sql
create or replace function public.transfer_tokens(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount numeric,
  p_token_type text
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Validate inputs
  if p_amount <= 0 then
    raise exception 'Transfer amount must be positive';
  end if;

  -- Check if sender has sufficient balance
  if not exists (
    select 1 from public.token_balances
    where user_id = p_from_user_id
    and token_type = p_token_type
    and balance >= p_amount
  ) then
    raise exception 'Insufficient balance';
  end if;

  -- Perform transfer
  -- ...

  return true;
exception
  when others then
    -- Log error
    insert into public.error_logs (
      function_name,
      error_message,
      context
    ) values (
      'transfer_tokens',
      SQLERRM,
      jsonb_build_object(
        'from_user_id', p_from_user_id,
        'to_user_id', p_to_user_id,
        'amount', p_amount,
        'token_type', p_token_type
      )
    );
    return false;
end;
$$;
```

## Migration Standards

### 1. Naming and Documentation

#### Naming Convention

All migration files must follow this naming convention:

```
YYYYMMDDHHmmss_short_description.sql
```

Example: `20250423120000_add_token_transfer_function.sql`

#### Header Comments

Every migration file should include a header with:

```sql
-- Migration: Add token transfer function
-- Generated: 2025-04-23T12:00:00Z
-- Purpose: Create a function to safely transfer tokens between users with validation
-- Author: @avolve-dao
```

### 2. Row Level Security (RLS)

#### Enable RLS on All Tables

Every new table must have RLS enabled:

```sql
-- Create table
create table public.my_new_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  -- other columns
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.my_new_table enable row level security;
```

#### Create Granular Policies

Create separate policies for each operation and role:

```sql
-- Allow users to see only their own data
create policy "Users can view their own data" on public.my_new_table
  for select
  to authenticated
  using (user_id = auth.uid());

-- Allow users to insert their own data
create policy "Users can insert their own data" on public.my_new_table
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Allow admins to see all data
create policy "Admins can view all data" on public.my_new_table
  for select
  to service_role
  using (true);
```

### 3. Audit Fields and Triggers

#### Include Audit Fields

All tables should include `created_at` and `updated_at` columns:

```sql
create table public.my_new_table (
  -- other columns
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### Create Update Trigger

Add a trigger to update the `updated_at` field:

```sql
-- Create trigger function if it doesn't exist
create or replace function public.update_updated_at()
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

-- Create trigger
create trigger update_my_new_table_updated_at
before update on public.my_new_table
for each row
execute function public.update_updated_at();
```

### 4. Indexes and Performance

#### Add Indexes on Foreign Keys

Always add indexes on foreign keys and frequently queried columns:

```sql
-- Add index on foreign key
create index idx_my_new_table_user_id on public.my_new_table(user_id);

-- Add index on frequently queried column
create index idx_my_new_table_status on public.my_new_table(status);

-- Add composite index for common query patterns
create index idx_my_new_table_user_status on public.my_new_table(user_id, status);
```

## Testing and Validation

### 1. Local Testing

Always test migrations locally before applying to production:

```bash
# Run migration locally
supabase db reset
supabase migration up

# Verify the changes
supabase db dump
```

### 2. Idempotent Migrations

Make migrations idempotent when possible:

```sql
-- Check if function exists before creating
create or replace function public.my_function(...)
...

-- Check if table exists before creating
create table if not exists public.my_table (...)
...

-- Check if index exists before creating
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where indexname = 'idx_my_table_column'
  ) then
    create index idx_my_table_column on public.my_table(column);
  end if;
end
$$;
```

## Examples

### Good Function Example

```sql
/**
 * Get user token balance
 *
 * Returns the current balance of a specific token type for a user.
 *
 * @param p_user_id - The user's ID
 * @param p_token_type - The token type to check
 * @returns The token balance as a numeric value
 */
create or replace function public.get_token_balance(
  p_user_id uuid,
  p_token_type text
)
returns numeric
language plpgsql
security invoker
set search_path = ''
stable
as $$
declare
  v_balance numeric;
begin
  -- Get the user's token balance
  select coalesce(sum(amount), 0)
  into v_balance
  from public.tokens
  where user_id = p_user_id
  and token_type = p_token_type;

  return v_balance;
exception
  when others then
    -- Log error and return 0
    insert into public.error_logs (
      function_name,
      error_message,
      context
    ) values (
      'get_token_balance',
      SQLERRM,
      jsonb_build_object(
        'user_id', p_user_id,
        'token_type', p_token_type
      )
    );
    return 0;
end;
$$;
```

### Good Migration Example

```sql
-- Migration: Add token transfer function and audit log
-- Generated: 2025-04-23T12:00:00Z
-- Purpose: Create a function to safely transfer tokens between users with validation
-- Author: @avolve-dao

-- 1. Create token transfer logs table
create table if not exists public.token_transfer_logs (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users(id),
  to_user_id uuid references auth.users(id) not null,
  token_type text not null,
  amount numeric not null,
  status text not null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Enable RLS
alter table public.token_transfer_logs enable row level security;

-- 3. Create RLS policies
create policy "Users can view their own transfers" on public.token_transfer_logs
  for select
  to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

create policy "Service role can view all transfers" on public.token_transfer_logs
  for select
  to service_role
  using (true);

-- 4. Add indexes
create index if not exists idx_token_transfer_logs_from_user_id
  on public.token_transfer_logs(from_user_id);
create index if not exists idx_token_transfer_logs_to_user_id
  on public.token_transfer_logs(to_user_id);
create index if not exists idx_token_transfer_logs_token_type
  on public.token_transfer_logs(token_type);
create index if not exists idx_token_transfer_logs_created_at
  on public.token_transfer_logs(created_at);

-- 5. Create updated_at trigger
create trigger update_token_transfer_logs_updated_at
before update on public.token_transfer_logs
for each row
execute function public.update_updated_at();

-- 6. Create token transfer function
create or replace function public.transfer_tokens(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_amount numeric,
  p_token_type text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_log_id uuid;
  v_result jsonb;
begin
  -- Validate inputs
  if p_amount <= 0 then
    insert into public.token_transfer_logs (
      from_user_id, to_user_id, token_type, amount, status, error_message
    ) values (
      p_from_user_id, p_to_user_id, p_token_type, p_amount, 'failed', 'Amount must be positive'
    ) returning id into v_log_id;

    return jsonb_build_object(
      'success', false,
      'error', 'Amount must be positive',
      'log_id', v_log_id
    );
  end if;

  -- Check if sender has sufficient balance
  if p_from_user_id is not null and (
    select coalesce(sum(amount), 0) from public.tokens
    where user_id = p_from_user_id and token_type = p_token_type
  ) < p_amount then
    insert into public.token_transfer_logs (
      from_user_id, to_user_id, token_type, amount, status, error_message
    ) values (
      p_from_user_id, p_to_user_id, p_token_type, p_amount, 'failed', 'Insufficient balance'
    ) returning id into v_log_id;

    return jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance',
      'log_id', v_log_id
    );
  end if;

  -- Create transfer log
  insert into public.token_transfer_logs (
    from_user_id, to_user_id, token_type, amount, status
  ) values (
    p_from_user_id, p_to_user_id, p_token_type, p_amount, 'pending'
  ) returning id into v_log_id;

  -- Deduct tokens from sender (if not a system grant)
  if p_from_user_id is not null then
    insert into public.tokens (
      user_id, token_type, amount, source, reference_id
    ) values (
      p_from_user_id, p_token_type, -p_amount, 'transfer_out', v_log_id::text
    );
  end if;

  -- Add tokens to recipient
  insert into public.tokens (
    user_id, token_type, amount, source, reference_id
  ) values (
    p_to_user_id, p_token_type, p_amount,
    case when p_from_user_id is null then 'system_grant' else 'transfer_in' end,
    v_log_id::text
  );

  -- Update log status
  update public.token_transfer_logs
  set status = 'completed'
  where id = v_log_id;

  return jsonb_build_object(
    'success', true,
    'log_id', v_log_id
  );
exception
  when others then
    -- Update log with error
    update public.token_transfer_logs
    set status = 'failed', error_message = SQLERRM
    where id = v_log_id;

    return jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'log_id', v_log_id
    );
end;
$$;

-- End of migration
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.io/docs)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
