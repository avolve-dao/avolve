/**
 * Token Types
 * 
 * This file contains TypeScript interfaces for the token system.
 */

import { AuthError } from '@supabase/supabase-js';

// Result interface
export interface TokenResult<T = any> {
  data: T | null;
  error: AuthError | null;
  message?: string;
}

// Token Type interface
export interface TokenType {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  is_active: boolean;
  is_transferable: boolean;
  transfer_fee: number;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

// Token Balance interface
export interface TokenBalance {
  id: string;
  user_id: string;
  token_type_id: string;
  balance: number;
  last_updated: string;
  metadata?: Record<string, any>;
  token_type?: TokenType;
}

// Token Transaction interface
export interface TokenTransaction {
  id: string;
  from_user_id?: string;
  to_user_id?: string;
  token_type_id: string;
  amount: number;
  fee_amount: number;
  reason?: string;
  status: string;
  created_at: string;
  metadata?: Record<string, any>;
  token_type?: TokenType;
  from_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  to_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

// Consensus Meeting interface
export interface ConsensusMeeting {
  id: string;
  creator_id: string;
  group_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  started_at?: string;
  ended_at?: string;
  outcome?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  creator?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

// Consensus Group interface
export interface ConsensusGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  created_by_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

// Consensus Participant interface
export interface ConsensusParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  status: string;
  invited_at?: string;
  joined_at?: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

// Pending Respect interface
export interface PendingRespect {
  id: string;
  meeting_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  reason?: string;
  is_processed: boolean;
  processed_at?: string;
  created_at: string;
  from_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
  to_user?: {
    id: string;
    username?: string;
    full_name?: string;
  };
}

// Token Leaderboard Entry interface
export interface TokenLeaderboardEntry {
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  balance: number;
  rank: number;
}

// Token Stats interface
export interface TokenStats {
  token_type_id: string;
  token_name: string;
  token_symbol: string;
  total_supply: number;
  holders_count: number;
  transactions_count: number;
  average_balance: number;
}

// User Token Summary interface
export interface UserTokenSummary {
  user_id: string;
  total_tokens_received: number;
  total_tokens_sent: number;
  unique_token_types: number;
  most_active_token?: {
    token_type_id: string;
    token_name: string;
    token_symbol: string;
    transaction_count: number;
  };
}
