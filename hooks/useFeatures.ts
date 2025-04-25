import { useState, useEffect, useCallback } from 'react';
import { FeaturesService } from '@/src/features';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// For now, always use a fallback userId string (anonymous or a test value)
const userId = 'anonymous';

/**
 * Hook for managing feature unlocks
 * Provides methods for checking if features are unlocked based on user progress and metrics
 */
export function useFeatures() {
  const [loading, setLoading] = useState(true);
  const [featureStatus, setFeatureStatus] = useState<any | null>(null);

  // Initialize the features service
  const featuresService = new FeaturesService();

  // Load all feature statuses
  const checkAllFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const statuses = await featuresService.getUserFeatureStatuses();
      setFeatureStatus(statuses);
    } catch (error) {
      console.error('Error checking features:', error);
    } finally {
      setLoading(false);
    }
  }, [featuresService]);

  // Load features on mount and when user changes
  useEffect(() => {
    checkAllFeatures();
  }, [checkAllFeatures]);

  // Check if a specific feature is unlocked
  const checkFeatureUnlock = useCallback(
    async (featureName: string): Promise<any> => {
      try {
        return await featuresService.checkFeatureUnlock(featureName);
      } catch (error) {
        console.error(`Error checking ${featureName} unlock:`, error);
        return {
          isUnlocked: false,
          unlockReason: `Error checking feature: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
    [featuresService]
  );

  // Check if a day token is unlocked
  const checkDayTokenUnlock = useCallback(
    async (dayName: string): Promise<any> => {
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
            gradient: '',
          },
        };
      }
    },
    [featuresService]
  );

  // Claim a day token
  const claimDayToken = useCallback(
    async (tokenSymbol: string): Promise<any> => {
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
          message: `Error claiming token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
    [featuresService, checkAllFeatures]
  );

  // Get day token info
  const getDayTokenInfo = useCallback(
    (dayOfWeek: number) => {
      return featuresService.getDayTokenInfo(dayOfWeek);
    },
    [featuresService]
  );

  // Helper functions for components
  const isFeatureUnlocked = useCallback(
    (featureName: string): boolean => {
      if (!featureStatus || !featureStatus.features[featureName]) {
        return false;
      }
      return featureStatus.features[featureName].isUnlocked;
    },
    [featureStatus]
  );

  const getFeatureUnlockReason = useCallback(
    (featureName: string): string => {
      if (!featureStatus || !featureStatus.features[featureName]) {
        return 'Feature information not available';
      }
      return featureStatus.features[featureName].unlockReason;
    },
    [featureStatus]
  );

  const isDayTokenUnlocked = useCallback(
    (dayName: string): boolean => {
      if (!featureStatus || !featureStatus.dayTokens[dayName]) {
        return false;
      }
      return featureStatus.dayTokens[dayName].isUnlocked;
    },
    [featureStatus]
  );

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
    isDayTokenUnlocked,
  };
}
