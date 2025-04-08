import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { metricsService } from './metrics';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * SuperpuzzlesService - Manages superpuzzle operations and contributions
 * Handles superpuzzle creation, contributions, and completion
 */
export class SuperpuzzlesService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = supabaseUrl, supabaseKey: string = supabaseAnonKey) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Get all active superpuzzles
   * 
   * @returns List of active superpuzzles
   */
  async getActiveSuperpuzzles(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('superpuzzles')
        .select(`
          id,
          name,
          description,
          token_id,
          required_points,
          status,
          created_at,
          tokens:token_id(
            id,
            name,
            symbol,
            color
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get active superpuzzles error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting superpuzzles'
      };
    }
  }

  /**
   * Get superpuzzles by day of the week
   * Filters superpuzzles based on their associated token's day
   * 
   * @param dayIndex Day of the week (0 = Sunday, 1 = Monday, etc.)
   * @returns List of superpuzzles for the specified day
   */
  async getSuperpuzzlesByDay(dayIndex: number): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      // Map day index to token symbol
      const tokenSymbols = {
        0: 'SPD', // Sunday: Superpuzzle Developments
        1: 'SHE', // Monday: Superhuman Enhancements
        2: 'PSP', // Tuesday: Personal Success Puzzle
        3: 'SSA', // Wednesday: Supersociety Advancements
        4: 'BSP', // Thursday: Business Success Puzzle
        5: 'SGB', // Friday: Supergenius Breakthroughs
        6: 'SMS', // Saturday: Supermind Superpowers
      };

      const symbol = tokenSymbols[dayIndex as keyof typeof tokenSymbols];
      
      if (!symbol) {
        return {
          success: false,
          error: 'Invalid day index'
        };
      }

      // Get token ID for the day's symbol
      const { data: tokenData, error: tokenError } = await this.supabase
        .from('tokens')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (tokenError) throw tokenError;

      // Get superpuzzles for the token
      const { data, error } = await this.supabase
        .from('superpuzzles')
        .select(`
          id,
          name,
          description,
          token_id,
          required_points,
          status,
          created_at,
          tokens:token_id(
            id,
            name,
            symbol,
            color
          )
        `)
        .eq('token_id', tokenData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Get superpuzzles by day error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting superpuzzles by day'
      };
    }
  }

  /**
   * Get a superpuzzle's details
   * 
   * @param superpuzzleId Superpuzzle ID to get details for
   * @returns Superpuzzle details with team contributions
   */
  async getSuperpuzzleDetails(superpuzzleId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      // Get superpuzzle details
      const { data: superpuzzleData, error: superpuzzleError } = await this.supabase
        .from('superpuzzles')
        .select(`
          id,
          name,
          description,
          token_id,
          required_points,
          status,
          created_at,
          completed_at,
          tokens:token_id(
            id,
            name,
            symbol,
            color
          )
        `)
        .eq('id', superpuzzleId)
        .single();

      if (superpuzzleError) throw superpuzzleError;

      // Get team contributions
      const { data: contributionsData, error: contributionsError } = await this.supabase
        .from('team_superpuzzles')
        .select(`
          id,
          team_id,
          points,
          created_at,
          completed_at,
          teams:team_id(
            id,
            name,
            description
          )
        `)
        .eq('superpuzzle_id', superpuzzleId)
        .order('points', { ascending: false });

      if (contributionsError) throw contributionsError;

      return {
        success: true,
        data: {
          ...superpuzzleData,
          teamContributions: contributionsData
        }
      };
    } catch (error) {
      console.error('Get superpuzzle details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting superpuzzle details'
      };
    }
  }

  /**
   * Check if a user can contribute to a superpuzzle
   * 
   * @param userId User ID to check eligibility for
   * @param teamId Team ID to contribute through
   * @param superpuzzleId Superpuzzle ID to contribute to
   * @returns Eligibility status and details
   */
  async checkContributionEligibility(userId: string, teamId: string, superpuzzleId: string): Promise<{
    success: boolean;
    data?: {
      isEligible: boolean;
      reason?: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('check_contribution_eligibility', {
        p_user_id: userId,
        p_team_id: teamId,
        p_superpuzzle_id: superpuzzleId
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Check contribution eligibility error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error checking contribution eligibility'
      };
    }
  }

  /**
   * Contribute to a superpuzzle
   * - Awards SCQ tokens on completion
   * - Boosts Community Health metrics
   * 
   * @param userId User ID contributing
   * @param teamId Team ID to contribute through
   * @param superpuzzleId Superpuzzle ID to contribute to
   * @param points Number of points to contribute
   * @returns Result of the contribution
   */
  async contributeToSuperpuzzle(userId: string, teamId: string, superpuzzleId: string, points: number): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('contribute_to_superpuzzle', {
        p_user_id: userId,
        p_team_id: teamId,
        p_superpuzzle_id: superpuzzleId,
        p_points: points
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
        data
      };
    } catch (error) {
      console.error('Contribute to superpuzzle error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error contributing to superpuzzle'
      };
    }
  }

  /**
   * Get a team's contributions to superpuzzles
   * 
   * @param teamId Team ID to get contributions for
   * @returns List of the team's superpuzzle contributions
   */
  async getTeamContributions(teamId: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('team_superpuzzles')
        .select(`
          id,
          superpuzzle_id,
          points,
          created_at,
          completed_at,
          superpuzzles:superpuzzle_id(
            id,
            name,
            description,
            required_points,
            status,
            token_id,
            tokens:token_id(
              id,
              name,
              symbol,
              color
            )
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data.map(contribution => ({
          id: contribution.id,
          superpuzzleId: contribution.superpuzzle_id,
          points: contribution.points,
          createdAt: contribution.created_at,
          completedAt: contribution.completed_at,
          superpuzzle: contribution.superpuzzles,
          progress: Math.round((contribution.points / contribution.superpuzzles.required_points) * 100),
          isCompleted: contribution.completed_at !== null
        }))
      };
    } catch (error) {
      console.error('Get team contributions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting team contributions'
      };
    }
  }

  /**
   * Get a user's contributions to superpuzzles
   * 
   * @param userId User ID to get contributions for
   * @returns List of the user's superpuzzle contributions
   */
  async getUserContributions(userId: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('contributions')
        .select(`
          id,
          team_superpuzzle_id,
          points,
          created_at,
          team_superpuzzles:team_superpuzzle_id(
            id,
            team_id,
            superpuzzle_id,
            points,
            completed_at,
            teams:team_id(
              id,
              name
            ),
            superpuzzles:superpuzzle_id(
              id,
              name,
              description,
              required_points,
              status,
              token_id,
              tokens:token_id(
                id,
                name,
                symbol,
                color
              )
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data.map(contribution => ({
          id: contribution.id,
          teamSuperpuzzleId: contribution.team_superpuzzle_id,
          points: contribution.points,
          createdAt: contribution.created_at,
          teamId: contribution.team_superpuzzles.team_id,
          teamName: contribution.team_superpuzzles.teams.name,
          superpuzzleId: contribution.team_superpuzzles.superpuzzle_id,
          superpuzzleName: contribution.team_superpuzzles.superpuzzles.name,
          superpuzzleDescription: contribution.team_superpuzzles.superpuzzles.description,
          tokenSymbol: contribution.team_superpuzzles.superpuzzles.tokens.symbol,
          tokenColor: contribution.team_superpuzzles.superpuzzles.tokens.color,
          isCompleted: contribution.team_superpuzzles.completed_at !== null
        }))
      };
    } catch (error) {
      console.error('Get user contributions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting user contributions'
      };
    }
  }

  /**
   * Check if a sub-token is eligible to be unlocked
   * 
   * @param tokenSymbol Symbol of the token to check
   * @returns Eligibility status and details
   */
  async checkSubTokenUnlockEligibility(tokenSymbol: string): Promise<{
    success: boolean;
    data?: {
      isEligible: boolean;
      tokenSymbol: string;
      totalPoints: number;
      requiredPoints: number;
      progress: number;
      reason?: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('check_sub_token_unlock_eligibility', {
        p_token_symbol: tokenSymbol
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Check sub-token unlock eligibility error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error checking sub-token unlock eligibility'
      };
    }
  }

  /**
   * Unlock a sub-token
   * 
   * @param tokenSymbol Symbol of the token to unlock
   * @returns Result of the unlock operation
   */
  async unlockSubToken(tokenSymbol: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('unlock_sub_token', {
        p_token_symbol: tokenSymbol
      });

      if (error) throw error;

      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('Unlock sub-token error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error unlocking sub-token'
      };
    }
  }
}

// Export a singleton instance
export const superpuzzlesService = new SuperpuzzlesService();

// Export default for direct imports
export default superpuzzlesService;
