'use client';

import { useCallback, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useUser } from './use-user';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export type ExperiencePhase = 'discover' | 'onboard' | 'scaffold' | 'endgame';
export type Pillar = 'superachiever' | 'superachievers' | 'supercivilization';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  pillar: Pillar;
  phase: ExperiencePhase;
  required_for_advancement: boolean;
  token_reward: number;
  token_type: string;
  order_index: number;
  progress?: number;
  completed_at?: string;
}

export interface PillarProgress {
  pillar: Pillar;
  current_phase: ExperiencePhase;
  phase_progress: number;
  completed_milestones: Milestone[];
  available_milestones: Milestone[];
  phase_transitions: {
    from_phase: ExperiencePhase;
    to_phase: ExperiencePhase;
    transitioned_at: string;
  }[];
}

export interface AvailableFeatures {
  superachiever: {
    personal_success_puzzle: boolean;
    business_success_puzzle: boolean;
    supermind_superpowers: boolean;
    advanced_personal: boolean;
    advanced_business: boolean;
    mentorship: boolean;
  };
  superachievers: {
    superpuzzles: boolean;
    teams: boolean;
    superhuman_enhancements: boolean;
    supersociety_advancements: boolean;
    supergenius_breakthroughs: boolean;
    community_leadership: boolean;
  };
  supercivilization: {
    governance_voting: boolean;
    token_staking: boolean;
    governance_proposals: boolean;
    network_state: boolean;
    governance_council: boolean;
  };
}

export interface PhaseTransition {
  pillar: Pillar;
  from_phase: ExperiencePhase;
  to_phase: ExperiencePhase;
  transitioned_at: string;
}

export const phaseOrder: ExperiencePhase[] = ['discover', 'onboard', 'scaffold', 'endgame'];

export const phaseNames = {
  discover: 'Discovery',
  onboard: 'Onboarding',
  scaffold: 'Scaffolding',
  endgame: 'Endgame',
};

export const pillarNames = {
  superachiever: 'Superachiever',
  superachievers: 'Superachievers',
  supercivilization: 'Supercivilization',
};

export const useExperiencePhases = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<PillarProgress[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<AvailableFeatures | null>(null);
  const [recentTransitions, setRecentTransitions] = useState<PhaseTransition[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    pillar: Pillar;
    phase: ExperiencePhase;
  } | null>(null);

  // Function to fetch user progress
  const fetchUserProgress = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_progress');

      if (error) {
        throw error;
      }

      setUserProgress(data || []);

      // Extract recent transitions (last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const transitions: PhaseTransition[] = [];
      data?.forEach((pillar: PillarProgress) => {
        pillar.phase_transitions?.forEach(transition => {
          const transitionDate = new Date(transition.transitioned_at);
          if (transitionDate > oneDayAgo) {
            transitions.push({
              pillar: pillar.pillar,
              from_phase: transition.from_phase,
              to_phase: transition.to_phase,
              transitioned_at: transition.transitioned_at,
            });
          }
        });
      });

      if (transitions.length > 0) {
        setRecentTransitions(transitions);

        // Show celebration for the most recent transition
        const mostRecent = transitions.sort(
          (a, b) => new Date(b.transitioned_at).getTime() - new Date(a.transitioned_at).getTime()
        )[0];

        setCelebrationData({
          pillar: mostRecent.pillar,
          phase: mostRecent.to_phase,
        });
        setShowCelebration(true);
      }

      // Fetch available features
      const { data: featuresData, error: featuresError } =
        await supabase.rpc('get_available_features');

      if (featuresError) {
        console.error('Error fetching available features:', featuresError);
      } else {
        setAvailableFeatures(featuresData);
      }
    } catch (err) {
      console.error('Error fetching user progress:', err);
      setError('Failed to load your progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  // Function to complete a milestone
  const completeMilestone = useCallback(
    async (milestoneId: string) => {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to track your progress',
          variant: 'destructive',
        });
        return false;
      }

      try {
        const { data, error } = await supabase.rpc('complete_milestone', {
          p_milestone_id: milestoneId,
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          toast({
            title: 'Milestone completed!',
            description: data.message,
            variant: 'default',
          });

          if (data.token_reward && data.token_type) {
            toast({
              title: 'Tokens earned!',
              description: `You earned ${data.token_reward} ${data.token_type} tokens`,
              variant: 'default',
            });
          }

          // Refresh user progress
          await fetchUserProgress();

          return true;
        } else {
          toast({
            title: 'Could not complete milestone',
            description: data.message,
            variant: 'destructive',
          });
          return false;
        }
      } catch (err) {
        console.error('Error completing milestone:', err);
        toast({
          title: 'Error',
          description: 'Failed to complete milestone. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
    },
    [user, supabase, toast, fetchUserProgress]
  );

  // Function to update milestone progress
  const updateMilestoneProgress = useCallback(
    async (milestoneId: string, progress: number) => {
      if (!user || progress < 0 || progress > 100) return false;

      try {
        const { data, error } = await supabase
          .from('user_milestone_progress')
          .upsert({
            user_id: user.id,
            milestone_id: milestoneId,
            progress,
            is_completed: progress >= 100,
            completed_at: progress >= 100 ? new Date().toISOString() : null,
          })
          .select();

        if (error) {
          throw error;
        }

        if (progress >= 100) {
          // If progress is 100%, call completeMilestone to handle rewards and phase advancement
          await completeMilestone(milestoneId);
        } else {
          // Otherwise just refresh the progress data
          await fetchUserProgress();
        }

        return true;
      } catch (err) {
        console.error('Error updating milestone progress:', err);
        return false;
      }
    },
    [user, supabase, completeMilestone, fetchUserProgress]
  );

  // Function to get current phase for a specific pillar
  const getCurrentPhase = useCallback(
    (pillar: Pillar): ExperiencePhase => {
      const pillarProgress = userProgress.find(p => p.pillar === pillar);
      return pillarProgress?.current_phase || 'discover';
    },
    [userProgress]
  );

  // Function to get phase progress for a specific pillar
  const getPhaseProgress = useCallback(
    (pillar: Pillar): number => {
      const pillarProgress = userProgress.find(p => p.pillar === pillar);
      return pillarProgress?.phase_progress || 0;
    },
    [userProgress]
  );

  // Function to get available milestones for a specific pillar
  const getAvailableMilestones = useCallback(
    (pillar: Pillar): Milestone[] => {
      const pillarProgress = userProgress.find(p => p.pillar === pillar);
      return pillarProgress?.available_milestones || [];
    },
    [userProgress]
  );

  // Function to get completed milestones for a specific pillar
  const getCompletedMilestones = useCallback(
    (pillar: Pillar): Milestone[] => {
      const pillarProgress = userProgress.find(p => p.pillar === pillar);
      return pillarProgress?.completed_milestones || [];
    },
    [userProgress]
  );

  // Function to check if a feature is available
  const isFeatureAvailable = useCallback(
    (feature: string, pillar: Pillar): boolean => {
      if (!availableFeatures) return false;

      switch (pillar) {
        case 'superachiever':
          return (
            availableFeatures.superachiever[
              feature as keyof typeof availableFeatures.superachiever
            ] || false
          );
        case 'superachievers':
          return (
            availableFeatures.superachievers[
              feature as keyof typeof availableFeatures.superachievers
            ] || false
          );
        case 'supercivilization':
          return (
            availableFeatures.supercivilization[
              feature as keyof typeof availableFeatures.supercivilization
            ] || false
          );
        default:
          return false;
      }
    },
    [availableFeatures]
  );

  // Function to get next recommended actions
  const getNextRecommendedActions = useCallback(
    (pillar: Pillar): Milestone[] => {
      const availableMilestones = getAvailableMilestones(pillar);

      // First, get required milestones sorted by order_index
      const requiredMilestones = availableMilestones
        .filter(m => m.required_for_advancement)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

      // If there are required milestones, prioritize them
      if (requiredMilestones.length > 0) {
        return requiredMilestones.slice(0, 3);
      }

      // Otherwise, return optional milestones
      return availableMilestones
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        .slice(0, 3);
    },
    [getAvailableMilestones]
  );

  // Function to dismiss celebration
  const dismissCelebration = useCallback(() => {
    setShowCelebration(false);
    setCelebrationData(null);
  }, []);

  // Subscribe to phase transitions
  useEffect(() => {
    if (!user || !supabase) return;

    const channel = supabase
      .channel('phase-transitions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_phase_transitions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // When a new phase transition occurs, refresh user progress
          fetchUserProgress();

          // Show celebration
          setCelebrationData({
            pillar: payload.new.pillar,
            phase: payload.new.to_phase,
          });
          setShowCelebration(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchUserProgress]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchUserProgress();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchUserProgress]);

  return {
    isLoading,
    error,
    userProgress,
    availableFeatures,
    recentTransitions,
    showCelebration,
    celebrationData,
    completeMilestone,
    updateMilestoneProgress,
    getCurrentPhase,
    getPhaseProgress,
    getAvailableMilestones,
    getCompletedMilestones,
    isFeatureAvailable,
    getNextRecommendedActions,
    dismissCelebration,
    refreshProgress: fetchUserProgress,
  };
};
