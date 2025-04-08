"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { claimsService } from '../src/claims';
import { metricsService } from '../src/metrics';
import { TokenSymbol } from '../types/supabase';

/**
 * Hook for managing daily token claims
 * Handles claim availability checking, claiming, and streak tracking
 */
export function useDailyClaims() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [todayToken, setTodayToken] = useState<{symbol: string; name: string} | null>(null);
  const [claimStreak, setClaimStreak] = useState<any>(null);
  const [recentClaims, setRecentClaims] = useState<any[]>([]);

  // Check if user can claim today's token
  const checkClaimAvailability = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await claimsService.canClaimToday(user.id);
      
      if (result.success && result.data) {
        setCanClaim(result.data.canClaim);
        setTodayToken({
          symbol: result.data.tokenSymbol,
          name: result.data.tokenName
        });
      }
      
      // Get streak information
      const streakResult = await claimsService.getClaimStreak(user.id);
      
      if (streakResult.success && streakResult.data) {
        setClaimStreak(streakResult.data);
      }
      
      // Get recent claims
      const recentResult = await claimsService.getRecentClaims(user.id);
      
      if (recentResult.success && recentResult.data) {
        setRecentClaims(recentResult.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check claim availability');
      console.error('Check claim availability error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Claim daily token
  const claimDailyToken = useCallback(async () => {
    if (!user || !canClaim) return { success: false, error: 'Cannot claim token now' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await claimsService.claimDailyReward(user.id);
      
      if (result.success) {
        // Record time spent (5 minutes for claiming)
        await metricsService.recordTimeSpent(user.id, 5, 'daily_claim');
        
        // Refresh claim data
        await checkClaimAvailability();
        
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Claim failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Claim failed';
      setError(errorMsg);
      console.error('Claim error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user, canClaim, checkClaimAvailability]);

  // Get day name for a token symbol
  const getDayForToken = useCallback((tokenSymbol: TokenSymbol): string => {
    switch (tokenSymbol) {
      case TokenSymbol.SPD: return 'Sunday';
      case TokenSymbol.SHE: return 'Monday';
      case TokenSymbol.PSP: return 'Tuesday';
      case TokenSymbol.SSA: return 'Wednesday';
      case TokenSymbol.BSP: return 'Thursday';
      case TokenSymbol.SGB: return 'Friday';
      case TokenSymbol.SMS: return 'Saturday';
      default: return '';
    }
  }, []);

  // Check claim availability on mount and when user changes
  useEffect(() => {
    if (user) {
      checkClaimAvailability();
    } else {
      setCanClaim(false);
      setTodayToken(null);
      setClaimStreak(null);
      setRecentClaims([]);
    }
  }, [user, checkClaimAvailability]);

  return {
    loading,
    error,
    canClaim,
    todayToken,
    claimStreak,
    recentClaims,
    claimDailyToken,
    refreshClaimData: checkClaimAvailability,
    getDayForToken
  };
}

export default useDailyClaims;
