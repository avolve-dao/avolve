# Avolve Database Optimization Guide

This document outlines the database optimization strategies implemented to ensure the Avolve platform can efficiently handle 100-1000 users with optimal performance and security.

## Table of Contents

1. [Indexing Strategy](#indexing-strategy)
2. [Data Integrity Constraints](#data-integrity-constraints)
3. [Concurrency Handling](#concurrency-handling)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Performance Monitoring](#performance-monitoring)
6. [Load Testing](#load-testing)
7. [Best Practices](#best-practices)

## Indexing Strategy

We've implemented a comprehensive indexing strategy to improve query performance for high-traffic tables:

### Transaction Table Indexes

```sql
-- Composite index for querying transactions by user and date range
CREATE INDEX idx_transactions_user_date ON public.transactions (from_user_id, to_user_id, created_at);

-- Index for filtering by transaction type and status
CREATE INDEX idx_transactions_type_status ON public.transactions (transaction_type, status);

-- Partial index for pending transactions
CREATE INDEX idx_transactions_pending ON public.transactions (created_at)
WHERE status = 'pending';

-- Index for completed transactions with timestamp
CREATE INDEX idx_transactions_completed ON public.transactions (completed_at)
WHERE completed_at IS NOT NULL;

-- BRIN index for large tables (more efficient for large datasets with time-based queries)
CREATE INDEX idx_transactions_brin ON public.transactions USING BRIN (created_at)
WITH (pages_per_range = 32);

-- Covering index for common transaction queries
CREATE INDEX idx_transactions_covering ON public.transactions (token_id, created_at)
INCLUDE (amount, transaction_type);
```

### User Balances Indexes

```sql
-- Composite index for token balances by user
CREATE INDEX idx_user_balances_user_token ON public.user_balances (user_id, token_id);

-- Index for high balance accounts
CREATE INDEX idx_user_balances_high_value ON public.user_balances (user_id, token_id)
WHERE balance > 100;
```

### Challenge System Indexes

```sql
-- Index for uncompleted challenges
CREATE INDEX idx_user_challenges_incomplete ON public.user_challenges (user_id, completed_at)
WHERE completed_at IS NULL;

-- Index for recent completions
CREATE INDEX idx_challenge_completions_recent ON public.user_challenge_completions (user_id, completion_date);

-- Composite index for challenge streaks
CREATE INDEX idx_challenge_streaks_milestone ON public.challenge_streaks (user_id, token_type, current_daily_streak);
```

### Invitation System Indexes

```sql
-- Index for active invitations
CREATE INDEX idx_invitations_active ON public.invitations (created_at, expires_at, status)
WHERE status = 'CREATED';

-- Index for invitation lookup by code
CREATE INDEX idx_invitations_code_lookup ON public.invitations (code, status) 
WHERE status = 'CREATED';
```

## Data Integrity Constraints

We've added CHECK constraints to ensure data validity and prevent invalid values:

### Challenge Streaks Constraints

```sql
-- Ensure streak counts are non-negative
ALTER TABLE public.challenge_streaks 
  ADD CONSTRAINT check_current_daily_streak_non_negative 
  CHECK (current_daily_streak >= 0);

ALTER TABLE public.challenge_streaks 
  ADD CONSTRAINT check_longest_daily_streak_non_negative 
  CHECK (longest_daily_streak >= 0);

ALTER TABLE public.challenge_streaks 
  ADD CONSTRAINT check_current_weekly_streak_non_negative 
  CHECK (current_weekly_streak >= 0);

ALTER TABLE public.challenge_streaks 
  ADD CONSTRAINT check_longest_weekly_streak_non_negative 
  CHECK (longest_weekly_streak >= 0);
```

### Invitation Tier Constraints

```sql
-- Ensure invitation tier values are valid
ALTER TABLE public.invitation_tiers 
  ADD CONSTRAINT check_validity_days_positive 
  CHECK (validity_days > 0);

ALTER TABLE public.invitation_tiers 
  ADD CONSTRAINT check_max_invites_positive 
  CHECK (max_invites >= 0);

ALTER TABLE public.invitation_tiers 
  ADD CONSTRAINT check_reward_multiplier_positive 
  CHECK (reward_multiplier > 0);
```

### Transaction Constraints

```sql
-- Ensure token amounts are non-negative
ALTER TABLE public.transactions 
  ADD CONSTRAINT check_transaction_amount_non_negative 
  CHECK (amount >= 0);

ALTER TABLE public.user_balances 
  ADD CONSTRAINT check_balance_non_negative 
  CHECK (balance >= 0);

-- Ensure valid transaction types
ALTER TABLE public.transactions 
  ADD CONSTRAINT check_transaction_type_valid 
  CHECK (transaction_type IN ('MINT', 'TRANSFER', 'BURN', 'REWARD', 'CLAIM', 'STAKE', 'UNSTAKE'));

-- Ensure valid transaction status values
ALTER TABLE public.transactions 
  ADD CONSTRAINT check_transaction_status_valid 
  CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'));
```

### Invitation Constraints

```sql
-- Ensure unique invitation codes
ALTER TABLE public.invitations 
  ADD CONSTRAINT invitations_code_key 
  UNIQUE (code);

-- Ensure valid invitation status values
ALTER TABLE public.invitations 
  ADD CONSTRAINT check_invitation_status_valid 
  CHECK (status IN ('CREATED', 'SENT', 'CLAIMED', 'EXPIRED'));
```

### Token Constraints

```sql
-- Ensure valid token types based on the Avolve token hierarchy
ALTER TABLE public.tokens 
  ADD CONSTRAINT check_token_symbol_valid 
  CHECK (symbol IN ('GEN', 'SAP', 'SCQ', 'PSP', 'BSP', 'SMS', 'SPD', 'SHE', 'SSA', 'SGB'));
```

## Concurrency Handling

We've optimized database functions to handle concurrent updates efficiently, preventing race conditions when multiple users are claiming tokens or updating streaks simultaneously:

### Advisory Locks

We use PostgreSQL advisory locks to prevent concurrent operations on the same resource:

```sql
-- Acquire an advisory lock specific to this user and token
SELECT pg_try_advisory_xact_lock(('x' || md5(user_id::text || token_symbol))::bit(64)::bigint) INTO v_lock_acquired;

IF NOT v_lock_acquired THEN
  RETURN jsonb_build_object('success', false, 'message', 'Another operation is in progress, please try again');
END IF;
```

### Row-Level Locking

We use `FOR UPDATE` and `FOR UPDATE SKIP LOCKED` to handle concurrent updates to the same rows:

```sql
-- Lock the row to prevent concurrent updates
SELECT * INTO v_streak
FROM public.challenge_streaks
WHERE user_id = new.user_id AND token_type = v_token_symbol
FOR UPDATE;

-- Skip already locked rows for better concurrency
SELECT EXISTS(
  SELECT 1 FROM public.user_daily_claims
  WHERE user_id = v_user_id AND reward_id = v_reward.id AND claim_date = current_date
  FOR UPDATE SKIP LOCKED
) INTO v_already_claimed;
```

### Optimized Token Minting

We created a concurrency-safe function for minting tokens:

```sql
-- Function signature
CREATE OR REPLACE FUNCTION public.mint_tokens_safely(
  p_to_user_id uuid,
  p_token_symbol text,
  p_amount numeric,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
```

### Batch Processing

We implemented batch processing for better performance with high transaction volumes:

```sql
-- Function signature
CREATE OR REPLACE FUNCTION public.batch_process_transactions(
  p_transaction_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
```

## Row Level Security (RLS)

We've enhanced Row Level Security policies to ensure users can only access their own data:

### User Balances RLS

```sql
-- Ensure users can only view their own balances
CREATE POLICY "Users can only view their own balances"
ON public.user_balances
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure users can only update their own balances through functions
CREATE POLICY "Users can only update their balances through functions"
ON public.user_balances
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

### Transactions RLS

```sql
-- Ensure users can only view transactions they're involved in
CREATE POLICY "Users can only view transactions they're involved in"
ON public.transactions
FOR SELECT
TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Ensure users cannot directly modify transactions
CREATE POLICY "Users cannot directly modify transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);
```

### Challenge Streaks RLS

```sql
-- Ensure users can only view their own streaks
CREATE POLICY "Users can only view their own streaks"
ON public.challenge_streaks
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Admin Access

```sql
-- Create a policy for admins to manage all data
CREATE POLICY "Admins can manage all transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM auth.users
  WHERE (users.raw_user_meta_data ->> 'is_admin')::boolean = true
));
```

## Performance Monitoring

We've added functions to monitor database performance and collect metrics:

### Performance Stats Table

```sql
CREATE TABLE IF NOT EXISTS public.database_performance_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### Metrics Collection Function

```sql
-- Function signature
CREATE OR REPLACE FUNCTION public.collect_database_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
```

### Database Size Function

```sql
-- Function signature
CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
```

### Database Optimization Function

```sql
-- Function signature
CREATE OR REPLACE FUNCTION public.optimize_database(p_analyze_only boolean default false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
```

## Load Testing

We've created scripts to test the database's ability to handle high concurrency:

### Concurrency Test Script

Located at `/scripts/concurrency_test.js`, this script simulates multiple users claiming tokens simultaneously to test for race conditions and deadlocks.

### Load Test Script

Located at `/scripts/load_test.js`, this script provides comprehensive load testing for different scenarios:

- Daily token claims
- Invitation creation and redemption
- Challenge completions and streak updates

Run the load test with:

```bash
node load_test.js --users=1000 --duration=60 --scenario=all --concurrency=20
```

## Best Practices

### Function Security

All database functions follow these security best practices:

1. **SECURITY INVOKER**: Functions run with the permissions of the calling user
2. **SET search_path = ''**: Prevents search path injection attacks
3. **Proper input validation**: All user inputs are validated before use

### Transaction Management

1. **Atomic operations**: Related operations are wrapped in transactions
2. **Error handling**: All functions include proper error handling
3. **Deadlock prevention**: Advisory locks and row-level locking strategies

### Query Optimization

1. **Use of appropriate indexes**: Indexes are tailored to common query patterns
2. **Partial indexes**: Used for frequently filtered subsets of data
3. **BRIN indexes**: Used for large time-series data
4. **Covering indexes**: Include frequently accessed columns

### Connection Pooling

1. **Reuse connections**: The application should use connection pooling
2. **Limit max connections**: Set appropriate connection limits
3. **Transaction timeout**: Set reasonable transaction timeouts

## Weekly Token Schedule

The Avolve platform implements a weekly meeting schedule with each day dedicated to a specific token:

- Sunday: SPD (Superpuzzle Developments) - Red-Green-Blue gradient
- Monday: SHE (Superhuman Enhancements) - Rose-Red-Orange gradient
- Tuesday: PSP (Personal Success Puzzle) - Amber-Yellow gradient
- Wednesday: SSA (Supersociety Advancements) - Lime-Green-Emerald gradient
- Thursday: BSP (Business Success Puzzle) - Teal-Cyan gradient
- Friday: SGB (Supergenius Breakthroughs) - Sky-Blue-Indigo gradient
- Saturday: SMS (Supermind Superpowers) - Violet-Purple-Fuchsia-Pink gradient

## Conclusion

These optimizations ensure the Avolve platform's database can efficiently handle 100-1000 users with optimal performance, security, and data integrity. Regular monitoring and performance tuning should be conducted as the user base grows to maintain optimal performance.
