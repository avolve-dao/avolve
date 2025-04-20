/**
 * Token Service Types
 * 
 * This file contains TypeScript types for the token service and related functionality.
 * It defines the structure of token operations, claims, and results.
 */

import { Database } from '@/lib/supabase/database.types';

/**
 * Token types from the database
 */
export type Token = Database['public']['Tables']['tokens']['Row'];
export type TokenTransaction = Database['public']['Tables']['token_transactions']['Row'];
export type UserBalance = Database['public']['Tables']['user_balances']['Row'];
export type UserStreak = {
  current_streak: number;
  longest_streak: number;
  last_claim_date: string;
  next_milestone: number;
  days_until_milestone: number;
};

/**
 * Token result wrapper for handling success/error responses
 */
export type TokenResult<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
};

/**
 * Token claim options
 */
export type TokenClaimOptions = {
  userId: string;
  tokenId: string;
  amount: number;
  reason?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Token claim result
 */
export type TokenClaimResult = {
  success: boolean;
  message: string;
  transaction_id?: string;
  streak?: {
    current: number;
    next_milestone: number;
    days_until_milestone: number;
    bonus_multiplier: number;
  };
};

/**
 * Token transfer options
 */
export interface TokenTransferOptions {
  fromUserId: string;
  toUserId: string;
  tokenId: string;
  amount: number;
  reason?: string;
}

/**
 * Token transfer result
 */
export type TokenTransferResult = {
  success: boolean;
  message: string;
  transaction_id?: string;
};

/**
 * Token mint options
 */
export interface TokenMintOptions {
  toUserId: string;
  tokenId: string;
  amount: number;
  reason?: string;
}

/**
 * Token mint result
 */
export interface TokenMintResult {
  success: boolean;
  message: string;
  transaction_id?: string;
}

/**
 * Token analytics options
 */
export interface TokenAnalyticsOptions {
  userId: string;
  daysBack?: number;
}

/**
 * Token analytics result
 */
export interface TokenAnalyticsResult {
  success: boolean;
  user_id?: string;
  timestamp?: string;
  period_days?: number;
  balances?: TokenBalance[];
  transaction_history?: Record<string, DailyTransactionData>;
  streak?: StreakData;
  daily_tokens?: DailyTokenData[];
  summary?: AnalyticsSummary;
}

/**
 * Token balance data
 */
export interface TokenBalance {
  symbol: string;
  name: string;
  gradient_class: string;
  token_level: number;
  amount: number;
}

/**
 * Daily transaction data
 */
export interface DailyTransactionData {
  received: number;
  sent: number;
  transaction_count: number;
  net: number;
  by_token: Record<string, {
    received: number;
    sent: number;
    net: number;
  }>;
}

/**
 * Streak data
 */
export interface StreakData {
  current: number;
  longest: number;
  last_claim_date: string | null;
}

/**
 * Daily token data
 */
export interface DailyTokenData {
  symbol: string;
  name: string;
  day: string;
  claim_count: number;
}

/**
 * Analytics summary
 */
export interface AnalyticsSummary {
  total_tokens: number;
  total_transactions: number;
  unique_token_types: number;
  most_active_day: string;
}

/**
 * User consent record
 */
export type UserConsent = {
  consent_id: string;
  user_id: string;
  interaction_type: string;
  terms: Record<string, unknown>;
  status: 'approved' | 'revoked' | 'pending';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/**
 * Consent operation result
 */
export type ConsentResult = {
  success: boolean;
  consent_id?: string;
  message?: string;
  error?: string;
};

/**
 * Token action
 */
export type TokenAction = {
  id: string;
  type: string;
  userId: string;
  tokenId: string;
  amount: number;
  createdAt: string;
  [key: string]: unknown;
};

/**
 * Token event
 */
export type TokenEvent = {
  id: string;
  actionId: string;
  eventType: string;
  timestamp: string;
  [key: string]: unknown;
};

/**
 * Token history
 */
export type TokenHistory = {
  id: string;
  tokenId: string;
  userId: string;
  change: number;
  timestamp: string;
  [key: string]: unknown;
};

/**
 * Token service interface
 */
export interface ITokenService {
  /**
   * Get a token by ID
   */
  getTokenById(tokenId: string): Promise<TokenResult<Token>>;
  
  /**
   * Get a token by symbol
   */
  getTokenBySymbol(symbol: string): Promise<TokenResult<Token>>;
  
  /**
   * Get all tokens
   */
  getAllTokens(): Promise<TokenResult<Token[]>>;
  
  /**
   * Get tokens for a specific day
   */
  getTokensForDay(dayOfWeek: number): Promise<TokenResult<Token[]>>;
  
  /**
   * Get user balance for a specific token
   */
  getUserBalance(userId: string, tokenId: string): Promise<TokenResult<UserBalance>>;
  
  /**
   * Get all user balances
   */
  getUserBalances(userId: string): Promise<TokenResult<UserBalance[]>>;
  
  /**
   * Mint tokens to a user
   */
  mintTokens(options: TokenMintOptions): Promise<TokenResult<TokenMintResult>>;
  
  /**
   * Transfer tokens between users
   */
  transferTokens(options: TokenTransferOptions): Promise<TokenResult<TokenTransferResult>>;
  
  /**
   * Claim daily token
   */
  claimDailyToken(options: TokenClaimOptions): Promise<TokenResult<TokenClaimResult>>;
  
  /**
   * Get user token analytics
   */
  getUserTokenAnalytics(options: TokenAnalyticsOptions): Promise<TokenResult<TokenAnalyticsResult>>;
  
  /**
   * Get user streak
   */
  getUserStreak(userId: string): Promise<TokenResult<UserStreak>>;
}
