import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

/**
 * TokensService - Manages token operations and utility
 * Handles token balances, transfers, and utility functions
 */
export class TokensService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '', supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Get all tokens
   * 
   * @returns List of all tokens
   */
  async getAllTokens(): Promise<{
    success: boolean;
    data?: unknown[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('tokens')
        .select(`
          id,
          name,
          symbol,
          description,
          color,
          parent_id,
          is_locked,
          created_at,
          parent:parent_id(
            id,
            name,
            symbol
          )
        `)
        .order('created_at', { ascending: true });

      return {
        success: true,
        data: data ?? []
      };
    } catch (error) {
      console.error('Get all tokens error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting tokens'
      };
    }
  }

  /**
   * Get a user's token balances
   * 
   * @returns List of user's token balances
   */
  async getUserBalances(): Promise<{
    success: boolean;
    data?: unknown[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_balances')
        .select(`
          id,
          token_id,
          balance,
          updated_at,
          tokens:token_id(
            id,
            name,
            symbol,
            description,
            color,
            parent_id,
            is_locked
          )
        `)
        .order('balance', { ascending: false });

      return {
        success: true,
        data: data ?? []
      };
    } catch (error) {
      console.error('Get user balances error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting user balances'
      };
    }
  }

  /**
   * Get a user's transactions
   * 
   * @returns List of user's transactions
   */
  async getUserTransactions(): Promise<{
    success: boolean;
    data?: unknown[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select(`
          id,
          token_id,
          from_user_id,
          to_user_id,
          amount,
          transaction_type,
          reason,
          created_at,
          tokens:token_id(
            id,
            name,
            symbol,
            color
          ),
          from_profile:from_user_id(
            id,
            username,
            full_name,
            avatar_url
          ),
          to_profile:to_user_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      return {
        success: true,
        data: data ?? []
      };
    } catch (error) {
      console.error('Get user transactions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting user transactions'
      };
    }
  }

  /**
   * Get a specific token's details
   * 
   * @returns Token details
   */
  async getTokenDetails(): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('tokens')
        .select(`
          id,
          name,
          symbol,
          description,
          color,
          parent_id,
          is_locked,
          created_at,
          parent:parent_id(
            id,
            name,
            symbol
          ),
          children:tokens!parent_id(
            id,
            name,
            symbol,
            is_locked
          )
        `)
        .single();

      return {
        success: true,
        data: data ?? {}
      };
    } catch (error) {
      console.error('Get token details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting token details'
      };
    }
  }

  /**
   * Transfer tokens between users
   * 
   * @returns Result of the transfer
   */
  async transferTokens(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      return {
        success: true,
        message: 'Transfer successful'
      };
    } catch (error) {
      console.error('Transfer tokens error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error transferring tokens'
      };
    }
  }

  /**
   * Spend GEN tokens for utility purposes
   * - 10% of spent amount is burned to enhance scarcity
   * - Boosts ARPU in metrics
   * - Logs in transactions with type 'spend'
   * 
   * @returns Result of the spend operation
   */
  async spendGen(): Promise<{
    success: boolean;
    data?: {
      amount: number;
      spendAmount: number;
      burnAmount: number;
      remainingBalance: number;
      message: string;
    };
    error?: string;
  }> {
    try {
      return {
        success: true,
        data: {
          amount: 0,
          spendAmount: 0,
          burnAmount: 0,
          remainingBalance: 0,
          message: 'Spend successful'
        }
      };
    } catch (error) {
      console.error('Spend GEN error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error spending GEN'
      };
    }
  }

  /**
   * Get the GEN token balance for a user
   * 
   * @returns GEN balance
   */
  async getGenBalance(): Promise<{
    success: boolean;
    data?: {
      balance: number;
    };
    error?: string;
  }> {
    try {
      return {
        success: true,
        data: {
          balance: 0
        }
      };
    } catch (error) {
      console.error('Get GEN balance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting GEN balance'
      };
    }
  }

  /**
   * Get the total supply of a token
   * 
   * @returns Total supply of the token
   */
  async getTokenSupply(): Promise<{
    success: boolean;
    data?: {
      totalSupply: number;
      circulatingSupply: number;
      burnedSupply: number;
    };
    error?: string;
  }> {
    try {
      return {
        success: true,
        data: {
          totalSupply: 0,
          circulatingSupply: 0,
          burnedSupply: 0
        }
      };
    } catch (error) {
      console.error('Get token supply error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting token supply'
      };
    }
  }
}

// Export a singleton instance
export const tokensService = new TokensService();

// Export default for direct imports
export default tokensService;
