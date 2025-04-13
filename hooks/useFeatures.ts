"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { FeaturesService, UserFeatureStatuses, FeatureStatus, DayTokenStatus, TokenClaimResult } from '@/src/features';

/**
 * Hook for managing feature unlocks
 * Provides methods for checking if features are unlocked based on user progress and metrics
 */
export function useFeatures() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [featureStatus, setFeatureStatus] = useState<UserFeatureStatuses | null>(null);
  
  // Initialize the features service
  const featuresService = new FeaturesService(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Load all feature statuses
  const checkAllFeatures = useCallback(async () => {
    if (!user) {
      setFeatureStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const statuses = await featuresService.getUserFeatureStatuses();
      setFeatureStatus(statuses);
    } catch (error) {
      console.error('Error checking features:', error);
    } finally {
      setLoading(false);
    }
  }, [user, featuresService]);

  // Load features on mount and when user changes
  useEffect(() => {
    checkAllFeatures();
  }, [user, checkAllFeatures]);

  // Check if a specific feature is unlocked
  const checkFeatureUnlock = useCallback(async (featureName: string): Promise<FeatureStatus> => {
    if (!user) {
      return {
        isUnlocked: false,
        unlockReason: 'You need to be logged in to access this feature'
      };
    }

    try {
      return await featuresService.checkFeatureUnlock(featureName);
    } catch (error) {
      console.error(`Error checking ${featureName} unlock:`, error);
      return {
        isUnlocked: false,
        unlockReason: `Error checking feature: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [user, featuresService]);

  // Check if a day token is unlocked
  const checkDayTokenUnlock = useCallback(async (dayName: string): Promise<DayTokenStatus> => {
    if (!user) {
      return {
        isUnlocked: false,
        unlockReason: 'You need to be logged in to claim tokens',
        tokenInfo: {
          symbol: '',
          name: '',
          description: '',
          day: dayName,
          dayOfWeek: -1,
          gradient: ''
        }
      };
    }

    try {
      return await featuresService.checkDayTokenUnlock(dayName);
    } catch (error) {
      console.error(`Error checking ${dayName} token unlock:`, error);
      return {
        isUnlocked: false,
        unlockReason: `Error checking day token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tokenInfo: {
          symbol: '',
          name: '',
          description: '',
          day: dayName,
          dayOfWeek: -1,
          gradient: ''
        }
      };
    }
  }, [user, featuresService]);

  // Claim a day token
  const claimDayToken = useCallback(async (tokenSymbol: string): Promise<TokenClaimResult> => {
    if (!user) {
      return {
        success: false,
        message: 'You need to be logged in to claim tokens'
      };
    }

    try {
      const result = await featuresService.claimDayToken(tokenSymbol);
      
      // Refresh feature statuses after claiming a token
      if (result.success) {
        checkAllFeatures();
      }
      
      return result;
    } catch (error) {
      console.error(`Error claiming ${tokenSymbol} token:`, error);
      return {
        success: false,
        message: `Error claiming token: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [user, featuresService, checkAllFeatures]);

  // Get day token info
  const getDayTokenInfo = useCallback((dayOfWeek: number) => {
    return featuresService.getDayTokenInfo(dayOfWeek);
  }, [featuresService]);

  // Helper functions for components
  const isFeatureUnlocked = useCallback((featureName: string): boolean => {
    if (!featureStatus || !featureStatus.features[featureName]) {
      return false;
    }
    return featureStatus.features[featureName].isUnlocked;
  }, [featureStatus]);

  const getFeatureUnlockReason = useCallback((featureName: string): string => {
    if (!featureStatus || !featureStatus.features[featureName]) {
      return 'Feature information not available';
    }
    return featureStatus.features[featureName].unlockReason;
  }, [featureStatus]);

  const isDayTokenUnlocked = useCallback((dayName: string): boolean => {
    if (!featureStatus || !featureStatus.dayTokens[dayName]) {
      return false;
    }
    return featureStatus.dayTokens[dayName].isUnlocked;
  }, [featureStatus]);

  return {
    loading,
    featureStatus,
    checkAllFeatures,
    checkFeatureUnlock,
    checkDayTokenUnlock,
    claimDayToken,
    getDayTokenInfo,
    isFeatureUnlocked,
    getFeatureUnlockReason,
    isDayTokenUnlocked
  };
}
