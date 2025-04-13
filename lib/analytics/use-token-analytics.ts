import { useEffect } from 'react';
import { useAnalytics } from './analytics-provider';

/**
 * Custom hook to track token-related analytics events
 * 
 * This hook provides specialized tracking for token interactions
 * to help monitor user engagement with the token system
 */
export function useTokenAnalytics() {
  const { trackEvent, trackTiming } = useAnalytics();
  
  /**
   * Track token claim events
   * 
   * @param tokenId - The ID of the token being claimed
   * @param amount - The amount of tokens claimed
   * @param durationMs - How long the claim operation took
   * @param success - Whether the claim was successful
   */
  const trackTokenClaim = (
    tokenId: string,
    amount: number,
    durationMs: number,
    success: boolean
  ) => {
    trackEvent('token_claim', {
      token_id: tokenId,
      amount,
      success,
    });
    
    trackTiming('token_claim_duration', durationMs);
  };
  
  /**
   * Track token balance view events
   * 
   * @param tokenIds - Array of token IDs being viewed
   */
  const trackTokenBalanceView = (tokenIds: string[]) => {
    trackEvent('token_balance_view', {
      token_ids: tokenIds,
      token_count: tokenIds.length,
    });
  };
  
  /**
   * Track token transfer events
   * 
   * @param tokenId - The ID of the token being transferred
   * @param amount - The amount of tokens transferred
   * @param recipientType - The type of recipient (user, system, etc.)
   * @param durationMs - How long the transfer operation took
   * @param success - Whether the transfer was successful
   */
  const trackTokenTransfer = (
    tokenId: string,
    amount: number,
    recipientType: 'user' | 'system' | 'challenge' | 'other',
    durationMs: number,
    success: boolean
  ) => {
    trackEvent('token_transfer', {
      token_id: tokenId,
      amount,
      recipient_type: recipientType,
      success,
    });
    
    trackTiming('token_transfer_duration', durationMs);
  };
  
  /**
   * Track streak milestone events
   * 
   * @param streakCount - The current streak count
   * @param isNewMilestone - Whether this is a new milestone (3, 6, 9, etc.)
   * @param bonusMultiplier - The bonus multiplier applied
   */
  const trackStreakMilestone = (
    streakCount: number,
    isNewMilestone: boolean,
    bonusMultiplier: number
  ) => {
    trackEvent('streak_milestone', {
      streak_count: streakCount,
      is_new_milestone: isNewMilestone,
      bonus_multiplier: bonusMultiplier,
    });
  };
  
  /**
   * Track challenge completion events
   * 
   * @param challengeId - The ID of the completed challenge
   * @param tokensEarned - The amount of tokens earned
   * @param completionTimeMs - How long it took to complete the challenge
   */
  const trackChallengeCompletion = (
    challengeId: string,
    tokensEarned: number,
    completionTimeMs: number
  ) => {
    trackEvent('challenge_completion', {
      challenge_id: challengeId,
      tokens_earned: tokensEarned,
    });
    
    trackTiming('challenge_completion_time', completionTimeMs);
  };
  
  return {
    trackTokenClaim,
    trackTokenBalanceView,
    trackTokenTransfer,
    trackStreakMilestone,
    trackChallengeCompletion,
  };
}
