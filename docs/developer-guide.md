# Avolve Platform Developer Guide

This guide provides technical documentation for developers working with the Avolve platform's regenerative gamified system, including database schema, key files, APIs, and metrics integration.

## Database Schema

The Avolve platform uses Supabase PostgreSQL for data storage. Below are the key tables related to the regenerative gamified system.

### Core Tables

#### `tokens`
Stores information about all tokens in the system.

```sql
create table public.tokens (
  id uuid primary key default gen_random_uuid(),
  symbol text not null unique,
  name text not null,
  description text,
  parent_token_id uuid references public.tokens(id),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `user_balances`
Tracks token balances for each user.

```sql
create table public.user_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, token_id)
);
```

#### `token_transactions`
Records all token transactions.

```sql
create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  token_id uuid not null references public.tokens(id) on delete cascade,
  amount numeric not null,
  transaction_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
```

### Daily Claims

#### `token_metadata`
Stores metadata about tokens, including which day they can be claimed.

```sql
create table public.token_metadata (
  id uuid primary key default gen_random_uuid(),
  token_symbol text not null unique,
  token_name text not null,
  description text,
  day_of_week integer, -- 0 = Sunday, 1 = Monday, etc.
  color_gradient text,
  parent_token text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### `day_token_claims`
Records token claims made by users.

```sql
create table public.day_token_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_symbol text not null,
  day_of_week integer not null, -- 0 = Sunday, 1 = Monday, etc.
  claimed_at timestamp with time zone default now(),
  amount numeric not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
```

### Feature Unlocks

#### `feature_unlocks`
Records which features are unlocked for each user.

```sql
create table public.feature_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature_name text not null,
  unlocked_at timestamp with time zone default now(),
  unlock_reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, feature_name)
);
```

#### `feature_unlock_criteria`
Defines the criteria for unlocking features.

```sql
create table public.feature_unlock_criteria (
  id uuid primary key default gen_random_uuid(),
  feature_name text not null unique,
  description text not null,
  criteria jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### Metrics

#### `user_metrics`
Stores user metrics for gamification.

```sql
create table public.user_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_type text not null,
  metric_name text not null,
  value numeric not null,
  recorded_at timestamp with time zone default now(),
  metadata jsonb default '{}'::jsonb,
  unique (user_id, metric_type, metric_name, recorded_at)
);
```

#### `user_activity_logs`
Records user activity for calculating metrics like DAU/MAU.

```sql
create table public.user_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);
```

## Key Files and Directories

### Service Layer

The service layer contains the business logic for the regenerative gamified system.

#### `/src/tokens.ts`
Handles token operations including balance checks, transfers, and claims.

```typescript
// Key functions:
// - getTokenBalance: Get a user's token balance
// - transferTokens: Transfer tokens between users
// - claimDailyToken: Claim the token for the current day
// - spendTokens: Spend tokens on features or items
```

#### `/src/features.ts`
Manages feature unlocks based on user metrics and progress.

```typescript
// Key functions:
// - checkFeatureUnlock: Check if a feature is unlocked for a user
// - checkDayTokenUnlock: Check if a day token is unlocked for a user
// - getUserFeatureStatuses: Get all feature and day token statuses for a user
// - getDayTokenInfo: Get information about a token for a specific day
```

#### `/src/metrics.ts`
Tracks and calculates user metrics for gamification.

```typescript
// Key functions:
// - recordMetric: Record a metric for a user
// - calculateDAUMAU: Calculate the DAU/MAU ratio for a user
// - calculateRetention: Calculate retention metrics for a user
// - getMetricsSummary: Get a summary of all metrics for a user
```

#### `/src/claims.ts`
Handles daily token claims and related functionality.

```typescript
// Key functions:
// - claimDailyReward: Claim the daily token reward
// - getDailyClaimStatus: Check if a user has claimed their daily token
// - getClaimStreak: Get the user's current claim streak
// - calculateClaimBonus: Calculate bonus tokens based on streak
```

### Database Functions

#### `/supabase/functions/claim_daily_token.sql`
PostgreSQL function for claiming daily tokens.

```sql
create or replace function public.claim_day_token(
  p_user_id uuid,
  p_token_symbol text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_day_of_week integer;
  v_current_day integer;
  v_amount numeric := 10; -- default amount to claim
  v_already_claimed boolean;
  v_result jsonb;
begin
  -- get the current day of week (0 = Sunday, 1 = Monday, etc.)
  select extract(dow from now())::integer into v_current_day;
  
  -- get the day of week for the token
  select day_of_week into v_day_of_week
  from public.token_metadata
  where token_symbol = p_token_symbol;
  
  -- check if the token is available today
  if v_day_of_week != v_current_day then
    return jsonb_build_object(
      'success', false,
      'message', p_token_symbol || ' tokens can only be claimed on ' || 
        case v_day_of_week
          when 0 then 'Sunday'
          when 1 then 'Monday'
          when 2 then 'Tuesday'
          when 3 then 'Wednesday'
          when 4 then 'Thursday'
          when 5 then 'Friday'
          when 6 then 'Saturday'
          else 'Unknown day'
        end
    );
  end if;
  
  -- check if already claimed today
  select exists(
    select 1 
    from public.day_token_claims 
    where user_id = p_user_id 
    and token_symbol = p_token_symbol 
    and date_trunc('day', claimed_at) = date_trunc('day', now())
  ) into v_already_claimed;
  
  if v_already_claimed then
    return jsonb_build_object(
      'success', false,
      'message', 'You have already claimed ' || p_token_symbol || ' tokens today'
    );
  end if;
  
  -- get token id
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return jsonb_build_object(
      'success', false,
      'message', 'Token ' || p_token_symbol || ' not found'
    );
  end if;
  
  -- record the claim
  insert into public.day_token_claims (user_id, token_symbol, day_of_week, amount)
  values (p_user_id, p_token_symbol, v_current_day, v_amount);
  
  -- add tokens to user balance
  insert into public.user_balances (user_id, token_id, balance)
  values (p_user_id, v_token_id, v_amount)
  on conflict (user_id, token_id)
  do update set balance = public.user_balances.balance + v_amount;
  
  -- record metric for token claim
  perform public.record_metric(p_user_id, 'engagement', 'token_claim', v_amount);
  
  -- check if this unlocks any features
  perform public.check_feature_unlock(p_user_id, 'tokenUtility');
  
  return jsonb_build_object(
    'success', true,
    'message', 'Successfully claimed ' || v_amount || ' ' || p_token_symbol || ' tokens',
    'amount', v_amount
  );
end;
$$;
```

#### `/supabase/functions/check_feature_unlock.sql`
PostgreSQL function for checking if a feature is unlocked.

```sql
create or replace function public.check_feature_unlock(
  p_user_id uuid,
  p_feature_name text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_criteria jsonb;
  v_completed_challenges integer;
  v_gen_balance numeric;
  v_dau_mau numeric;
  v_day_tokens_claimed integer;
  v_is_unlocked boolean := false;
  v_unlock_reason text;
  v_result jsonb;
  v_existing_unlock uuid;
begin
  -- check if the feature is already unlocked
  select id into v_existing_unlock
  from public.feature_unlocks
  where user_id = p_user_id and feature_name = p_feature_name;
  
  if v_existing_unlock is not null then
    return jsonb_build_object(
      'isUnlocked', true,
      'unlockReason', 'Feature already unlocked'
    );
  end if;
  
  -- get the criteria for the feature
  select criteria into v_criteria
  from public.feature_unlock_criteria
  where feature_name = p_feature_name;
  
  if v_criteria is null then
    return jsonb_build_object(
      'isUnlocked', false,
      'unlockReason', 'Feature not found'
    );
  end if;
  
  -- get the user's completed challenges
  select count(*) into v_completed_challenges
  from public.completed_challenges
  where user_id = p_user_id;
  
  -- get the user's GEN balance
  select coalesce(sum(balance), 0) into v_gen_balance
  from public.user_balances
  where user_id = p_user_id and token_id = (
    select id from public.tokens where symbol = 'GEN'
  );
  
  -- get the user's DAU/MAU ratio if needed
  if v_criteria->>'requiredDAUMAU' is not null and (v_criteria->>'requiredDAUMAU')::numeric > 0 then
    -- simplified calculation for demo purposes
    select 
      case 
        when count(distinct date_trunc('day', created_at)) > 0 
        then count(distinct case when created_at > now() - interval '1 day' then date_trunc('hour', created_at) end)::numeric / 
             count(distinct date_trunc('day', created_at))
        else 0
      end into v_dau_mau
    from public.user_activity_logs
    where user_id = p_user_id
    and created_at > now() - interval '30 days';
  else
    v_dau_mau := 0;
  end if;
  
  -- get the number of day tokens claimed if needed
  if v_criteria->>'requiredDayTokens' is not null and (v_criteria->>'requiredDayTokens')::integer > 0 then
    select count(distinct token_symbol) into v_day_tokens_claimed
    from public.day_token_claims
    where user_id = p_user_id;
  else
    v_day_tokens_claimed := 0;
  end if;
  
  -- check if the user meets the criteria
  if (v_criteria->>'completedChallenges' is null or v_completed_challenges >= (v_criteria->>'completedChallenges')::integer)
     and (v_criteria->>'requiredGEN' is null or v_gen_balance >= (v_criteria->>'requiredGEN')::numeric)
     and (v_criteria->>'requiredDAUMAU' is null or v_dau_mau >= (v_criteria->>'requiredDAUMAU')::numeric)
     and (v_criteria->>'requiredDayTokens' is null or v_day_tokens_claimed >= (v_criteria->>'requiredDayTokens')::integer)
  then
    v_is_unlocked := true;
    
    -- construct the unlock reason
    v_unlock_reason := 'You''ve met the requirements: ';
    
    if v_criteria->>'completedChallenges' is not null and v_completed_challenges >= (v_criteria->>'completedChallenges')::integer then
      v_unlock_reason := v_unlock_reason || 'Completed ' || v_completed_challenges || ' challenges. ';
    end if;
    
    if v_criteria->>'requiredGEN' is not null and v_gen_balance >= (v_criteria->>'requiredGEN')::numeric then
      v_unlock_reason := v_unlock_reason || 'Accumulated ' || v_gen_balance || ' GEN tokens. ';
    end if;
    
    if v_criteria->>'requiredDAUMAU' is not null and v_dau_mau >= (v_criteria->>'requiredDAUMAU')::numeric then
      v_unlock_reason := v_unlock_reason || 'Achieved DAU/MAU ratio of ' || v_dau_mau || '. ';
    end if;
    
    if v_criteria->>'requiredDayTokens' is not null and v_day_tokens_claimed >= (v_criteria->>'requiredDayTokens')::integer then
      v_unlock_reason := v_unlock_reason || 'Claimed ' || v_day_tokens_claimed || ' different day tokens. ';
    end if;
    
    -- insert the unlock record if it doesn't exist
    insert into public.feature_unlocks (user_id, feature_name, unlock_reason)
    values (p_user_id, p_feature_name, v_unlock_reason);
  else
    -- construct the reason why the feature is locked
    v_unlock_reason := 'Requirements to unlock: ';
    
    if v_criteria->>'completedChallenges' is not null then
      v_unlock_reason := v_unlock_reason || 'Complete ' || (v_criteria->>'completedChallenges')::integer || ' challenges (' || v_completed_challenges || ' done). ';
    end if;
    
    if v_criteria->>'requiredGEN' is not null then
      v_unlock_reason := v_unlock_reason || 'Accumulate ' || (v_criteria->>'requiredGEN')::numeric || ' GEN tokens (' || v_gen_balance || ' current). ';
    end if;
    
    if v_criteria->>'requiredDAUMAU' is not null then
      v_unlock_reason := v_unlock_reason || 'Achieve DAU/MAU ratio of ' || (v_criteria->>'requiredDAUMAU')::numeric || ' (' || v_dau_mau || ' current). ';
    end if;
    
    if v_criteria->>'requiredDayTokens' is not null then
      v_unlock_reason := v_unlock_reason || 'Claim ' || (v_criteria->>'requiredDayTokens')::integer || ' different day tokens (' || v_day_tokens_claimed || ' claimed). ';
    end if;
  end if;
  
  -- build the result
  v_result := jsonb_build_object(
    'isUnlocked', v_is_unlocked,
    'unlockReason', v_unlock_reason,
    'criteria', v_criteria,
    'progress', jsonb_build_object(
      'completedChallenges', v_completed_challenges,
      'genBalance', v_gen_balance,
      'dauMau', v_dau_mau,
      'dayTokensClaimed', v_day_tokens_claimed
    )
  );
  
  return v_result;
end;
$$;
```

## API Reference

### Token Endpoints

#### `GET /api/tokens/balance`
Get a user's token balances.

**Response:**
```json
{
  "balances": [
    {
      "symbol": "GEN",
      "name": "Supercivilization",
      "balance": 150
    },
    {
      "symbol": "SAP",
      "name": "Superachiever",
      "balance": 75
    },
    // ...
  ]
}
```

#### `POST /api/tokens/claim`
Claim the daily token.

**Request:**
```json
{
  "tokenSymbol": "PSP"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully claimed 10 PSP tokens",
  "amount": 10
}
```

### Feature Endpoints

#### `GET /api/features/status`
Get the status of all features for the current user.

**Response:**
```json
{
  "features": {
    "teams": {
      "isUnlocked": true,
      "unlockReason": "You've met the requirements: Completed 15 challenges."
    },
    "governance": {
      "isUnlocked": false,
      "unlockReason": "Requirements to unlock: Accumulate 100 GEN tokens (75 current)."
    },
    // ...
  },
  "dayTokens": {
    "sunday": {
      "isUnlocked": false,
      "unlockReason": "SPD tokens are only available on Sundays.",
      "tokenInfo": {
        "symbol": "SPD",
        "name": "Superpuzzle Developments",
        "description": "Collective journey - Developments",
        "day": "Sunday",
        "dayOfWeek": 0,
        "gradient": "from-red-500 via-green-500 to-blue-500"
      }
    },
    // ...
  }
}
```

#### `GET /api/features/check/:featureName`
Check if a specific feature is unlocked.

**Response:**
```json
{
  "isUnlocked": false,
  "unlockReason": "Requirements to unlock: Complete 10 challenges (5 done).",
  "criteria": {
    "completedChallenges": 10,
    "requiredGEN": 0
  },
  "progress": {
    "completedChallenges": 5,
    "genBalance": 75,
    "dauMau": 0.25,
    "dayTokensClaimed": 2
  }
}
```

### Metrics Endpoints

#### `GET /api/metrics/summary`
Get a summary of all metrics for the current user.

**Response:**
```json
{
  "dauMau": 0.35,
  "retention": {
    "d1": 0.8,
    "d7": 0.5,
    "d30": 0.2
  },
  "arpu": 12.5,
  "nps": 65,
  "engagement": {
    "sessionsPerDay": 2.3,
    "avgSessionLength": 12.5,
    "actionsPerSession": 8.2
  }
}
```

#### `POST /api/metrics/record`
Record a metric for the current user.

**Request:**
```json
{
  "metricType": "engagement",
  "metricName": "session_complete",
  "value": 1,
  "metadata": {
    "sessionLength": 15.2,
    "actionsPerformed": 12
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Metric recorded successfully"
}
```

## Metrics Integration

The platform uses a comprehensive metrics system to drive the regenerative gamified experience. Here's how metrics are integrated into the codebase:

### Recording Metrics

Metrics are recorded in various parts of the application:

```typescript
// In src/claims.ts
async function claimDailyReward(userId: string, tokenSymbol: string) {
  // Claim PSP on TUE to boost DAU
  const result = await supabase.rpc('claim_day_token', {
    p_user_id: userId,
    p_token_symbol: tokenSymbol
  });
  
  if (result.data?.success) {
    // Record metric for successful claim
    await recordMetric(userId, 'engagement', 'daily_claim', 1, {
      tokenSymbol,
      amount: result.data.amount
    });
    
    // Boost DAU metric
    await recordMetric(userId, 'engagement', 'daily_active', 1);
  }
  
  return result.data;
}
```

### Calculating Metrics

Metrics are calculated in the metrics service:

```typescript
// In src/metrics.ts
async function calculateDAUMAU(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: activityLogs } = await supabase
    .from('user_activity_logs')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  if (!activityLogs || activityLogs.length === 0) {
    return 0;
  }
  
  // Get unique days active in the last 30 days
  const uniqueDays = new Set();
  activityLogs.forEach(log => {
    const date = new Date(log.created_at).toDateString();
    uniqueDays.add(date);
  });
  
  // Get activity in the last day
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const recentLogs = activityLogs.filter(log => 
    new Date(log.created_at) >= oneDayAgo
  );
  
  // Calculate DAU/MAU ratio
  const mau = uniqueDays.size;
  const dau = recentLogs.length > 0 ? 1 : 0;
  
  return mau > 0 ? dau / mau : 0;
}
```

### Using Metrics for Feature Unlocks

Metrics are used to determine feature unlocks:

```typescript
// In src/features.ts
async function checkMarketplaceUnlock(userId: string) {
  // Check completed challenges
  const { data: challenges } = await supabase
    .from('completed_challenges')
    .select('id')
    .eq('user_id', userId);
  
  const completedChallenges = challenges?.length || 0;
  
  // Check DAU/MAU ratio
  const dauMau = await calculateDAUMAU(userId);
  
  // Marketplace unlocks after 20 challenges or DAU/MAU > 0.3
  const isUnlocked = completedChallenges >= 20 || dauMau > 0.3;
  
  if (isUnlocked) {
    // Record the unlock
    await supabase
      .from('feature_unlocks')
      .upsert({
        user_id: userId,
        feature_name: 'marketplace',
        unlock_reason: completedChallenges >= 20 
          ? `Completed ${completedChallenges} challenges` 
          : `Achieved DAU/MAU ratio of ${dauMau.toFixed(2)}`
      });
    
    // Record metric for feature unlock
    await recordMetric(userId, 'progression', 'feature_unlock', 1, {
      feature: 'marketplace'
    });
  }
  
  return {
    isUnlocked,
    completedChallenges,
    requiredChallenges: 20,
    dauMau,
    requiredDAUMAU: 0.3
  };
}
```

## Frontend Components

### Key Components

#### `DayTokenCard.tsx`
Component for displaying and claiming daily tokens.

```tsx
// In components/Features/DayTokenCard.tsx
const handleClaimToken = async () => {
  try {
    setLoading(true);
    
    // First check if the token is available today
    const dayStatus = await checkDayTokenUnlock(dayName.toLowerCase());
    
    if (!dayStatus.isUnlocked) {
      toast({
        title: "Token not available",
        description: dayStatus.unlockReason,
        variant: "destructive"
      });
      return;
    }
    
    // Attempt to claim the token
    const result = await claimDayToken(dayStatus.tokenInfo.symbol);
    
    if (result.success) {
      setClaimed(true);
      toast({
        title: "Token claimed!",
        description: result.message,
        variant: "success"
      });
    } else {
      toast({
        title: "Failed to claim token",
        description: result.message,
        variant: "destructive"
      });
    }
  } catch (error) {
    console.error('Error claiming token:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred while claiming the token.",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};
```

#### `FeatureGuard.tsx`
Component for protecting routes based on feature unlock status.

```tsx
// In components/Features/FeatureGuard.tsx
useEffect(() => {
  const checkAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const result = await checkFeatureUnlock(featureName);
      setIsUnlocked(result.isUnlocked);
      setUnlockReason(result.unlockReason);
    } catch (error) {
      console.error(`Error checking ${featureName} access:`, error);
    } finally {
      setLoading(false);
    }
  };

  checkAccess();
}, [user, featureName]);
```

## Best Practices

### Inline Comments

Always include clear comments in your code, especially for metrics-related functionality:

```typescript
// Claim PSP on TUE to boost DAU in claimDailyReward()
// Record SHE claim on MON to improve retention metrics
// Process petition approval to boost NPS metrics
// Spend GEN tokens to boost ARPU metrics
```

### Error Handling

Always handle errors properly, especially for token operations:

```typescript
try {
  const result = await claimDayToken(tokenSymbol);
  // Handle success
} catch (error) {
  console.error('Error claiming token:', error);
  // Handle error
}
```

### Metrics Recording

Always record metrics for important user actions:

```typescript
// Record metrics for important actions
await recordMetric(userId, 'engagement', 'daily_claim', 1, { tokenSymbol });
await recordMetric(userId, 'progression', 'challenge_complete', 1, { challengeId });
await recordMetric(userId, 'financial', 'token_spend', amount, { purpose });
```

## Troubleshooting

### Common Issues

1. **Token Claim Issues**
   - Check the day of the week matches the token being claimed
   - Verify the user hasn't already claimed the token today
   - Ensure the token exists in the database

2. **Feature Unlock Issues**
   - Verify the feature criteria in the database
   - Check the user's progress toward meeting the criteria
   - Ensure metrics are being recorded correctly

3. **Metrics Calculation Issues**
   - Verify activity logs are being recorded
   - Check the calculation logic for complex metrics like DAU/MAU
   - Ensure date handling is correct across time zones

### Debugging

Use the following SQL queries for debugging:

```sql
-- Check user token balances
SELECT u.email, t.symbol, ub.balance
FROM public.user_balances ub
JOIN auth.users u ON ub.user_id = u.id
JOIN public.tokens t ON ub.token_id = t.id
WHERE u.email = 'user@example.com';

-- Check feature unlock status
SELECT *
FROM public.feature_unlocks
WHERE user_id = 'user-uuid';

-- Check daily token claims
SELECT *
FROM public.day_token_claims
WHERE user_id = 'user-uuid'
ORDER BY claimed_at DESC;

-- Check user metrics
SELECT *
FROM public.user_metrics
WHERE user_id = 'user-uuid'
ORDER BY recorded_at DESC;
```

## Environment Setup

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Local Development

1. Clone the repository
2. Install dependencies with `pnpm install`
3. Set up environment variables in `.env.local`
4. Start the development server with `pnpm dev`
5. Access the application at `http://localhost:3000`

### Database Migrations

Run database migrations using the Supabase CLI:

```bash
supabase migration up
```

## Conclusion

This developer guide provides a comprehensive overview of the Avolve platform's regenerative gamified system. By following these guidelines and best practices, you can effectively contribute to the platform's development and enhance its gamification features.
