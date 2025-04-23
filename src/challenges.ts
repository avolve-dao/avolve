import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { TokenSymbol } from '../types/platform';

/**
 * ChallengesService - Manages user challenges and progress
 * Handles challenge completion, points awarding, and token unlocking
 */
export class ChallengesService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '', supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Complete a challenge for a user
   * - Awards points to user_progress
   * - Unlocks tokens when sufficient points are earned
   * - Boosts interaction rate in metrics
   * - Updates user_balances and logs in transactions
   * 
   * @param userId User ID completing the challenge
   * @param challengeId Challenge ID being completed
   * @returns Result of the challenge completion
   */
  async completeChallenge(userId: string, challengeId: string): Promise<{
    success: boolean;
    data?: {
      points: number;
      tokenSymbol: TokenSymbol;
      unlocked: boolean;
      totalPoints: number;
    };
    error?: string;
  }> {
    try {
      // All challenge-related DB queries have been removed due to missing tables in the Supabase schema. Please implement challenge logic in-app or create the required tables in your database.
      throw new Error("Challenge-related tables do not exist in the current Supabase schema. Please implement this logic in-app or create the tables in your database.");
    } catch (error) {
      console.error('Challenge completion error:', error);
      return {
        success: false,
        data: { points: 0, tokenSymbol: '' as TokenSymbol, unlocked: false, totalPoints: 0 },
        error: error instanceof Error ? error.message : 'Unknown challenge completion error'
      };
    }
  }

  /**
   * Get all available challenges
   * Optionally filtered by token type
   * 
   * @param tokenSymbol Optional token symbol to filter challenges by
   * @returns List of available challenges
   */
  async getChallenges(tokenSymbol?: TokenSymbol): Promise<{
    success: boolean;
    data?: Challenge[];
    error?: string;
  }> {
    try {
      // All challenge-related DB queries have been removed due to missing tables in the Supabase schema. Please implement challenge logic in-app or create the required tables in your database.
      throw new Error("Challenge-related tables do not exist in the current Supabase schema. Please implement this logic in-app or create the tables in your database.");
    } catch (error) {
      console.error('Get challenges error:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error getting challenges'
      };
    }
  }

  /**
   * Get challenges completed by a user
   * 
   * @param userId User ID to check
   * @returns List of completed challenges with completion dates
   */
  async getUserCompletedChallenges(userId: string): Promise<{
    success: boolean;
    data?: ChallengeCompletion[];
    error?: string;
  }> {
    try {
      // All challenge-related DB queries have been removed due to missing tables in the Supabase schema. Please implement challenge logic in-app or create the required tables in your database.
      throw new Error("Challenge-related tables do not exist in the current Supabase schema. Please implement this logic in-app or create the tables in your database.");
    } catch (error) {
      console.error('Get user completed challenges error:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error getting completed challenges'
      };
    }
  }

  /**
   * Get user's progress for each token type
   * 
   * @param userId User ID to check
   * @returns Progress for each token including points and unlock status
   */
  async getUserProgress(userId: string): Promise<{
    success: boolean;
    data?: UserProgress[];
    error?: string;
  }> {
    try {
      // All challenge-related DB queries have been removed due to missing tables in the Supabase schema. Please implement challenge logic in-app or create the required tables in your database.
      throw new Error("Challenge-related tables do not exist in the current Supabase schema. Please implement this logic in-app or create the tables in your database.");
    } catch (error) {
      console.error('Get user progress error:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error getting user progress'
      };
    }
  }

  /**
   * Get available challenges for today based on the day's token
   * 
   * @param userId User ID to check
   * @returns Today's challenges filtered by the day's token
   */
  async getTodaysChallenges(userId: string): Promise<{
    success: boolean;
    data: {
      challenges: Challenge[];
      completedToday: ChallengeCompletion[];
    };
    error?: string;
  }> {
    try {
      // Get the day of the week
      const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      
      // Map day to token symbol using value enum
      let dayToken;
      switch (dayOfWeek) {
        case 'SUN': dayToken = TokenSymbolEnum.SPD; break;
        case 'MON': dayToken = TokenSymbolEnum.SHE; break;
        case 'TUE': dayToken = TokenSymbolEnum.PSP; break;
        case 'WED': dayToken = TokenSymbolEnum.SSA; break;
        case 'THU': dayToken = TokenSymbolEnum.BSP; break;
        case 'FRI': dayToken = TokenSymbolEnum.SGB; break;
        case 'SAT': dayToken = TokenSymbolEnum.SMS; break;
        default: dayToken = TokenSymbolEnum.SAP; // Fallback
      }

      // Get token ID for the day's token
      const { data: tokenData } = await this.supabase
        .from('tokens')
        .select('id')
        .eq('symbol', dayToken)
        .single();

      if (!tokenData) {
        throw new Error(`Token not found for symbol: ${dayToken}`);
      }

      // All challenge-related DB queries have been removed due to missing tables in the Supabase schema. Please implement challenge logic in-app or create the required tables in your database.
      throw new Error("Challenge-related tables do not exist in the current Supabase schema. Please implement this logic in-app or create the tables in your database.");
    } catch (error) {
      console.error('Get today\'s challenges error:', error);
      return {
        success: false,
        data: { challenges: [], completedToday: [] },
        error: error instanceof Error ? error.message : 'Unknown error getting today\'s challenges'
      };
    }
  }
}

// TODO: Ensure the following RPCs exist in Supabase:
// - complete_challenge (handles challenge completion logic)
// - record_metric (records user interaction metrics)
// If not, add them via migrations and document their expected behavior for onboarding.

interface Challenge {
  id: string;
  name: string;
  description: string;
  token_id: string;
  tokens: {
    symbol: string;
    name: string;
  };
  points: number;
  active: boolean;
}

interface ChallengeCompletion {
  id: string;
  challenge_id: string;
  challenges: {
    name: string;
    description: string;
    points: number;
    token_id: string;
    tokens: {
      symbol: string;
      name: string;
    };
  };
  completed_at: string;
}

interface UserProgress {
  id: string;
  token_id: string;
  tokens: {
    symbol: string;
    name: string;
    is_locked: boolean;
  };
  points: number;
  level: number;
}

// Export a singleton instance
export const challengesService = new ChallengesService();

// Export default for direct imports
export default challengesService;

export enum TokenSymbolEnum {
  SPD = 'SPD',
  SHE = 'SHE',
  PSP = 'PSP',
  SSA = 'SSA',
  BSP = 'BSP',
  SGB = 'SGB',
  SMS = 'SMS',
  SAP = 'SAP',
}
