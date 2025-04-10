# Avolve Database Schema

This document provides an overview of the Avolve platform's database schema, focusing on the core tables, relationships, and Row Level Security (RLS) policies.

## Table of Contents

1. [Overview](#overview)
2. [Core Tables](#core-tables)
3. [Challenge System](#challenge-system)
4. [Invitation System](#invitation-system)
5. [Token System](#token-system)
6. [Row Level Security](#row-level-security)
7. [Database Functions](#database-functions)
8. [Developer Examples](#developer-examples)
9. [Performance Optimization](#performance-optimization)
10. [Table Partitioning](#table-partitioning)
11. [Maintenance Automation](#maintenance-automation)
12. [Monitoring System](#monitoring-system)

## Overview

The Avolve platform uses PostgreSQL via Supabase as its database backend. The schema follows these design principles:

- **Normalized Structure**: Tables are normalized to reduce redundancy
- **Row Level Security**: All tables have RLS policies to control access
- **Timestamps**: Most tables include `created_at` and `updated_at` columns
- **UUID Primary Keys**: All tables use UUID primary keys
- **Referential Integrity**: Foreign keys enforce relationships
- **Tesla's 3-6-9 Pattern**: Streak calculations follow Tesla's sacred geometry

## Core Tables

### Users and Profiles

- `auth.users`: Managed by Supabase Auth
- `public.profiles`: Extended user profile information
- `public.user_settings`: User-specific settings and preferences

## Challenge System

The challenge system implements Tesla's 3-6-9 pattern for streaks and rewards.

### daily_token_challenges

Stores the daily challenges for each token type.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| reward_id | uuid | Reference to token_rewards |
| challenge_name | text | Name of the challenge |
| challenge_description | text | Description of the challenge |
| completion_criteria | jsonb | Criteria for completing the challenge |
| bonus_amount | numeric | Base reward amount |
| is_active | boolean | Whether the challenge is active |
| day_of_week | integer | Day of week (0-6, Sunday-Saturday) |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### weekly_challenges

Stores the weekly challenges for each token type.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| token_type | text | Token symbol (e.g., PSP, BSP) |
| challenge_name | text | Name of the challenge |
| challenge_description | text | Description of the challenge |
| completion_criteria | jsonb | Criteria for completing the challenge |
| reward_amount | numeric | Base reward amount |
| streak_bonus_multiplier | numeric | Multiplier for streak bonuses |
| is_active | boolean | Whether the challenge is active |
| start_date | timestamptz | Start date of the challenge |
| end_date | timestamptz | End date of the challenge |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### challenge_streaks

Tracks user streaks for daily and weekly challenges, implementing Tesla's 3-6-9 pattern.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users |
| token_type | text | Token symbol (e.g., PSP, BSP) |
| current_daily_streak | integer | Current consecutive days |
| longest_daily_streak | integer | Longest streak achieved |
| current_weekly_streak | integer | Current consecutive weeks |
| longest_weekly_streak | integer | Longest weekly streak |
| last_daily_completion_date | date | Last daily completion date |
| last_weekly_completion_date | date | Last weekly completion date |
| streak_milestone_reached | integer | Highest milestone (3, 6, 9, etc.) |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### user_challenge_completions

Records when users complete daily challenges.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users |
| challenge_id | uuid | Reference to daily_token_challenges |
| completion_date | timestamptz | When the challenge was completed |
| bonus_claimed | boolean | Whether streak bonus was claimed |
| created_at | timestamptz | Creation timestamp |

### user_weekly_challenges

Tracks user progress on weekly challenges.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users |
| challenge_id | uuid | Reference to weekly_challenges |
| progress | jsonb | Progress data for the challenge |
| is_completed | boolean | Whether the challenge is completed |
| completed_at | timestamptz | When the challenge was completed |
| reward_claimed | boolean | Whether the reward was claimed |
| reward_claimed_at | timestamptz | When the reward was claimed |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

## Invitation System

The invitation system allows users to invite others to the platform with different tiers of benefits.

### invitation_tiers

Defines the different tiers of invitations available.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| tier_name | text | Name of the tier (Standard, Silver, Gold, Platinum) |
| tier_level | integer | Numeric level of the tier (1-4) |
| reward_amount | numeric | Token reward amount for this tier |
| max_invites | integer | Maximum invites allowed per month |
| validity_days | integer | Days before invitation expires |
| reward_multiplier | numeric | Multiplier for rewards |
| description | text | Description of the tier |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### invitations

Stores individual invitation codes and their status.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| code | text | Unique invitation code |
| creator_id | uuid | User who created the invitation |
| tier_id | uuid | Reference to invitation_tiers |
| recipient_email | text | Optional email of recipient |
| status | text | Status (CREATED, SENT, CLAIMED, EXPIRED) |
| claimed_by | uuid | User who claimed the invitation |
| claimed_at | timestamptz | When the invitation was claimed |
| expires_at | timestamptz | When the invitation expires |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

## Token System

The token system implements the three value pillars of Avolve: Superachiever, Superachievers, and Supercivilization.

### tokens

Defines the token types in the system.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| symbol | text | Token symbol (e.g., GEN, SAP, SCQ, PSP) |
| name | text | Full name of the token |
| description | text | Description of the token |
| gradient_class | text | CSS gradient class for UI |
| is_primary | boolean | Whether this is a primary token |
| is_active | boolean | Whether the token is active |
| is_transferable | boolean | Whether users can transfer this token |
| parent_id | uuid | Parent token (for hierarchy) |
| token_level | integer | Level in the token hierarchy |
| is_tesla_369 | boolean | Whether it follows Tesla's pattern |
| claim_day | day_of_week_enum | Day of week for claiming |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

### user_balances

Tracks token balances for each user.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to auth.users |
| token_id | uuid | Reference to tokens |
| balance | numeric | Current token balance |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

## Row Level Security

All tables in the Avolve platform implement Row Level Security (RLS) to ensure data is only accessible to authorized users.

### Challenge System RLS

```sql
-- Users can view active daily challenges
create policy "Anyone can view active daily challenges"
  on public.daily_token_challenges
  for select
  to anon, authenticated
  using (is_active = true);

-- Users can view their own challenge completions
create policy "Users can view their own challenge completions"
  on public.user_challenge_completions
  for select
  to authenticated
  using (user_id = auth.uid());

-- Users can insert their own challenge completions
create policy "Users can insert their own challenge completions"
  on public.user_challenge_completions
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Users can view their own challenge streaks
create policy "Users can view their own challenge streaks"
  on public.challenge_streaks
  for select
  to authenticated
  using (user_id = auth.uid());
```

### Invitation System RLS

```sql
-- Anyone can view invitation tiers
create policy "Anyone can view invitation tiers"
  on public.invitation_tiers
  for select
  to anon, authenticated
  using (true);

-- Users can view their own created invitations
create policy "Users can view their own created invitations"
  on public.invitations
  for select
  to authenticated
  using (creator_id = auth.uid() or claimed_by = auth.uid());

-- Users can create invitations
create policy "Users can create invitations"
  on public.invitations
  for insert
  to authenticated
  with check (creator_id = auth.uid());
```

## Database Functions

The platform uses several database functions to implement complex business logic.

### calculate_streak_bonus

Calculates bonus rewards based on Tesla's 3-6-9 pattern.

```sql
create or replace function public.calculate_streak_bonus(
  p_user_id uuid,
  p_token_type text,
  p_base_amount numeric,
  p_is_daily boolean
)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_streak integer;
  v_multiplier numeric;
  v_milestone integer;
begin
  -- Get the appropriate streak value
  if p_is_daily then
    select current_daily_streak into v_streak
    from public.challenge_streaks
    where user_id = p_user_id and token_type = p_token_type;
  else
    select current_weekly_streak into v_streak
    from public.challenge_streaks
    where user_id = p_user_id and token_type = p_token_type;
  end if;
  
  -- If no streak found, return the base amount
  if v_streak is null then
    return p_base_amount;
  end if;
  
  -- Calculate multiplier based on Tesla's 3-6-9 pattern
  v_milestone := case
    when v_streak >= 9 then 9
    when v_streak >= 6 then 6
    when v_streak >= 3 then 3
    else 0
  end;
  
  -- Calculate the multiplier
  if v_milestone = 9 then
    -- For streaks of 9 or more: 1.9x + 0.3x for each additional 3 days
    v_multiplier := 1.9 + (floor((v_streak - 9) / 3) * 0.3);
  elsif v_milestone = 6 then
    -- For streaks of 6-8: 1.6x
    v_multiplier := 1.6;
  elsif v_milestone = 3 then
    -- For streaks of 3-5: 1.3x
    v_multiplier := 1.3;
  else
    -- For streaks of 0-2: no bonus (1.0x)
    v_multiplier := 1.0;
  end if;
  
  -- Return the calculated bonus amount
  return p_base_amount * v_multiplier;
end;
$$;
```

### update_challenge_streak

Trigger function to update streaks when users complete challenges.

```sql
create or replace function public.update_challenge_streak()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_symbol text;
  v_reward_id uuid;
  v_token_id uuid;
  v_streak_record public.challenge_streaks;
  v_last_completion_date date;
  v_today date := current_date;
  v_yesterday date := current_date - interval '1 day';
  v_streak_milestone integer;
begin
  -- Get token information
  select reward_id into v_reward_id
  from public.daily_token_challenges
  where id = new.challenge_id;
  
  -- Get token symbol and update streak
  -- Implementation details...
  
  return new;
end;
$$;
```

## Developer Examples

This section provides practical examples for common database operations in the Avolve platform.

### Querying Challenges for a Specific Day

#### SQL Example

```sql
-- Get today's challenges
select 
  c.id as challenge_id,
  c.challenge_name,
  c.challenge_description,
  c.bonus_amount,
  t.symbol as token_symbol,
  t.name as token_name,
  t.color_gradient
from 
  public.daily_token_challenges c
  join public.tokens t on c.token_id = t.id
where 
  c.is_active = true
  and c.day_of_week = extract(dow from current_date)
order by 
  c.challenge_name;

-- Get challenges for a specific day (e.g., Monday = 1)
select 
  c.id as challenge_id,
  c.challenge_name,
  c.challenge_description,
  c.bonus_amount,
  t.symbol as token_symbol,
  t.name as token_name,
  t.color_gradient
from 
  public.daily_token_challenges c
  join public.tokens t on c.token_id = t.id
where 
  c.is_active = true
  and c.day_of_week = 1  -- Monday
order by 
  c.challenge_name;
```

#### TypeScript Example (using Supabase)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Get challenges for today
 */
async function getTodaysChallenges() {
  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  const { data, error } = await supabase
    .from('daily_token_challenges')
    .select(`
      id,
      challenge_name,
      challenge_description,
      bonus_amount,
      tokens (
        id,
        symbol,
        name,
        color_gradient
      )
    `)
    .eq('is_active', true)
    .eq('day_of_week', dayOfWeek);
    
  if (error) {
    console.error('Error fetching today\'s challenges:', error);
    return null;
  }
  
  return data;
}

/**
 * Get challenges for a specific day of the week
 * @param dayOfWeek - 0 for Sunday, 1 for Monday, etc.
 */
async function getChallengesForDay(dayOfWeek: number) {
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
  }
  
  const { data, error } = await supabase
    .from('daily_token_challenges')
    .select(`
      id,
      challenge_name,
      challenge_description,
      bonus_amount,
      tokens (
        id,
        symbol,
        name,
        color_gradient
      )
    `)
    .eq('is_active', true)
    .eq('day_of_week', dayOfWeek);
    
  if (error) {
    console.error(`Error fetching challenges for day ${dayOfWeek}:`, error);
    return null;
  }
  
  return data;
}
```

### Calculating Streak Bonuses

#### SQL Example

```sql
-- Calculate streak bonus for a user and token type
select 
  public.calculate_streak_bonus(
    '550e8400-e29b-41d4-a716-446655440000'::uuid,  -- user_id
    'PSP',                                         -- token_type
    10.0,                                          -- base_amount
    true                                           -- is_daily
  ) as bonus_amount;

-- Get all user streaks with calculated bonus amounts
select 
  u.email,
  cs.token_type,
  cs.current_daily_streak,
  cs.streak_milestone_reached,
  t.base_reward_amount,
  public.calculate_streak_bonus(
    cs.user_id, 
    cs.token_type, 
    t.base_reward_amount, 
    true
  ) as calculated_reward
from 
  public.challenge_streaks cs
  join auth.users u on cs.user_id = u.id
  join public.tokens t on cs.token_type = t.symbol
where 
  cs.current_daily_streak > 0
order by 
  cs.token_type, cs.current_daily_streak desc;
```

#### TypeScript Example (using Supabase)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Calculate streak bonus using Tesla's 3-6-9 pattern
 * @param streak - Current streak count
 * @returns Bonus multiplier
 */
function calculateStreakBonus(streak: number): number {
  if (streak <= 0) {
    return 1.0; // No bonus for zero or negative streaks
  }
  
  if (streak >= 9) {
    // For streaks of 9 or more: 1.9x + 0.3x for each additional 3 days
    return 1.9 + (Math.floor((streak - 9) / 3) * 0.3);
  } else if (streak >= 6) {
    // For streaks of 6-8: 1.6x
    return 1.6;
  } else if (streak >= 3) {
    // For streaks of 3-5: 1.3x
    return 1.3;
  } else {
    // For streaks of 1-2: 1.0x (no bonus)
    return 1.0;
  }
}

/**
 * Get user's streak for a specific token type
 * @param userId - User ID
 * @param tokenType - Token symbol (e.g., PSP, BSP)
 */
async function getUserStreak(userId: string, tokenType: string) {
  const { data, error } = await supabase
    .from('challenge_streaks')
    .select('current_daily_streak, longest_daily_streak, streak_milestone_reached')
    .eq('user_id', userId)
    .eq('token_type', tokenType)
    .single();
    
  if (error) {
    console.error(`Error fetching streak for user ${userId} and token ${tokenType}:`, error);
    return null;
  }
  
  return data;
}

/**
 * Calculate reward amount with streak bonus
 * @param userId - User ID
 * @param tokenType - Token symbol (e.g., PSP, BSP)
 * @param baseAmount - Base reward amount
 */
async function calculateRewardWithBonus(userId: string, tokenType: string, baseAmount: number) {
  // Get user's current streak
  const streak = await getUserStreak(userId, tokenType);
  
  if (!streak) {
    return baseAmount; // No streak found, return base amount
  }
  
  // Calculate bonus multiplier
  const multiplier = calculateStreakBonus(streak.current_daily_streak);
  
  // Return calculated reward amount
  return baseAmount * multiplier;
}

/**
 * Get all user streaks with calculated bonuses
 */
async function getAllUserStreaksWithBonuses() {
  // First get all tokens to have their base amounts
  const { data: tokens, error: tokensError } = await supabase
    .from('tokens')
    .select('symbol, base_reward_amount');
    
  if (tokensError) {
    console.error('Error fetching tokens:', tokensError);
    return null;
  }
  
  // Create a map of token symbols to base amounts
  const tokenBaseAmounts = tokens.reduce((map, token) => {
    map[token.symbol] = token.base_reward_amount;
    return map;
  }, {});
  
  // Get all user streaks
  const { data: streaks, error: streaksError } = await supabase
    .from('challenge_streaks')
    .select(`
      user_id,
      token_type,
      current_daily_streak,
      longest_daily_streak,
      streak_milestone_reached,
      profiles (
        display_name,
        email
      )
    `)
    .gt('current_daily_streak', 0);
    
  if (streaksError) {
    console.error('Error fetching streaks:', streaksError);
    return null;
  }
  
  // Calculate bonus for each streak
  return streaks.map(streak => {
    const baseAmount = tokenBaseAmounts[streak.token_type] || 10; // Default to 10 if not found
    const multiplier = calculateStreakBonus(streak.current_daily_streak);
    
    return {
      ...streak,
      base_amount: baseAmount,
      bonus_multiplier: multiplier,
      calculated_reward: baseAmount * multiplier
    };
  });
}

## Performance Optimization

The Avolve platform implements several database optimizations to ensure high performance and scalability as the user base grows to 100-1000 users.

### Optimized Queries

Complex queries have been optimized using Common Table Expressions (CTEs) and materialized views to improve performance.

#### User Streak Queries

The `get_user_streaks` function efficiently retrieves streak information for a user:

```sql
-- Retrieve streak information for a user
select * from public.get_user_streaks('550e8400-e29b-41d4-a716-446655440000');
```

#### Transaction History Queries

The `get_user_transaction_history` function retrieves transaction history with efficient filtering:

```sql
-- Get a user's transaction history for the last 30 days
select * from public.get_user_transaction_history(
  '550e8400-e29b-41d4-a716-446655440000',  -- user_id
  50,                                      -- limit
  0,                                       -- offset
  now() - interval '30 days',              -- start_date
  now(),                                   -- end_date
  null,                                    -- token_id (optional)
  null                                     -- transaction_type (optional)
);
```

### Materialized Views

Materialized views cache frequently accessed data to reduce query load:

```sql
-- Daily challenge summaries materialized view
select * from public.daily_challenge_summaries;

-- Refresh the materialized view
select public.refresh_daily_challenge_summaries();
```

### Indexes

Strategic indexes have been added to improve query performance:

```sql
-- Challenge streaks indexes
create index if not exists idx_challenge_streaks_user_id on public.challenge_streaks(user_id);
create index if not exists idx_challenge_streaks_token_type on public.challenge_streaks(token_type);
create index if not exists idx_challenge_streaks_last_daily_completion on public.challenge_streaks(last_daily_completion_date);

-- Transaction indexes
create index if not exists idx_transactions_from_user_id on public.transactions(from_user_id);
create index if not exists idx_transactions_to_user_id on public.transactions(to_user_id);
create index if not exists idx_transactions_token_id on public.transactions(token_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at);
```

## Table Partitioning

As transaction volume grows, the `transactions` table is partitioned by month to improve query performance and maintenance.

### Partitioning Strategy

The `transactions_partitioned` table uses range partitioning based on the `created_at` timestamp:

```sql
create table if not exists public.transactions_partitioned (
    id uuid not null default gen_random_uuid(),
    token_id uuid not null,
    from_user_id uuid,
    to_user_id uuid not null,
    amount numeric not null,
    transaction_type text not null,
    reason text,
    tx_hash text,
    created_at timestamp with time zone not null default now(),
    status text not null default 'completed',
    metadata jsonb,
    completed_at timestamp with time zone,
    primary key (id, created_at)
) partition by range (created_at);
```

### Monthly Partitions

Each month has its own partition:

```sql
-- Example of monthly partitions
create table if not exists public.transactions_y2025m04 
partition of public.transactions_partitioned
for values from ('2025-04-01') to ('2025-05-01');

create table if not exists public.transactions_y2025m05 
partition of public.transactions_partitioned
for values from ('2025-05-01') to ('2025-06-01');
```

### Automatic Partition Creation

New partitions are automatically created using the `create_transaction_partition_for_month` function:

```sql
-- Create a new partition for the next month
select public.create_transaction_partition_for_month();
```

### Querying Partitioned Tables

Queries against the partitioned table automatically use the appropriate partition:

```sql
-- Query recent transactions (uses only the relevant partition)
select * from public.transactions_partitioned
where created_at > now() - interval '30 days'
order by created_at desc
limit 100;
```

## Maintenance Automation

The Avolve platform includes automated maintenance tasks to keep the database performant and efficient.

### Transaction Archiving

Transactions older than 90 days are automatically archived to maintain a lean primary table:

```sql
-- Archive transactions older than 90 days
select public.archive_old_transactions(90);
```

### Expired Invitation Cleanup

Expired invitation codes are automatically marked as expired:

```sql
-- Clean up expired invitation codes
select public.cleanup_expired_invitations();
```

### Automated Maintenance Function

All maintenance tasks can be run with a single function call:

```sql
-- Run all maintenance tasks
select public.run_database_maintenance();
```

### Scheduled Maintenance

Maintenance is scheduled using a Supabase Edge Function that runs daily:

```typescript
// Supabase Edge Function for database maintenance
// Located at: /supabase/functions/database-maintenance/index.ts

// To invoke manually:
const { data, error } = await supabase.functions.invoke('database-maintenance', {
  body: { 
    days_old: 90,
    auth_key: 'your-secret-key'
  }
});
```

## Monitoring System

The Avolve platform includes a comprehensive monitoring system to track database performance and health.

### Database Health Table

Performance metrics are stored in the `database_health` table:

```sql
-- Structure of the database_health table
create table if not exists public.database_health (
    id uuid primary key default gen_random_uuid(),
    timestamp timestamp with time zone not null default now(),
    metric_name text not null,
    metric_value numeric not null,
    details jsonb,
    created_at timestamp with time zone not null default now()
);
```

### Metrics Collection

Database metrics are collected using the `collect_database_metrics` function:

```sql
-- Collect current database metrics
select public.collect_database_metrics();
```

### Performance Analysis

The `analyze_database_performance` function identifies potential issues:

```sql
-- Analyze database performance and get alerts
select * from public.analyze_database_performance();
```

### Health Reports

Comprehensive health reports can be generated:

```sql
-- Generate a health report for the last 24 hours
select public.generate_database_health_report(24);
```

### Key Metrics Monitored

The monitoring system tracks several key metrics:

1. **Query Duration**: Average query execution time
2. **Cache Hit Ratio**: Percentage of data served from cache
3. **Deadlocks**: Number of deadlocks detected
4. **Connection Count**: Number of active database connections
5. **Transaction Duration**: Duration of longest-running transaction
6. **Table Statistics**: Size and access patterns of tables
7. **Index Usage**: Effectiveness of indexes

### Alert Thresholds

The system generates alerts based on configurable thresholds:

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Query Duration | > 10 seconds | > 30 seconds |
| Cache Hit Ratio | < 90% | < 70% |
| Deadlocks | > 0 | N/A |
| Connection Count | > 50 | > 80 |
| Transaction Duration | > 60 seconds | > 300 seconds |

### Monitoring Dashboard

A monitoring dashboard can be implemented using the collected metrics and the Supabase UI or a custom dashboard solution.
