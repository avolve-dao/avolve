import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useFeatures } from '@/hooks/useFeatures';

// Create context for features
interface FeaturesContextType {
  isFeatureUnlocked: (featureName: string) => boolean;
  getFeatureUnlockReason: (featureName: string) => string;
  isDayTokenUnlocked: (dayName: string) => boolean;
  refreshFeatures: () => Promise<void>;
  isLoading: boolean;
}

const FeaturesContext = createContext<FeaturesContextType>({
  isFeatureUnlocked: () => false,
  getFeatureUnlockReason: () => '',
  isDayTokenUnlocked: () => false,
  refreshFeatures: async () => {},
  isLoading: false
});

// Hook to use features context
export const useFeaturesContext = () => useContext(FeaturesContext);

// Features provider component
export const FeaturesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUser();
  const { 
    loading, 
    checkAllFeatures, 
    isFeatureUnlocked, 
    getFeatureUnlockReason, 
    isDayTokenUnlocked 
  } = useFeatures();

  // Load features when user changes
  useEffect(() => {
    if (user) {
      checkAllFeatures();
    }
  }, [user]);

  // Function to refresh features
  const refreshFeatures = async () => {
    if (user) {
      await checkAllFeatures();
    }
  };

  return (
    <FeaturesContext.Provider 
      value={{ 
        isFeatureUnlocked, 
        getFeatureUnlockReason, 
        isDayTokenUnlocked,
        refreshFeatures,
        isLoading: loading
      }}
    >
      {children}
    </FeaturesContext.Provider>
  );
};

export default FeaturesProvider;
