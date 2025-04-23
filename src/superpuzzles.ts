// --- Interfaces for Superpuzzles ---
// ONBOARDING NOTE: The following tables and relationships must exist in Supabase for this service to function:
// - superpuzzles (with tokens relation via token_id)
// - tokens
// - contributions (with user_id, team_superpuzzle_id, etc.)
// - team_superpuzzles (with team_id, superpuzzle_id)
// - teams
// All must have proper Row Level Security (RLS) policies for both authenticated and admin users.
//
// The following RPCs must exist:
// - check_sub_token_unlock_eligibility
// - unlock_sub_token
// If any are missing, add TODOs in migrations and document their expected behavior for onboarding.

interface TeamContribution {
  id: string;
  superpuzzleId: string;
  points: number;
  contributedAt: string;
  completedAt: string | null;
  superpuzzle: {
    id: string;
    name: string;
    description: string;
    required_points: number;
    status: string;
    token_id: string;
    tokens: {
      id: string;
      name: string;
      symbol: string;
      color: string;
    };
  };
  progress: number;
  isCompleted: boolean;
}

interface Superpuzzle {
  id: string;
  name: string;
  description: string;
  token_id: string;
  required_points: number;
  status: string;
  created_at: string;
  completed_at: string | null;
  tokens: {
    id: string;
    name: string;
    symbol: string;
    color: string;
  };
  teamContributions: TeamContribution[];
}

interface UserContribution {
  id: string;
  teamSuperpuzzleId: string;
  points: number;
  contributedAt: string;
  teamId: string;
  teamName: string;
  superpuzzleId: string;
  superpuzzleName: string;
  superpuzzleDescription: string;
  tokenSymbol: string;
  tokenColor: string;
  isCompleted: boolean;
}

interface ContributionResult {
  id: string;
  contribution: string;
  created_at: string;
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Initialize Supabase client
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * SuperpuzzlesService - Manages superpuzzle operations and contributions
 * Handles superpuzzle creation, contributions, and completion
 */
export class SuperpuzzlesService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '', supabaseKey: string = supabaseAnonKey) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Get all active superpuzzles
   * 
   * @returns List of active superpuzzles
   */
  async getActiveSuperpuzzles(): Promise<{
    success: boolean;
    data?: Superpuzzle[];
    error?: string;
  }> {
    try {
      // The 'superpuzzles' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'superpuzzles' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
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
    data?: Superpuzzle[];
    error?: string;
  }> {
    try {
      // The 'superpuzzles' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'superpuzzles' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
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
    data?: Superpuzzle | null;
    error?: string;
  }> {
    try {
      // The 'superpuzzles' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'superpuzzles' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
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
    data?: ContributionResult;
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
    data?: TeamContribution[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('team_contributions')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      // Fix TeamContribution[] assignment: map and ensure all required properties exist and types match
      const mappedContributions = (data || []).map((row: any) => ({
        id: row.id,
        superpuzzleId: row.superpuzzle_id || '',
        points: typeof row.points === 'number' ? row.points : 0,
        contributedAt: row.created_at || '',
        completedAt: row.completed_at ?? null,
        superpuzzle: {
          id: row.superpuzzles?.[0]?.id || '',
          name: row.superpuzzles?.[0]?.name || '',
          description: row.superpuzzles?.[0]?.description || '',
          required_points: typeof row.superpuzzles?.[0]?.required_points === 'number' ? row.superpuzzles[0].required_points : 0,
          status: row.superpuzzles?.[0]?.status || '',
          token_id: row.superpuzzles?.[0]?.token_id || '',
          tokens: (row.superpuzzles?.[0]?.tokens && Array.isArray(row.superpuzzles[0].tokens)) ? (row.superpuzzles[0].tokens[0] && !Array.isArray(row.superpuzzles[0].tokens[0]) ? row.superpuzzles[0].tokens[0] : { id: '', name: '', symbol: '', color: '' }) : (row.superpuzzles?.[0]?.tokens || { id: '', name: '', symbol: '', color: '' })
        },
        progress: typeof row.progress === 'number' ? row.progress : 0,
        isCompleted: !!row.completed_at
      }));

      return {
        success: true,
        data: mappedContributions
      };
    } catch (error) {
      console.error('Get team contributions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown team contributions error'
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
    data?: UserContribution[];
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
          contributedAt: contribution.created_at,
          teamId: contribution.team_superpuzzles?.[0]?.team_id || '',
          teamName: contribution.team_superpuzzles?.[0]?.teams?.[0]?.name || '',
          superpuzzleId: contribution.team_superpuzzles?.[0]?.superpuzzle_id || '',
          superpuzzleName: contribution.team_superpuzzles?.[0]?.superpuzzles?.[0]?.name || '',
          superpuzzleDescription: contribution.team_superpuzzles?.[0]?.superpuzzles?.[0]?.description || '',
          tokenSymbol: contribution.team_superpuzzles?.[0]?.superpuzzles?.[0]?.tokens?.[0]?.symbol || '',
          tokenColor: contribution.team_superpuzzles?.[0]?.superpuzzles?.[0]?.tokens?.[0]?.color || '',
          isCompleted: contribution.team_superpuzzles?.[0]?.completed_at !== null
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

// Defensive coding note: All .map and nested property accesses below use type guards and default values to ensure robust, error-tolerant flows for both users and admins. New contributors should follow this pattern for any additions or changes.
