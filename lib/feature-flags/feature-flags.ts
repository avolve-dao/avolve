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

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { User } from '@supabase/supabase-js';
import { UseSupabaseResult } from '@/lib/supabase/types';

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
  name: FeatureFlagName;
  enabled: boolean;
  description: string;
  user_group_ids?: string[];
  percentage_rollout?: number;
  created_at: string;
  updated_at: string;
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
  Object.keys(FEATURE_FLAGS).forEach((flag) => {
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
export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ 
  children, 
  initialFlags 
}) => {
  const supabaseContext = useSupabase();
  const supabase = supabaseContext.supabase;
  const user = supabaseContext.session?.user || null;
  
  const [flags, setFlags] = useState<FeatureFlags>(initializeFeatureFlags(initialFlags));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if a feature is enabled
  const isEnabled = (flag: FeatureFlagName): boolean => {
    return flags[flag] === true;
  };
  
  // Set a feature flag value
  const setFlag = (flag: FeatureFlagName, value: boolean) => {
    setFlags((prevFlags) => {
      const newFlags = { ...prevFlags, [flag]: value };
      
      // Save to local storage in development mode
      if (process.env.NODE_ENV === 'development') {
        try {
          localStorage.setItem('avolve_feature_flags', JSON.stringify(newFlags));
        } catch (error) {
          console.error('Error saving feature flags to localStorage:', error);
        }
      }
      
      return newFlags;
    });
  };
  
  // Fetch remote feature flags from Supabase
  const fetchRemoteFlags = async (currentUser: User | null): Promise<Partial<FeatureFlags>> => {
    try {
      // Fetch global feature flags
      const { data: remoteFlags, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('is_active', true);
      
      if (flagsError) {
        throw flagsError;
      }
      
      // Process remote flags
      const processedFlags: Partial<FeatureFlags> = {};
      
      remoteFlags.forEach((flag: RemoteFeatureFlag) => {
        const flagName = flag.name;
        
        // Check if this flag should be enabled for this user
        let isEnabledForUser = flag.enabled;
        
        // Check percentage rollout if defined
        if (isEnabledForUser && flag.percentage_rollout !== undefined && flag.percentage_rollout < 100) {
          // Use user ID to determine if user is in the rollout percentage
          if (currentUser?.id) {
            // Generate a consistent hash from user ID + flag name
            const hash = hashString(`${currentUser.id}-${flagName}`);
            const normalizedHash = hash % 100; // 0-99
            
            isEnabledForUser = normalizedHash < flag.percentage_rollout;
          } else {
            // No user, so not in rollout
            isEnabledForUser = false;
          }
        }
        
        // Check user groups if defined
        if (isEnabledForUser && flag.user_group_ids && flag.user_group_ids.length > 0 && currentUser?.id) {
          // Fetch user groups
          // This would normally be cached or stored in user session
          // For this example, we'll make a separate query
          // In a real app, this would be optimized
          isEnabledForUser = false; // Default to false until we confirm user is in a group
          
          // This would be replaced with an actual check against user groups
          // For now, we'll assume all authenticated users are in the default group
          if (currentUser) {
            isEnabledForUser = true;
          }
        }
        
        processedFlags[flagName] = isEnabledForUser;
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
        const remoteFlags = await fetchRemoteFlags(user);
        Object.assign(newFlags, remoteFlags);
      } catch (remoteError) {
        console.error('Error fetching remote flags:', remoteError);
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
  
  // Fetch remote flags on mount and when user changes
  useEffect(() => {
    refreshFlags();
  }, [user?.id]);
  
  return (
    <FeatureFlagContext.Provider value={{ 
      flags, 
      isEnabled, 
      setFlag, 
      refreshFlags,
      isLoading,
      error
    }}>
      {children}
    </FeatureFlagContext.Provider>
  );
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

export const FeatureFlagged: React.FC<FeatureFlaggedProps> = ({ 
  flag, 
  children, 
  fallback = null 
}) => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
};

// Helper function to generate a hash from a string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
