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
  REVOKED = 'revoked'
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
  description?: string;
  created_at: string;
  updated_at: string;
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
}

/**
 * Invitation dashboard data
 */
export interface InvitationDashboardData {
  available_tiers: InvitationTier[];
  user_invitations: InvitationWithInvitee[];
  pending_invitations: number;
  accepted_invitations: number;
  total_rewards_earned: number;
  unclaimed_rewards: number;
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
