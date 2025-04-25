# Avolve Platform Database Schema Documentation

This document provides a comprehensive overview of the Avolve platform's database schema, including tables, relationships, and key functions.

## Overview

The Avolve platform uses a PostgreSQL database managed through Supabase, with Row Level Security (RLS) policies to ensure data protection. The schema is designed around the core concepts of the Supercivilization ecosystem:

- User profiles and authentication
- Feature flags and progression
- Token economy
- Invitation system
- Analytics and metrics

## Inventory, Schema, and RLS

This file now serves as the single source of truth for:
- Table/entity inventory (see below)
- Schema details (see table sections)
- RLS and security policies (see dedicated section)

For visual ERDs, see `diagrams.md`.

## Table Inventory

### profiles

Stores user profile information.

| Column               | Type        | Description                               |
| -------------------- | ----------- | ----------------------------------------- |
| id                   | uuid        | Primary key, references auth.users.id     |
| username             | text        | Unique username                           |
| display_name         | text        | User's display name                       |
| avatar_url           | text        | URL to user's avatar image                |
| bio                  | text        | User's biography                          |
| email                | text        | User's email address                      |
| is_admin             | boolean     | Whether the user is an admin              |
| onboarding_completed | boolean     | Whether the user has completed onboarding |
| created_at           | timestamptz | When the profile was created              |
| updated_at           | timestamptz | When the profile was last updated         |

### feature_flags

Stores feature flag definitions and configurations.

| Column             | Type        | Description                               |
| ------------------ | ----------- | ----------------------------------------- |
| id                 | uuid        | Primary key                               |
| key                | text        | Unique feature key                        |
| name               | text        | Display name of the feature               |
| description        | text        | Description of the feature                |
| enabled_by_default | boolean     | Whether the feature is enabled by default |
| requires_tokens    | jsonb       | Token requirements to unlock the feature  |
| created_at         | timestamptz | When the feature flag was created         |
| updated_at         | timestamptz | When the feature flag was last updated    |

### user_features

Stores which features are enabled for each user.

| Column      | Type        | Description                                  |
| ----------- | ----------- | -------------------------------------------- |
| id          | uuid        | Primary key                                  |
| user_id     | uuid        | References profiles.id                       |
| feature_key | text        | References feature_flags.key                 |
| enabled     | boolean     | Whether the feature is enabled for this user |
| unlocked_at | timestamptz | When the feature was unlocked                |
| created_at  | timestamptz | When the record was created                  |
| updated_at  | timestamptz | When the record was last updated             |

### tokens

Stores token definitions.

| Column      | Type        | Description                     |
| ----------- | ----------- | ------------------------------- |
| id          | uuid        | Primary key                     |
| token_type  | text        | Unique token type identifier    |
| name        | text        | Display name of the token       |
| description | text        | Description of the token        |
| icon        | text        | Icon identifier for the token   |
| created_at  | timestamptz | When the token was created      |
| updated_at  | timestamptz | When the token was last updated |

### token_ownership

Stores user token balances.

| Column     | Type        | Description                      |
| ---------- | ----------- | -------------------------------- |
| id         | uuid        | Primary key                      |
| user_id    | uuid        | References profiles.id           |
| token_type | text        | References tokens.token_type     |
| balance    | numeric     | Current token balance            |
| created_at | timestamptz | When the record was created      |
| updated_at | timestamptz | When the record was last updated |

### token_flows

Tracks token transactions.

| Column      | Type        | Description                                                  |
| ----------- | ----------- | ------------------------------------------------------------ |
| id          | uuid        | Primary key                                                  |
| user_id     | uuid        | References profiles.id                                       |
| token_type  | text        | References tokens.token_type                                 |
| amount      | numeric     | Transaction amount (positive for earned, negative for spent) |
| description | text        | Description of the transaction                               |
| metadata    | jsonb       | Additional metadata about the transaction                    |
| created_at  | timestamptz | When the transaction occurred                                |

### invitations

Stores invitation codes for new users.

| Column     | Type        | Description                                        |
| ---------- | ----------- | -------------------------------------------------- |
| id         | uuid        | Primary key                                        |
| code       | text        | Unique invitation code                             |
| email      | text        | Email the invitation was sent to                   |
| created_by | uuid        | References profiles.id of the inviter              |
| max_uses   | integer     | Maximum number of times the invitation can be used |
| uses       | integer     | Current number of uses                             |
| expires_at | timestamptz | When the invitation expires                        |
| metadata   | jsonb       | Additional metadata about the invitation           |
| created_at | timestamptz | When the invitation was created                    |
| updated_at | timestamptz | When the invitation was last updated               |

### metrics

Stores analytics data.

| Column       | Type        | Description                                  |
| ------------ | ----------- | -------------------------------------------- |
| id           | uuid        | Primary key                                  |
| user_id      | uuid        | References profiles.id                       |
| metric_type  | enum        | Type of metric (engagement, retention, etc.) |
| metric_value | numeric     | Numeric value of the metric                  |
| event        | text        | Event name                                   |
| notes        | text        | Additional notes                             |
| metadata     | jsonb       | Additional metadata                          |
| timestamp    | timestamptz | When the event occurred                      |
| recorded_at  | timestamptz | When the metric was recorded                 |
| created_at   | timestamptz | When the record was created                  |
| updated_at   | timestamptz | When the record was last updated             |

### user_onboarding

Tracks user onboarding progress.

| Column       | Type        | Description                      |
| ------------ | ----------- | -------------------------------- |
| id           | uuid        | Primary key                      |
| user_id      | uuid        | References profiles.id           |
| step         | text        | Current onboarding step          |
| progress     | jsonb       | Detailed progress information    |
| completed    | boolean     | Whether onboarding is completed  |
| completed_at | timestamptz | When onboarding was completed    |
| created_at   | timestamptz | When the record was created      |
| updated_at   | timestamptz | When the record was last updated |

## Security & RLS Policies

- RLS is enabled on all tables by default.
- Policies are granular: one per action (select, insert, update, delete) and per role (`anon`, `authenticated`).
- All policies are documented in migration files.
- Only authenticated users can select from sensitive tables; only admins can insert/update/delete where appropriate.
- All admin actions (create/mint/transfer tokens, promote phases) are RBAC enforced.

## Data Flow

- All admin and onboarding UI components fetch and mutate data directly via Supabase queries.
- No hardcoded or simulated data is used in any user-facing or admin feature.
- All analytics, onboarding, and admin flows are live and production-grade.

## Migrations & Best Practices

- All migration files are timestamped and well-commented.
- RLS is enforced in every new table creation.
- Policies include rationale and are never combined across roles/actions.
- All functions use `SECURITY INVOKER` and `set search_path = ''`.
- Explicit typing for inputs/outputs.
- Prefer `IMMUTABLE` or `STABLE` unless side effects are required.
- Triggers are documented with their purpose and policy.

## Supabase Extensions

- Notable: `pgjwt`, `pg_graphql`, `pg_stat_monitor`, `pgaudit`, `timescaledb`

## How to Contribute

See `contributing.md` for guidelines.

## Key Functions

### is_feature_enabled

Checks if a feature is enabled for a user.

```sql
create or replace function public.is_feature_enabled(
  p_feature_key text,
  p_user_id uuid default auth.uid()
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_enabled boolean;
begin
  -- Check if the user has this feature explicitly enabled
  select enabled into v_enabled
  from public.user_features
  where user_id = p_user_id and feature_key = p_feature_key;

  -- If found, return the value
  if found then
    return v_enabled;
  end if;

  -- Otherwise, check if the feature is enabled by default
  select enabled_by_default into v_enabled
  from public.feature_flags
  where key = p_feature_key;

  -- Return default value or false if not found
  return coalesce(v_enabled, false);
end;
$$;
```

### check_feature_unlock_conditions

Checks if a user meets the conditions to unlock a feature.

```sql
create or replace function public.check_feature_unlock_conditions(
  p_feature_key text,
  p_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_requires_tokens jsonb;
  v_token_type text;
  v_required_amount numeric;
  v_current_balance numeric;
  v_result jsonb := jsonb_build_object('can_unlock', true);
  v_token_requirements jsonb := '{}'::jsonb;
begin
  -- Get token requirements for the feature
  select requires_tokens into v_requires_tokens
  from public.feature_flags
  where key = p_feature_key;

  -- If no token requirements, user can unlock
  if v_requires_tokens is null or v_requires_tokens = '{}'::jsonb then
    return jsonb_build_object(
      'can_unlock', true,
      'requirements', '{}'::jsonb
    );
  end if;

  -- Check each token requirement
  for v_token_type, v_required_amount in select * from jsonb_each_text(v_requires_tokens)
  loop
    -- Get user's current balance for this token
    select balance into v_current_balance
    from public.token_ownership
    where user_id = p_user_id and token_type = v_token_type;

    -- If user doesn't have this token, set balance to 0
    v_current_balance := coalesce(v_current_balance, 0);

    -- Add to token requirements
    v_token_requirements := v_token_requirements ||
      jsonb_build_object(
        v_token_type,
        jsonb_build_object(
          'required', v_required_amount::numeric,
          'current', v_current_balance,
          'sufficient', v_current_balance >= v_required_amount::numeric
        )
      );

    -- Check if user has enough of this token
    if v_current_balance < v_required_amount::numeric then
      v_result := jsonb_build_object('can_unlock', false);
    end if;
  end loop;

  -- Return result with requirements
  return v_result || jsonb_build_object('requirements', v_token_requirements);
end;
$$;
```

### unlock_feature

Unlocks a feature for a user if they meet the requirements.

```sql
create or replace function public.unlock_feature(
  p_feature_key text,
  p_user_id uuid default auth.uid()
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_unlock_check jsonb;
  v_token_type text;
  v_required_amount numeric;
  v_requires_tokens jsonb;
  v_result jsonb;
begin
  -- Check if feature is already unlocked
  if public.is_feature_enabled(p_feature_key, p_user_id) then
    return jsonb_build_object(
      'success', true,
      'message', 'Feature is already unlocked',
      'feature_key', p_feature_key
    );
  end if;

  -- Check unlock conditions
  v_unlock_check := public.check_feature_unlock_conditions(p_feature_key, p_user_id);

  -- If can't unlock, return error
  if not (v_unlock_check->>'can_unlock')::boolean then
    return jsonb_build_object(
      'success', false,
      'message', 'Unlock conditions not met',
      'feature_key', p_feature_key,
      'requirements', v_unlock_check->'requirements'
    );
  end if;

  -- Get token requirements
  select requires_tokens into v_requires_tokens
  from public.feature_flags
  where key = p_feature_key;

  -- Spend tokens if required
  if v_requires_tokens is not null and v_requires_tokens != '{}'::jsonb then
    for v_token_type, v_required_amount in select * from jsonb_each_text(v_requires_tokens)
    loop
      -- Record token expenditure
      insert into public.token_flows (
        user_id,
        token_type,
        amount,
        description,
        metadata
      ) values (
        p_user_id,
        v_token_type,
        -1 * v_required_amount::numeric,
        'Unlocked feature: ' || p_feature_key,
        jsonb_build_object('feature_key', p_feature_key)
      );

      -- Update token balance
      update public.token_ownership
      set balance = balance - v_required_amount::numeric
      where user_id = p_user_id and token_type = v_token_type;
    end loop;
  end if;

  -- Enable the feature for the user
  insert into public.user_features (
    user_id,
    feature_key,
    enabled,
    unlocked_at
  ) values (
    p_user_id,
    p_feature_key,
    true,
    now()
  )
  on conflict (user_id, feature_key)
  do update set
    enabled = true,
    unlocked_at = now(),
    updated_at = now();

  -- Return success
  return jsonb_build_object(
    'success', true,
    'message', 'Feature unlocked successfully',
    'feature_key', p_feature_key,
    'unlocked_at', now()
  );
end;
$$;
```

### create_invitation

Creates an invitation code.

```sql
create or replace function public.create_invitation(
  p_email text,
  p_max_uses integer,
  p_expires_in interval,
  p_metadata jsonb default '{}'
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_invitation_id uuid;
  v_invitation_code text;
  v_token_cost integer := 10; -- Cost in GEN tokens to create an invitation
  v_current_balance numeric;
begin
  -- Get current user ID
  v_user_id := auth.uid();

  -- Check if user is authenticated
  if v_user_id is null then
    return jsonb_build_object(
      'success', false,
      'message', 'Authentication required'
    );
  end if;

  -- Check if user has enough GEN tokens
  select balance into v_current_balance
  from public.token_ownership
  where user_id = v_user_id and token_type = 'GEN';

  if v_current_balance is null or v_current_balance < v_token_cost then
    return jsonb_build_object(
      'success', false,
      'message', 'Not enough GEN tokens to create invitation',
      'required', v_token_cost,
      'current', coalesce(v_current_balance, 0)
    );
  end if;

  -- Generate invitation code
  v_invitation_code := 'INV-' || upper(substring(md5(random()::text) for 6));

  -- Create invitation
  insert into public.invitations (
    code,
    email,
    created_by,
    max_uses,
    uses,
    expires_at,
    metadata
  ) values (
    v_invitation_code,
    p_email,
    v_user_id,
    p_max_uses,
    0,
    now() + p_expires_in,
    p_metadata
  )
  returning id into v_invitation_id;

  -- Spend tokens
  insert into public.token_flows (
    user_id,
    token_type,
    amount,
    description,
    metadata
  ) values (
    v_user_id,
    'GEN',
    -1 * v_token_cost,
    'Created invitation: ' || v_invitation_code,
    jsonb_build_object('invitation_id', v_invitation_id)
  );

  -- Update token balance
  update public.token_ownership
  set balance = balance - v_token_cost
  where user_id = v_user_id and token_type = 'GEN';

  -- Return success
  return jsonb_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'code', v_invitation_code,
    'expires_at', now() + p_expires_in
  );
end;
$$;
```

## Relationships

- `profiles.id` → `auth.users.id` (One-to-one)
- `user_features.user_id` → `profiles.id` (Many-to-one)
- `user_features.feature_key` → `feature_flags.key` (Many-to-one)
- `token_ownership.user_id` → `profiles.id` (Many-to-one)
- `token_ownership.token_type` → `tokens.token_type` (Many-to-one)
- `token_flows.user_id` → `profiles.id` (Many-to-one)
- `token_flows.token_type` → `tokens.token_type` (Many-to-one)
- `invitations.created_by` → `profiles.id` (Many-to-one)
- `metrics.user_id` → `profiles.id` (Many-to-one)
- `user_onboarding.user_id` → `profiles.id` (One-to-one)

## Row Level Security (RLS) Policies

All tables have RLS policies to ensure data security:

- Users can only read/write their own data
- Admins can read/write all data
- Some tables have public read access for specific columns

Example RLS policy for the `profiles` table:

```sql
-- Users can read their own profile
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- Users can update their own profile
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Admins can read all profiles
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);

-- Admins can update all profiles
create policy "Admins can update all profiles"
on public.profiles
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);
```

## Indexes

Important indexes for performance optimization:

```sql
-- Profiles indexes
create index idx_profiles_username on public.profiles (username);
create index idx_profiles_email on public.profiles (email);

-- Feature flags indexes
create index idx_feature_flags_key on public.feature_flags (key);

-- User features indexes
create index idx_user_features_user_id on public.user_features (user_id);
create index idx_user_features_feature_key on public.user_features (feature_key);
create unique index idx_user_features_user_feature on public.user_features (user_id, feature_key);

-- Token ownership indexes
create index idx_token_ownership_user_id on public.token_ownership (user_id);
create index idx_token_ownership_token_type on public.token_ownership (token_type);
create unique index idx_token_ownership_user_token on public.token_ownership (user_id, token_type);

-- Token flows indexes
create index idx_token_flows_user_id on public.token_flows (user_id);
create index idx_token_flows_token_type on public.token_flows (token_type);
create index idx_token_flows_created_at on public.token_flows (created_at);

-- Invitations indexes
create index idx_invitations_code on public.invitations (code);
create index idx_invitations_email on public.invitations (email);
create index idx_invitations_created_by on public.invitations (created_by);

-- Metrics indexes
create index idx_metrics_user_id on public.metrics (user_id);
create index idx_metrics_metric_type on public.metrics (metric_type);
create index idx_metrics_event on public.metrics (event);
create index idx_metrics_timestamp on public.metrics (timestamp);
```

## Database Migrations

The Avolve platform uses Supabase migrations to manage database schema changes. Migrations are stored in the `supabase/migrations` directory and follow the naming convention `YYYYMMDDHHmmss_description.sql`.

## Best Practices

1. **Always use RLS policies** to secure data access
2. **Use functions with `security invoker`** to ensure proper permission checks
3. **Set `search_path = ''`** in functions to avoid SQL injection
4. **Use transactions** for operations that modify multiple tables
5. **Add appropriate indexes** for frequently queried columns
6. **Document schema changes** in migration files
7. **Use enum types** for columns with a fixed set of values
8. **Use triggers** for automatic timestamps and audit trails

## Database Monitoring

The Avolve platform uses the following queries for database monitoring:

```sql
-- Check table sizes
select
  schemaname,
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_size_pretty(pg_relation_size(relid)) as table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as index_size
from pg_catalog.pg_statio_user_tables
order by pg_total_relation_size(relid) desc;

-- Check index usage
select
  schemaname,
  relname as table_name,
  indexrelname as index_name,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
from pg_stat_user_indexes
order by idx_scan desc;

-- Check slow queries
select
  query,
  calls,
  total_time,
  mean_time,
  rows
from pg_stat_statements
order by mean_time desc
limit 10;
```

## Further Resources

- [Supabase Documentation](https://supabase.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Avolve API Documentation](./API_DOCUMENTATION.md)
- [Avolve Production Launch Checklist](./PRODUCTION_LAUNCH_CHECKLIST.md)

*Redundant database schema, inventory, and policy files have been merged here for clarity and maintainability.*
