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
      // The 'check_petition_eligibility' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.
      throw new Error("The 'check_petition_eligibility' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.");
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
      // The 'create_petition' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.
      throw new Error("The 'create_petition' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.");
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
      // The 'vote_on_petition' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.
      throw new Error("The 'vote_on_petition' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.");
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
      // The 'process_petition' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.
      throw new Error("The 'process_petition' RPC function does not exist in the current Supabase schema. Please implement this logic in-app or create the function in your database.");
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
    // Onboarding Note: petitions, votes, and profiles tables must exist with correct relationships and RLS policies.
    // petitions.user_id -> profiles.id, votes.petition_id -> petitions.id, votes.user_id -> profiles.id
    // This ensures robust, secure governance flows for all users/admins.
    try {
      // The 'petitions' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'petitions' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
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
      // The 'petitions' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'petitions' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
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
      // The 'petitions' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'petitions' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
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
      // The 'votes' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.
      throw new Error("The 'votes' table does not exist in the current Supabase schema. Please implement this logic in-app or create the table in your database.");
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

// TODO: Ensure the following RPCs exist in Supabase for launch/onboarding:
// - check_petition_eligibility
// - create_petition
// - vote_on_petition
// - process_petition
// If not, add them via migrations and document their expected behavior for onboarding.

// Onboarding Note: Ensure the petitions, votes, and profiles tables exist and are migrated with correct relationships and RLS policies for robust, secure governance flows.

// Export a singleton instance
export const governanceService = new GovernanceService();

// Export default for direct imports
export default governanceService;
