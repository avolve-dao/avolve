import { useState, useEffect } from 'react';
import { onboardingService } from '../src/onboarding';
import { useToast } from '../components/ui/use-toast';

/**
 * Hook for managing user onboarding
 * Provides methods for starting and progressing through the onboarding process
 */
export const useOnboarding = () => {
  // For now, always use a fallback userId string (anonymous or a test value)
  const userId = 'anonymous';
  const { toast } = useToast();
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
    setLoading(true);
    try {
      const result = await onboardingService.startOnboarding(userId);
      if (result.success && result.data) {
        await loadOnboardingStatus();
        return { success: true, currentStep: result.data.currentStep };
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to start onboarding',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while starting onboarding',
        variant: 'destructive',
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Update onboarding step
  const updateOnboardingStep = async (step: number) => {
    setLoading(true);
    try {
      const result = await onboardingService.updateOnboardingStep(userId, step);
      if (result.success && result.data) {
        await loadOnboardingStatus();

        if (result.data.isCompleted) {
          toast({
            title: 'Success',
            description: 'Onboarding completed! 🎉',
            variant: 'default',
          });
        }

        return {
          success: true,
          currentStep: result.data.currentStep,
          isCompleted: result.data.isCompleted,
        };
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update onboarding step',
          variant: 'destructive',
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating onboarding',
        variant: 'destructive',
      });
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Load onboarding status
  const loadOnboardingStatus = async () => {
    setLoading(true);
    try {
      const result = await onboardingService.getOnboardingStatus(userId);
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
    loadOnboardingStatus();
  }, []);

  return {
    loading,
    onboardingStatus,
    onboardingContent,
    startOnboarding,
    updateOnboardingStep,
    loadOnboardingStatus,
    goToNextStep,
    goToPreviousStep,
  };
};

export default useOnboarding;
