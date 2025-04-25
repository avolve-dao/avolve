/**
 * @ai-anchor #INVITATION_SYSTEM
 * @ai-context This file defines types for the invitation system in the Avolve platform
 * @ai-related-to token-types.ts, invitation-service.ts, invitation-repository.ts
 * @ai-sacred-geometry tesla-369
 *
 * Invitation Types
 *
 * This file defines the types for the invitation system, including invitation tiers,
 * invitation codes, and invitation status tracking.
 */

/**
 * Invitation result type
 */
export type InvitationResult<T> = {
  data: T | null;
  error: InvitationError | null;
};

/**
 * Invitation error type
 */
export class InvitationError extends Error {
  public details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'InvitationError';
    this.details = details;
  }
}

/**
 * Invitation status enum
 */
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  CLAIMED = 'claimed',
}

/**
 * Invitation interface
 */
export interface Invitation {
  id: string;
  code: string;
  created_by: string;
  email?: string;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  invitee_id?: string;
  reward_amount: number;
  reward_token_id?: string;
  reward_claimed: boolean;
  reward_claimed_at?: string;
  invitation_tier: string;
  tier_name: string;
  token_type: string;
}

/**
 * Invitation tier interface
 */
export interface InvitationTier {
  id: string;
  tier_name: string;
  token_cost: number;
  token_type: string;
  max_invites: number;
  validity_days: number;
  reward_multiplier: number;
  reward_amount: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Invitation tier availability interface
 */
export interface InvitationTierAvailability extends InvitationTier {
  available: boolean;
  remaining_invites: number;
  user_has_tokens: boolean;
}

/**
 * Invitation creation response
 */
export interface InvitationCreationResponse {
  success: boolean;
  message: string;
  invitation_id?: string;
  invitation_code?: string;
  expires_at?: string;
}

/**
 * Invitation acceptance response
 */
export interface InvitationAcceptanceResponse {
  success: boolean;
  message: string;
  invitation_id?: string;
  token_type?: string;
  amount?: number;
  transaction_id?: string;
  reward_amount?: number;
}

/**
 * Invitation with creator details
 */
export interface InvitationWithCreator extends Invitation {
  creator_username?: string;
  creator_avatar_url?: string;
}

/**
 * Invitation with invitee details
 */
export interface InvitationWithInvitee extends Invitation {
  invitee_username?: string;
  invitee_avatar_url?: string;
  tier_name: string;
}

/**
 * Statistics for invitation dashboard
 */
export interface InvitationStatistics {
  invitations_created: number;
  invitations_accepted: number;
  invitations_claimed: number;
  invitations_pending: number;
  invitations_expired: number;
  conversion_rate: number;
}

/**
 * Invitation dashboard data
 */
export interface InvitationDashboardData {
  statistics: InvitationStatistics;
  tier_distribution: Record<string, number>;
  created_invitations: InvitationWithInvitee[];
  received_invitations: InvitationWithCreator[];
  available_tiers: InvitationTier[];
}

/**
 * Invitation validation result
 */
export interface InvitationValidationResult {
  valid: boolean;
  message: string;
  status?: InvitationStatus;
  expires_at?: string;
  invitation?: Invitation;
  error_code?: string;
}

/**
 * Create invitation request
 */
export interface CreateInvitationRequest {
  tier_name: string;
  email?: string;
}

/**
 * Accept invitation request
 */
export interface AcceptInvitationRequest {
  invitation_code: string;
}

/**
 * Claim invitation reward request
 */
export interface ClaimInvitationRewardRequest {
  invitation_id: string;
}

/**
 * Repository interface for invitations
 */
export interface IInvitationRepository {
  getAllInvitationTiers(): Promise<InvitationResult<InvitationTier[]>>;
  getInvitationTierByName(tierName: string): Promise<InvitationResult<InvitationTier>>;
  getUserInvitationCountForTier(
    userId: string,
    tierName: string
  ): Promise<InvitationResult<number>>;
  createInvitation(
    userId: string,
    tierName: string,
    email?: string
  ): Promise<InvitationResult<Invitation>>;
  getInvitationByCode(code: string): Promise<InvitationResult<Invitation>>;
  getInvitationById(id: string): Promise<InvitationResult<Invitation>>;
  acceptInvitation(
    invitationId: string,
    userId: string
  ): Promise<InvitationResult<InvitationAcceptanceResponse>>;
  claimInvitationReward(
    invitationId: string,
    userId: string
  ): Promise<InvitationResult<InvitationAcceptanceResponse>>;
  getUserCreatedInvitations(userId: string): Promise<InvitationResult<Invitation[]>>;
  getUserInvitationsWithInvitees(
    userId: string
  ): Promise<InvitationResult<InvitationWithInvitee[]>>;
  getUserReceivedInvitations(userId: string): Promise<InvitationResult<InvitationWithCreator[]>>;
  updateInvitationStatus(
    invitationId: string,
    status: InvitationStatus
  ): Promise<InvitationResult<Invitation>>;
}
