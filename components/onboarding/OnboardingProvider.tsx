'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
}

const OnboardingContext = createContext<{
  state: OnboardingState;
  nextStep: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}>({
  state: {
    currentStep: 1,
    totalSteps: 5,
    isComplete: false,
  },
  nextStep: async () => {},
  completeOnboarding: async () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    totalSteps: 5,
    isComplete: false,
  });

  const { toast } = useToast();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadOnboardingState() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setState({
          currentStep: data.current_step,
          totalSteps: data.total_steps,
          isComplete: data.is_complete,
        });
      }
    }

    loadOnboardingState();
  }, [supabase]);

  const nextStep = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to continue',
        variant: 'destructive',
      });
      return;
    }

    if (state.currentStep >= state.totalSteps) {
      return;
    }

    const newStep = state.currentStep + 1;

    const { error } = await supabase.from('user_onboarding').upsert({
      user_id: user.id,
      current_step: newStep,
      total_steps: state.totalSteps,
      is_complete: newStep === state.totalSteps,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update onboarding progress',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({
      ...prev,
      currentStep: newStep,
      isComplete: newStep === state.totalSteps,
    }));
  };

  const completeOnboarding = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to continue',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('user_onboarding').upsert({
      user_id: user.id,
      current_step: state.totalSteps,
      total_steps: state.totalSteps,
      is_complete: true,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({
      ...prev,
      currentStep: state.totalSteps,
      isComplete: true,
    }));
  };

  return (
    <OnboardingContext.Provider value={{ state, nextStep, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
