import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { subscriptionService } from '../src/subscriptions';
import { metricsService } from '../src/metrics';
import { TokenSymbol } from '../types/supabase';

/**
 * Hook for managing user subscriptions and token interactions
 * Handles subscription creation, token spending, and metrics tracking
 */
export function useSubscription() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [treasuryAllocations, setTreasuryAllocations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // Load user's subscription data
  const loadSubscription = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.getUserSubscription(user.id);
      
      if (result.success && result.data) {
        setSubscription(result.data);
      } else {
        setSubscription(null);
      }
      
      // Also update metrics when checking subscription
      await metricsService.updateMetrics(user.id);
      const metricsResult = await metricsService.getMetricsSummary();
      
      if (metricsResult.success) {
        setMetrics(metricsResult.data);
      }
      
      // Load treasury allocations
      const allocationsResult = await subscriptionService.getTreasuryAllocations();
      
      if (allocationsResult.success) {
        setTreasuryAllocations(allocationsResult.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
      console.error('Load subscription error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe the user
  const subscribe = useCallback(async (
    amountUsd: number = 100,
    paymentMethod?: Record<string, any>
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.subscribe(
        user.id,
        amountUsd,
        paymentMethod
      );
      
      if (result.success) {
        await loadSubscription(); // Refresh subscription data
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Subscription failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Subscription failed';
      setError(errorMsg);
      console.error('Subscribe error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user, loadSubscription]);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.cancelSubscription(user.id);
      
      if (result.success) {
        await loadSubscription(); // Refresh subscription data
        return { success: true };
      } else {
        setError(result.error || 'Cancellation failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Cancellation failed';
      setError(errorMsg);
      console.error('Cancel subscription error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user, loadSubscription]);

  // Spend GEN for internal tokens
  const spendForInternalTokens = useCallback(async (
    amountUsd: number,
    tokenSymbol: TokenSymbol,
    description?: string
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await subscriptionService.spendForInternalTokens(
        user.id,
        amountUsd,
        tokenSymbol,
        description
      );
      
      if (result.success) {
        // Record interaction metric
        await metricsService.recordInteraction(
          user.id,
          tokenSymbol,
          'token_purchase'
        );
        
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Token purchase failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Token purchase failed';
      setError(errorMsg);
      console.error('Token purchase error:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Record user activity time
  const recordTimeSpent = useCallback(async (
    minutes: number,
    activityType?: string
  ) => {
    if (!user) return;
    
    try {
      await metricsService.recordTimeSpent(user.id, minutes, activityType);
    } catch (err) {
      console.error('Record time spent error:', err);
    }
  }, [user]);

  // Submit NPS score
  const submitNPS = useCallback(async (
    score: number,
    feedback?: string
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      const result = await metricsService.recordNPS(user.id, score, feedback);
      return result;
    } catch (err) {
      console.error('Submit NPS error:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to submit NPS' 
      };
    }
  }, [user]);

  // Load subscription data on mount and when user changes
  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setTreasuryAllocations([]);
      setMetrics(null);
    }
  }, [user, loadSubscription]);

  return {
    loading,
    error,
    subscription,
    treasuryAllocations,
    metrics,
    subscribe,
    cancelSubscription,
    spendForInternalTokens,
    recordTimeSpent,
    submitNPS,
    refreshData: loadSubscription
  };
}

export default useSubscription;
