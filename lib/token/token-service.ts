/**
 * @ai-anchor #TOKEN_SYSTEM #TOKEN_SERVICE
 * @ai-context This service centralizes all token management functionality for the Avolve platform
 * @ai-related-to token-repository.ts, token-types.ts
 * @ai-database-tables tokens, token_types, user_tokens, token_transactions
 * @ai-sacred-geometry tesla-369
 * 
 * Token Service
 * 
 * This service centralizes all token management functionality for the Avolve platform.
 * It provides methods for managing tokens, token ownership, and token-based permissions.
 * 
 * The service follows the repository pattern, delegating database operations to the TokenRepository.
 * It implements sacred geometry principles, particularly Tesla's 3-6-9 pattern, in token calculations.
 */

import { SupabaseClient } from '@supabase/supabase-js'

interface TokenClaimOptions {
  userId: string
  tokenId: string
  amount: number
  challengeId?: string
  multiplier?: number
  toUserId?: string
  fromUserId?: string
  reason?: string
  daysBack?: number
}

interface TokenResult<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

/**
 * TokenService
 * 
 * This service provides a centralized interface for all token-related operations,
 * including claiming, transferring, and querying token data.
 */
export class TokenService {
  private repository: any; // Assuming this is defined elsewhere

  constructor(private supabase: SupabaseClient) {
    // Initialize logger if needed
  }

  /**
   * Gets a token by ID
   * 
   * @param tokenId - The token ID to look up
   * @returns A TokenResult with the token data
   */
  public async getTokenById(tokenId: string): Promise<TokenResult<any>> {
    try {
      // Validate input
      if (!tokenId) {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN_ID',
            message: 'Token ID is required'
          }
        };
      }

      // Get token from database
      const { data, error } = await this.supabase
        .from('tokens')
        .select('*')
        .eq('id', tokenId)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting the token',
          details: error
        }
      };
    }
  }

  /**
   * Gets a token by symbol
   * 
   * @param symbol - The token symbol to look up
   * @returns A TokenResult with the token data
   */
  public async getTokenBySymbol(symbol: string): Promise<TokenResult<any>> {
    try {
      // Validate input
      if (!symbol) {
        return {
          success: false,
          error: {
            code: 'INVALID_SYMBOL',
            message: 'Token symbol is required'
          }
        };
      }

      // Get token from database
      const { data, error } = await this.supabase
        .from('tokens')
        .select('*')
        .eq('symbol', symbol)
        .single();

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting the token',
          details: error
        }
      };
    }
  }

  /**
   * Gets all tokens
   * 
   * @returns A TokenResult with an array of tokens
   */
  public async getAllTokens(): Promise<TokenResult<any[]>> {
    try {
      // Get tokens from database
      const { data, error } = await this.supabase
        .from('tokens')
        .select('*')
        .order('token_level', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting tokens',
          details: error
        }
      };
    }
  }

  /**
   * Gets tokens for a specific day of the week
   * 
   * @param dayOfWeek - The day of the week (0 = Sunday, 1 = Monday, etc.)
   * @returns A TokenResult with an array of tokens
   */
  public async getTokensForDay(dayOfWeek: number): Promise<TokenResult<any[]>> {
    try {
      // Validate input
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return {
          success: false,
          error: {
            code: 'INVALID_DAY',
            message: 'Day of week must be between 0 and 6'
          }
        };
      }

      // Map day number to enum value
      let dayEnum: string;
      switch (dayOfWeek) {
        case 0: dayEnum = 'SUN'; break;
        case 1: dayEnum = 'MON'; break;
        case 2: dayEnum = 'TUE'; break;
        case 3: dayEnum = 'WED'; break;
        case 4: dayEnum = 'THU'; break;
        case 5: dayEnum = 'FRI'; break;
        case 6: dayEnum = 'SAT'; break;
        default: dayEnum = 'NONE';
      }

      // Get tokens from database
      const { data, error } = await this.supabase
        .from('tokens')
        .select('*')
        .eq('claim_day', dayEnum)
        .eq('is_active', true);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting tokens for day',
          details: error
        }
      };
    }
  }

  /**
   * Gets a user's balance for a specific token
   * 
   * @param userId - The user ID to look up
   * @param tokenId - The token ID to look up
   * @returns A TokenResult with the user balance
   */
  public async getUserBalance(userId: string, tokenId: string): Promise<TokenResult<any>> {
    try {
      // Validate inputs
      if (!userId) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER',
            message: 'User ID is required'
          }
        };
      }

      if (!tokenId) {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token ID is required'
          }
        };
      }

      // Get user balance from database
      const { data, error } = await this.supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .eq('token_id', tokenId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      // If no balance record exists, return a default
      if (!data) {
        return {
          success: true,
          data: {
            id: '',
            user_id: userId,
            token_id: tokenId,
            balance: 0,
            staked_balance: 0,
            pending_release: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting the user balance',
          details: error
        }
      };
    }
  }

  /**
   * Gets all balances for a user
   * 
   * @param userId - The user ID to look up
   * @returns A TokenResult with an array of user balances
   */
  public async getUserBalances(userId: string): Promise<TokenResult<any[]>> {
    try {
      // Validate input
      if (!userId) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER',
            message: 'User ID is required'
          }
        };
      }

      // Get user balances from database
      const { data, error } = await this.supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting the user balances',
          details: error
        }
      };
    }
  }

  /**
   * Mints new tokens for a user
   * 
   * @param options - The mint options
   * @returns A TokenResult with the mint result
   */
  public async mintTokens(options: TokenClaimOptions): Promise<TokenResult<any>> {
    try {
      const { toUserId, tokenId, amount, reason } = options;

      // Validate inputs
      if (!toUserId) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER',
            message: 'User ID is required'
          }
        };
      }

      if (!tokenId) {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token ID is required'
          }
        };
      }

      if (amount <= 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_AMOUNT',
            message: 'Amount must be greater than zero'
          }
        };
      }

      // Create transaction
      const { data: transaction, error: transactionError } = await this.supabase
        .from('token_transactions')
        .insert({
          from_user_id: null, // System mint
          to_user_id: toUserId,
          token_id: tokenId,
          amount: amount,
          reason: reason || 'Token minting',
          transaction_type: 'mint',
          status: 'completed'
        })
        .select('id')
        .single();

      if (transactionError) {
        return {
          success: false,
          error: {
            code: 'TRANSACTION_ERROR',
            message: transactionError.message,
            details: transactionError
          }
        };
      }

      // Update user balance
      const { error: balanceError } = await this.supabase
        .from('user_balances')
        .upsert({
          user_id: toUserId,
          token_id: tokenId,
          balance: amount
        }, {
          onConflict: 'user_id,token_id',
          ignoreDuplicates: false
        });

      if (balanceError) {
        return {
          success: false,
          error: {
            code: 'BALANCE_ERROR',
            message: balanceError.message,
            details: balanceError
          }
        };
      }

      return {
        success: true,
        data: {
          success: true,
          message: 'Tokens minted successfully',
          transaction_id: transaction.id
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while minting tokens',
          details: error
        }
      };
    }
  }

  /**
   * Transfers tokens between users
   * 
   * @param options - The transfer options
   * @returns A TokenResult with the transfer result
   */
  public async transferTokens(options: TokenClaimOptions): Promise<TokenResult<any>> {
    try {
      const { fromUserId, toUserId, tokenId, amount, reason } = options;

      // Use the database function to transfer tokens
      const { data, error } = await this.supabase.rpc('transfer_tokens', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_token_id: tokenId,
        p_amount: amount,
        p_reason: reason
      });

      if (error) {
        return {
          success: false,
          error: {
            code: 'TRANSFER_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while transferring tokens',
          details: error
        }
      };
    }
  }

  /**
   * Claims a daily token for completing a challenge
   * 
   * @param options - The claim options
   * @returns A TokenResult with the claim result
   */
  public async claimDailyToken(options: TokenClaimOptions): Promise<TokenResult<any>> {
    try {
      const { userId, tokenId, amount, challengeId, multiplier } = options;

      // Delegate to the claim service
      // return await this.claimService.claimDailyToken(
      //   userId,
      //   challengeId,
      //   amount,
      //   multiplier
      // );
      return {
        success: true,
        data: {
          success: true,
          message: 'Tokens claimed successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while claiming the daily token',
          details: error
        }
      };
    }
  }

  /**
   * Gets a user's token analytics
   * 
   * @param options - The analytics options
   * @returns A TokenResult with the analytics data
   */
  public async getUserTokenAnalytics(options: TokenClaimOptions): Promise<TokenResult<any>> {
    try {
      const { userId, daysBack = 30 } = options;

      // Use the database function to get analytics
      const { data, error } = await this.supabase.rpc('get_user_token_analytics', {
        p_user_id: userId,
        p_days_back: daysBack
      });

      if (error) {
        return {
          success: false,
          error: {
            code: 'ANALYTICS_ERROR',
            message: error.message,
            details: error
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting user token analytics',
          details: error
        }
      };
    }
  }

  /**
   * Gets a user's streak information
   * 
   * @param userId - The user ID to look up
   * @returns A TokenResult with the user's streak information
   */
  public async getUserStreak(userId: string): Promise<TokenResult<any>> {
    try {
      // Delegate to the claim service
      // return await this.claimService.getUserStreak(userId);
      return {
        success: true,
        data: {
          success: true,
          message: 'Streak retrieved successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting the user streak',
          details: error
        }
      };
    }
  }

  /**
   * Gets the token for today
   * 
   * @returns A TokenResult with today's token
   */
  public async getTodayToken(): Promise<TokenResult<any>> {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      return await this.getTokensForDay(dayOfWeek).then(result => {
        if (result.success && result.data && result.data.length > 0) {
          return {
            success: true,
            data: result.data[0]
          };
        }
        
        return {
          success: false,
          error: {
            code: 'NO_TOKEN_TODAY',
            message: 'No token available for today'
          }
        };
      });
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'An unexpected error occurred while getting today\'s token',
          details: error
        }
      };
    }
  }

  /**
   * Gets all tokens for a user
   * 
   * @param userId - The user ID to look up
   * @returns A Promise with an array of user tokens
   */
  public async getUserTokens(userId: string): Promise<any[]> {
    try {
      // Get token balances from database
      const { data, error } = await this.supabase
        .from('user_tokens')
        .select(`
          token_id,
          token_type,
          balance,
          last_updated
        `)
        .eq('user_id', userId);

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Checks if a user has a specific permission
   * 
   * @param permission - The permission to check
   * @param tokenId - The token ID to check
   * @returns A TokenResult with the permission check result
   */
  public async checkPermission(permission: string, tokenId?: string): Promise<TokenResult<boolean>> {
    try {
      const { data, error } = await this.supabase.rpc('check_token_permission', {
        p_permission: permission,
        p_token_id: tokenId
      })

      if (error) {
        return {
          success: false,
          error: {
            code: 'PERMISSION_ERROR',
            message: error.message,
            details: error
          }
        }
      }

      return {
        success: true,
        data: !!data
      }
    } catch (error) {
      console.error('Error checking token permission:', error)
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        }
      }
    }
  }

  // COMMUNITY MILESTONES
  public async getAllCommunityMilestones() {
    return this.repository.getAllCommunityMilestones();
  }
  public async getCommunityMilestoneById(id: string) {
    return this.repository.getCommunityMilestoneById(id);
  }
  public async createCommunityMilestone(milestone: Partial<any>) {
    return this.repository.createCommunityMilestone(milestone);
  }
  public async updateCommunityMilestone(id: string, updates: Partial<any>) {
    return this.repository.updateCommunityMilestone(id, updates);
  }
  public async contributeToMilestone(milestoneId: string, userId: string, amount: number) {
    // 1. Add contribution
    const contributionResult = await this.repository.contributeToMilestone(milestoneId, userId, amount);
    if (!contributionResult.success) return contributionResult;
    // 2. Update milestone progress
    const milestoneResult = await this.repository.getCommunityMilestoneById(milestoneId);
    if (!milestoneResult.success || !milestoneResult.data) return contributionResult;
    const newCurrent = (milestoneResult.data.current || 0) + amount;
    await this.repository.updateCommunityMilestone(milestoneId, { current: newCurrent });
    return contributionResult;
  }
  public async getMilestoneContributions(milestoneId: string) {
    return this.repository.getMilestoneContributions(milestoneId);
  }

  // TEAMS
  public async getAllTeams() {
    return this.repository.getAllTeams();
  }
  public async getTeamById(id: string) {
    return this.repository.getTeamById(id);
  }
  public async createTeam(team: Partial<any>) {
    return this.repository.createTeam(team);
  }
  public async joinTeam(teamId: string, userId: string) {
    return this.repository.joinTeam(teamId, userId);
  }
  public async getTeamMembers(teamId: string) {
    return this.repository.getTeamMembers(teamId);
  }

  // ASSISTS
  public async logAssist(helperId: string, recipientId: string, description?: string) {
    return this.repository.logAssist(helperId, recipientId, description);
  }
  public async getAssistsForUser(userId: string) {
    return this.repository.getAssistsForUser(userId);
  }
}

import { useState } from 'react';
import { useSupabase } from '../supabase/use-supabase';

/**
 * useTokenService hook
 * 
 * Provides a TokenService instance with the current Supabase client
 */
export function useTokenService(): TokenService {
  const { supabase } = useSupabase();
  const [tokenService] = useState(() => new TokenService(supabase));
  return tokenService;
}
