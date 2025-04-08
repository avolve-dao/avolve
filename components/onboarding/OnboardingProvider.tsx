"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingModal from './OnboardingModal';

// Create context for onboarding
interface OnboardingContextType {
  showOnboarding: () => void;
  isOnboardingComplete: boolean;
}

const OnboardingContext = createContext<OnboardingContextType>({
  showOnboarding: () => {},
  isOnboardingComplete: false
});

// Hook to use onboarding context
export const useOnboardingContext = () => useContext(OnboardingContext);

// Onboarding provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUser();
  const { onboardingStatus, loadOnboardingStatus } = useOnboarding();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load onboarding status when user changes
  useEffect(() => {
    if (user) {
      loadOnboardingStatus().then(status => {
        if (status) {
          setIsOnboardingComplete(!!status.completedAt);
          
          // Show onboarding modal automatically for new users
          if (status.step === 0 && !isInitialized) {
            setIsModalOpen(true);
          }
        }
        setIsInitialized(true);
      });
    } else {
      setIsOnboardingComplete(false);
      setIsInitialized(true);
    }
  }, [user]);

  // Update onboarding complete status when onboardingStatus changes
  useEffect(() => {
    if (onboardingStatus) {
      setIsOnboardingComplete(!!onboardingStatus.completedAt);
    }
  }, [onboardingStatus]);

  // Function to show onboarding modal
  const showOnboarding = () => {
    setIsModalOpen(true);
  };

  return (
    <OnboardingContext.Provider value={{ showOnboarding, isOnboardingComplete }}>
      {children}
      <OnboardingModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
