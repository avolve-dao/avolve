/**
 * @ai-anchor #INVITATION_SYSTEM
 * @ai-context This repository handles data access operations for the invitation system
 * @ai-related-to invitation-types.ts, invitation-service.ts
 * @ai-sacred-geometry tesla-369
 * 
 * Invitation Repository
 * 
 * This repository implements the data access layer for invitation-related operations.
 * It follows the repository pattern, providing a clean separation between business logic and data access.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  IInvitationRepository,
  InvitationResult,
  InvitationError,
  Invitation,
  InvitationTier,
  InvitationStatus,
  InvitationCreationResponse,
  InvitationAcceptanceResponse,
  InvitationWithCreator,
  InvitationWithInvitee
} from './invitation-types';

/**
 * Invitation Repository Class
 * 
 * This repository handles all database operations related to invitations.
 * It implements the IInvitationRepository interface.
 */
export class InvitationRepository implements IInvitationRepository {
  /**
   * Creates a new InvitationRepository instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(private readonly client: SupabaseClient) {}

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
   * Gets an invitation tier by name
   * 
   * @param tierName - The name of the invitation tier
   * @returns A promise resolving to an InvitationResult containing an InvitationTier object
   */
  public async getInvitationTierByName(tierName: string): Promise<InvitationResult<InvitationTier>> {
    try {
      const { data, error } = await this.client
        .from('invitation_tiers')
        .select('*')
        .eq('tier_name', tierName)
        .single();
      
      if (error) {
        console.error('Get invitation tier by name error:', error);
        return { 
          data: null, 
          error: new InvitationError(`Failed to fetch invitation tier: ${tierName}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected get invitation tier by name error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting invitation tier', error) 
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
   * Creates a new invitation
   * 
   * @param userId - The ID of the user creating the invitation
   * @param tierName - The name of the invitation tier
   * @param email - Optional email of the invitee
   * @returns A promise resolving to an InvitationResult containing the created Invitation
   */
  public async createInvitation(
    userId: string,
    tierName: string,
    email?: string
  ): Promise<InvitationResult<Invitation>> {
    try {
      // Get the tier details
      const { data: tier, error: tierError } = await this.getInvitationTierByName(tierName);
      
      if (tierError || !tier) {
        return { 
          data: null, 
          error: new InvitationError(`Invalid tier name: ${tierName}`, tierError) 
        };
      }
      
      // Generate a unique invitation code
      const code = await this.generateUniqueInvitationCode();
      
      // Calculate expiration date based on tier validity
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + tier.validity_days);
      
      // Create the invitation
      const { data, error } = await this.client
        .from('invitations')
        .insert({
          code,
          created_by: userId,
          email: email || null,
          status: InvitationStatus.PENDING,
          expires_at: expiresAt.toISOString(),
          invitation_tier: tierName,
          reward_amount: 10 * tier.reward_multiplier // Base reward * multiplier
        })
        .select()
        .single();
      
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
          error: new InvitationError('Failed to fetch invitation by code', error) 
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
          error: new InvitationError('Failed to fetch invitation by ID', error) 
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
   * Accepts an invitation
   * 
   * @param invitationId - The ID of the invitation
   * @param userId - The ID of the user accepting the invitation
   * @returns A promise resolving to an InvitationResult containing an InvitationAcceptanceResponse
   */
  public async acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<InvitationResult<InvitationAcceptanceResponse>> {
    try {
      // Get the invitation
      const { data: invitation, error: invitationError } = await this.getInvitationById(invitationId);
      
      if (invitationError || !invitation) {
        return { 
          data: null, 
          error: new InvitationError('Failed to fetch invitation', invitationError) 
        };
      }
      
      // Check if the invitation is valid
      if (invitation.status !== InvitationStatus.PENDING) {
        return { 
          data: { success: false, message: 'Invitation is not pending' }, 
          error: null 
        };
      }
      
      // Check if the invitation is expired
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      if (expiresAt < now) {
        // Update the invitation to expired
        await this.client
          .from('invitations')
          .update({ status: InvitationStatus.EXPIRED })
          .eq('id', invitationId);
        
        return { 
          data: { success: false, message: 'Invitation has expired' }, 
          error: null 
        };
      }
      
      // Update the invitation
      const { error: updateError } = await this.client
        .from('invitations')
        .update({
          status: InvitationStatus.ACCEPTED,
          accepted_at: new Date().toISOString(),
          invitee_id: userId
        })
        .eq('id', invitationId);
      
      if (updateError) {
        console.error('Accept invitation error:', updateError);
        return { 
          data: null, 
          error: new InvitationError('Failed to accept invitation', updateError) 
        };
      }
      
      return { 
        data: { 
          success: true, 
          message: 'Invitation accepted successfully',
          reward_amount: invitation.reward_amount
        }, 
        error: null 
      };
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
   * @param invitationId - The ID of the invitation
   * @param userId - The ID of the user claiming the reward
   * @returns A promise resolving to an InvitationResult containing an InvitationAcceptanceResponse
   */
  public async claimInvitationReward(
    invitationId: string,
    userId: string
  ): Promise<InvitationResult<InvitationAcceptanceResponse>> {
    try {
      // Get the invitation
      const { data: invitation, error: invitationError } = await this.getInvitationById(invitationId);
      
      if (invitationError || !invitation) {
        return { 
          data: null, 
          error: new InvitationError('Failed to fetch invitation', invitationError) 
        };
      }
      
      // Check if the invitation is accepted
      if (invitation.status !== InvitationStatus.ACCEPTED) {
        return { 
          data: { success: false, message: 'Invitation is not accepted' }, 
          error: null 
        };
      }
      
      // Check if the reward is already claimed
      if (invitation.reward_claimed) {
        return { 
          data: { success: false, message: 'Reward already claimed' }, 
          error: null 
        };
      }
      
      // Check if the user is the invitee
      if (invitation.invitee_id !== userId) {
        return { 
          data: { success: false, message: 'Only the invitee can claim the reward' }, 
          error: null 
        };
      }
      
      // Update the invitation
      const { error: updateError } = await this.client
        .from('invitations')
        .update({
          reward_claimed: true,
          reward_claimed_at: new Date().toISOString()
        })
        .eq('id', invitationId);
      
      if (updateError) {
        console.error('Claim invitation reward error:', updateError);
        return { 
          data: null, 
          error: new InvitationError('Failed to claim invitation reward', updateError) 
        };
      }
      
      return { 
        data: { 
          success: true, 
          message: 'Reward claimed successfully',
          reward_amount: invitation.reward_amount
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Unexpected claim invitation reward error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while claiming invitation reward', error) 
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
      const invitationsWithInvitees = data.map(invitation => {
        const { invitee, ...rest } = invitation;
        return {
          ...rest,
          invitee_username: invitee?.username,
          invitee_avatar_url: invitee?.avatar_url
        } as InvitationWithInvitee;
      });
      
      return { data: invitationsWithInvitees, error: null };
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
        .order('accepted_at', { ascending: false });
      
      if (error) {
        console.error('Get user received invitations error:', error);
        return { 
          data: null, 
          error: new InvitationError('Failed to fetch user received invitations', error) 
        };
      }
      
      // Transform the data to match the InvitationWithCreator interface
      const invitationsWithCreators = data.map(invitation => {
        const { creator, ...rest } = invitation;
        return {
          ...rest,
          creator_username: creator?.username,
          creator_avatar_url: creator?.avatar_url
        } as InvitationWithCreator;
      });
      
      return { data: invitationsWithCreators, error: null };
    } catch (error) {
      console.error('Unexpected get user received invitations error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting user received invitations', error) 
      };
    }
  }

  /**
   * Updates the status of an invitation
   * 
   * @param invitationId - The ID of the invitation
   * @param status - The new status
   * @returns A promise resolving to an InvitationResult containing the updated Invitation
   */
  public async updateInvitationStatus(
    invitationId: string,
    status: InvitationStatus
  ): Promise<InvitationResult<Invitation>> {
    try {
      const { data, error } = await this.client
        .from('invitations')
        .update({ 
          status,
          ...(status === InvitationStatus.CLAIMED ? { reward_claimed: true, reward_claimed_at: new Date().toISOString() } : {})
        })
        .eq('id', invitationId)
        .select('*')
        .single();
      
      if (error) {
        console.error('Update invitation status error:', error);
        return { 
          data: null, 
          error: new InvitationError(`Failed to update invitation status to ${status}`, error) 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Unexpected update invitation status error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while updating invitation status', error) 
      };
    }
  }

  /**
   * Generates a unique invitation code
   * 
   * @param length - The length of the code to generate (default: 8)
   * @returns A promise resolving to a unique invitation code
   */
  private async generateUniqueInvitationCode(length: number = 8): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = '';
    
    // Generate a random code
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const { data } = await this.client
      .from('invitations')
      .select('code')
      .eq('code', result);
    
    // If code exists, recursively try again
    if (data && data.length > 0) {
      return this.generateUniqueInvitationCode(length);
    }
    
    return result;
  }
}
