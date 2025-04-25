import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database-extensions';

export type FeatureFlag = {
  key: string;
  description: string;
  enabled: boolean;
  tokenRequirements?: Record<string, number>;
};

export type FeatureFlags = Record<string, FeatureFlag>;

/**
 * Hook to access feature flags in the application
 *
 * @returns {Object} - Object containing feature flags and loading state
 */
export function useFeatureFlags() {
  const supabase = createClientComponentClient<Database>();
  const [features, setFeatures] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        setLoading(true);

        // Fetch features from the API
        const response = await fetch('/api/features');

        if (!response.ok) {
          // Try to parse error body for more details
          let errorMsg = `Failed to fetch features: ${response.statusText}`;
          try {
            const errData = await response.json();
            if (errData?.error || errData?.message) {
              errorMsg += ` | ${errData.error ?? ''} ${errData.message ?? ''}`;
            }
          } catch {}
          throw new Error(errorMsg);
        }

        const data = await response.json();

        // Defensive: ensure features is an object
        const featuresObj = typeof data.features === 'object' && data.features !== null ? data.features : {};

        // Ensure each feature has its key property set and normalize types
        const processedFeatures: FeatureFlags = {};
        Object.entries(featuresObj).forEach(([key, feature]: [string, any]) => {
          processedFeatures[key] = {
            key,
            description: feature.description ?? '',
            enabled: !!feature.enabled,
            tokenRequirements: feature.tokenRequirements ?? {},
          };
        });

        setFeatures(processedFeatures);
      } catch (err) {
        console.error('Error fetching feature flags:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();

    // Subscribe to feature flag changes via Realtime
    const channel = supabase
      .channel('feature_flags_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
        },
        () => {
          // Refetch features when they change
          fetchFeatures();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  /**
   * Check if a feature is enabled
   *
   * @param featureKey - The key of the feature to check
   * @returns {boolean} - Whether the feature is enabled
   */
  const isEnabled = (featureKey: string): boolean => {
    return features[featureKey]?.enabled || false;
  };

  return {
    features,
    loading,
    error,
    isEnabled,
  };
}
