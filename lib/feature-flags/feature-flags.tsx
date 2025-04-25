'use client';

/**
 * Feature Flag System
 *
 * This module provides a comprehensive feature flag system for the Avolve platform.
 * It allows toggling experimental features without redeploying the application.
 *
 * Features can be controlled via:
 * 1. Environment variables
 * 2. Remote configuration (Supabase)
 * 3. Local storage overrides (for development)
 * 4. User-specific flags (based on user roles or IDs)
 */

import { createContext, useContext, useState, useEffect, ReactNode, Fragment } from 'react';
import { createClient } from '@/lib/supabase/client';

// Define feature flag names as constants to avoid typos
export const FEATURE_FLAGS = {
  NEW_CHALLENGE_TYPES: 'NEW_CHALLENGE_TYPES',
  ENHANCED_STREAK_VISUALIZATION: 'ENHANCED_STREAK_VISUALIZATION',
  TEAM_CHALLENGES: 'TEAM_CHALLENGES',
  ACHIEVEMENT_BADGES: 'ACHIEVEMENT_BADGES',
  TOKEN_MARKETPLACE: 'TOKEN_MARKETPLACE',
  ADVANCED_ANALYTICS: 'ADVANCED_ANALYTICS',
  DARK_MODE: 'DARK_MODE',
} as const;

// Type for feature flag names
export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

// Type for feature flag values
export type FeatureFlags = {
  [key in FeatureFlagName]: boolean;
};

// Type for remote feature flag configuration
export interface RemoteFeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  user_group_ids?: string[];
  percentage_rollout?: number;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

// Default feature flag values
const DEFAULT_FLAGS: FeatureFlags = {
  NEW_CHALLENGE_TYPES: false,
  ENHANCED_STREAK_VISUALIZATION: false,
  TEAM_CHALLENGES: false,
  ACHIEVEMENT_BADGES: false,
  TOKEN_MARKETPLACE: false,
  ADVANCED_ANALYTICS: false,
  DARK_MODE: true,
};

// Get environment variable feature flags
const getEnvFlags = (): Partial<FeatureFlags> => {
  const flags: Partial<FeatureFlags> = {};

  // Process environment variables
  Object.keys(FEATURE_FLAGS).forEach(flag => {
    const flagKey = flag as FeatureFlagName;
    const envVarName = `NEXT_PUBLIC_FEATURE_${flag}`;
    const envValue = process.env[envVarName];

    if (envValue !== undefined) {
      flags[flagKey] = envValue === 'true';
    }
  });

  return flags;
};

// Get local storage overrides (for development)
const getLocalStorageFlags = (): Partial<FeatureFlags> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const storedFlags = localStorage.getItem('avolve_feature_flags');
    return storedFlags ? JSON.parse(storedFlags) : {};
  } catch (error) {
    console.error('Error reading feature flags from localStorage:', error);
    return {};
  }
};

// Initialize feature flags
export const initializeFeatureFlags = (userOverrides?: Partial<FeatureFlags>): FeatureFlags => {
  // Start with default flags
  const flags = { ...DEFAULT_FLAGS };

  // Apply environment variable flags
  const envFlags = getEnvFlags();
  Object.assign(flags, envFlags);

  // Apply local storage overrides (for development)
  if (process.env.NODE_ENV === 'development') {
    const localFlags = getLocalStorageFlags();
    Object.assign(flags, localFlags);
  }

  // Apply user-specific overrides
  if (userOverrides) {
    Object.assign(flags, userOverrides);
  }

  return flags;
};

// Feature flag context
interface FeatureFlagContextType {
  flags: FeatureFlags;
  isEnabled: (flag: FeatureFlagName) => boolean;
  setFlag: (flag: FeatureFlagName, value: boolean) => void;
  refreshFlags: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: DEFAULT_FLAGS,
  isEnabled: () => false,
  setFlag: () => {},
  refreshFlags: async () => {},
  isLoading: false,
  error: null,
});

// Feature flag provider props
interface FeatureFlagProviderProps {
  children: ReactNode;
  initialFlags?: Partial<FeatureFlags>;
}

// Feature flag provider component
export const FeatureFlagProvider = ({ children, initialFlags }: FeatureFlagProviderProps) => {
  const supabase = createClient();
  const [flags, setFlags] = useState<FeatureFlags>(initializeFeatureFlags(initialFlags));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if a feature is enabled
  const isEnabled = (flag: FeatureFlagName): boolean => {
    return flags[flag] === true;
  };

  // Set a feature flag value
  const setFlag = (flag: FeatureFlagName, value: boolean): void => {
    const newFlags = { ...flags, [flag]: value };
    setFlags(newFlags);

    // Save to local storage in development
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      try {
        const localFlags = getLocalStorageFlags();
        const updatedLocalFlags = { ...localFlags, [flag]: value };
        localStorage.setItem('avolve_feature_flags', JSON.stringify(updatedLocalFlags));
      } catch (error) {
        console.error('Error saving feature flag to localStorage:', error);
      }
    }
  };

  // Fetch remote feature flags from Supabase
  const fetchRemoteFlags = async (): Promise<Partial<FeatureFlags>> => {
    try {
      // Fetch all feature flags from Supabase
      const { data, error } = await supabase.from('feature_flags').select('*');

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {};
      }

      // Process flags
      const processedFlags: Partial<FeatureFlags> = {};

      data.forEach((flag: any) => {
        // Only process flags that match our known feature flag names
        const flagName = flag.name as string;
        if (!(flagName in FEATURE_FLAGS)) {
          return;
        }

        const typedFlagName = flagName as FeatureFlagName;
        let isEnabledForUser = flag.enabled;

        // Apply percentage rollout if defined
        if (isEnabledForUser && flag.percentage_rollout !== undefined) {
          // Generate a consistent hash from user ID + flag name
          const hash = hashString(`${flagName}`);
          const normalizedHash = hash % 100; // 0-99

          isEnabledForUser = normalizedHash < (flag.percentage_rollout as number);
        }

        processedFlags[typedFlagName] = isEnabledForUser;
      });

      return processedFlags;
    } catch (error) {
      console.error('Error fetching remote feature flags:', error);
      throw new Error('Failed to fetch remote feature flags');
    }
  };

  // Refresh all flags from remote and local sources
  const refreshFlags = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Start with default flags
      const newFlags = { ...DEFAULT_FLAGS };

      // Apply environment variable flags
      const envFlags = getEnvFlags();
      Object.assign(newFlags, envFlags);

      // Apply remote flags if available
      try {
        const remoteFlags = await fetchRemoteFlags();
        Object.assign(newFlags, remoteFlags);
      } catch (remoteError) {
        console.error('Error fetching remote flags:', remoteError);
        setError(
          remoteError instanceof Error
            ? remoteError
            : new Error('Failed to fetch remote feature flags')
        );
        // Continue with other flag sources
      }

      // Apply local storage overrides (for development)
      if (process.env.NODE_ENV === 'development') {
        const localFlags = getLocalStorageFlags();
        Object.assign(newFlags, localFlags);
      }

      // Apply initial flags passed to provider
      if (initialFlags) {
        Object.assign(newFlags, initialFlags);
      }

      setFlags(newFlags);
    } catch (error) {
      console.error('Error refreshing feature flags:', error);
      setError(error instanceof Error ? error : new Error('Unknown error refreshing flags'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch remote flags on mount
  useEffect(() => {
    refreshFlags();
  }, []);

  const contextValue: FeatureFlagContextType = {
    flags,
    isEnabled,
    setFlag,
    refreshFlags,
    isLoading,
    error,
  };

  return <FeatureFlagContext.Provider value={contextValue}>{children}</FeatureFlagContext.Provider>;
};

// Hook to use feature flags
export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);

  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }

  return context;
};

// Helper function to conditionally render components based on feature flags
interface FeatureFlaggedProps {
  flag: FeatureFlagName;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureFlagged = ({ flag, children, fallback = null }: FeatureFlaggedProps) => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag) ? <Fragment>{children}</Fragment> : <Fragment>{fallback}</Fragment>;
};

// Helper function to generate a hash from a string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
