"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { onboardingService } from '../src/onboarding';
import { useToast } from './useToast';

/**
 * Hook for managing user onboarding
 * Provides methods for starting and progressing through the onboarding process
 */
export const useOnboarding = () => {
  const user = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<{
    step: number;
    startedAt: string;
    updatedAt: string;
    completedAt: string | null;
    isCompleted: boolean;
  } | null>(null);
  const [onboardingContent, setOnboardingContent] = useState<{
    title: string;
    description: string;
    instructions: string[];
    image?: string;
  } | null>(null);

  // Start or continue onboarding
  const startOnboarding = async () => {
    if (!user) {
      showToast('error', 'You must be logged in to start onboarding');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await onboardingService.startOnboarding(user.id);
      if (result.success && result.data) {
        await loadOnboardingStatus();
        return { success: true, currentStep: result.data.currentStep };
      } else {
        showToast('error', result.error || 'Failed to start onboarding');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      showToast('error', 'An error occurred while starting onboarding');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Update onboarding step
  const updateOnboardingStep = async (step: number) => {
    if (!user) {
      showToast('error', 'You must be logged in to update onboarding');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await onboardingService.updateOnboardingStep(user.id, step);
      if (result.success && result.data) {
        await loadOnboardingStatus();
        
        if (result.data.isCompleted) {
          showToast('success', 'Onboarding completed! 🎉');
        }
        
        return { 
          success: true, 
          currentStep: result.data.currentStep,
          isCompleted: result.data.isCompleted
        };
      } else {
        showToast('error', result.error || 'Failed to update onboarding step');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      showToast('error', 'An error occurred while updating onboarding');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Load onboarding status
  const loadOnboardingStatus = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await onboardingService.getOnboardingStatus(user.id);
      if (result.success && result.data) {
        setOnboardingStatus(result.data);
        
        // Load content for current step
        const content = onboardingService.getOnboardingContent(result.data.step);
        setOnboardingContent(content);
        
        return result.data;
      } else {
        console.error('Failed to load onboarding status:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Go to next step
  const goToNextStep = async () => {
    if (!onboardingStatus) return { success: false };
    
    const nextStep = onboardingStatus.step + 1;
    return await updateOnboardingStep(nextStep);
  };

  // Go to previous step
  const goToPreviousStep = async () => {
    if (!onboardingStatus || onboardingStatus.step <= 1) return { success: false };
    
    const prevStep = onboardingStatus.step - 1;
    return await updateOnboardingStep(prevStep);
  };

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      loadOnboardingStatus();
    } else {
      setOnboardingStatus(null);
      setOnboardingContent(null);
    }
  }, [user]);

  return {
    loading,
    onboardingStatus,
    onboardingContent,
    startOnboarding,
    updateOnboardingStep,
    loadOnboardingStatus,
    goToNextStep,
    goToPreviousStep
  };
};

export default useOnboarding;
