/**
 * @ai-anchor #CHALLENGE_SYSTEM
 * @ai-context This file implements the repository pattern for challenge-related database operations
 * @ai-related-to challenge-types.ts, challenge-service.ts
 * @ai-database-tables daily_token_challenges, weekly_challenges, user_challenge_completions, user_weekly_challenges, challenge_streaks
 * @ai-sacred-geometry tesla-369
 * 
 * Challenge Repository
 * 
 * This repository handles all direct database interactions for challenge-related operations.
 * It follows the repository pattern to separate data access concerns from business logic.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  ChallengeResult,
  ChallengeError,
  DailyChallenge,
  WeeklyChallenge,
  ChallengeStreak,
  UserChallengeCompletion,
  UserWeeklyChallenge
} from './challenge-types';

/**
 * ChallengeRepository class
 * 
 * Handles all direct database interactions for challenge-related operations.
 * This class follows the repository pattern to separate data access from business logic.
 */
export class ChallengeRepository {
  /**
   * Creates a new ChallengeRepository instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(private readonly client: SupabaseClient) {}

  /**
   * Fetches all daily challenges
   * 
   * @returns A promise resolving to a ChallengeResult containing an array of DailyChallenge objects
   */
  public async getAllDailyChallenges(): Promise<ChallengeResult<DailyChallenge[]>> {
    try {
      const { data, error } = await this.client
        .from('daily_token_challenges')
        .select('*')
        .eq('is_active', true)
        .order('day_of_week');
      
      if (error) {
        console.error('Get all daily challenges error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to fetch daily challenges', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all daily challenges error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting daily challenges', error) 
      };
    }
  }

  /**
   * Fetches all weekly challenges
   * 
   * @returns A promise resolving to a ChallengeResult containing an array of WeeklyChallenge objects
   */
  public async getAllWeeklyChallenges(): Promise<ChallengeResult<WeeklyChallenge[]>> {
    try {
      const { data, error } = await this.client
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at');
      
      if (error) {
        console.error('Get all weekly challenges error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to fetch weekly challenges', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all weekly challenges error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting weekly challenges', error) 
      };
    }
  }

  /**
   * Fetches active weekly challenges
   * 
   * @returns A promise resolving to a ChallengeResult containing an array of active WeeklyChallenge objects
   */
  public async getActiveWeeklyChallenges(): Promise<ChallengeResult<WeeklyChallenge[]>> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await this.client
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at');
      
      if (error) {
        console.error('Get active weekly challenges error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to fetch active weekly challenges', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get active weekly challenges error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting active weekly challenges', error) 
      };
    }
  }

  /**
   * Fetches daily challenges for a specific day of the week
   * 
   * @param dayOfWeek - The day of the week (0-6, Sunday-Saturday)
   * @returns A promise resolving to a ChallengeResult containing an array of DailyChallenge objects
   */
  public async getDailyChallengesByDay(dayOfWeek: number): Promise<ChallengeResult<DailyChallenge[]>> {
    try {
      const { data, error } = await this.client
        .from('daily_token_challenges')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .order('created_at');
      
      if (error) {
        console.error('Get daily challenges by day error:', error);
        return { 
          data: null, 
          error: new ChallengeError(`Failed to fetch daily challenges for day ${dayOfWeek}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get daily challenges by day error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting daily challenges by day', error) 
      };
    }
  }

  /**
   * Fetches a daily challenge by its ID
   * 
   * @param id - The ID of the daily challenge to fetch
   * @returns A promise resolving to a ChallengeResult containing a DailyChallenge object
   */
  public async getDailyChallengeById(id: string): Promise<ChallengeResult<DailyChallenge>> {
    try {
      const { data, error } = await this.client
        .from('daily_token_challenges')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get daily challenge by ID error:', error);
        return { 
          data: null, 
          error: new ChallengeError(`Failed to fetch daily challenge with ID: ${id}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get daily challenge by ID error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting daily challenge', error) 
      };
    }
  }

  /**
   * Fetches a weekly challenge by its ID
   * 
   * @param id - The ID of the weekly challenge to fetch
   * @returns A promise resolving to a ChallengeResult containing a WeeklyChallenge object
   */
  public async getWeeklyChallengeById(id: string): Promise<ChallengeResult<WeeklyChallenge>> {
    try {
      const { data, error } = await this.client
        .from('weekly_challenges')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get weekly challenge by ID error:', error);
        return { 
          data: null, 
          error: new ChallengeError(`Failed to fetch weekly challenge with ID: ${id}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get weekly challenge by ID error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting weekly challenge', error) 
      };
    }
  }

  /**
   * Fetches a user's challenge streaks
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a ChallengeResult containing an array of ChallengeStreak objects
   */
  public async getUserChallengeStreaks(userId: string): Promise<ChallengeResult<ChallengeStreak[]>> {
    try {
      const { data, error } = await this.client
        .from('challenge_streaks')
        .select('*')
        .eq('user_id', userId)
        .order('token_type');
      
      if (error) {
        console.error('Get user challenge streaks error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to fetch user challenge streaks', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user challenge streaks error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting user challenge streaks', error) 
      };
    }
  }

  /**
   * Fetches a user's challenge streak for a specific token type
   * 
   * @param userId - The ID of the user
   * @param tokenType - The token type
   * @returns A promise resolving to a ChallengeResult containing a ChallengeStreak object
   */
  public async getUserChallengeStreakByToken(userId: string, tokenType: string): Promise<ChallengeResult<ChallengeStreak>> {
    try {
      const { data, error } = await this.client
        .from('challenge_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('token_type', tokenType)
        .single();
      
      if (error) {
        // If no streak found, return null data without error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        
        console.error('Get user challenge streak by token error:', error);
        return { 
          data: null, 
          error: new ChallengeError(`Failed to fetch user challenge streak for token: ${tokenType}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user challenge streak by token error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting user challenge streak by token', error) 
      };
    }
  }

  /**
   * Checks if a user has completed a daily challenge
   * 
   * @param userId - The ID of the user
   * @param challengeId - The ID of the challenge
   * @param date - The date to check (defaults to today)
   * @returns A promise resolving to a ChallengeResult containing a boolean indicating if the challenge has been completed
   */
  public async hasUserCompletedDailyChallenge(
    userId: string, 
    challengeId: string,
    date: Date = new Date()
  ): Promise<ChallengeResult<boolean>> {
    try {
      // Format the date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      const { data, error } = await this.client
        .from('user_challenge_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .eq('completion_date', formattedDate)
        .limit(1);
      
      if (error) {
        console.error('Check user completed daily challenge error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to check if user completed daily challenge', error) 
        };
      }
      
      return { data: data.length > 0, error: null };
    } catch (error) {
      console.error('Unexpected check user completed daily challenge error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while checking if user completed daily challenge', error) 
      };
    }
  }

  /**
   * Fetches a user's weekly challenge progress
   * 
   * @param userId - The ID of the user
   * @param challengeId - The ID of the weekly challenge
   * @returns A promise resolving to a ChallengeResult containing a UserWeeklyChallenge object
   */
  public async getUserWeeklyChallengeProgress(
    userId: string,
    challengeId: string
  ): Promise<ChallengeResult<UserWeeklyChallenge>> {
    try {
      const { data, error } = await this.client
        .from('user_weekly_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();
      
      if (error) {
        // If no progress found, return null data without error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        
        console.error('Get user weekly challenge progress error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to fetch user weekly challenge progress', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user weekly challenge progress error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting user weekly challenge progress', error) 
      };
    }
  }

  /**
   * Completes a daily challenge for a user
   * 
   * @param userId - The ID of the user
   * @param challengeId - The ID of the challenge
   * @param date - The completion date (defaults to today)
   * @returns A promise resolving to a ChallengeResult containing the created UserChallengeCompletion
   */
  public async completeDailyChallenge(
    userId: string,
    challengeId: string,
    date: Date = new Date()
  ): Promise<ChallengeResult<UserChallengeCompletion>> {
    try {
      // Format the date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      // Check if the challenge has already been completed today
      const { data: existingCompletion, error: checkError } = await this.client
        .from('user_challenge_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .eq('completion_date', formattedDate)
        .limit(1);
      
      if (checkError) {
        console.error('Check existing completion error:', checkError);
        return { 
          data: null, 
          error: new ChallengeError('Failed to check existing challenge completion', checkError) 
        };
      }
      
      // If already completed, return the existing completion
      if (existingCompletion && existingCompletion.length > 0) {
        return { data: existingCompletion[0], error: null };
      }
      
      // Create a new completion record
      const { data, error } = await this.client
        .from('user_challenge_completions')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          completion_date: formattedDate,
          bonus_claimed: false
        })
        .select()
        .single();
      
      if (error) {
        console.error('Complete daily challenge error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to complete daily challenge', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected complete daily challenge error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while completing daily challenge', error) 
      };
    }
  }

  /**
   * Updates a user's weekly challenge progress
   * 
   * @param userId - The ID of the user
   * @param challengeId - The ID of the weekly challenge
   * @param progress - The progress data
   * @param isCompleted - Whether the challenge is completed
   * @returns A promise resolving to a ChallengeResult containing the updated UserWeeklyChallenge
   */
  public async updateWeeklyChallengeProgress(
    userId: string,
    challengeId: string,
    progress: Record<string, any>,
    isCompleted: boolean = false
  ): Promise<ChallengeResult<UserWeeklyChallenge>> {
    try {
      // Check if a progress record already exists
      const { data: existingProgress, error: checkError } = await this.client
        .from('user_weekly_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .limit(1);
      
      if (checkError) {
        console.error('Check existing weekly progress error:', checkError);
        return { 
          data: null, 
          error: new ChallengeError('Failed to check existing weekly challenge progress', checkError) 
        };
      }
      
      let result;
      
      if (existingProgress && existingProgress.length > 0) {
        // Update existing progress
        const updateData: any = {
          progress,
          updated_at: new Date().toISOString()
        };
        
        // Only update completion status if the challenge is being completed
        if (isCompleted && !existingProgress[0].is_completed) {
          updateData.is_completed = true;
          updateData.completed_at = new Date().toISOString();
        }
        
        const { data, error } = await this.client
          .from('user_weekly_challenges')
          .update(updateData)
          .eq('id', existingProgress[0].id)
          .select()
          .single();
        
        if (error) {
          console.error('Update weekly challenge progress error:', error);
          return { 
            data: null, 
            error: new ChallengeError('Failed to update weekly challenge progress', error) 
          };
        }
        
        result = { data, error: null };
      } else {
        // Create new progress record
        const { data, error } = await this.client
          .from('user_weekly_challenges')
          .insert({
            user_id: userId,
            challenge_id: challengeId,
            progress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .select()
          .single();
        
        if (error) {
          console.error('Create weekly challenge progress error:', error);
          return { 
            data: null, 
            error: new ChallengeError('Failed to create weekly challenge progress', error) 
          };
        }
        
        result = { data, error: null };
      }
      
      return result;
    } catch (error) {
      console.error('Unexpected update weekly challenge progress error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while updating weekly challenge progress', error) 
      };
    }
  }

  /**
   * Claims a reward for a completed challenge
   * 
   * @param userId - The ID of the user
   * @param challengeId - The ID of the challenge
   * @param isWeekly - Whether this is a weekly challenge
   * @returns A promise resolving to a ChallengeResult containing a boolean indicating success
   */
  public async claimChallengeReward(
    userId: string,
    challengeId: string,
    isWeekly: boolean = false
  ): Promise<ChallengeResult<boolean>> {
    try {
      let result;
      
      if (isWeekly) {
        // Update weekly challenge to mark reward as claimed
        const { data, error } = await this.client
          .from('user_weekly_challenges')
          .update({
            reward_claimed: true,
            reward_claimed_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('is_completed', true)
          .eq('reward_claimed', false)
          .select();
        
        if (error) {
          console.error('Claim weekly challenge reward error:', error);
          return { 
            data: null, 
            error: new ChallengeError('Failed to claim weekly challenge reward', error) 
          };
        }
        
        result = { data: data.length > 0, error: null };
      } else {
        // Update daily challenge completion to mark bonus as claimed
        const { data, error } = await this.client
          .from('user_challenge_completions')
          .update({
            bonus_claimed: true
          })
          .eq('user_id', userId)
          .eq('challenge_id', challengeId)
          .eq('bonus_claimed', false)
          .select();
        
        if (error) {
          console.error('Claim daily challenge reward error:', error);
          return { 
            data: null, 
            error: new ChallengeError('Failed to claim daily challenge reward', error) 
          };
        }
        
        result = { data: data.length > 0, error: null };
      }
      
      return result;
    } catch (error) {
      console.error('Unexpected claim challenge reward error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while claiming challenge reward', error) 
      };
    }
  }

  /**
   * Calculates the streak bonus for a user's challenge
   * 
   * @param userId - The ID of the user
   * @param tokenType - The token type
   * @param baseAmount - The base reward amount
   * @param isDaily - Whether this is a daily challenge
   * @returns A promise resolving to a ChallengeResult containing the bonus amount
   */
  public async calculateStreakBonus(
    userId: string,
    tokenType: string,
    baseAmount: number,
    isDaily: boolean = true
  ): Promise<ChallengeResult<number>> {
    try {
      const { data, error } = await this.client.rpc('calculate_streak_bonus', {
        p_user_id: userId,
        p_token_type: tokenType,
        p_base_amount: baseAmount,
        p_is_daily: isDaily
      });
      
      if (error) {
        console.error('Calculate streak bonus error:', error);
        return { 
          data: null, 
          error: new ChallengeError('Failed to calculate streak bonus', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected calculate streak bonus error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while calculating streak bonus', error) 
      };
    }
  }
}
