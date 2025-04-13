/**
 * @ai-anchor #CHALLENGE_SYSTEM
 * @ai-context This service centralizes all challenge management functionality for the Avolve platform
 * @ai-related-to challenge-repository.ts, challenge-types.ts, token-service.ts
 * @ai-sacred-geometry tesla-369
 * 
 * Challenge Service
 * 
 * This service provides a high-level API for challenge-related operations.
 * It implements business logic and delegates database operations to the ChallengeRepository.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  ChallengeResult,
  ChallengeError,
  DailyChallenge,
  WeeklyChallenge,
  ChallengeStreak,
  UserChallengeCompletion,
  UserWeeklyChallenge,
  ChallengeCompletionStatus,
  DailyChallengeWithStatus,
  WeeklyChallengeWithStatus,
  ChallengeDashboardData
} from './challenge-types';
import { ChallengeRepository } from './challenge-repository';
import { TokenService } from '../token/token-service';

/**
 * Challenge Service Class
 * 
 * This service provides a high-level API for challenge-related operations.
 * It implements business logic and delegates database operations to the ChallengeRepository.
 */
export class ChallengeService {
  private repository: ChallengeRepository;
  private tokenService: TokenService;
  
  /**
   * Creates a new ChallengeService instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(private readonly client: SupabaseClient) {
    this.repository = new ChallengeRepository(client);
    this.tokenService = new TokenService(client);
  }

  /**
   * Gets all daily challenges
   * 
   * @returns A promise resolving to a ChallengeResult containing an array of DailyChallenge objects
   */
  public async getAllDailyChallenges(): Promise<ChallengeResult<DailyChallenge[]>> {
    return this.repository.getAllDailyChallenges();
  }

  /**
   * Gets all weekly challenges
   * 
   * @returns A promise resolving to a ChallengeResult containing an array of WeeklyChallenge objects
   */
  public async getAllWeeklyChallenges(): Promise<ChallengeResult<WeeklyChallenge[]>> {
    return this.repository.getAllWeeklyChallenges();
  }

  /**
   * Gets active weekly challenges
   * 
   * @returns A promise resolving to a ChallengeResult containing an array of active WeeklyChallenge objects
   */
  public async getActiveWeeklyChallenges(): Promise<ChallengeResult<WeeklyChallenge[]>> {
    return this.repository.getActiveWeeklyChallenges();
  }

  /**
   * Gets daily challenges for today
   * 
   * @returns A promise resolving to a ChallengeResult containing an array of DailyChallenge objects
   */
  public async getTodayDailyChallenges(): Promise<ChallengeResult<DailyChallenge[]>> {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return this.repository.getDailyChallengesByDay(dayOfWeek);
  }

  /**
   * Gets a user's challenge streaks
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a ChallengeResult containing an array of ChallengeStreak objects
   */
  public async getUserChallengeStreaks(userId: string): Promise<ChallengeResult<ChallengeStreak[]>> {
    return this.repository.getUserChallengeStreaks(userId);
  }

  /**
   * Gets a user's challenge streak for a specific token type
   * 
   * @param userId - The ID of the user
   * @param tokenType - The token type
   * @returns A promise resolving to a ChallengeResult containing a ChallengeStreak object
   */
  public async getUserChallengeStreakByToken(userId: string, tokenType: string): Promise<ChallengeResult<ChallengeStreak>> {
    return this.repository.getUserChallengeStreakByToken(userId, tokenType);
  }

  /**
   * Gets daily challenges with user completion status
   * 
   * @param userId - The ID of the user
   * @param dayOfWeek - The day of the week (0-6, Sunday-Saturday)
   * @returns A promise resolving to a ChallengeResult containing an array of DailyChallengeWithStatus objects
   */
  public async getDailyChallengesWithStatus(
    userId: string,
    dayOfWeek: number = new Date().getDay()
  ): Promise<ChallengeResult<DailyChallengeWithStatus[]>> {
    try {
      // Get daily challenges for the specified day
      const { data: challenges, error: challengesError } = await this.repository.getDailyChallengesByDay(dayOfWeek);
      
      if (challengesError) {
        return { data: null, error: challengesError };
      }
      
      if (!challenges || challenges.length === 0) {
        return { data: [], error: null };
      }
      
      // Get completion status for each challenge
      const challengesWithStatus: DailyChallengeWithStatus[] = await Promise.all(
        challenges.map(async (challenge) => {
          const { data: isCompleted } = await this.repository.hasUserCompletedDailyChallenge(
            userId,
            challenge.id
          );
          
          let streakBonus = 0;
          
          if (isCompleted) {
            // Calculate streak bonus
            const { data: bonus } = await this.repository.calculateStreakBonus(
              userId,
              challenge.token_type,
              challenge.reward_amount,
              true // is daily
            );
            
            if (bonus) {
              streakBonus = bonus - challenge.reward_amount;
            }
          }
          
          return {
            ...challenge,
            completion_status: isCompleted 
              ? ChallengeCompletionStatus.COMPLETED 
              : ChallengeCompletionStatus.NOT_STARTED,
            streak_bonus: streakBonus
          };
        })
      );
      
      return { data: challengesWithStatus, error: null };
    } catch (error) {
      console.error('Unexpected get daily challenges with status error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting daily challenges with status', error) 
      };
    }
  }

  /**
   * Gets weekly challenges with user completion status
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a ChallengeResult containing an array of WeeklyChallengeWithStatus objects
   */
  public async getWeeklyChallengesWithStatus(
    userId: string
  ): Promise<ChallengeResult<WeeklyChallengeWithStatus[]>> {
    try {
      // Get active weekly challenges
      const { data: challenges, error: challengesError } = await this.repository.getActiveWeeklyChallenges();
      
      if (challengesError) {
        return { data: null, error: challengesError };
      }
      
      if (!challenges || challenges.length === 0) {
        return { data: [], error: null };
      }
      
      // Get completion status for each challenge
      const challengesWithStatus: WeeklyChallengeWithStatus[] = await Promise.all(
        challenges.map(async (challenge) => {
          const { data: progress } = await this.repository.getUserWeeklyChallengeProgress(
            userId,
            challenge.id
          );
          
          let completionStatus = ChallengeCompletionStatus.NOT_STARTED;
          let streakBonus = 0;
          
          if (progress) {
            if (progress.reward_claimed) {
              completionStatus = ChallengeCompletionStatus.REWARD_CLAIMED;
            } else if (progress.is_completed) {
              completionStatus = ChallengeCompletionStatus.COMPLETED;
              
              // Calculate streak bonus
              const { data: bonus } = await this.repository.calculateStreakBonus(
                userId,
                challenge.token_type,
                challenge.reward_amount,
                false // is weekly
              );
              
              if (bonus) {
                streakBonus = bonus - challenge.reward_amount;
              }
            } else {
              completionStatus = ChallengeCompletionStatus.IN_PROGRESS;
            }
          }
          
          return {
            ...challenge,
            completion_status: completionStatus,
            progress: progress?.progress || {},
            streak_bonus: streakBonus
          };
        })
      );
      
      return { data: challengesWithStatus, error: null };
    } catch (error) {
      console.error('Unexpected get weekly challenges with status error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting weekly challenges with status', error) 
      };
    }
  }

  /**
   * Gets challenge dashboard data for a user
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to a ChallengeResult containing ChallengeDashboardData
   */
  public async getChallengeDashboard(userId: string): Promise<ChallengeResult<ChallengeDashboardData>> {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Get daily challenges with status
      const { data: dailyChallenges, error: dailyError } = await this.getDailyChallengesWithStatus(userId, dayOfWeek);
      
      if (dailyError) {
        return { data: null, error: dailyError };
      }
      
      // Get weekly challenges with status
      const { data: weeklyChallenges, error: weeklyError } = await this.getWeeklyChallengesWithStatus(userId);
      
      if (weeklyError) {
        return { data: null, error: weeklyError };
      }
      
      // Get user streaks
      const { data: streaksArray, error: streaksError } = await this.getUserChallengeStreaks(userId);
      
      if (streaksError) {
        return { data: null, error: streaksError };
      }
      
      // Convert streaks array to record by token type
      const streaks: Record<string, ChallengeStreak> = {};
      if (streaksArray) {
        streaksArray.forEach(streak => {
          streaks[streak.token_type] = streak;
        });
      }
      
      // Get today's token
      const { data: dailyToken, error: tokenError } = await this.tokenService.getDailyToken();
      
      if (tokenError) {
        return { data: null, error: tokenError };
      }
      
      // Build dashboard data
      const dashboardData: ChallengeDashboardData = {
        daily_challenges: dailyChallenges || [],
        weekly_challenges: weeklyChallenges || [],
        streaks,
        today_token: dailyToken?.symbol || ''
      };
      
      return { data: dashboardData, error: null };
    } catch (error) {
      console.error('Unexpected get challenge dashboard error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while getting challenge dashboard', error) 
      };
    }
  }

  /**
   * Completes a daily challenge for a user
   * 
   * @param userId - The ID of the user
   * @param challengeId - The ID of the challenge
   * @returns A promise resolving to a ChallengeResult containing a boolean indicating success
   */
  public async completeDailyChallenge(
    userId: string,
    challengeId: string
  ): Promise<ChallengeResult<boolean>> {
    try {
      // Get the challenge details
      const { data: challenge, error: challengeError } = await this.repository.getDailyChallengeById(challengeId);
      
      if (challengeError) {
        return { data: null, error: challengeError };
      }
      
      if (!challenge) {
        return { 
          data: null, 
          error: new ChallengeError(`Challenge with ID ${challengeId} not found`) 
        };
      }
      
      // Check if the challenge is for today
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      if (challenge.day_of_week !== dayOfWeek) {
        return { 
          data: null, 
          error: new ChallengeError(`This challenge is not available today`) 
        };
      }
      
      // Complete the challenge
      const { data: completion, error: completionError } = await this.repository.completeDailyChallenge(
        userId,
        challengeId
      );
      
      if (completionError) {
        return { data: null, error: completionError };
      }
      
      if (!completion) {
        return { 
          data: null, 
          error: new ChallengeError('Failed to complete challenge') 
        };
      }
      
      // Calculate reward with streak bonus
      const { data: totalReward, error: rewardError } = await this.repository.calculateStreakBonus(
        userId,
        challenge.token_type,
        challenge.reward_amount,
        true // is daily
      );
      
      if (rewardError) {
        return { data: null, error: rewardError };
      }
      
      // Award tokens to the user
      const { data: mintResult, error: mintError } = await this.tokenService.mintTokensBySymbol(
        userId,
        challenge.token_type,
        totalReward || challenge.reward_amount,
        `Daily challenge completion: ${challenge.challenge_name}`
      );
      
      if (mintError) {
        console.error('Mint tokens error:', mintError);
        // Continue even if minting fails, as the challenge is already marked as completed
      }
      
      return { data: true, error: null };
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
   * @returns A promise resolving to a ChallengeResult containing a boolean indicating success
   */
  public async updateWeeklyChallengeProgress(
    userId: string,
    challengeId: string,
    progress: Record<string, any>,
    isCompleted: boolean = false
  ): Promise<ChallengeResult<boolean>> {
    try {
      // Get the challenge details
      const { data: challenge, error: challengeError } = await this.repository.getWeeklyChallengeById(challengeId);
      
      if (challengeError) {
        return { data: null, error: challengeError };
      }
      
      if (!challenge) {
        return { 
          data: null, 
          error: new ChallengeError(`Challenge with ID ${challengeId} not found`) 
        };
      }
      
      // Check if the challenge is active
      const now = new Date();
      const startDate = new Date(challenge.start_date);
      const endDate = new Date(challenge.end_date);
      
      if (now < startDate || now > endDate) {
        return { 
          data: null, 
          error: new ChallengeError(`This challenge is not currently active`) 
        };
      }
      
      // Update progress
      const { data: updatedProgress, error: progressError } = await this.repository.updateWeeklyChallengeProgress(
        userId,
        challengeId,
        progress,
        isCompleted
      );
      
      if (progressError) {
        return { data: null, error: progressError };
      }
      
      if (!updatedProgress) {
        return { 
          data: null, 
          error: new ChallengeError('Failed to update challenge progress') 
        };
      }
      
      // If the challenge is completed, award tokens
      if (isCompleted && updatedProgress.is_completed && !updatedProgress.reward_claimed) {
        // Calculate reward with streak bonus
        const { data: totalReward, error: rewardError } = await this.repository.calculateStreakBonus(
          userId,
          challenge.token_type,
          challenge.reward_amount,
          false // is weekly
        );
        
        if (rewardError) {
          return { data: null, error: rewardError };
        }
        
        // Award tokens to the user
        const { data: mintResult, error: mintError } = await this.tokenService.mintTokensBySymbol(
          userId,
          challenge.token_type,
          totalReward || challenge.reward_amount,
          `Weekly challenge completion: ${challenge.challenge_name}`
        );
        
        if (mintError) {
          console.error('Mint tokens error:', mintError);
          // Continue even if minting fails, as the challenge is already marked as completed
        }
        
        // Mark reward as claimed
        const { data: claimResult, error: claimError } = await this.repository.claimChallengeReward(
          userId,
          challengeId,
          true // is weekly
        );
        
        if (claimError) {
          console.error('Claim reward error:', claimError);
          // Continue even if claiming fails, as the tokens are already minted
        }
      }
      
      return { data: true, error: null };
    } catch (error) {
      console.error('Unexpected update weekly challenge progress error:', error);
      return { 
        data: null, 
        error: new ChallengeError('An unexpected error occurred while updating weekly challenge progress', error) 
      };
    }
  }
}
