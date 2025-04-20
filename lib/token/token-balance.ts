/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_BALANCE
 * @ai-context This module handles token balance operations for the Avolve platform
 * @ai-related-to token-repository.ts, token-types.ts, token-service.ts
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  TokenBalance,
  TokenResult,
  TokenError
} from './token-types';
import { TokenRepository } from './token-repository';
import { retryOperation } from './token-utils';

/**
 * Token Balance Service
 * 
 * This service handles token balance operations, including fetching balances
 * and calculating levels based on token amounts.
 */
export class TokenBalanceService {
  private repository: TokenRepository;
  
  /**
   * Creates a new TokenBalanceService instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(client: SupabaseClient) {
    this.repository = new TokenRepository(client);
  }

  /**
   * Get a user's token balance
   * 
   * @param userId - The ID of the user
   * @param tokenId - The ID of the token
   * @returns A promise resolving to a TokenResult containing the user's token balance
   */
  public async getUserTokenBalance(userId: string, tokenId: string): Promise<TokenResult<number>> {
    return this.repository.getUserTokenBalance(userId, tokenId);
  }

  /**
   * Get tokens owned by a user
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a TokenResult containing an array of TokenOwnership objects
   */
  public async getUserTokens(userId: string): Promise<TokenResult<any>> {
    return this.repository.getUserTokens(userId);
  }

  /**
   * Get user token balances with additional information
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a TokenResult containing an array of TokenBalance objects
   */
  public async getUserTokenBalances(userId: string): Promise<TokenResult<TokenBalance[]>> {
    try {
      const { data: ownerships, error } = await this.repository.getUserTokens(userId);
      
      if (error) {
        console.error('Get user token balances error:', error);
        return { data: null, error };
      }
      
      if (!ownerships || ownerships.length === 0) {
        return { data: [], error: null };
      }
      
      // Get token details for each ownership
      const balances: TokenBalance[] = [];
      
      for (const ownership of ownerships) {
        const { data: token, error: tokenError } = await this.repository.getTokenById(ownership.token_id);
        
        if (tokenError || !token) {
          console.error(`Error fetching token ${ownership.token_id}:`, tokenError);
          continue;
        }
        
        balances.push({
          id: token.id,
          user_id: ownership.user_id,
          token_type_id: token.token_type_id,
          balance: ownership.balance,
          last_updated: ownership.updated_at ?? new Date().toISOString()
        });
      }
      
      return { data: balances, error: null };
    } catch (error) {
      console.error('Unexpected get user token balances error:', error);
      return { 
        data: null, 
        error: new TokenError('An unexpected error occurred while getting user token balances', error) 
      };
    }
  }

  /**
   * Calculate token level based on amount
   * 
   * @param amount - The token amount
   * @returns The token level
   */
  public calculateTokenLevel(amount: number): number {
    return Math.floor(amount / 100) + 1;
  }

  /**
   * Calculate progress to next level
   * 
   * @param amount - The token amount
   * @returns Progress percentage to next level (0-100)
   */
  public calculateLevelProgress(amount: number): number {
    return (amount % 100);
  }

  /**
   * Calculate tokens needed for next level
   * 
   * @param amount - The token amount
   * @returns Tokens needed for next level
   */
  public calculateTokensToNextLevel(amount: number): number {
    return 100 - (amount % 100);
  }
}
