/**
 * @ai-anchor #INVITATION_SYSTEM
 * @ai-context This service centralizes all invitation management functionality for the Avolve platform
 * @ai-related-to invitation-types.ts, token-service.ts
 * @ai-sacred-geometry tesla-369
 * 
 * Invitation Service
 * 
 * This service provides a high-level API for invitation-related operations.
 * It implements business logic for the tiered invitation system.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  InvitationResult,
  InvitationError,
  Invitation,
  InvitationStatus,
  InvitationTier,
  InvitationCreationResponse,
  InvitationAcceptanceResponse,
  InvitationWithCreator,
  InvitationWithInvitee,
  InvitationDashboardData,
  CreateInvitationRequest,
  AcceptInvitationRequest,
  ClaimInvitationRewardRequest
} from './invitation-types';
import { TokenService } from '../token/token-service';

/**
 * Invitation Service Class
 * 
 * This service provides a high-level API for invitation-related operations.
 * It implements business logic for the tiered invitation system.
 */
export class InvitationService {
  private tokenService: TokenService;
  
  /**
   * Creates a new InvitationService instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(private readonly client: SupabaseClient) {
    this.tokenService = new TokenService(client);
  }

  /**
   * Gets all invitation tiers
   * 
   * @returns A promise resolving to an InvitationResult containing an array of InvitationTier objects
   */
  public async getAllInvitationTiers(): Promise<InvitationResult<InvitationTier[]>> {
    try {
      const { data, error } = await this.client
        .from('invitation_tiers')
        .select('*')
        .order('token_cost');
      
      if (error) {
        console.error('Get all invitation tiers error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to fetch invitation tiers', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get all invitation tiers error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting invitation tiers', error) 
      };
    }
  }

  /**
   * Gets invitations created by a user
   * 
   * @param userId - The ID of the user who created the invitations
   * @returns A promise resolving to an InvitationResult containing an array of Invitation objects
   */
  public async getUserCreatedInvitations(userId: string): Promise<InvitationResult<Invitation[]>> {
    try {
      const { data, error } = await this.client
        .from('invitations')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get user created invitations error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to fetch user created invitations', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get user created invitations error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting user created invitations', error) 
      };
    }
  }

  /**
   * Gets invitations with invitee details
   * 
   * @param userId - The ID of the user who created the invitations
   * @returns A promise resolving to an InvitationResult containing an array of InvitationWithInvitee objects
   */
  public async getUserInvitationsWithInvitees(userId: string): Promise<InvitationResult<InvitationWithInvitee[]>> {
    try {
      const { data, error } = await this.client
        .from('invitations')
        .select(`
          *,
          invitee:invitee_id (
            username,
            avatar_url
          )
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get user invitations with invitees error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to fetch user invitations with invitees', error) 
        };
      }
      
      // Transform the data to match the InvitationWithInvitee interface
      const transformedData: InvitationWithInvitee[] = data.map(invitation => {
        const { invitee, ...rest } = invitation;
        return {
          ...rest,
          invitee_username: invitee?.username,
          invitee_avatar_url: invitee?.avatar_url
        };
      });
      
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Unexpected get user invitations with invitees error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting user invitations with invitees', error) 
      };
    }
  }

  /**
   * Gets invitations received by a user
   * 
   * @param userId - The ID of the user who received the invitations
   * @returns A promise resolving to an InvitationResult containing an array of InvitationWithCreator objects
   */
  public async getUserReceivedInvitations(userId: string): Promise<InvitationResult<InvitationWithCreator[]>> {
    try {
      const { data, error } = await this.client
        .from('invitations')
        .select(`
          *,
          creator:created_by (
            username,
            avatar_url
          )
        `)
        .eq('invitee_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Get user received invitations error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to fetch user received invitations', error) 
        };
      }
      
      // Transform the data to match the InvitationWithCreator interface
      const transformedData: InvitationWithCreator[] = data.map(invitation => {
        const { creator, ...rest } = invitation;
        return {
          ...rest,
          creator_username: creator?.username,
          creator_avatar_url: creator?.avatar_url
        };
      });
      
      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Unexpected get user received invitations error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting user received invitations', error) 
      };
    }
  }

  /**
   * Gets an invitation by its code
   * 
   * @param code - The invitation code
   * @returns A promise resolving to an InvitationResult containing an Invitation object
   */
  public async getInvitationByCode(code: string): Promise<InvitationResult<Invitation>> {
    try {
      const { data, error } = await this.client
        .from('invitations')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error) {
        console.error('Get invitation by code error:', error);
        return { 
          data: null, 
          error: new InvitationError(`Failed to fetch invitation with code: ${code}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get invitation by code error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting invitation by code', error) 
      };
    }
  }

  /**
   * Gets an invitation by its ID
   * 
   * @param id - The invitation ID
   * @returns A promise resolving to an InvitationResult containing an Invitation object
   */
  public async getInvitationById(id: string): Promise<InvitationResult<Invitation>> {
    try {
      const { data, error } = await this.client
        .from('invitations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Get invitation by ID error:', error);
        return { 
          data: null, 
          error: new InvitationError(`Failed to fetch invitation with ID: ${id}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get invitation by ID error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting invitation by ID', error) 
      };
    }
  }

  /**
   * Creates a new invitation
   * 
   * @param userId - The ID of the user creating the invitation
   * @param request - The invitation creation request
   * @returns A promise resolving to an InvitationResult containing an InvitationCreationResponse
   */
  public async createInvitation(
    userId: string,
    request: CreateInvitationRequest
  ): Promise<InvitationResult<InvitationCreationResponse>> {
    try {
      const { data, error } = await this.client.rpc('create_invitation', {
        p_tier_name: request.tier_name,
        p_email: request.email || null
      });
      
      if (error) {
        console.error('Create invitation error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to create invitation', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected create invitation error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while creating invitation', error) 
      };
    }
  }

  /**
   * Accepts an invitation
   * 
   * @param userId - The ID of the user accepting the invitation
   * @param request - The invitation acceptance request
   * @returns A promise resolving to an InvitationResult containing an InvitationAcceptanceResponse
   */
  public async acceptInvitation(
    userId: string,
    request: AcceptInvitationRequest
  ): Promise<InvitationResult<InvitationAcceptanceResponse>> {
    try {
      const { data, error } = await this.client.rpc('accept_invitation', {
        p_invitation_code: request.invitation_code
      });
      
      if (error) {
        console.error('Accept invitation error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to accept invitation', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected accept invitation error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while accepting invitation', error) 
      };
    }
  }

  /**
   * Claims a reward for an accepted invitation
   * 
   * @param userId - The ID of the user claiming the reward
   * @param request - The claim invitation reward request
   * @returns A promise resolving to an InvitationResult containing an InvitationAcceptanceResponse
   */
  public async claimInvitationReward(
    userId: string,
    request: ClaimInvitationRewardRequest
  ): Promise<InvitationResult<InvitationAcceptanceResponse>> {
    try {
      const { data, error } = await this.client.rpc('claim_invitation_reward', {
        p_invitation_id: request.invitation_id
      });
      
      if (error) {
        console.error('Claim invitation reward error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to claim invitation reward', error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected claim invitation reward error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while claiming invitation reward', error) 
      };
    }
  }

  /**
   * Gets invitation dashboard data for a user
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to an InvitationResult containing InvitationDashboardData
   */
  public async getInvitationDashboard(userId: string): Promise<InvitationResult<InvitationDashboardData>> {
    try {
      // Get all invitation tiers
      const { data: tiers, error: tiersError } = await this.getAllInvitationTiers();
      
      if (tiersError) {
        return { data: null, error: tiersError };
      }
      
      // Get user invitations with invitee details
      const { data: invitations, error: invitationsError } = await this.getUserInvitationsWithInvitees(userId);
      
      if (invitationsError) {
        return { data: null, error: invitationsError };
      }
      
      // Calculate dashboard metrics
      const pendingInvitations = invitations?.filter(inv => inv.status === InvitationStatus.PENDING).length || 0;
      const acceptedInvitations = invitations?.filter(inv => inv.status === InvitationStatus.ACCEPTED).length || 0;
      
      // Calculate total rewards earned
      const totalRewardsEarned = invitations?.reduce((sum, inv) => {
        if (inv.status === InvitationStatus.ACCEPTED && inv.reward_claimed) {
          return sum + inv.reward_amount;
        }
        return sum;
      }, 0) || 0;
      
      // Calculate unclaimed rewards
      const unclaimedRewards = invitations?.reduce((sum, inv) => {
        if (inv.status === InvitationStatus.ACCEPTED && !inv.reward_claimed) {
          return sum + inv.reward_amount;
        }
        return sum;
      }, 0) || 0;
      
      // Build dashboard data
      const dashboardData: InvitationDashboardData = {
        available_tiers: tiers || [],
        user_invitations: invitations || [],
        pending_invitations: pendingInvitations,
        accepted_invitations: acceptedInvitations,
        total_rewards_earned: totalRewardsEarned,
        unclaimed_rewards: unclaimedRewards
      };
      
      return { data: dashboardData, error: null };
    } catch (error) {
      console.error('Unexpected get invitation dashboard error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting invitation dashboard', error) 
      };
    }
  }

  /**
   * Checks if an invitation code is valid
   * 
   * @param code - The invitation code to check
   * @returns A promise resolving to an InvitationResult containing a boolean indicating if the code is valid
   */
  public async isInvitationCodeValid(code: string): Promise<InvitationResult<boolean>> {
    try {
      const { data: invitation, error } = await this.getInvitationByCode(code);
      
      if (error) {
        return { data: false, error: null };
      }
      
      if (!invitation) {
        return { data: false, error: null };
      }
      
      // Check if the invitation is pending and not expired
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      const isValid = invitation.status === InvitationStatus.PENDING && expiresAt > now;
      
      return { data: isValid, error: null };
    } catch (error) {
      console.error('Unexpected check invitation code error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while checking invitation code', error) 
      };
    }
  }

  /**
   * Gets the number of invitations a user has created for a specific tier in the last 30 days
   * 
   * @param userId - The ID of the user
   * @param tierName - The name of the invitation tier
   * @returns A promise resolving to an InvitationResult containing the number of invitations
   */
  public async getUserInvitationCountForTier(
    userId: string,
    tierName: string
  ): Promise<InvitationResult<number>> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await this.client
        .from('invitations')
        .select('id', { count: 'exact' })
        .eq('created_by', userId)
        .eq('invitation_tier', tierName)
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (error) {
        console.error('Get user invitation count error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to get user invitation count', error) 
        };
      }
      
      return { data: data.length, error: null };
    } catch (error) {
      console.error('Unexpected get user invitation count error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting user invitation count', error) 
      };
    }
  }

  /**
   * Checks if a user has reached their invitation limit for a specific tier
   * 
   * @param userId - The ID of the user
   * @param tierName - The name of the invitation tier
   * @returns A promise resolving to an InvitationResult containing a boolean indicating if the limit has been reached
   */
  public async hasUserReachedInvitationLimit(
    userId: string,
    tierName: string
  ): Promise<InvitationResult<boolean>> {
    try {
      // Get the tier details
      const { data: tiers, error: tiersError } = await this.client
        .from('invitation_tiers')
        .select('*')
        .eq('tier_name', tierName)
        .limit(1);
      
      if (tiersError) {
        console.error('Get tier details error:', tiersError);
        return { 
          data: null, 
          error: new InvitationError('Failed to get tier details', tiersError) 
        };
      }
      
      if (!tiers || tiers.length === 0) {
        return { 
          data: null, 
          error: new InvitationError(`Invalid tier name: ${tierName}`) 
        };
      }
      
      const tier = tiers[0];
      
      // Get the user's invitation count for this tier
      const { data: count, error: countError } = await this.getUserInvitationCountForTier(userId, tierName);
      
      if (countError) {
        return { data: null, error: countError };
      }
      
      return { data: count !== null && count >= tier.max_invites, error: null };
    } catch (error) {
      console.error('Unexpected check invitation limit error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while checking invitation limit', error) 
      };
    }
  }
}
