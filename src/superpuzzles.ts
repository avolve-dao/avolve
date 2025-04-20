// --- Interfaces for Superpuzzles ---

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
import { Database } from '../types/supabase';

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

      // Fix tokens property for root and nested objects: flatten tokens array to single object if needed
      const mappedData = (data || []).map((item: any) => {
        let tokens = (item.tokens && Array.isArray(item.tokens)) ? (item.tokens[0] && !Array.isArray(item.tokens[0]) ? item.tokens[0] : { id: '', name: '', symbol: '', color: '' }) : (item.tokens || { id: '', name: '', symbol: '', color: '' });
        const teamContributions = (item.teamContributions || []).map((tc: any) => {
          let tcTokens = tc.superpuzzle?.tokens;
          if (Array.isArray(tcTokens)) {
            tcTokens = tcTokens[0] && !Array.isArray(tcTokens[0]) ? tcTokens[0] : { id: '', name: '', symbol: '', color: '' };
          } else {
            tcTokens = tcTokens || { id: '', name: '', symbol: '', color: '' };
          }
          return {
            ...tc,
            superpuzzle: {
              ...tc.superpuzzle,
              tokens: tcTokens
            }
          };
        });
        // Defensive: forcibly flatten tokens if still an array after all mapping
        let finalTokens = tokens;
        if (Array.isArray(finalTokens)) {
          finalTokens = finalTokens[0] && !Array.isArray(finalTokens[0]) ? finalTokens[0] : { id: '', name: '', symbol: '', color: '' };
        } else if (!finalTokens || typeof finalTokens !== 'object' || Array.isArray(finalTokens)) {
          finalTokens = { id: '', name: '', symbol: '', color: '' };
        }
        // If after all, still an array, forcibly cast to single object
        if (Array.isArray(finalTokens)) {
          finalTokens = { id: '', name: '', symbol: '', color: '' };
        }
        // Defensive: flatten tokens in all teamContributions.superpuzzle
        const finalTeamContributions = teamContributions.map((tc: any) => {
          let tcTokens = tc.superpuzzle?.tokens;
          if (Array.isArray(tcTokens)) {
            tcTokens = tcTokens[0] && !Array.isArray(tcTokens[0]) ? tcTokens[0] : { id: '', name: '', symbol: '', color: '' };
          } else if (!tcTokens || typeof tcTokens !== 'object' || Array.isArray(tcTokens)) {
            tcTokens = { id: '', name: '', symbol: '', color: '' };
          }
          return {
            ...tc,
            superpuzzle: {
              ...tc.superpuzzle,
              tokens: tcTokens
            }
          };
        });
        // ULTIMATE DEFENSIVE: forcibly flatten tokens if still an array, not an object, or not matching the required shape
        const isValidTokenObj = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj) && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.symbol === 'string' && typeof obj.color === 'string';
        if (!isValidTokenObj(finalTokens)) {
          finalTokens = { id: '', name: '', symbol: '', color: '' };
        }
        return {
          ...item,
          tokens: finalTokens,
          completed_at: item.completed_at ?? null,
          teamContributions: finalTeamContributions
        };
      });

      return {
        success: true,
        data: mappedData
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
    data?: Superpuzzle[];
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

      // Fix tokens property for root and nested objects: flatten tokens array to single object if needed
      const mappedData = (data || []).map((item: any) => {
        let tokens = (item.tokens && Array.isArray(item.tokens)) ? (item.tokens[0] && !Array.isArray(item.tokens[0]) ? item.tokens[0] : { id: '', name: '', symbol: '', color: '' }) : (item.tokens || { id: '', name: '', symbol: '', color: '' });
        const teamContributions = (item.teamContributions || []).map((tc: any) => {
          let tcTokens = tc.superpuzzle?.tokens;
          if (Array.isArray(tcTokens)) {
            tcTokens = tcTokens[0] && !Array.isArray(tcTokens[0]) ? tcTokens[0] : { id: '', name: '', symbol: '', color: '' };
          } else {
            tcTokens = tcTokens || { id: '', name: '', symbol: '', color: '' };
          }
          return {
            ...tc,
            superpuzzle: {
              ...tc.superpuzzle,
              tokens: tcTokens
            }
          };
        });
        // Defensive: forcibly flatten tokens if still an array after all mapping
        let finalTokens = tokens;
        if (Array.isArray(finalTokens)) {
          finalTokens = finalTokens[0] && !Array.isArray(finalTokens[0]) ? finalTokens[0] : { id: '', name: '', symbol: '', color: '' };
        } else if (!finalTokens || typeof finalTokens !== 'object' || Array.isArray(finalTokens)) {
          finalTokens = { id: '', name: '', symbol: '', color: '' };
        }
        // If after all, still an array, forcibly cast to single object
        if (Array.isArray(finalTokens)) {
          finalTokens = { id: '', name: '', symbol: '', color: '' };
        }
        // Defensive: flatten tokens in all teamContributions.superpuzzle
        const finalTeamContributions = teamContributions.map((tc: any) => {
          let tcTokens = tc.superpuzzle?.tokens;
          if (Array.isArray(tcTokens)) {
            tcTokens = tcTokens[0] && !Array.isArray(tcTokens[0]) ? tcTokens[0] : { id: '', name: '', symbol: '', color: '' };
          } else if (!tcTokens || typeof tcTokens !== 'object' || Array.isArray(tcTokens)) {
            tcTokens = { id: '', name: '', symbol: '', color: '' };
          }
          return {
            ...tc,
            superpuzzle: {
              ...tc.superpuzzle,
              tokens: tcTokens
            }
          };
        });
        // ULTIMATE DEFENSIVE: forcibly flatten tokens if still an array, not an object, or not matching the required shape
        const isValidTokenObj = (obj: any) => obj && typeof obj === 'object' && !Array.isArray(obj) && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.symbol === 'string' && typeof obj.color === 'string';
        if (!isValidTokenObj(finalTokens)) {
          finalTokens = { id: '', name: '', symbol: '', color: '' };
        }
        return {
          ...item,
          tokens: finalTokens,
          completed_at: item.completed_at ?? null,
          teamContributions: finalTeamContributions
        };
      });

      return {
        success: true,
        data: mappedData
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
    data?: Superpuzzle | null;
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

      // Fix TeamContribution[] shape for teamContributions property
      const mappedTeamContributions = (contributionsData || []).map((row: any) => ({
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

      let tokensObj: { id: string; name: string; symbol: string; color: string } = { id: '', name: '', symbol: '', color: '' };
      if (Array.isArray(superpuzzleData.tokens)) {
        for (const t of superpuzzleData.tokens as any[]) {
          if (
            t && typeof t === 'object' &&
            !Array.isArray(t) &&
            typeof (t as any).id === 'string' &&
            typeof (t as any).name === 'string' &&
            typeof (t as any).symbol === 'string' &&
            typeof (t as any).color === 'string'
          ) {
            tokensObj = {
              id: (t as any).id,
              name: (t as any).name,
              symbol: (t as any).symbol,
              color: (t as any).color
            };
            break;
          }
        }
      } else if (
        superpuzzleData.tokens &&
        typeof superpuzzleData.tokens === 'object' &&
        !Array.isArray(superpuzzleData.tokens) &&
        typeof (superpuzzleData.tokens as any).id === 'string' &&
        typeof (superpuzzleData.tokens as any).name === 'string' &&
        typeof (superpuzzleData.tokens as any).symbol === 'string' &&
        typeof (superpuzzleData.tokens as any).color === 'string'
      ) {
        tokensObj = {
          id: (superpuzzleData.tokens as any).id,
          name: (superpuzzleData.tokens as any).name,
          symbol: (superpuzzleData.tokens as any).symbol,
          color: (superpuzzleData.tokens as any).color
        };
      }
      let returned = {
        ...superpuzzleData,
        tokens: tokensObj,
        teamContributions: mappedTeamContributions
      };
      return {
        success: true,
        data: returned as Superpuzzle
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
