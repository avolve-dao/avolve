import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

/**
 * GovernanceService - Manages platform governance through petitions and voting
 * Handles petition creation, voting, and approval processes
 */
export class GovernanceService {
  private supabase: SupabaseClient<Database>;

  constructor(supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '', supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '') {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Check if a user is eligible to create a petition
   * Users must have at least 100 GEN tokens to create a petition
   * 
   * @param userId User ID to check eligibility for
   * @returns Eligibility status and details
   */
  async checkPetitionEligibility(userId: string): Promise<{
    success: boolean;
    data?: {
      isEligible: boolean;
      genBalance: number;
      requiredGen: number;
      reason?: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('check_petition_eligibility', {
        p_user_id: userId
      });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Check petition eligibility error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error checking petition eligibility'
      };
    }
  }

  /**
   * Create a new petition
   * - Unlocked after 100 GEN tokens
   * - Boosts NPS in metrics if approved
   * 
   * @param userId User ID creating the petition
   * @param title Petition title
   * @param description Petition description
   * @returns Result of petition creation
   */
  async createPetition(userId: string, title: string, description: string): Promise<{
    success: boolean;
    data?: {
      petitionId: string;
      message: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('create_petition', {
        p_user_id: userId,
        p_title: title,
        p_description: description
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
        data: {
          petitionId: data.petitionId,
          message: data.message
        }
      };
    } catch (error) {
      console.error('Create petition error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating petition'
      };
    }
  }

  /**
   * Vote on a petition
   * - Vote weight is based on GEN balance only
   * 
   * @param userId User ID voting on the petition
   * @param petitionId Petition ID to vote on
   * @returns Result of voting
   */
  async voteOnPetition(userId: string, petitionId: string): Promise<{
    success: boolean;
    data?: {
      voteWeight: number;
      previousWeight?: number;
      message: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('vote_on_petition', {
        p_user_id: userId,
        p_petition_id: petitionId
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
        data: {
          voteWeight: data.voteWeight,
          previousWeight: data.previousWeight,
          message: data.message
        }
      };
    } catch (error) {
      console.error('Vote on petition error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error voting on petition'
      };
    }
  }

  /**
   * Process a petition (approve or reject)
   * - Approved petitions boost NPS metrics for the creator
   * 
   * @param petitionId Petition ID to process
   * @param status New status ('approved' or 'rejected')
   * @returns Result of processing
   */
  async processPetition(petitionId: string, status: 'approved' | 'rejected'): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase.rpc('process_petition', {
        p_petition_id: petitionId,
        p_status: status
      });

      if (error) throw error;

      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      console.error('Process petition error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing petition'
      };
    }
  }

  /**
   * Get all petitions
   * 
   * @param status Optional status filter ('pending', 'approved', 'rejected')
   * @returns List of petitions
   */
  async getAllPetitions(status?: 'pending' | 'approved' | 'rejected'): Promise<{
    success: boolean;
    data?: Petition[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('petitions')
        .select(`
          id,
          title,
          description,
          user_id,
          created_at,
          status,
          profiles:user_id(id, username, full_name, avatar_url),
          votes:petition_id(id, user_id, vote_weight, created_at)
        `)
        .eq('status', status || 'pending');

      if (error) throw error;

      // Normalize data to Petition[]
      const petitions: Petition[] = (data || []).map((row: Record<string, unknown>) => ({
        id: String(row.id ?? ''),
        user_id: String(row.user_id ?? ''),
        title: String(row.title ?? ''),
        description: String(row.description ?? ''),
        creator_id: String(row.user_id ?? ''),
        created_at: String(row.created_at ?? ''),
        status: String(row.status ?? ''),
        profiles: Array.isArray(row.profiles)
          ? (row.profiles as Profile[]).map((p) => ({
              id: String(p.id ?? ''),
              username: String(p.username ?? ''),
              full_name: String(p.full_name ?? ''),
              avatar_url: String(p.avatar_url ?? '')
            }))
          : [],
        votes: Array.isArray(row.votes)
          ? (row.votes as Vote[]).map((v) => ({
              id: String(v.id ?? ''),
              user_id: String(v.user_id ?? ''),
              vote_weight: typeof v.vote_weight === 'number' ? v.vote_weight : 1,
              created_at: String(v.created_at ?? '')
            }))
          : [],
        voteCount: Array.isArray(row.votes) ? row.votes.length : 0
      }));

      return {
        success: true,
        data: petitions
      };
    } catch (error) {
      console.error('Get all petitions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown getAllPetitions error'
      };
    }
  }

  /**
   * Get petitions created by a user
   * 
   * @param userId User ID to get petitions for
   * @returns List of petitions created by the user
   */
  async getUserPetitions(userId: string): Promise<{
    success: boolean;
    data?: Petition[];
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('petitions')
        .select(`
          id,
          user_id,
          title,
          description,
          status,
          created_at,
          updated_at,
          approved_at,
          rejected_at,
          votes:votes(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data.map(petition => ({
          ...petition,
          voteCount: petition.votes[0]?.count || 0
        }))
      };
    } catch (error) {
      console.error('Get user petitions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting user petitions'
      };
    }
  }

  /**
   * Get a petition's details including votes
   * 
   * @param petitionId Petition ID to get details for
   * @returns Petition details with votes
   */
  async getPetitionDetails(petitionId: string): Promise<{
    success: boolean;
    data?: Petition | null;
    error?: string;
  }> {
    try {
      // Get petition details
      const { data: petitionData, error: petitionError } = await this.supabase
        .from('petitions')
        .select(`
          id,
          user_id,
          title,
          description,
          status,
          created_at,
          updated_at,
          approved_at,
          rejected_at,
          profiles:user_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', petitionId)
        .single();

      if (petitionError) throw petitionError;

      // Get votes
      const { data: votesData, error: votesError } = await this.supabase
        .from('votes')
        .select(`
          id,
          user_id,
          vote_weight,
          created_at,
          profiles:user_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('petition_id', petitionId)
        .order('vote_weight', { ascending: false });

      if (votesError) throw votesError;

      // Calculate total vote weight
      const totalVoteWeight = votesData.reduce((sum, vote) => sum + vote.vote_weight, 0);

      return {
        success: true,
        data: {
          ...petitionData,
          votes: votesData,
          voteCount: votesData.length,
          totalVoteWeight
        }
      };
    } catch (error) {
      console.error('Get petition details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting petition details'
      };
    }
  }

  /**
   * Check if a user has voted on a petition
   * 
   * @param userId User ID to check
   * @param petitionId Petition ID to check
   * @returns Vote details if found
   */
  async getUserVote(userId: string, petitionId: string): Promise<{
    success: boolean;
    data?: {
      hasVoted: boolean;
      voteWeight?: number;
      voteId?: string;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('votes')
        .select('id, vote_weight')
        .eq('petition_id', petitionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      return {
        success: true,
        data: {
          hasVoted: !!data,
          voteWeight: data?.vote_weight,
          voteId: data?.id
        }
      };
    } catch (error) {
      console.error('Get user vote error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error checking user vote'
      };
    }
  }
}

interface Petition {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
  status: string;
  votes?: Vote[];
  profiles?: Profile[];
  voteCount?: number;
  [key: string]: unknown;
}

interface Vote {
  id: string;
  user_id: string;
  vote_weight: number;
  created_at: string;
  profiles?: Profile[];
}

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

// Export a singleton instance
export const governanceService = new GovernanceService();

// Export default for direct imports
export default governanceService;
