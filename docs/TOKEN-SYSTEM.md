# Avolve Token System Documentation

Copyright 2025 Avolve DAO and the Joshua Seymour Family. All rights reserved. Proprietary and confidential.

This document and its contents are proprietary and confidential.

## Overview

The Avolve token system implements a comprehensive tokenomics framework that supports the platform's experience phases and gamification strategy. This document provides technical details on the implementation, database schema, and usage patterns.

## Token Types

### Primary Token

- **GEN Token**: The primary token of the Avolve ecosystem with potential external liquidity
  - Used for governance voting
  - Implements a burn mechanism (10% of spent tokens are burned)
  - Tracks circulating supply and burn rate

### Utility Tokens

Each pillar has its own set of utility tokens:

1. **Superachiever Pillar**
   - **PSP (Personal Success Puzzle)**: Earned through personal development activities
   - **BSP (Business Success Puzzle)**: Earned through business development activities
   - **SMS (Supermind Superpowers)**: Earned through cognitive enhancement activities

2. **Superachievers Pillar**
   - **SPD (Superpuzzle Developments)**: Earned through collaborative problem-solving
   - **SHE (Superhuman Enhancements)**: Earned through physical optimization
   - **SSA (Supersociety Advancements)**: Earned through community contributions
   - **SGB (Supergenius Breakthroughs)**: Earned through innovative thinking

3. **Supercivilization Pillar**
   - **SCQ (Supercivilization Quotient)**: Earned through governance participation

## Database Schema

### Tables

1. **tokens**
   - `id`: UUID (primary key)
   - `symbol`: Text (e.g., "GEN", "PSP")
   - `name`: Text (full name)
   - `description`: Text
   - `icon_url`: Text (optional)
   - `color`: Text (optional)
   - `pillar`: Text (optional, references pillar)
   - `total_supply`: Bigint
   - `circulating_supply`: Bigint
   - `active`: Boolean
   - `transferable`: Boolean
   - `transfer_fee`: Numeric
   - `created_at`: Timestamptz
   - `updated_at`: Timestamptz

2. **user_tokens**
   - `id`: UUID (primary key)
   - `user_id`: UUID (references auth.users)
   - `token_id`: UUID (references tokens)
   - `balance`: Integer
   - `created_at`: Timestamptz
   - `updated_at`: Timestamptz
   - `last_updated`: Timestamptz

3. **token_transactions**
   - `id`: UUID (primary key)
   - `from_user_id`: UUID (references auth.users, nullable)
   - `to_user_id`: UUID (references auth.users, nullable)
   - `token_id`: UUID (references tokens)
   - `amount`: Integer
   - `reason`: Text
   - `transaction_type`: Text (transfer, spend, reward, mint, burn)
   - `created_at`: Timestamptz
   - `updated_at`: Timestamptz

4. **token_burns**
   - `id`: UUID (primary key)
   - `transaction_id`: UUID (references token_transactions)
   - `token_id`: UUID (references tokens)
   - `amount`: Integer
   - `burn_reason`: Text
   - `created_at`: Timestamptz

5. **token_rewards**
   - `id`: UUID (primary key)
   - `user_id`: UUID (references auth.users)
   - `token_id`: UUID (references tokens)
   - `amount`: Integer
   - `reason`: Text
   - `source`: Text
   - `created_at`: Timestamptz

### Views

1. **token_transaction_summary**
   - Aggregates transaction data for analytics
   - Provides daily, weekly, and monthly summaries

### Functions

1. **transfer_tokens**
   - Transfers tokens between users
   - Parameters:
     - `p_from_user_id`: UUID
     - `p_to_user_id`: UUID
     - `p_token_id`: UUID
     - `p_amount`: Integer
     - `p_reason`: Text
   - Returns: JSON with transaction result

2. **spend_gen_tokens**
   - Implements GEN token spending with burn mechanism
   - Parameters:
     - `p_user_id`: UUID
     - `p_amount`: Integer
     - `p_purpose`: Text
   - Returns: JSON with transaction result and burn amount

3. **get_user_transactions**
   - Retrieves transaction history for a user
   - Parameters:
     - `p_user_id`: UUID
     - `p_limit`: Integer (default: 10)
     - `p_offset`: Integer (default: 0)
   - Returns: JSON array of transactions

4. **get_token_supply_stats**
   - Retrieves supply statistics for a token
   - Parameters:
     - `p_symbol`: Text
   - Returns: JSON with supply statistics

## Integration with Experience Phases

The token system is tightly integrated with the experience phases system:

1. **Phase Milestone Rewards**
   - Completing milestones awards tokens
   - Different token types based on pillar and phase
   - Token rewards increase with phase progression

2. **Token-Gated Features**
   - Features are unlocked based on token balances
   - Requirements vary by feature and experience phase
   - Progressive disclosure of advanced features

3. **Token Burn Mechanism**
   - 10% of spent GEN tokens are burned
   - Increases scarcity over time
   - Encourages active participation

## Client Implementation

### React Hooks

1. **useTokens** (from `@/hooks/use-tokens`)
   - Provides token management functionality
   - Real-time balance updates via Supabase subscriptions
   - Methods for transferring tokens and checking balances

```typescript
// Example usage
import { useTokens } from '@/hooks/use-tokens';
const { 
  tokens, 
  userBalances, 
  transferTokens, 
  getTokenBalance, 
  hasEnoughTokens 
} = useTokens(); // from @/hooks/use-tokens

// Check if user has enough tokens
if (hasEnoughTokens('GEN', 100)) {
  // Perform action
}

// Transfer tokens
await transferTokens(recipientId, 'GEN', 50, 'Contribution reward');
```

### Token Service

The `tokensService` provides lower-level access to token functionality:

```typescript
import { tokensService } from '@/lib/tokens';

// Get all tokens
const { data: tokens } = await tokensService.getAllTokens();

// Get user balances
const { data: balances } = await tokensService.getUserBalances(userId);

// Transfer tokens
const result = await tokensService.transferTokens(
  fromUserId,
  toUserId,
  tokenId,
  amount,
  reason
);

// Spend GEN tokens
const { data } = await tokensService.spendGen(
  userId,
  amount,
  'marketplace'
);
```

## Security Considerations

1. **Row Level Security**
   - Users can only view their own token balances
   - Users can only initiate transfers from their own accounts
   - Token burn records are publicly viewable

2. **Transaction Atomicity**
   - All token transfers use database transactions
   - Prevents partial transfers and data inconsistency

3. **Validation**
   - Amount validation (must be greater than zero)
   - Balance validation (must have sufficient funds)
   - Purpose validation for token spending

## Performance Optimizations

1. **Indexing**
   - Indexes on user_id, token_id, and created_at columns
   - Optimized for frequent balance lookups

2. **Real-time Updates**
   - Efficient Supabase subscriptions for balance changes
   - Targeted updates to minimize unnecessary re-renders

3. **Caching**
   - Client-side caching of token definitions
   - Optimistic UI updates for better user experience

## Future Enhancements

1. **Token Staking**
   - Allow users to stake tokens for rewards
   - Implement time-locked staking with variable rewards

2. **Token Exchange**
   - Enable exchange between different token types
   - Implement variable exchange rates based on scarcity

3. **NFT Integration**
   - Convert achievements to NFTs
   - Implement NFT marketplace for digital assets

4. **Psibase Integration**
   - Prepare for migration to Psibase blockchain
   - Implement bridge for token transfers between systems

## Conclusion

The Avolve token system provides a robust foundation for the platform's gamification strategy and experience phases. By following the patterns and practices outlined in this document, developers can effectively work with the token system and extend its functionality as needed.
