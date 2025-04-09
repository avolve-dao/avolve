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
  InvitationTierAvailability,
  InvitationCreationResponse,
  InvitationAcceptanceResponse,
  InvitationWithCreator,
  InvitationWithInvitee,
  InvitationDashboardData,
  InvitationValidationResult,
  CreateInvitationRequest,
  AcceptInvitationRequest,
  ClaimInvitationRewardRequest,
  IInvitationRepository
} from './invitation-types';
import { TokenService } from '../token/token-service';
import { InvitationRepository } from './invitation-repository';

/**
 * Invitation Service Class
 * 
 * This service provides a high-level API for invitation-related operations.
 * It implements business logic for the tiered invitation system.
 */
export class InvitationService {
  private tokenService: TokenService;
  private repository: IInvitationRepository;
  
  /**
   * Creates a new InvitationService instance
   * 
   * @param client - The Supabase client instance
   */
  constructor(private readonly client: SupabaseClient) {
    this.tokenService = new TokenService(client);
    this.repository = new InvitationRepository(client);
  }

  /**
   * Gets all invitation tiers
   * 
   * @returns A promise resolving to an InvitationResult containing an array of InvitationTier objects
   */
  public async getAllInvitationTiers(): Promise<InvitationResult<InvitationTier[]>> {
    return this.repository.getAllInvitationTiers();
  }

  /**
   * Gets invitations created by a user
   * 
   * @param userId - The ID of the user who created the invitations
   * @returns A promise resolving to an InvitationResult containing an array of Invitation objects
   */
  public async getUserCreatedInvitations(userId: string): Promise<InvitationResult<Invitation[]>> {
    return this.repository.getUserCreatedInvitations(userId);
  }

  /**
   * Gets invitations with invitee details
   * 
   * @param userId - The ID of the user who created the invitations
   * @returns A promise resolving to an InvitationResult containing an array of InvitationWithInvitee objects
   */
  public async getUserInvitationsWithInvitees(userId: string): Promise<InvitationResult<InvitationWithInvitee[]>> {
    return this.repository.getUserInvitationsWithInvitees(userId);
  }

  /**
   * Gets invitations received by a user
   * 
   * @param userId - The ID of the user who received the invitations
   * @returns A promise resolving to an InvitationResult containing an array of InvitationWithCreator objects
   */
  public async getUserReceivedInvitations(userId: string): Promise<InvitationResult<InvitationWithCreator[]>> {
    return this.repository.getUserReceivedInvitations(userId);
  }

  /**
   * Gets an invitation by its code
   * 
   * @param code - The invitation code
   * @returns A promise resolving to an InvitationResult containing an Invitation object
   */
  public async getInvitationByCode(code: string): Promise<InvitationResult<Invitation>> {
    return this.repository.getInvitationByCode(code);
  }

  /**
   * Gets an invitation by its ID
   * 
   * @param id - The invitation ID
   * @returns A promise resolving to an InvitationResult containing an Invitation object
   */
  public async getInvitationById(id: string): Promise<InvitationResult<Invitation>> {
    return this.repository.getInvitationById(id);
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
      // Check if the user has reached their invitation limit
      const { data: hasReachedLimit, error: limitError } = 
        await this.hasUserReachedInvitationLimit(userId, request.tier_name);
      
      if (limitError) {
        return { data: null, error: limitError };
      }
      
      if (hasReachedLimit) {
        return { 
          data: { 
            success: false, 
            message: `You have reached your monthly limit for ${request.tier_name} invitations` 
          }, 
          error: null 
        };
      }
      
      // Get the tier details to check token cost
      const { data: tier, error: tierError } = await this.repository.getInvitationTierByName(request.tier_name);
      
      if (tierError || !tier) {
        return { 
          data: null, 
          error: new InvitationError(`Invalid tier name: ${request.tier_name}`, tierError) 
        };
      }
      
      // Check if the user has enough tokens
      if (tier.token_cost > 0) {
        const { data: tokenBalance, error: tokenError } = 
          await this.tokenService.getUserTokenBalance(userId, tier.token_type);
        
        if (tokenError) {
          return { 
            data: null, 
            error: new InvitationError('Failed to check token balance', tokenError) 
          };
        }
        
        if (!tokenBalance || tokenBalance < tier.token_cost) {
          return { 
            data: { 
              success: false, 
              message: `Insufficient ${tier.token_type} tokens. Required: ${tier.token_cost}, Available: ${tokenBalance || 0}` 
            }, 
            error: null 
          };
        }
        
        // Deduct tokens
        const { data: burnResult, error: burnError } = await this.tokenService.burnTokens(
          userId,
          tier.token_type,
          tier.token_cost,
          `Created ${tier.tier_name} invitation`
        );
        
        if (burnError || !burnResult?.success) {
          return { 
            data: null, 
            error: new InvitationError('Failed to deduct tokens', burnError) 
          };
        }
      }
      
      // Create the invitation
      const { data: invitation, error: invitationError } = 
        await this.repository.createInvitation(userId, request.tier_name, request.email);
      
      if (invitationError || !invitation) {
        return { 
          data: null, 
          error: invitationError 
        };
      }
      
      return { 
        data: { 
          success: true, 
          message: 'Invitation created successfully',
          invitation_id: invitation.id,
          invitation_code: invitation.code,
          expires_at: invitation.expires_at
        }, 
        error: null 
      };
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
      // Get the invitation by code
      const { data: invitation, error: invitationError } = 
        await this.repository.getInvitationByCode(request.invitation_code);
      
      if (invitationError) {
        return { data: null, error: invitationError };
      }
      
      if (!invitation) {
        return { 
          data: { success: false, message: 'Invalid invitation code' }, 
          error: null 
        };
      }
      
      // Check if the invitation is valid
      if (invitation.status !== InvitationStatus.PENDING) {
        return { 
          data: { success: false, message: `Invitation is ${invitation.status}` }, 
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
          .eq('id', invitation.id);
        
        return { 
          data: { success: false, message: 'Invitation has expired' }, 
          error: null 
        };
      }
      
      // Accept the invitation
      return this.repository.acceptInvitation(invitation.id, userId);
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
      // Validate invitation
      const { data: invitation, error: invitationError } = await this.repository.getInvitationById(request.invitation_id);
      
      if (invitationError) {
        return { data: null, error: invitationError };
      }
      
      if (!invitation) {
        return { 
          data: null, 
          error: new InvitationError('Invitation not found') 
        };
      }
      
      // Check if invitation is already claimed
      if (invitation.status === InvitationStatus.CLAIMED) {
        return { 
          data: null, 
          error: new InvitationError('Invitation reward has already been claimed') 
        };
      }
      
      // Check if invitation is accepted
      if (invitation.status !== InvitationStatus.ACCEPTED) {
        return { 
          data: null, 
          error: new InvitationError(`Invitation must be accepted before claiming reward. Current status: ${invitation.status}`) 
        };
      }
      
      // Check if the user is the invitee
      if (invitation.invitee_id !== userId) {
        return { 
          data: null, 
          error: new InvitationError('Only the invited user can claim this reward') 
        };
      }
      
      // Get the tier for this invitation
      const { data: tier, error: tierError } = await this.repository.getInvitationTierByName(invitation.tier_name);
      
      if (tierError) {
        return { data: null, error: tierError };
      }
      
      if (!tier) {
        return { 
          data: null, 
          error: new InvitationError(`Invitation tier "${invitation.tier_name}" not found`) 
        };
      }
      
      // Find the token ID for this token type
      const { data: tokenData, error: tokenError } = await this.tokenService.getTokenTypeByCode(tier.token_type);
      
      if (tokenError || !tokenData) {
        return { 
          data: null, 
          error: new InvitationError(`Failed to find token type: ${tier.token_type}`, tokenError) 
        };
      }
      
      // Get the first token of this type
      const { data: tokens, error: tokensError } = await this.tokenService.getTokensByType(tokenData.id);
      
      if (tokensError || !tokens || tokens.length === 0) {
        return { 
          data: null, 
          error: new InvitationError(`No tokens found for type: ${tier.token_type}`, tokensError) 
        };
      }
      
      // Mint tokens to the invitee
      const { data: claimResult, error: claimError } = await this.tokenService.mintTokens(
        userId,
        tokens[0].id,
        tier.reward_amount,
        `Invitation reward for tier ${tier.tier_name}`
      );
      
      if (claimError) {
        return { 
          data: null, 
          error: new InvitationError('Failed to mint tokens for invitation reward', claimError) 
        };
      }
      
      // Update invitation status to claimed
      const { data: updatedInvitation, error: updateError } = await this.repository.updateInvitationStatus(
        invitation.id,
        InvitationStatus.CLAIMED
      );
      
      if (updateError) {
        // If we failed to update the status but already minted tokens, we should log this
        // but still consider the claim successful since the user got their tokens
        console.error('Failed to update invitation status after successful token claim:', updateError);
      }
      
      // Return success response
      return { 
        data: { 
          success: true,
          message: `Successfully claimed ${tier.reward_amount} ${tier.token_type} tokens!`,
          invitation_id: invitation.id,
          token_type: tier.token_type,
          amount: tier.reward_amount,
          transaction_id: claimResult?.transaction_id || 'unknown'
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
   * Gets invitation dashboard data for a user
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to an InvitationResult containing InvitationDashboardData
   */
  public async getInvitationDashboard(userId: string): Promise<InvitationResult<InvitationDashboardData>> {
    try {
      // Get created invitations
      const { data: createdInvitations, error: createdError } = await this.repository.getUserInvitationsWithInvitees(userId);
      
      if (createdError) {
        return { data: null, error: createdError };
      }
      
      // Get received invitations
      const { data: receivedInvitations, error: receivedError } = await this.repository.getUserReceivedInvitations(userId);
      
      if (receivedError) {
        return { data: null, error: receivedError };
      }
      
      // Get all tiers
      const { data: tiers, error: tiersError } = await this.repository.getAllInvitationTiers();
      
      if (tiersError) {
        return { data: null, error: tiersError };
      }
      
      // Calculate statistics
      const invitationsCreated = createdInvitations ? createdInvitations.length : 0;
      const invitationsAccepted = createdInvitations ? createdInvitations.filter(inv => inv.status === InvitationStatus.ACCEPTED || inv.status === InvitationStatus.CLAIMED).length : 0;
      const invitationsClaimed = createdInvitations ? createdInvitations.filter(inv => inv.status === InvitationStatus.CLAIMED).length : 0;
      const invitationsPending = createdInvitations ? createdInvitations.filter(inv => inv.status === InvitationStatus.PENDING).length : 0;
      const invitationsExpired = createdInvitations ? createdInvitations.filter(inv => inv.status === InvitationStatus.EXPIRED).length : 0;
      
      // Calculate conversion rate
      const conversionRate = invitationsCreated > 0 ? (invitationsAccepted / invitationsCreated) * 100 : 0;
      
      // Calculate tier distribution
      const tierDistribution: Record<string, number> = {};
      
      if (createdInvitations && createdInvitations.length > 0) {
        createdInvitations.forEach(inv => {
          tierDistribution[inv.tier_name] = (tierDistribution[inv.tier_name] || 0) + 1;
        });
      }
      
      // Format the dashboard data
      return {
        data: {
          statistics: {
            invitations_created: invitationsCreated,
            invitations_accepted: invitationsAccepted,
            invitations_claimed: invitationsClaimed,
            invitations_pending: invitationsPending,
            invitations_expired: invitationsExpired,
            conversion_rate: conversionRate
          },
          tier_distribution: tierDistribution,
          created_invitations: createdInvitations || [],
          received_invitations: receivedInvitations || [],
          available_tiers: tiers || []
        },
        error: null
      };
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
      const { data: invitation, error } = await this.repository.getInvitationByCode(code);
      
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
    return this.repository.getUserInvitationCountForTier(userId, tierName);
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
      const { data: tier, error: tierError } = await this.repository.getInvitationTierByName(tierName);
      
      if (tierError || !tier) {
        return { 
          data: null, 
          error: new InvitationError(`Invalid tier name: ${tierName}`, tierError) 
        };
      }
      
      // Get the user's invitation count for this tier
      const { data: count, error: countError } = await this.repository.getUserInvitationCountForTier(userId, tierName);
      
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

  /**
   * Gets available invitation tiers for a user
   * 
   * @param userId - The ID of the user
   * @returns A promise resolving to an InvitationResult containing an array of InvitationTierAvailability objects
   */
  public async getAvailableInvitationTiers(userId: string): Promise<InvitationResult<InvitationTierAvailability[]>> {
    try {
      // Get all tiers
      const { data: tiers, error: tiersError } = await this.repository.getAllInvitationTiers();
      
      if (tiersError || !tiers) {
        return { data: null, error: tiersError };
      }
      
      const result: InvitationTierAvailability[] = [];
      
      // Check each tier's availability
      for (const tier of tiers) {
        // Check invitation limit
        const { data: count, error: countError } = 
          await this.repository.getUserInvitationCountForTier(userId, tier.tier_name);
        
        if (countError) {
          console.error(`Error checking count for tier ${tier.tier_name}:`, countError);
          continue;
        }
        
        // Check token balance if tier has a cost
        let userHasTokens = true;
        if (tier.token_cost > 0) {
          const { data: balance, error: balanceError } = 
            await this.tokenService.getUserTokenBalance(userId, tier.token_type);
          
          if (balanceError) {
            console.error(`Error checking balance for tier ${tier.tier_name}:`, balanceError);
            userHasTokens = false;
          } else {
            userHasTokens = balance !== null && balance >= tier.token_cost;
          }
        }
        
        result.push({
          ...tier,
          available: count !== null && count < tier.max_invites && userHasTokens,
          remaining_invites: count !== null ? Math.max(0, tier.max_invites - count) : 0,
          user_has_tokens: userHasTokens
        });
      }
      
      return { data: result, error: null };
    } catch (error) {
      console.error('Unexpected get available invitation tiers error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while getting available invitation tiers', error) 
      };
    }
  }

  /**
   * Validates an invitation code and returns detailed information
   * 
   * @param code - The invitation code to validate
   * @returns A promise resolving to an InvitationResult containing an InvitationValidationResult
   */
  public async validateInvitationCode(code: string): Promise<InvitationResult<InvitationValidationResult>> {
    try {
      if (!code || code.trim() === '') {
        return {
          data: {
            valid: false,
            message: 'Invitation code is required',
            error_code: 'EMPTY_CODE'
          },
          error: null
        };
      }

      const { data: invitation, error } = await this.repository.getInvitationByCode(code);
      
      if (error) {
        return {
          data: {
            valid: false,
            message: 'Error validating invitation code',
            error_code: 'VALIDATION_ERROR'
          },
          error
        };
      }
      
      if (!invitation) {
        return {
          data: {
            valid: false,
            message: 'Invalid invitation code',
            error_code: 'INVALID_CODE'
          },
          error: null
        };
      }
      
      // Check invitation status
      if (invitation.status !== InvitationStatus.PENDING) {
        return {
          data: {
            valid: false,
            message: `Invitation has already been ${invitation.status}`,
            status: invitation.status,
            error_code: 'ALREADY_USED'
          },
          error: null
        };
      }
      
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      
      if (expiresAt < now) {
        return {
          data: {
            valid: false,
            message: 'Invitation has expired',
            status: InvitationStatus.EXPIRED,
            expires_at: invitation.expires_at,
            error_code: 'EXPIRED'
          },
          error: null
        };
      }
      
      // Valid invitation
      return {
        data: {
          valid: true,
          message: 'Valid invitation code',
          status: invitation.status,
          expires_at: invitation.expires_at,
          invitation
        },
        error: null
      };
    } catch (error) {
      console.error('Unexpected validate invitation code error:', error);
      return { 
        data: null, 
        error: new InvitationError('An unexpected error occurred while validating invitation code', error) 
      };
    }
  }
}
