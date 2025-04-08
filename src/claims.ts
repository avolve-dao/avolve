import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { TokenSymbol } from '../types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * ClaimsService - Handles daily token claims and streak management
 * 
 * The regenerative gamified system is built around daily token claims that:
 * 1. Drive daily active user (DAU) metrics
 * 2. Improve retention through consistent engagement
 * 3. Increase average revenue per user (ARPU) through token utility
 * 4. Boost net promoter score (NPS) through community participation
 * 
 * Each day has a specific token that can be claimed:
 * - Sunday: SPD (Superpuzzle Developments) - Boosts community engagement metrics
 * - Monday: SHE (Superhuman Enhancements) - Improves D1 retention metrics
 * - Tuesday: PSP (Personal Success Puzzle) - Increases DAU/MAU ratio
 * - Wednesday: SSA (Supersociety Advancements) - Enhances community contribution metrics
 * - Thursday: BSP (Business Success Puzzle) - Boosts ARPU metrics
 * - Friday: SGB (Supergenius Breakthroughs) - Improves innovation metrics
 * - Saturday: SMS (Supermind Superpowers) - Enhances user satisfaction and NPS
 */
export class ClaimsService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = supabaseUrl, supabaseKey: string = supabaseAnonKey) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Get the token symbol for the current day of the week
   * This is the core of the daily claim system that drives regular engagement
   * 
   * @returns The token symbol corresponding to the current day
   */
  getDayToken(): TokenSymbol {
    const dayOfWeek = new Date().toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
    
    switch (dayOfWeek) {
      case 'SUN': return TokenSymbol.SPD; // Sunday: Superpuzzle Developments (Red-Green-Blue gradient)
      case 'MON': return TokenSymbol.SHE; // Monday: Superhuman Enhancements (Rose-Red-Orange gradient)
      case 'TUE': return TokenSymbol.PSP; // Tuesday: Personal Success Puzzle (Amber-Yellow gradient)
      case 'WED': return TokenSymbol.SSA; // Wednesday: Supersociety Advancements (Lime-Green-Emerald gradient)
      case 'THU': return TokenSymbol.BSP; // Thursday: Business Success Puzzle (Teal-Cyan gradient)
      case 'FRI': return TokenSymbol.SGB; // Friday: Supergenius Breakthroughs (Sky-Blue-Indigo gradient)
      case 'SAT': return TokenSymbol.SMS; // Saturday: Supermind Superpowers (Violet-Purple-Fuchsia-Pink gradient)
      default: return TokenSymbol.SAP; // Fallback to SAP (Superachiever)
    }
  }

  /**
   * Get the parent token for a sub-token
   * The token hierarchy is essential for the regenerative system:
   * - GEN (Supercivilization) is the top-level token
   * - SAP (Superachiever) for individual journey tokens
   * - SCQ (Superachievers) for collective journey tokens
   * 
   * @param tokenSymbol Sub-token symbol
   * @returns Parent token symbol (SAP or SCQ)
   */
  getParentToken(tokenSymbol: TokenSymbol): TokenSymbol {
    // SAP sub-tokens (individual journey)
    if ([TokenSymbol.PSP, TokenSymbol.BSP, TokenSymbol.SMS].includes(tokenSymbol)) {
      return TokenSymbol.SAP;
    }
    // SCQ sub-tokens (collective journey)
    if ([TokenSymbol.SPD, TokenSymbol.SHE, TokenSymbol.SSA, TokenSymbol.SGB].includes(tokenSymbol)) {
      return TokenSymbol.SCQ;
    }
    // Return the token itself if it's already a parent token
    return tokenSymbol;
  }

  /**
   * Claim daily token reward for a user
   * This is the primary engagement mechanism that drives key metrics:
   * - Claim PSP on TUE to boost DAU/MAU ratio
   * - Claim SHE on MON to improve D1 retention metrics
   * - Claim BSP on THU to boost ARPU metrics
   * - Claim SMS on SAT to enhance NPS scores
   * 
   * The streak system encourages consistent engagement, further improving
   * retention metrics and creating habit-forming behavior.
   * 
   * @param userId User ID claiming the reward
   * @returns Result of the claim operation
   */
  async claimDailyReward(userId: string): Promise<{
    success: boolean;
    data?: {
      tokenSymbol: string;
      amount: number;
      streakDays: number;
      multiplier: number;
      unlocked: boolean;
    };
    error?: string;
  }> {
    try {
      // Call the database function to process the daily claim
      // This function also records metrics for:
      // - Daily active users (DAU)
      // - Engagement time
      // - Streak consistency
      // - Feature unlock progress
      const { data, error } = await this.supabase.rpc('process_daily_claim', {
        p_user_id: userId
      });

      if (error) throw error;

      // After successful claim, this data is used to:
      // 1. Update user's token balance
      // 2. Check for feature unlocks (e.g., claiming 3 different day tokens)
      // 3. Update metrics dashboards
      // 4. Trigger achievement notifications
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Daily claim error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown daily claim error'
      };
    }
  }

  /**
   * Get user's claim streak information
   * Streaks are a key retention mechanism that:
   * 1. Creates habit-forming behavior
   * 2. Rewards consistent engagement
   * 3. Provides increasing returns (multipliers)
   * 4. Drives D1, D7, and D30 retention metrics
   * 
   * @param userId User ID to check
   * @returns Streak information including current streak and last claim date
   */
  async getClaimStreak(userId: string): Promise<{
    success: boolean;
    data?: {
      currentStreak: number;
      lastClaimDate: string;
      nextClaimAvailable: boolean;
      nextMultiplierAt: number;
      currentMultiplier: number;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('get_claim_streak', {
        p_user_id: userId
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get claim streak error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting claim streak'
      };
    }
  }

  /**
   * Get user's recent claims history
   * This history provides:
   * 1. Visual feedback on engagement patterns
   * 2. Reinforcement of the daily claim schedule
   * 3. Data for personalized recommendations
   * 4. Insights for improving user engagement
   * 
   * @param userId User ID to check
   * @param limit Number of claims to return (default: 7)
   * @returns Recent claims with token and amount details
   */
  async getRecentClaims(userId: string, limit: number = 7): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('daily_claims')
        .select(`
          id,
          token_id,
          tokens (symbol, name),
          amount,
          claimed_at
        `)
        .eq('user_id', userId)
        .order('claimed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get recent claims error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting recent claims'
      };
    }
  }

  /**
   * Check if user can claim today's reward
   * This drives the daily engagement loop:
   * 1. Users check if they can claim
   * 2. They complete any required actions
   * 3. They claim their daily token
   * 4. They return tomorrow to continue the cycle
   * 
   * This cycle is essential for maintaining high DAU/MAU ratios
   * and improving retention metrics.
   * 
   * @param userId User ID to check
   * @returns Whether the user can claim today and which token is available
   */
  async canClaimToday(userId: string): Promise<{
    success: boolean;
    data?: {
      canClaim: boolean;
      tokenSymbol: string;
      tokenName: string;
      nextClaimTime?: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('can_claim_today', {
        p_user_id: userId
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Check claim availability error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error checking claim availability'
      };
    }
  }
}

// Export a singleton instance
export const claimsService = new ClaimsService();

// Export default for direct imports
export default claimsService;
