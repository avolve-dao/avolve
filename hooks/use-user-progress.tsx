'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/supabase/provider';

export type ExperiencePhase = 'discover' | 'onboard' | 'scaffold' | 'endgame';
export type PillarType = 'superachiever' | 'superachievers' | 'supercivilization';

export interface UserPillarProgress {
  current_phase: ExperiencePhase;
  phase_progress: number; // 0-100%
  unlocked_features: string[];
  completed_milestones: string[];
}

export interface UserProgressData {
  superachiever: UserPillarProgress;
  superachievers: UserPillarProgress;
  supercivilization: UserPillarProgress;
}

export function useUserProgress() {
  const { supabase, session } = useSupabase();
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user progress data from Supabase
        const { data, error } = await supabase
          .from('user_pillar_progress')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) throw error;

        // Transform the data into our UserProgressData structure
        const progressData: UserProgressData = {
          superachiever: {
            current_phase: 'discover',
            phase_progress: 0,
            unlocked_features: [],
            completed_milestones: []
          },
          superachievers: {
            current_phase: 'discover',
            phase_progress: 0,
            unlocked_features: [],
            completed_milestones: []
          },
          supercivilization: {
            current_phase: 'discover',
            phase_progress: 0,
            unlocked_features: [],
            completed_milestones: []
          }
        };

        // Map database records to our structure
        if (data && data.length > 0) {
          data.forEach(record => {
            if (record.pillar && progressData[record.pillar as PillarType]) {
              progressData[record.pillar as PillarType] = {
                current_phase: record.current_phase || 'discover',
                phase_progress: record.phase_progress || 0,
                unlocked_features: record.unlocked_features || [],
                completed_milestones: record.completed_milestones || []
              };
            }
          });
        }

        setUserProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProgress();

    // Set up real-time subscription for progress updates
    const progressSubscription = supabase
      .channel('user_pillar_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_pillar_progress',
          filter: `user_id=eq.${session?.user?.id}`
        },
        () => {
          fetchUserProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressSubscription);
    };
  }, [supabase, session]);

  // Function to update user progress
  const updateProgress = async (
    pillar: PillarType,
    updates: Partial<UserPillarProgress>
  ) => {
    if (!session?.user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('user_pillar_progress')
        .update(updates)
        .eq('user_id', session.user.id)
        .eq('pillar', pillar)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      return null;
    }
  };

  // Function to advance to the next phase
  const advanceToNextPhase = async (pillar: PillarType) => {
    if (!userProgress || !session?.user?.id) return null;

    const currentPhase = userProgress[pillar].current_phase;
    const phaseOrder: ExperiencePhase[] = ['discover', 'onboard', 'scaffold', 'endgame'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      return await updateProgress(pillar, { 
        current_phase: nextPhase,
        phase_progress: 0
      });
    }
    
    return null;
  };

  return {
    userProgress,
    isLoading,
    error,
    updateProgress,
    advanceToNextPhase
  };
}
