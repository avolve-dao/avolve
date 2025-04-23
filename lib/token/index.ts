/**
 * Tokens Service
 * Provides functionality for interacting with the Avolve token system
 * 
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createClient } from '@/lib/supabase/client';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  description: string;
  icon_url?: string;
  color?: string;
  pillar?: 'superachiever' | 'superachievers' | 'supercivilization';
  total_supply?: number;
  circulating_supply?: number;
  burn_rate?: number;
  transferable?: boolean;
}

export interface TokenTransaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  token_id: string;
  amount: number;
  reason: string;
  created_at: string;
  token_symbol?: string;
  token_name?: string;
  from_user_name?: string;
  to_user_name?: string;
}

export interface TokenBalance {
  token_id: string;
  balance: number;
  tokens: Token;
}

export type TokenSpendPurpose = 
  | 'marketplace' 
  | 'premium_features' 
  | 'governance' 
  | 'staking' 
  | 'donation' 
  | 'other';

export interface TokenSupplyStats {
  total_supply: number;
  circulating_supply: number;
  burn_rate: number;
  holders_count: number;
}

/**
 * Service for interacting with the token system
 */
export const tokensService = {
  /**
   * Get all available tokens
   */
  async getAllTokens(): Promise<{ success: boolean; data?: Token[]; error?: string }> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .order('symbol');
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch tokens' 
      };
    }
  },
  
  /**
   * Get token balances for a specific user
   */
  async getUserBalances(userId: string): Promise<{ success: boolean; data?: TokenBalance[]; error?: string }> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select(`
          id,
          token_id,
          balance,
          tokens (
            id,
            symbol,
            name,
            description,
            icon_url,
            color,
            pillar
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      // Map tokens array to single object per TokenBalance
      const mappedData = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            tokens: Array.isArray(item.tokens) ? item.tokens[0] : item.tokens,
          }))
        : [];
      return { success: true, data: mappedData };
    } catch (error) {
      console.error('Error fetching user balances:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch user balances' 
      };
    }
  },
  
  /**
   * Get transaction history for a user
   */
  async getUserTransactions(
    userId: string, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<{ success: boolean; data?: TokenTransaction[]; error?: string }> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_transactions', {
          p_user_id: userId,
          p_limit: limit,
          p_offset: offset
        });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch transaction history' 
      };
    }
  },
  
  /**
   * Get details for a specific token
   */
  async getTokenDetails(tokenId: string): Promise<{ success: boolean; data?: Token; error?: string }> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('tokens')
        .select('*')
        .eq('id', tokenId)
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching token details:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch token details' 
      };
    }
  },
  
  /**
   * Transfer tokens from one user to another
   */
  async transferTokens(
    fromUserId: string,
    toUserId: string,
    tokenId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; data?: any; message?: string; error?: string }> {
    const supabase = createClient();
    
    try {
      if (amount <= 0) {
        return { success: false, error: 'Amount must be greater than 0' };
      }
      
      const { data, error } = await supabase
        .rpc('transfer_tokens', {
          p_from_user_id: fromUserId,
          p_to_user_id: toUserId,
          p_token_id: tokenId,
          p_amount: amount,
          p_reason: reason
        });
      
      if (error) throw error;
      
      return { 
        success: true, 
        data,
        message: 'Tokens transferred successfully' 
      };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to transfer tokens' 
      };
    }
  },
  
  /**
   * Spend GEN tokens for utility purposes
   * Includes token burning mechanism
   */
  async spendGen(
    userId: string,
    amount: number,
    purpose: TokenSpendPurpose
  ): Promise<{ success: boolean; data?: { burnAmount: number }; error?: string }> {
    const supabase = createClient();
    
    try {
      if (amount <= 0) {
        return { success: false, error: 'Amount must be greater than 0' };
      }
      
      const { data, error } = await supabase
        .rpc('spend_gen_tokens', {
          p_user_id: userId,
          p_amount: amount,
          p_purpose: purpose
        });
      
      if (error) throw error;
      
      // Calculate burn amount (10% of spent amount)
      const burnAmount = Math.floor(amount * 0.1);
      
      return { 
        success: true, 
        data: { burnAmount } 
      };
    } catch (error) {
      console.error('Error spending GEN tokens:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to spend GEN tokens' 
      };
    }
  },
  
  /**
   * Get token supply statistics
   */
  async getTokenSupply(tokenSymbol: string): Promise<{ success: boolean; data?: TokenSupplyStats; error?: string }> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .rpc('get_token_supply_stats', {
          p_symbol: tokenSymbol
        });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching token supply:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch token supply statistics' 
      };
    }
  }
};
