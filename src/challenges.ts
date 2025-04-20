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
      // Call the database function to process the challenge completion
      const { data, error } = await this.supabase.rpc('complete_challenge', {
        p_user_id: userId,
        p_challenge_id: challengeId
      });

      if (error) throw error;

      // Boost interaction rate in metrics
      if (data) {
        await this.supabase.rpc('record_metric', {
          p_metric: 'interaction',
          p_value: 1,
          p_user_id: userId,
          p_data: JSON.stringify({ challenge_id: challengeId, points: data.points })
        });
      }

      return {
        success: true,
        data: {
          points: data.points,
          tokenSymbol: data.tokenSymbol,
          unlocked: data.unlocked,
          totalPoints: data.totalPoints
        }
      };
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
      let query = this.supabase
        .from('challenges')
        .select(`
          id,
          name,
          description,
          token_id,
          tokens (symbol, name),
          points,
          active
        `)
        .eq('active', true);

      // Filter by token if specified
      if (tokenSymbol) {
        const { data: tokenData } = await this.supabase
          .from('tokens')
          .select('id')
          .eq('symbol', tokenSymbol)
          .single();

        if (tokenData) {
          query = query.eq('token_id', tokenData.id);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map((challenge) => {
          const tokens = Array.isArray(challenge.tokens) ? (challenge.tokens[0] || { symbol: '', name: '' }) : (challenge.tokens || { symbol: '', name: '' });
          return {
            id: challenge.id,
            name: challenge.name,
            description: challenge.description,
            token_id: challenge.token_id,
            tokens,
            points: challenge.points,
            active: challenge.active
          };
        })
      };
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
      const { data, error } = await this.supabase
        .from('user_challenges')
        .select(`
          id,
          challenge_id,
          challenges (
            name,
            description,
            points,
            token_id,
            tokens (symbol, name)
          ),
          completed_at
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map((completion) => {
          const ch = Array.isArray(completion.challenges) ? (completion.challenges[0] || {}) : (completion.challenges || {});
          const chTokens = ch && 'tokens' in ch ? (Array.isArray(ch.tokens) ? (ch.tokens[0] || { symbol: '', name: '' }) : (ch.tokens || { symbol: '', name: '' })) : { symbol: '', name: '' };
          return {
            id: completion.id,
            challenge_id: completion.challenge_id,
            challenges: {
              name: ch.name || '',
              description: ch.description || '',
              points: ch.points || 0,
              token_id: ch.token_id || '',
              tokens: chTokens
            },
            completed_at: completion.completed_at
          };
        })
      };
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
      const { data, error } = await this.supabase
        .from('user_progress')
        .select(`
          id,
          token_id,
          tokens (symbol, name, is_locked),
          points,
          level
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        success: true,
        data: (data || []).map((progress) => {
          const tokens = Array.isArray(progress.tokens) ? (progress.tokens[0] || { symbol: '', name: '', is_locked: false }) : (progress.tokens || { symbol: '', name: '', is_locked: false });
          return {
            ...progress,
            tokens
          };
        })
      };
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

      // Get challenges for today's token
      const { data: challenges, error: challengesError } = await this.supabase
        .from('challenges')
        .select(`
          id,
          name,
          description,
          token_id,
          tokens (symbol, name),
          points,
          active
        `)
        .eq('token_id', tokenData.id)
        .eq('active', true);

      if (challengesError) throw challengesError;

      // Get challenges completed by the user today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: completedToday, error: completedError } = await this.supabase
        .from('user_challenges')
        .select(`
          id,
          challenge_id,
          challenges (
            name,
            description,
            points,
            token_id
          ),
          completed_at
        `)
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString())
        .order('completed_at', { ascending: false });

      if (completedError) throw completedError;

      return {
        success: true,
        data: {
          challenges: (challenges || []).map((challenge) => {
            const tokens = Array.isArray(challenge.tokens) ? (challenge.tokens[0] || { symbol: '', name: '' }) : (challenge.tokens || { symbol: '', name: '' });
            return {
              id: challenge.id,
              name: challenge.name,
              description: challenge.description,
              token_id: challenge.token_id,
              tokens,
              points: challenge.points,
              active: challenge.active
            };
          }),
          completedToday: (completedToday || []).map((completion) => {
            const ch = Array.isArray(completion.challenges) ? (completion.challenges[0] || {}) : (completion.challenges || {});
            const chTokens = ch && 'tokens' in ch ? (Array.isArray(ch.tokens) ? (ch.tokens[0] || { symbol: '', name: '' }) : (ch.tokens || { symbol: '', name: '' })) : { symbol: '', name: '' };
            return {
              id: completion.id,
              challenge_id: completion.challenge_id,
              challenges: {
                name: ch.name || '',
                description: ch.description || '',
                points: ch.points || 0,
                token_id: ch.token_id || '',
                tokens: chTokens
              },
              completed_at: completion.completed_at
            };
          })
        }
      };
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

// If TokenSymbol is only a type, define a value enum here for runtime use
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
