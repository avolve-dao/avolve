/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_CLAIM
 * @ai-context This module handles token claiming operations for the Avolve platform
 * @ai-related-to token-repository.ts, token-types.ts, token-service.ts
 * @ai-sacred-geometry tesla-369
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  TokenResult, 
  TokenClaimOptions, 
  TokenClaimResult,
  UserStreak
} from './token-service.types';
import { Logger } from '@/lib/monitoring/logger';
import { 
  retryOperation, 
  calculateStreakBonus, 
  getNextStreakMilestone, 
  getDaysUntilNextMilestone 
} from './token-utils';

/**
 * Token Claim Service
 * 
 * This service handles token claiming operations, including minting tokens
 * and processing challenge rewards with streak bonuses.
 */
export class TokenClaimService {
  private logger: Logger;

  constructor(
    private supabase: SupabaseClient
  ) {
    this.logger = new Logger('TokenClaimService');
  }

  /**
   * Mint new tokens for a user
   * 
   * @param toUserId - The ID of the user receiving tokens
   * @param tokenId - The ID of the token to mint
   * @param amount - The amount of tokens to mint
   * @param reason - Optional reason for minting
   * @returns A promise resolving to a TokenResult containing the transaction result
   */
  public async mintTokens(
    toUserId: string, 
    tokenId: string, 
    amount: number,
    reason?: string
  ): Promise<TokenResult<{ success: boolean; message: string; transaction_id?: string }>> {
    // Validate inputs
    if (!toUserId) {
      return { 
        success: false,
        data: { success: false, message: 'User ID is required' }, 
        error: {
          code: 'INVALID_USER',
          message: 'User ID is required'
        } 
      };
    }
    
    if (!tokenId) {
      return { 
        success: false,
        data: { success: false, message: 'Token ID is required' }, 
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token ID is required'
        } 
      };
    }
    
    if (amount <= 0) {
      return { 
        success: false,
        data: { success: false, message: 'Amount must be greater than 0' }, 
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be greater than 0'
        } 
      };
    }
    
    try {
      // Get token details
      const { data: token, error: tokenError } = await retryOperation(() => 
        this.supabase
          .from('tokens')
          .select('*')
          .eq('id', tokenId)
          .single()
      );
      
      if (tokenError || !token) {
        this.logger.error('Get token error:', tokenError, { toUserId, tokenId });
        return { 
          success: false,
          data: { success: false, message: 'Failed to get token details' }, 
          error: {
            code: 'TOKEN_ERROR',
            message: tokenError?.message || 'Unknown error',
            details: tokenError
          } 
        };
      }
      
      // Create transaction
      const { data: transaction, error: transactionError } = await retryOperation(() => 
        this.supabase
          .from('token_transactions')
          .insert({
            token_id: tokenId,
            to_user_id: toUserId,
            amount,
            transaction_type: 'mint',
            reason: reason || 'Token minting',
            status: 'completed'
          })
          .select('id')
          .single()
      );
      
      if (transactionError) {
        this.logger.error('Create transaction error:', transactionError, { toUserId, tokenId });
        return { 
          success: false,
          data: { success: false, message: 'Failed to create transaction' }, 
          error: {
            code: 'TRANSACTION_ERROR',
            message: transactionError.message,
            details: transactionError
          } 
        };
      }
      
      // Update user token balance
      const { error: updateError } = await retryOperation(() => 
        this.supabase
          .from('user_balances')
          .upsert({
            user_id: toUserId,
            token_id: tokenId,
            balance: amount
          }, {
            onConflict: 'user_id,token_id',
            ignoreDuplicates: false
          })
      );
      
      if (updateError) {
        this.logger.error('Update user token balance error:', updateError, { toUserId, tokenId });
        return { 
          success: false,
          data: { success: false, message: 'Failed to update user balance' }, 
          error: {
            code: 'BALANCE_ERROR',
            message: updateError.message,
            details: updateError
          } 
        };
      }
      
      return { 
        success: true,
        data: { 
          success: true, 
          message: `Successfully minted ${amount} tokens`, 
          transaction_id: transaction.id 
        }, 
        error: undefined
      };
    } catch (error) {
      this.logger.error('Unexpected mint tokens error:', error as Error, { toUserId, tokenId });
      return { 
        success: false,
        data: { success: false, message: 'An unexpected error occurred while minting tokens' }, 
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while minting tokens',
          details: error
        } 
      };
    }
  }

  /**
   * Claims a daily token reward for completing a challenge
   * 
   * @param userId - The ID of the user claiming the token
   * @param challengeId - The ID of the challenge completed
   * @param amount - The base amount of tokens to claim
   * @param multiplier - The streak multiplier to apply
   * @param reason - Optional reason for claiming
   * @returns A TokenResult with claim details
   */
  public async claimDailyToken(
    userId: string,
    challengeId: string,
    amount: number,
    multiplier: number = 1,
    reason?: string
  ): Promise<TokenResult<TokenClaimResult>> {
    try {
      this.logger.info('Claiming daily token', { userId, challengeId, amount, multiplier });

      // Use the database function to claim the daily token
      const { data, error } = await this.supabase.rpc('claim_daily_token', {
        p_user_id: userId,
        p_challenge_id: challengeId,
        p_amount: amount,
        p_multiplier: multiplier
      });

      if (error) {
        this.logger.error('Error claiming daily token', error, { userId, challengeId });
        return {
          success: false,
          data: {
            success: false,
            message: error.message
          },
          error: {
            code: 'CLAIM_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data as TokenClaimResult,
        error: undefined
      };
    } catch (error) {
      this.logger.error('Unexpected error claiming daily token', error as Error, { userId, challengeId });
      return {
        success: false,
        data: {
          success: false,
          message: 'An unexpected error occurred while claiming the daily token'
        },
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while claiming the daily token',
          details: error
        }
      };
    }
  }

  /**
   * Gets the current streak for a user
   * 
   * @param userId - The user ID to get the streak for
   * @returns A TokenResult with the user's streak information
   */
  public async getUserStreak(userId: string): Promise<TokenResult<UserStreak>> {
    try {
      this.logger.info('Getting user streak', { userId });

      // Validate input
      if (!userId) {
        return {
          success: false,
          data: {
            id: '',
            user_id: '',
            current_streak: 0,
            longest_streak: 0,
            last_claim_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          error: {
            code: 'INVALID_USER',
            message: 'User ID is required'
          }
        };
      }

      // Get user streak from database
      const { data, error } = await this.supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        this.logger.error('Error getting user streak', error, { userId });
        return {
          success: false,
          data: {
            id: '',
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_claim_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      // If no streak record exists, create one
      if (!data) {
        const { data: newStreak, error: createError } = await this.supabase
          .from('user_streaks')
          .insert({
            user_id: userId,
            current_streak: 0,
            longest_streak: 0,
            last_claim_date: null
          })
          .select('*')
          .single();

        if (createError) {
          this.logger.error('Error creating user streak', createError, { userId });
          return {
            success: false,
            data: {
              id: '',
              user_id: userId,
              current_streak: 0,
              longest_streak: 0,
              last_claim_date: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: {
              code: 'CREATE_ERROR',
              message: createError.message,
              details: createError
            }
          };
        }

        return {
          success: true,
          data: newStreak as UserStreak,
          error: undefined
        };
      }

      return {
        success: true,
        data: data as UserStreak,
        error: undefined
      };
    } catch (error) {
      this.logger.error('Unexpected error getting user streak', error as Error, { userId });
      return {
        success: false,
        data: {
          id: '',
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_claim_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting the user streak',
          details: error
        }
      };
    }
  }

  /**
   * Calculates the streak bonus multiplier based on the current streak
   * 
   * @param currentStreak - The user's current streak
   * @returns The streak bonus multiplier
   */
  private calculateStreakBonus(currentStreak: number): number {
    return calculateStreakBonus(currentStreak);
  }

  /**
   * Records a challenge completion
   * 
   * @param userId - The user ID completing the challenge
   * @param challengeId - The challenge ID that was completed
   * @param tokenId - The token ID that was claimed
   * @param amount - The amount of tokens claimed
   * @param streakMultiplier - The streak multiplier that was applied
   * @returns A TokenResult with the ID of the record
   */
  private async recordChallengeCompletion(
    userId: string,
    challengeId: string,
    tokenId: string,
    amount: number,
    streakMultiplier: number
  ): Promise<TokenResult<{ id: string }>> {
    try {
      this.logger.info('Recording challenge completion', { userId, challengeId, tokenId });

      // Record the completion in the database
      const { data, error } = await this.supabase
        .from('challenge_completions')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          token_id: tokenId,
          amount_earned: amount,
          streak_multiplier: streakMultiplier
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error('Error recording challenge completion', error, { userId, challengeId });
        return {
          success: false,
          data: { id: '' },
          error: {
            code: 'RECORD_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: { id: data.id },
        error: undefined
      };
    } catch (error) {
      this.logger.error('Unexpected error recording challenge completion', error as Error, { userId, challengeId });
      return {
        success: false,
        data: { id: '' },
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while recording the challenge completion',
          details: error
        }
      };
    }
  }

  /**
   * Claim a challenge reward with streak bonus
   * 
   * @param userId - The ID of the user
   * @param challengeId - The ID of the challenge
   * @param tokenId - The ID of the token to claim
   * @param baseAmount - The base amount of tokens to claim
   * @param streakLength - The user's current streak length
   * @returns A TokenResult with claim details
   */
  public async claimChallengeReward(
    userId: string,
    challengeId: string,
    tokenId: string,
    baseAmount: number,
    streakLength: number
  ): Promise<TokenResult<{ 
    success: boolean; 
    message: string; 
    transaction_id?: string;
    unlocked?: boolean;
  }>> {
    try {
      this.logger.info('Claiming challenge reward', { userId, challengeId, tokenId, baseAmount, streakLength });

      // Validate inputs
      if (!userId) {
        return {
          success: false,
          data: { success: false, message: 'User ID is required' },
          error: {
            code: 'INVALID_USER',
            message: 'User ID is required'
          }
        };
      }

      if (!challengeId) {
        return {
          success: false,
          data: { success: false, message: 'Challenge ID is required' },
          error: {
            code: 'INVALID_CHALLENGE',
            message: 'Challenge ID is required'
          }
        };
      }

      if (!tokenId) {
        return {
          success: false,
          data: { success: false, message: 'Token ID is required' },
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token ID is required'
          }
        };
      }

      if (baseAmount <= 0) {
        return {
          success: false,
          data: { success: false, message: 'Amount must be greater than 0' },
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Amount must be greater than 0'
          }
        };
      }

      // Get token details
      const { data: token, error: tokenError } = await this.supabase
        .from('tokens')
        .select('*')
        .eq('id', tokenId)
        .single();

      if (tokenError || !token) {
        this.logger.error('Error getting token details', tokenError, { tokenId });
        return {
          success: false,
          data: { success: false, message: 'Failed to get token details' },
          error: {
            code: 'TOKEN_ERROR',
            message: tokenError?.message || 'Unknown error',
            details: tokenError
          }
        };
      }

      // Calculate bonus multiplier based on streak length
      const bonusMultiplier = this.calculateStreakBonus(streakLength);
      
      // Apply bonus to base amount
      const adjustedAmount = Math.floor(baseAmount * bonusMultiplier);
      
      // Mint tokens
      const mintResult = await this.mintTokens(
        userId,
        tokenId,
        adjustedAmount,
        bonusMultiplier > 1 
          ? `Challenge reward with ${bonusMultiplier}x streak bonus` 
          : 'Challenge reward'
      );
      
      if (!mintResult.success || mintResult.error) {
        this.logger.error('Error minting tokens', mintResult.error, { userId, challengeId });
        return {
          success: false,
          data: { success: false, message: 'Failed to mint tokens' },
          error: {
            code: 'MINT_ERROR',
            message: mintResult.error?.message || 'Unknown error',
            details: mintResult.error
          }
        };
      }
      
      // Record the claim
      await this.recordChallengeCompletion(
        userId,
        challengeId,
        tokenId,
        adjustedAmount,
        bonusMultiplier
      );
      
      return {
        success: true,
        data: { 
          success: true, 
          message: bonusMultiplier > 1 
            ? `Earned ${adjustedAmount} ${token.symbol} tokens with a x${bonusMultiplier} streak bonus!` 
            : `Earned ${adjustedAmount} ${token.symbol} tokens!`,
          transaction_id: mintResult.data.transaction_id
        },
        error: undefined
      };
    } catch (error) {
      this.logger.error('Unexpected error claiming challenge reward', error as Error, { userId, challengeId });
      return {
        success: false,
        data: { success: false, message: 'An unexpected error occurred while claiming reward' },
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while claiming reward',
          details: error
        }
      };
    }
  }
}
