/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_SERVICE
 * @ai-context This module provides token service functionality with consent checks
 * @ai-related-to token-claim.ts, token-repository.ts, token-types.ts
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { 
  TokenResult, 
  TokenClaimOptions, 
  TokenClaimResult,
  UserStreak,
  TokenTransferResult
} from './token-service.types';
import { TokenClaimService } from './token-claim';
import { Logger } from '@/lib/monitoring/logger';

/**
 * Token Service
 * 
 * Provides token operations with consent checks in accordance with
 * The Prime Law's principles of voluntary consent
 */
export class TokenService {
  private logger: Logger;
  private tokenClaimService: TokenClaimService;
  
  constructor(
    private supabase: SupabaseClient<Database>
  ) {
    this.logger = new Logger('TokenService');
    this.tokenClaimService = new TokenClaimService(supabase);
  }
  
  /**
   * Check if user has given consent for a token operation
   * 
   * @param userId - The user ID to check consent for
   * @param consentType - The type of consent to check
   * @param actionType - The action type to check
   * @param resourceId - Optional resource ID to check consent for
   * @returns Whether the user has given consent
   */
  private async hasConsent(
    userId: string,
    consentType: string,
    actionType: string,
    resourceId?: string
  ): Promise<boolean> {
    try {
      // Build query
      let query = this.supabase
        .from('user_consent')
        .select('*')
        .eq('user_id', userId)
        .eq('interaction_type', consentType)
        .eq('terms->action', actionType)
        .eq('status', 'approved');
      
      // Add resource ID filter if provided
      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        this.logger.error('Error checking consent:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      this.logger.error('Unexpected error checking consent:', error);
      return false;
    }
  }
  
  /**
   * Record user consent for a token operation
   * 
   * @param userId - The user ID giving consent
   * @param consentType - The type of consent
   * @param actionType - The action type
   * @param terms - The terms of the consent
   * @param metadata - Optional metadata
   * @returns The consent ID if successful
   */
  public async recordConsent(
    userId: string,
    consentType: string,
    actionType: string,
    terms: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<TokenResult<{ consent_id: string }>> {
    try {
      const { data, error } = await this.supabase
        .from('user_consent')
        .insert({
          user_id: userId,
          interaction_type: consentType,
          terms: {
            action: actionType,
            ...terms
          },
          status: 'approved',
          metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('consent_id')
        .single();
      
      if (error) {
        this.logger.error('Error recording consent:', error);
        return {
          success: false,
          error: {
            code: 'CONSENT_ERROR',
            message: 'Failed to record consent',
            details: error
          }
        };
      }
      
      return {
        success: true,
        data: { consent_id: data.consent_id }
      };
    } catch (error) {
      this.logger.error('Unexpected error recording consent:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while recording consent',
          details: error
        }
      };
    }
  }
  
  /**
   * Claim daily token with consent check
   * 
   * @param userId - The user ID claiming the token
   * @param challengeId - The challenge ID
   * @param amount - The amount to claim
   * @param multiplier - Optional multiplier
   * @param reason - Optional reason
   * @param consentGiven - Whether consent has been explicitly given
   * @returns Token claim result
   */
  public async claimDailyToken(
    userId: string,
    challengeId: string,
    amount: number,
    multiplier: number = 1,
    reason?: string,
    consentGiven: boolean = false
  ): Promise<TokenResult<TokenClaimResult>> {
    // Check if user has given consent or explicit consent is provided
    const hasConsent = consentGiven || await this.hasConsent(userId, 'token_claim', 'claim');
    
    if (!hasConsent) {
      return {
        success: false,
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'User consent is required to claim tokens in accordance with The Prime Law'
        }
      };
    }
    
    // Proceed with token claim
    return this.tokenClaimService.claimDailyToken(
      userId,
      challengeId,
      amount,
      multiplier,
      reason
    );
  }
  
  /**
   * Claim challenge reward with consent check
   * 
   * @param userId - The user ID
   * @param challengeId - The challenge ID
   * @param tokenId - The token ID
   * @param baseAmount - The base amount
   * @param streakLength - The streak length
   * @param consentGiven - Whether consent has been explicitly given
   * @returns Challenge reward result
   */
  public async claimChallengeReward(
    userId: string,
    challengeId: string,
    tokenId: string,
    baseAmount: number,
    streakLength: number,
    consentGiven: boolean = false
  ): Promise<TokenResult<{ 
    success: boolean; 
    message: string; 
    transaction_id?: string;
    unlocked?: boolean;
  }>> {
    // Check if user has given consent or explicit consent is provided
    const hasConsent = consentGiven || await this.hasConsent(userId, 'token_claim', 'claim');
    
    if (!hasConsent) {
      return {
        success: false,
        error: {
          code: 'CONSENT_REQUIRED',
          message: 'User consent is required to claim challenge rewards in accordance with The Prime Law'
        }
      };
    }
    
    // Proceed with challenge reward claim
    return this.tokenClaimService.claimChallengeReward(
      userId,
      challengeId,
      tokenId,
      baseAmount,
      streakLength
    );
  }
  
  /**
   * Batch claim tokens for multiple challenges
   * This improves performance by reducing the number of database operations
   * 
   * @param userId - The user ID claiming tokens
   * @param claims - Array of token claim requests
   * @param consentGiven - Whether consent has been given for all claims
   * @returns Results of all token claims
   */
  public async batchClaimTokens(
    userId: string,
    claims: Array<{
      challengeId: string;
      tokenId: string;
      amount: number;
      streakLength?: number;
      reason?: string;
    }>,
    consentGiven: boolean = false
  ): Promise<TokenResult<{
    results: Array<{
      challengeId: string;
      success: boolean;
      message: string;
      transaction_id?: string;
      error?: string;
    }>;
    successCount: number;
    failureCount: number;
  }>> {
    try {
      // Verify consent for batch operation
      if (!consentGiven) {
        const consentType = 'token_claim';
        const actionType = 'batch_claim';
        
        // Record consent for batch operation
        const consentResult = await this.recordConsent(
          userId,
          consentType,
          actionType,
          {
            claims: claims.map(claim => ({
              challengeId: claim.challengeId,
              tokenId: claim.tokenId,
              amount: claim.amount
            }))
          }
        );
        
        if (!consentResult.success) {
          return {
            success: false,
            error: {
              code: 'CONSENT_REQUIRED',
              message: 'Explicit consent is required for batch token claims in accordance with The Prime Law',
              details: consentResult.error
            }
          };
        }
      }
      
      // Prepare batch transaction
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Authentication required for token operations',
            details: sessionError
          }
        };
      }
      
      // Execute all claims and collect results
      const results = await Promise.all(
        claims.map(async claim => {
          try {
            let result;
            
            // Determine if this is a streak-based claim
            if (claim.streakLength) {
              result = await this.tokenClaimService.processStreakReward(
                userId,
                claim.challengeId,
                claim.tokenId,
                claim.amount,
                claim.streakLength,
                claim.reason
              );
            } else {
              result = await this.tokenClaimService.mintTokens(
                userId,
                claim.tokenId,
                claim.amount,
                claim.reason
              );
            }
            
            return {
              challengeId: claim.challengeId,
              success: result.success,
              message: result.message || 'Token claim processed',
              transaction_id: result.transaction_id
            };
          } catch (error) {
            this.logger.error(`Error processing claim for challenge ${claim.challengeId}:`, error);
            return {
              challengeId: claim.challengeId,
              success: false,
              message: 'Failed to process token claim',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      // Count successes and failures
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return {
        success: successCount > 0,
        data: {
          results,
          successCount,
          failureCount
        }
      };
    } catch (error) {
      this.logger.error('Unexpected error in batch token claim:', error);
      return {
        success: false,
        error: {
          code: 'BATCH_OPERATION_FAILED',
          message: 'Failed to process batch token claims',
          details: error
        }
      };
    }
  }

  /**
   * Get token availability for the current day
   * Based on the weekly token schedule
   * 
   * @returns Information about the available token for today
   */
  public getTokenForToday(): TokenResult<{
    day: string;
    token: {
      symbol: string;
      name: string;
      description: string;
      gradient: string;
      journey: 'individual' | 'collective';
    };
    nextToken: {
      symbol: string;
      name: string;
      day: string;
    };
  }> {
    try {
      const days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ];
      
      const tokens = [
        {
          day: 'Sunday',
          symbol: 'SPD',
          name: 'Superpuzzle Developments',
          description: 'Tokens for collective innovation and development',
          gradient: 'from-red-500 via-green-500 to-blue-500',
          journey: 'collective' as const
        },
        {
          day: 'Monday',
          symbol: 'SHE',
          name: 'Superhuman Enhancements',
          description: 'Tokens for personal development and enhancement',
          gradient: 'from-rose-500 via-red-500 to-orange-500',
          journey: 'collective' as const
        },
        {
          day: 'Tuesday',
          symbol: 'PSP',
          name: 'Personal Success Puzzle',
          description: 'Tokens for individual achievement and success',
          gradient: 'from-amber-500 to-yellow-500',
          journey: 'individual' as const
        },
        {
          day: 'Wednesday',
          symbol: 'SSA',
          name: 'Supersociety Advancements',
          description: 'Tokens for social systems and community',
          gradient: 'from-lime-500 via-green-500 to-emerald-500',
          journey: 'collective' as const
        },
        {
          day: 'Thursday',
          symbol: 'BSP',
          name: 'Business Success Puzzle',
          description: 'Tokens for business operations and growth',
          gradient: 'from-teal-500 to-cyan-500',
          journey: 'individual' as const
        },
        {
          day: 'Friday',
          symbol: 'SGB',
          name: 'Supergenius Breakthroughs',
          description: 'Tokens for research and development',
          gradient: 'from-sky-500 via-blue-500 to-indigo-500',
          journey: 'collective' as const
        },
        {
          day: 'Saturday',
          symbol: 'SMS',
          name: 'Supermind Superpowers',
          description: 'Tokens for mental capabilities and growth',
          gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
          journey: 'individual' as const
        }
      ];
      
      const today = new Date();
      const dayIndex = today.getDay();
      const todayToken = tokens[dayIndex];
      const tomorrowToken = tokens[(dayIndex + 1) % 7];
      
      return {
        success: true,
        data: {
          day: days[dayIndex],
          token: todayToken,
          nextToken: {
            symbol: tomorrowToken.symbol,
            name: tomorrowToken.name,
            day: days[(dayIndex + 1) % 7]
          }
        }
      };
    } catch (error) {
      this.logger.error('Error determining token for today:', error);
      return {
        success: false,
        error: {
          code: 'TOKEN_SCHEDULE_ERROR',
          message: 'Failed to determine today\'s token',
          details: error
        }
      };
    }
  }

  /**
   * Transfer tokens with consent check
   * 
   * @param fromUserId - The user ID sending tokens
   * @param toUserId - The user ID receiving tokens
   * @param tokenId - The token ID
   * @param amount - The amount to transfer
   * @param reason - Optional reason
   * @param consentGiven - Whether consent has been given
   * @returns Token transfer result
   */
  public async transferTokens(
    fromUserId: string,
    toUserId: string,
    tokenId: string,
    amount: number,
    reason?: string,
    consentGiven: boolean = false
  ): Promise<TokenResult<TokenTransferResult>> {
    try {
      // Validate inputs
      if (!fromUserId || !toUserId || !tokenId) {
        return {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Missing required parameters for token transfer',
            details: { fromUserId, toUserId, tokenId }
          }
        };
      }
      
      if (amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Transfer amount must be greater than zero',
            details: { amount }
          }
        };
      }
      
      // Get token details for validation and messaging
      const { data: token, error: tokenError } = await this.supabase
        .from('tokens')
        .select('id, symbol, name, transferable')
        .eq('id', tokenId)
        .single();
      
      if (tokenError || !token) {
        return {
          success: false,
          error: {
            code: 'TOKEN_NOT_FOUND',
            message: 'The specified token does not exist',
            details: tokenError
          }
        };
      }
      
      // Check if token is transferable
      if (!token.transferable) {
        return {
          success: false,
          error: {
            code: 'TOKEN_NOT_TRANSFERABLE',
            message: `${token.symbol} tokens are not transferable`,
            details: { tokenSymbol: token.symbol }
          }
        };
      }
      
      // Verify consent if not explicitly given
      if (!consentGiven) {
        const consentType = 'token_transfer';
        const actionType = 'send';
        
        // Record consent for transfer
        const consentResult = await this.recordConsent(
          fromUserId,
          consentType,
          actionType,
          {
            tokenId,
            tokenSymbol: token.symbol,
            amount,
            recipient: toUserId,
            reason
          }
        );
        
        if (!consentResult.success) {
          return {
            success: false,
            error: {
              code: 'CONSENT_REQUIRED',
              message: 'Explicit consent is required for token transfers in accordance with The Prime Law',
              details: consentResult.error
            }
          };
        }
      }
      
      // Check sender's balance
      const { data: balanceData, error: balanceError } = await this.supabase
        .from('user_balances')
        .select('amount')
        .eq('user_id', fromUserId)
        .eq('token_id', tokenId)
        .single();
      
      if (balanceError) {
        return {
          success: false,
          error: {
            code: 'BALANCE_CHECK_FAILED',
            message: 'Failed to check token balance',
            details: balanceError
          }
        };
      }
      
      const currentBalance = balanceData?.amount || 0;
      
      if (currentBalance < amount) {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: `Insufficient ${token.symbol} balance for transfer`,
            details: { 
              required: amount, 
              available: currentBalance,
              tokenSymbol: token.symbol
            }
          }
        };
      }
      
      // Create transaction record
      const { data: transaction, error: transactionError } = await this.supabase
        .from('token_transactions')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          token_id: tokenId,
          amount,
          reason,
          transaction_type: 'transfer',
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (transactionError) {
        return {
          success: false,
          error: {
            code: 'TRANSACTION_CREATION_FAILED',
            message: 'Failed to create transaction record',
            details: transactionError
          }
        };
      }
      
      // Update sender's balance (decrement)
      const { error: senderUpdateError } = await this.supabase.rpc(
        'update_token_balance',
        {
          p_user_id: fromUserId,
          p_token_id: tokenId,
          p_amount: -amount
        }
      );
      
      if (senderUpdateError) {
        // Attempt to revert the transaction
        await this.supabase
          .from('token_transactions')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', transaction.id);
        
        return {
          success: false,
          error: {
            code: 'SENDER_UPDATE_FAILED',
            message: 'Failed to update sender balance',
            details: senderUpdateError
          }
        };
      }
      
      // Update recipient's balance (increment)
      const { error: recipientUpdateError } = await this.supabase.rpc(
        'update_token_balance',
        {
          p_user_id: toUserId,
          p_token_id: tokenId,
          p_amount: amount
        }
      );
      
      if (recipientUpdateError) {
        // Attempt to revert the transaction and sender's balance
        await this.supabase
          .from('token_transactions')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', transaction.id);
        
        await this.supabase.rpc(
          'update_token_balance',
          {
            p_user_id: fromUserId,
            p_token_id: tokenId,
            p_amount: amount // Restore the sender's balance
          }
        );
        
        return {
          success: false,
          error: {
            code: 'RECIPIENT_UPDATE_FAILED',
            message: 'Failed to update recipient balance',
            details: recipientUpdateError
          }
        };
      }
      
      return {
        success: true,
        data: {
          success: true,
          message: `Successfully transferred ${amount} ${token.symbol} to recipient`,
          transaction_id: transaction.id
        }
      };
    } catch (error) {
      this.logger.error('Unexpected error transferring tokens:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while transferring tokens',
          details: error instanceof Error ? { message: error.message, stack: error.stack } : error
        }
      };
    }
  }

  /**
   * Get user token balances
   * 
   * @param userId - The user ID to get balances for
   * @returns User token balances
   */
  public async getUserBalances(userId: string): Promise<TokenResult<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('user_balances')
        .select(`
          amount,
          tokens:token_id (
            id,
            symbol,
            name,
            description,
            icon_url,
            gradient_class,
            is_primary,
            token_type,
            parent_id
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        this.logger.error('Error getting user balances:', error);
        return {
          success: false,
          error: {
            code: 'QUERY_ERROR',
            message: 'Failed to get user balances',
            details: error
          }
        };
      }
      
      return {
        success: true,
        data: data.map(item => ({
          token: item.tokens,
          amount: item.amount
        }))
      };
    } catch (error) {
      this.logger.error('Unexpected error getting user balances:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting user balances',
          details: error
        }
      };
    }
  }
  
  /**
   * Get user token transactions
   * 
   * @param userId - The user ID to get transactions for
   * @param limit - Optional limit on number of transactions
   * @param offset - Optional offset for pagination
   * @returns User token transactions
   */
  public async getUserTransactions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<TokenResult<any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('token_transactions')
        .select(`
          id,
          token_id,
          from_user_id,
          to_user_id,
          amount,
          transaction_type,
          reason,
          status,
          created_at,
          tokens:token_id (
            symbol,
            name
          ),
          from_user:from_user_id (
            id,
            username
          ),
          to_user:to_user_id (
            id,
            username
          )
        `)
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit)
        .offset(offset);
      
      if (error) {
        this.logger.error('Error getting user transactions:', error);
        return {
          success: false,
          error: {
            code: 'QUERY_ERROR',
            message: 'Failed to get user transactions',
            details: error
          }
        };
      }
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.logger.error('Unexpected error getting user transactions:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting user transactions',
          details: error
        }
      };
    }
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Export a singleton instance
export const tokenService = new TokenService(supabase);

// Export default for direct imports
export default tokenService;
