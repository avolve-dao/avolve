import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useFeatureFlags, FeatureFlags } from '@/hooks/useFeatureFlags';
import { FeatureUnlockAnimation } from '@/components/feature-flags/FeatureUnlockAnimation';

type FeatureFlagContextType = {
  features: FeatureFlags;
  loading: boolean;
  error: Error | null;
  isEnabled: (featureKey: string) => boolean;
  showUnlockAnimation: (featureKey: string) => void;
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

type FeatureFlagProviderProps = {
  children: ReactNode;
};

/**
 * Provider component for feature flags
 * Makes feature flags available throughout the application
 */
export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const featureFlags = useFeatureFlags();
  const [unlockedFeature, setUnlockedFeature] = useState<string | null>(null);
  const [previousFeatures, setPreviousFeatures] = useState<Record<string, boolean>>({});

  // Track feature unlocks by comparing previous and current feature states
  useEffect(() => {
    if (!featureFlags.loading && Object.keys(featureFlags.features).length > 0) {
      const newUnlocks = Object.keys(featureFlags.features).filter(key => {
        // If the feature was previously not enabled but now is, it's a new unlock
        return !previousFeatures[key] && featureFlags.isEnabled(key);
      });

      // If there's a new unlock, show the animation for the first one
      if (newUnlocks.length > 0 && !unlockedFeature) {
        setUnlockedFeature(newUnlocks[0]);
      }

      // Update previous features state
      const currentFeatureState: Record<string, boolean> = {};
      Object.keys(featureFlags.features).forEach(key => {
        currentFeatureState[key] = featureFlags.isEnabled(key);
      });
      setPreviousFeatures(currentFeatureState);
    }
  }, [
    featureFlags.features,
    featureFlags.loading,
    featureFlags.isEnabled,
    previousFeatures,
    unlockedFeature,
  ]);

  // Function to manually trigger the unlock animation
  const showUnlockAnimation = (featureKey: string) => {
    if (featureFlags.isEnabled(featureKey)) {
      setUnlockedFeature(featureKey);
    }
  };

  // Handle closing the animation
  const handleCloseAnimation = () => {
    setUnlockedFeature(null);
  };

  return (
    <FeatureFlagContext.Provider
      value={{
        ...featureFlags,
        showUnlockAnimation,
      }}
    >
      {children}
      {unlockedFeature && (
        <FeatureUnlockAnimation
          feature={featureFlags.features[unlockedFeature] || { key: unlockedFeature }}
          isVisible={!!unlockedFeature}
          onClose={handleCloseAnimation}
        />
      )}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to use feature flags in components
 * @returns {FeatureFlagContextType} - Feature flag context
 * @throws {Error} - If used outside of FeatureFlagProvider
 */
export function useFeatureFlagContext(): FeatureFlagContextType {
  const context = useContext(FeatureFlagContext);

  if (context === undefined) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }

  return context;
}

/**
 * Higher-order component to conditionally render based on feature flags
 * @param WrappedComponent - Component to wrap
 * @param featureKey - Feature flag key to check
 * @param FallbackComponent - Optional component to render if feature is disabled
 */
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureKey: string,
  FallbackComponent?: React.ComponentType<P>
) {
  return function WithFeatureFlag(props: P) {
    const { isEnabled } = useFeatureFlagContext();

    if (isEnabled(featureKey)) {
      return <WrappedComponent {...props} />;
    }

    return FallbackComponent ? <FallbackComponent {...props} /> : null;
  };
}
