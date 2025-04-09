# Contributing to Avolve

Thank you for your interest in contributing to the Avolve platform! This guide will help you get started with the development environment, understand our workflow, and learn how to contribute effectively.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Environment](#development-environment)
4. [Database Migrations](#database-migrations)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [Style Guidelines](#style-guidelines)
8. [Documentation](#documentation)

## Code of Conduct

Our community is dedicated to providing a welcoming and inclusive environment for everyone. We expect all contributors to adhere to our [Code of Conduct](./code-of-conduct.md).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Supabase CLI
- PostgreSQL (for local development)
- Git

### Repository Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/avolve.git
   cd avolve
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/avolve-dao/avolve.git
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```

## Development Environment

### Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

For local development with Supabase, you can use:

```bash
supabase start
```

This will provide you with local URLs and keys to use in your `.env.local` file.

### Running the Development Server

```bash
pnpm dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

## Database Migrations

The Avolve platform uses Supabase migrations to manage database schema changes. All migrations are stored in the `supabase/migrations` directory.

### Creating a New Migration

When making changes to the database schema, create a new migration file:

```bash
supabase migration new name_of_your_migration
```

This will create a new file in the `supabase/migrations` directory with the naming convention:

```
YYYYMMDDHHmmss_name_of_your_migration.sql
```

### Migration File Format

Migration files should follow these guidelines:

1. Include a header comment explaining the purpose of the migration
2. Use lowercase for SQL keywords
3. Use snake_case for table and column names
4. Include appropriate RLS policies for new tables
5. Add comments for complex operations

Example:

```sql
-- Migration: create_challenge_streaks_table
-- Description: Creates a table to track user challenge streaks with Tesla's 3-6-9 pattern

-- Create the challenge_streaks table
create table public.challenge_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_type text not null,
  current_daily_streak integer not null default 0,
  longest_daily_streak integer not null default 0,
  current_weekly_streak integer not null default 0,
  longest_weekly_streak integer not null default 0,
  last_daily_completion_date date,
  last_weekly_completion_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, token_type)
);

-- Add indexes for performance
create index idx_challenge_streaks_user_id on public.challenge_streaks(user_id);
create index idx_challenge_streaks_token_type on public.challenge_streaks(token_type);

-- Add RLS policies
alter table public.challenge_streaks enable row level security;

-- Users can view their own challenge streaks
create policy "Users can view their own challenge streaks"
on public.challenge_streaks
for select using (user_id = auth.uid());

-- Users can insert their own challenge streaks
create policy "Challenge streaks are only insertable by the system or the user"
on public.challenge_streaks
for insert with check (user_id = auth.uid());

-- Users can update their own challenge streaks
create policy "Challenge streaks are only updatable by the system or the user"
on public.challenge_streaks
for update using (user_id = auth.uid());
```

### Applying Migrations

To apply migrations to your local development database:

```bash
supabase migration up
```

To apply migrations to a specific environment:

```bash
supabase migration up --db-url=your-database-url
```

### Reverting Migrations

If you need to revert a migration:

```bash
supabase migration down -n 1
```

This will revert the most recent migration. You can specify the number of migrations to revert with the `-n` flag.

### Seeding Test Data

For development purposes, you can seed the database with test data:

1. Create or modify seed files in the `supabase/seed` directory
2. Run the seed command:

```bash
supabase db seed
```

The seed data includes:
- Sample tokens and token types
- Test users with various permission levels
- Example daily and weekly challenges
- Sample invitation tiers and codes

#### Sample Seed Data

Here's an example of seed data for the challenge system:

```sql
-- Insert token types
INSERT INTO public.token_types (code, name, description)
VALUES
  ('GEN', 'Supercivilization', 'Top-level token representing the entire ecosystem'),
  ('SAP', 'Superachiever', 'Individual journey tokens'),
  ('SCQ', 'Superachievers', 'Collective journey tokens');

-- Insert tokens
INSERT INTO public.tokens (symbol, name, description, is_active, gradient)
VALUES
  ('PSP', 'Personal Success Puzzle', 'Token for personal development', true, 'bg-gradient-to-r from-amber-500 to-yellow-500'),
  ('BSP', 'Business Success Puzzle', 'Token for business development', true, 'bg-gradient-to-r from-teal-500 to-cyan-500'),
  ('SMS', 'Supermind Superpowers', 'Token for mental mastery', true, 'bg-gradient-to-r from-violet-500 to-fuchsia-500');

-- Insert daily challenges
INSERT INTO public.daily_token_challenges (reward_id, challenge_name, challenge_description, completion_criteria, bonus_amount)
VALUES
  ((SELECT id FROM public.tokens WHERE symbol = 'PSP'), 'Morning Reflection', 'Complete a 5-minute morning reflection', '{"type": "reflection", "duration": 5}', 10),
  ((SELECT id FROM public.tokens WHERE symbol = 'BSP'), 'Business Goal Setting', 'Set one business goal for the day', '{"type": "goal", "count": 1}', 10),
  ((SELECT id FROM public.tokens WHERE symbol = 'SMS'), 'Mindfulness Practice', 'Complete a 10-minute mindfulness session', '{"type": "mindfulness", "duration": 10}', 10);
```

## Testing

When adding new features or fixing bugs, please include appropriate tests. We follow these testing principles:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test interactions between components
3. **End-to-End Tests**: Test complete user flows

### Running Tests

To run all tests:

```bash
pnpm test
```

To run tests in watch mode:

```bash
pnpm test:watch
```

### Testing Database Migrations and Functions

When working with database features, it's essential to test migrations and database functions thoroughly:

#### Running Migrations in Test Environment

```bash
# Start the test database
supabase start

# Run all migrations
supabase migration up

# Run a specific migration
supabase migration up 20250408185408_create_challenge_system.sql

# Verify migration status
supabase migration list
```

#### Testing Database Functions

To test database functions like the Tesla's 3-6-9 streak calculation:

```bash
# Connect to the database
supabase db connect

# Test the calculate_streak_bonus function
SELECT calculate_streak_bonus('user-id-here', 'PSP', 10, true);

# Test the update_challenge_streak trigger
INSERT INTO user_challenge_completions (user_id, challenge_id) 
VALUES ('user-id-here', 'challenge-id-here');

# Verify the streak was updated
SELECT * FROM challenge_streaks WHERE user_id = 'user-id-here';
```

#### Seeding Test Data

To seed your test database with challenge and invitation data:

```bash
# Run the seed script
supabase db seed

# Or run a specific seed file
psql -U postgres -h localhost -p 54322 -d postgres -f supabase/seed/challenge_seed.sql
```

Example seed data for testing the challenge system:

```sql
-- Insert test tokens
INSERT INTO tokens (symbol, name, description, is_active, gradient_class)
VALUES
  ('PSP', 'Personal Success Puzzle', 'Token for personal development', true, 'bg-gradient-to-r from-amber-500 to-yellow-500'),
  ('BSP', 'Business Success Puzzle', 'Token for business development', true, 'bg-gradient-to-r from-teal-500 to-cyan-500'),
  ('SMS', 'Supermind Superpowers', 'Token for mental development', true, 'bg-gradient-to-r from-violet-500 to-fuchsia-500');

-- Insert test daily challenges
INSERT INTO daily_token_challenges (reward_id, challenge_name, challenge_description, completion_criteria, bonus_amount, day_of_week)
VALUES
  ('psp-reward-id', 'Tuesday PSP Challenge', 'Complete a personal success activity', '{"action": "personal_activity"}', 10, 2),
  ('bsp-reward-id', 'Thursday BSP Challenge', 'Complete a business success activity', '{"action": "business_activity"}', 10, 4),
  ('sms-reward-id', 'Saturday SMS Challenge', 'Complete a supermind activity', '{"action": "mental_activity"}', 10, 6);
```

### Writing Tests for Challenge and Invitation Systems

Example test for a challenge service function:

```typescript
import { ChallengeService } from '../lib/challenge/challenge-service';
import { createMockSupabaseClient } from '../test/mocks/supabase';

describe('ChallengeService', () => {
  let challengeService: ChallengeService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    challengeService = new ChallengeService(mockSupabase);
  });

  describe('completeDailyChallenge', () => {
    it('should complete a daily challenge successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const challengeId = 'test-challenge-id';
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: challengeId,
                reward_id: 'psp-token-id',
                bonus_amount: 10
              },
              error: null
            })
          })
        })
      });

      // Act
      const result = await challengeService.completeDailyChallenge(userId, challengeId);

      // Assert
      expect(result.data?.success).toBe(true);
      expect(result.data?.points).toBe(10);
      expect(result.data?.tokenSymbol).toBe('PSP');
    });
    
    it('should apply Tesla 3-6-9 streak bonus correctly', async () => {
      // Arrange
      const userId = 'test-user-id';
      const challengeId = 'test-challenge-id';
      // Mock a user with a 9-day streak
      mockSupabase.rpc.mockResolvedValueOnce({
        data: 19, // 1.9x multiplier for 9-day streak
        error: null
      });
      
      // Act
      const result = await challengeService.completeDailyChallenge(userId, challengeId);
      
      // Assert
      expect(result.data?.points).toBe(19); // 10 base * 1.9 multiplier
    });
  });
});
```

Example test for the invitation service:

```typescript
import { InvitationService } from '../lib/invitation/invitation-service';
import { createMockSupabaseClient } from '../test/mocks/supabase';

describe('InvitationService', () => {
  let invitationService: InvitationService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    invitationService = new InvitationService(mockSupabase);
  });

  describe('claimInvitationReward', () => {
    it('should claim invitation reward successfully', async () => {
      // Arrange
      const userId = 'test-user-id';
      const request = {
        invitationId: 'test-invitation-id',
        code: 'TEST123'
      };
      
      // Mock invitation data
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: request.invitationId,
                code: request.code,
                status: 'CLAIMED',
                tier_id: 'gold-tier-id'
              },
              error: null
            })
          })
        })
      });
      
      // Mock tier data
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'gold-tier-id',
                tier_name: 'Gold',
                reward_amount: 20
              },
              error: null
            })
          })
        })
      });
      
      // Act
      const result = await invitationService.claimInvitationReward(userId, request);
      
      // Assert
      expect(result.data?.success).toBe(true);
      expect(result.data?.amount).toBe(20);
      expect(result.data?.tierName).toBe('Gold');
    });
  });
});
```

## Pull Request Process

1. Ensure your code follows our style guidelines
2. Update documentation as necessary
3. Include tests for new features or bug fixes
4. Make sure all tests pass
5. Submit a pull request to the `main` branch
6. Wait for code review and address any feedback

## Style Guidelines

### TypeScript

We follow the [Airbnb TypeScript Style Guide](https://github.com/airbnb/javascript) with some modifications. Key points:

- Use TypeScript for all new code
- Use interfaces for object types
- Use functional components with hooks for React
- Use async/await for asynchronous code
- Use proper error handling with try/catch

### SQL

For SQL code:

- Use lowercase for SQL keywords
- Use snake_case for table and column names
- Include appropriate comments
- Always set `search_path = ''` in functions
- Use fully qualified names (schema.table) in queries

## Documentation

### Code Documentation

- Use JSDoc comments for functions and classes
- Include descriptions for parameters and return values
- Add examples for complex functions
- Use `@ai-anchor` tags for AI-assisted documentation

Example:

```typescript
/**
 * @ai-anchor #CHALLENGE_SYSTEM
 * @ai-context This service handles challenge completion and rewards
 * 
 * Completes a daily challenge for a user and awards tokens
 * 
 * @param userId - The ID of the user completing the challenge
 * @param challengeId - The ID of the challenge to complete
 * @returns A promise resolving to a ChallengeResult containing success status and reward details
 * 
 * @example
 * const result = await challengeService.completeDailyChallenge(userId, challengeId);
 * if (result.data?.success) {
 *   console.log(`Earned ${result.data.points} ${result.data.tokenSymbol} tokens!`);
 * }
 */
public async completeDailyChallenge(
  userId: string,
  challengeId: string
): Promise<ChallengeResult<ChallengeCompletion>> {
  // Implementation
}
```

### User Documentation

When adding new features, please update the relevant user documentation in the `docs` directory. This includes:

- User guides
- Feature explanations
- FAQs
- Screenshots or diagrams (when helpful)

## Thank You!

Your contributions help make the Avolve platform better for everyone. We appreciate your time and effort!

---

*For more information, see the [Database Schema](./database-schema.md) and [Architecture Overview](./architecture.md).*
