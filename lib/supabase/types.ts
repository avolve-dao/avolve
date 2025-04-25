/**
 * Supabase Types
 *
 * This file contains TypeScript interfaces for Supabase data models and responses.
 */

import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

/**
 * Supabase context result
 */
export interface UseSupabaseResult {
  supabase: SupabaseClient<Database>;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Token model
 */
export interface Token {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  token_type_id: string;
  is_active: boolean;
  is_transferable: boolean;
  transfer_fee_percentage?: number;
  gradient?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Token type model
 */
export interface TokenType {
  id: string;
  code: string;
  name: string;
  description?: string;
  parent_token_type_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * Token ownership model
 */
export interface TokenOwnership {
  id: string;
  user_id: string;
  token_id: string;
  amount: number;
  is_locked: boolean;
  last_claimed?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Token transaction model
 */
export interface TokenTransaction {
  id: string;
  token_id: string;
  from_user_id?: string;
  to_user_id: string;
  amount: number;
  transaction_type: string;
  reason?: string;
  tx_hash?: string;
  status: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

/**
 * Token balance model with additional information
 */
export interface TokenBalance {
  token_id: string;
  token_name: string;
  token_symbol: string;
  amount: number;
  is_locked: boolean;
  level: number;
  last_claimed?: string;
}

/**
 * Challenge model
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  token_type: string;
  difficulty: number;
  day_of_week: number;
  base_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Challenge streak model
 */
export interface ChallengeStreak {
  id: string;
  user_id: string;
  token_type: string;
  streak_length: number;
  last_daily_completion_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Challenge completion model
 */
export interface ChallengeCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  token_id: string;
  amount: number;
  streak_multiplier: number;
  completed_at: string;
}

/**
 * Debug query information
 */
export interface DebugQuery {
  table: string;
  query: string;
  duration: number;
  error?: string;
}

/**
 * Debug data for the debug panel
 */
export interface DebugData {
  queries: DebugQuery[];
  performance: Record<string, number>;
  session: User | null;
  state: Record<string, any>;
}

/**
 * Token result with data and error
 */
export interface TokenResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Token error
 */
export class TokenError extends Error {
  constructor(
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'TokenError';
  }
}
