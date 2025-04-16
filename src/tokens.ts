import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { metricsService } from './metrics';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * TokensService - Manages token operations and utility
 * Handles token balances, transfers, and utility functions
 */
export class TokensService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = supabaseUrl, supabaseKey: string = supabaseAnonKey) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Get all tokens
   * 
   * @returns List of all tokens
   */
  async getAllTokens(): Promise<{
    success: boolean;
    data?: Database['public']['Tables']['tokens']['Row'][];
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

      if (error) throw error;

      return {
        success: true,
        data
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
   * @param userId User ID to get balances for
   * @returns List of user's token balances
   */
  async getUserBalances(userId: string): Promise<{
    success: boolean;
    data?: Database['public']['Tables']['user_balances']['Row'][];
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
        .eq('user_id', userId)
        .order('balance', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data
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
   * @param userId User ID to get transactions for
   * @param limit Maximum number of transactions to return
   * @param offset Offset for pagination
   * @returns List of user's transactions
   */
  async getUserTransactions(userId: string, limit: number = 10, offset: number = 0): Promise<{
    success: boolean;
    data?: Database['public']['Tables']['transactions']['Row'][];
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
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data
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
   * @param tokenId Token ID to get details for
   * @returns Token details
   */
  async getTokenDetails(tokenId: string): Promise<{
    success: boolean;
    data?: Database['public']['Tables']['tokens']['Row'];
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
        .eq('id', tokenId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
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
   * @param fromUserId User ID sending tokens
   * @param toUserId User ID receiving tokens
   * @param tokenId Token ID to transfer
   * @param amount Amount to transfer
   * @param reason Reason for the transfer
   * @returns Result of the transfer
   */
  async transferTokens(fromUserId: string, toUserId: string, tokenId: string, amount: number, reason: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('transfer_tokens', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_token_id: tokenId,
        p_amount: amount,
        p_reason: reason
      });

      if (error) throw error;

      return {
        success: data.success,
        message: data.message
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
   * @param userId User ID spending GEN
   * @param amount Amount of GEN to spend
   * @param purpose Purpose of the spend (e.g., marketplace, premium features)
   * @returns Result of the spend operation
   */
  async spendGen(userId: string, amount: number, purpose: string): Promise<{
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
      const { data, error } = await this.supabase.rpc('spend_gen', {
        p_user_id: userId,
        p_amount: amount,
        p_purpose: purpose
      });

      if (error) throw error;

      if (!data.success) {
        return {
          success: false,
          error: data.message
        };
      }

      return {
        success: true,
        data: {
          amount: data.amount,
          spendAmount: data.spendAmount,
          burnAmount: data.burnAmount,
          remainingBalance: data.remainingBalance,
          message: data.message
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
   * @param userId User ID to get GEN balance for
   * @returns GEN balance
   */
  async getGenBalance(userId: string): Promise<{
    success: boolean;
    data?: {
      balance: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .eq('tokens.symbol', 'GEN')
        .join('tokens', 'user_balances.token_id = tokens.id')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      return {
        success: true,
        data: {
          balance: data?.balance || 0
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
   * @param tokenSymbol Symbol of the token to get supply for
   * @returns Total supply of the token
   */
  async getTokenSupply(tokenSymbol: string): Promise<{
    success: boolean;
    data?: {
      totalSupply: number;
      circulatingSupply: number;
      burnedSupply: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('get_token_supply', {
        p_token_symbol: tokenSymbol
      });

      if (error) throw error;

      return {
        success: true,
        data
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
