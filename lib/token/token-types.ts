/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_HIERARCHY
 * @ai-context This file defines the core types for the token system
 * @ai-related-to token-service.ts, token-repository.ts
 * @ai-sacred-geometry tesla-369
 *
 * Token Types
 *
 * This file contains TypeScript interfaces for the Avolve token system.
 * It defines the core data structures for tokens, token types, balances,
 * transactions, and related concepts.
 */

import { AuthError } from '@supabase/supabase-js';

/**
 * Custom error class for token-related errors
 */
export class TokenError extends Error {
  /**
   * Creates a new TokenError
   *
   * @param message - The error message
   * @param originalError - The original error that caused this error (optional)
   */
  constructor(
    public readonly message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'TokenError';
  }
}

/**
 * Transaction status enum
 * Defines the possible states of a token transaction
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Transaction types enum
 * Defines the possible types of token transactions
 */
export enum TransactionType {
  MINT = 'mint',
  BURN = 'burn',
  TRANSFER = 'transfer',
  CLAIM = 'claim',
  REWARD = 'reward',
}

/**
 * Result interface for token operations
 * Provides a standardized return type for all token-related functions
 *
 * @template T - The type of data returned in the result
 */
export interface TokenResult<T = any> {
  /** The data returned by the operation, or null if an error occurred */
  data: T | null;
  /** The error that occurred during the operation, or null if successful */
  error: TokenError | AuthError | null;
  /** Optional message providing additional context about the result */
  message?: string;
}

/**
 * Token interface
 * Represents a token in the Avolve platform
 */
export interface Token {
  /** Unique identifier for the token */
  id: string;
  /** ID of the token type this token belongs to */
  token_type_id: string;
  /** Display name for the token */
  name: string;
  /** Short symbol for the token (e.g., GEN, SAP, PSP) */
  symbol: string;
  /** Optional description of the token's purpose and usage */
  description?: string;
  /** Additional metadata for the token */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** Whether the token can be transferred between users */
  is_transferable?: boolean;
  /** Whether the token is currently active */
  is_active?: boolean;
  /** When the token was created */
  created_at?: string;
  /** When the token was last updated */
  updated_at?: string;
  /** Digital root of the token (3, 6, or 9 for Tesla tokens) */
  digital_root?: number;
  /** Whether the token is part of Tesla's 3-6-9 pattern */
  is_tesla_369?: boolean;
  /** Fibonacci weight for reward calculations */
  fibonacci_weight?: number;
  /** Golden ratio multiplier for value calculations */
  golden_ratio_multiplier?: number;
  /** Token family based on digital root */
  token_family?: string;
  /** Gradient colors for UI display */
  gradient?: string;
  /** Day of week for claiming (0-6, Sunday-Saturday) */
  claim_day?: number;
}

/**
 * Token Type interface
 * Represents a category of tokens in the Avolve platform
 */
export interface TokenType {
  /** Unique identifier for the token type */
  id: string;
  /** Unique code for the token type (e.g., GEN, SAP, PSP) */
  code: string;
  /** Display name for the token type */
  name: string;
  /** Optional description of the token type's purpose */
  description?: string;
  /** ID of the parent token type (for hierarchical relationships) */
  parent_token_type_id?: string;
  /** Whether this is a system-defined token type */
  is_system?: boolean;
  /** Additional metadata for the token type */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** When the token type was created */
  created_at?: string;
  /** When the token type was last updated */
  updated_at?: string;
  /** Level in the token hierarchy (3, 6, or 9) */
  token_level?: number;
}

/**
 * Token Ownership interface
 * Represents a user's ownership of a specific token
 */
export interface TokenOwnership {
  /** Unique identifier for the ownership record */
  id: string;
  /** ID of the user who owns the token */
  user_id: string;
  /** ID of the token being owned */
  token_id: string;
  /** Current balance of the token */
  balance: number;
  /** When the ownership record was created */
  created_at?: string;
  /** When the ownership record was last updated */
  updated_at?: string;
  /** Additional metadata for the ownership */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** The token being owned (for joined queries) */
  tokens?: Token;
}

/**
 * Token Permission interface
 * Represents a permission granted by owning a specific token
 */
export interface TokenPermission {
  /** Unique identifier for the permission */
  id: string;
  /** ID of the token type that grants this permission */
  token_type_id: string;
  /** ID of the permission being granted */
  permission_id: string;
  /** Minimum balance required to have this permission */
  min_balance: number;
  /** When the permission was created */
  created_at?: string;
}

/**
 * Token Transaction interface
 * Represents a transaction involving tokens
 */
export interface TokenTransaction {
  /** Unique identifier for the transaction */
  id: string;
  /** ID of the token involved in the transaction */
  token_id: string;
  /** ID of the user sending tokens (optional for minting) */
  from_user_id?: string;
  /** ID of the user receiving tokens (optional for burning) */
  to_user_id?: string;
  /** Amount of tokens being transacted */
  amount: number;
  /** Type of transaction (mint, burn, transfer, etc.) */
  transaction_type: string;
  /** Current status of the transaction */
  status: string;
  /** Optional reason for the transaction */
  reason?: string;
  /** Additional metadata for the transaction */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** When the transaction was created */
  created_at?: string;
  /** The token involved in the transaction (for joined queries) */
  token?: Token;
  /** The user sending tokens (for joined queries) */
  from_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  /** The user receiving tokens (for joined queries) */
  to_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

/**
 * Token Balance interface
 * Represents a user's balance of a specific token type
 */
export interface TokenBalance {
  /** Unique identifier for the balance record */
  id: string;
  /** ID of the user who owns the token */
  user_id: string;
  /** ID of the token type being owned */
  token_type_id: string;
  /** Current balance of the token */
  balance: number;
  /** When the balance was last updated */
  last_updated: string;
  /** Additional metadata for the balance */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** The token type being owned (for joined queries) */
  token_type?: TokenType;
}

/**
 * Consensus Meeting interface
 * Represents a consensus meeting in the Avolve platform
 */
export interface ConsensusMeeting {
  /** Unique identifier for the meeting */
  id: string;
  /** ID of the user who created the meeting */
  creator_id: string;
  /** ID of the group the meeting belongs to */
  group_id: string;
  /** Title of the meeting */
  title: string;
  /** Optional description of the meeting */
  description?: string;
  /** When the meeting is scheduled to start */
  scheduled_at: string;
  /** Duration of the meeting in minutes */
  duration_minutes: number;
  /** Current status of the meeting */
  status: string;
  /** When the meeting actually started */
  started_at?: string;
  /** When the meeting actually ended */
  ended_at?: string;
  /** Outcome of the meeting */
  outcome?: string;
  /** Notes from the meeting */
  notes?: string;
  /** When the meeting record was created */
  created_at: string;
  /** When the meeting record was last updated */
  updated_at?: string;
  /** Additional metadata for the meeting */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** The user who created the meeting (for joined queries) */
  creator?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

/**
 * Consensus Group interface
 * Represents a group that can hold consensus meetings
 */
export interface ConsensusGroup {
  /** Unique identifier for the group */
  id: string;
  /** Name of the group */
  name: string;
  /** Optional description of the group */
  description?: string;
  /** ID of the user who created the group */
  created_by: string;
  /** Whether the group is currently active */
  is_active: boolean;
  /** When the group was created */
  created_at: string;
  /** When the group was last updated */
  updated_at?: string;
  /** Additional metadata for the group */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** The user who created the group (for joined queries) */
  created_by_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

/**
 * Consensus Participant interface
 * Represents a participant in a consensus meeting
 */
export interface ConsensusParticipant {
  /** Unique identifier for the participant record */
  id: string;
  /** ID of the meeting the participant is in */
  meeting_id: string;
  /** ID of the user who is participating */
  user_id: string;
  /** Current status of the participant */
  status: string;
  /** When the participant was invited */
  invited_at?: string;
  /** When the participant joined the meeting */
  joined_at?: string;
  /** When the participant record was created */
  created_at: string;
  /** When the participant record was last updated */
  updated_at?: string;
  /** Additional metadata for the participant */
  metadata?: Record<string, string | number | boolean | null | undefined>;
  /** The user who is participating (for joined queries) */
  user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

/**
 * Pending Respect interface
 * Represents a pending respect transaction between users
 */
export interface PendingRespect {
  /** Unique identifier for the pending respect */
  id: string;
  /** ID of the meeting where the respect was given */
  meeting_id: string;
  /** ID of the user giving respect */
  from_user_id: string;
  /** ID of the user receiving respect */
  to_user_id: string;
  /** Amount of respect being given */
  amount: number;
  /** Optional reason for giving respect */
  reason?: string;
  /** Whether the respect has been processed */
  is_processed: boolean;
  /** When the respect was processed */
  processed_at?: string;
  /** When the pending respect was created */
  created_at: string;
  /** The user giving respect (for joined queries) */
  from_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  /** The user receiving respect (for joined queries) */
  to_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

/**
 * Token Leaderboard Entry interface
 * Represents an entry in a token leaderboard
 */
export interface TokenLeaderboardEntry {
  /** ID of the user in the leaderboard */
  user_id: string;
  /** Username of the user */
  username?: string;
  /** Full name of the user */
  full_name?: string;
  /** URL to the user's avatar */
  avatar_url?: string;
  /** Current token balance */
  balance: number;
  /** Current rank in the leaderboard */
  rank: number;
}

/**
 * Token Stats interface
 * Represents statistics for a token type
 */
export interface TokenStats {
  /** ID of the token type */
  token_type_id: string;
  /** Name of the token */
  token_name: string;
  /** Symbol of the token */
  token_symbol: string;
  /** Total supply of the token */
  total_supply: number;
  /** Number of users holding the token */
  holders_count: number;
  /** Number of transactions involving the token */
  transactions_count: number;
  /** Average balance per holder */
  average_balance: number;
}

/**
 * User Token Summary interface
 * Represents a summary of a user's token activity
 */
export interface UserTokenSummary {
  /** ID of the user */
  user_id: string;
  /** Total tokens received by the user */
  total_tokens_received: number;
  /** Total tokens sent by the user */
  total_tokens_sent: number;
  /** Number of unique token types held by the user */
  unique_token_types: number;
  /** Information about the user's most active token */
  most_active_token?: {
    /** ID of the token type */
    token_type_id: string;
    /** Name of the token */
    token_name: string;
    /** Symbol of the token */
    token_symbol: string;
    /** Number of transactions involving this token */
    transaction_count: number;
  };
}

/**
 * Daily Token interface
 * Represents a token that can be claimed on a specific day of the week
 */
export interface DailyToken {
  /** ID of the token */
  id: string;
  /** Symbol of the token (e.g., GEN, SAP, PSP) */
  symbol: string;
  /** Name of the token */
  name: string;
  /** Day of week for claiming (0-6, Sunday-Saturday) */
  day_of_week: number;
  /** CSS gradient for UI display */
  gradient: string;
  /** Whether this token is part of Tesla's 3-6-9 pattern */
  is_tesla_369: boolean;
}

/**
 * Maps day of week to token symbol
 * Based on the Avolve weekly token schedule
 */
export const DAY_TO_TOKEN_MAP: Record<number, string> = {
  0: 'SPD', // Sunday: Superpuzzle Developments
  1: 'SHE', // Monday: Superhuman Enhancements
  2: 'PSP', // Tuesday: Personal Success Puzzle
  3: 'SSA', // Wednesday: Supersociety Advancements
  4: 'BSP', // Thursday: Business Success Puzzle
  5: 'SGB', // Friday: Supergenius Breakthroughs
  6: 'SMS', // Saturday: Supermind Superpowers
};
