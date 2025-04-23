/**
 * Journey Map Server Component
 * 
 * Displays user's progress through experience phases with a visual journey map
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { JourneyMapClient } from './client';

// Types
import type { Database } from '@/types/supabase';
import type { ExperiencePhase, UserProgress, PhaseId } from '@/types/experience';

export async function JourneyMapServer({ userId }: { userId: string }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch user's current phase and progress
  const { data: userProgress } = await supabase.rpc('get_user_progress', {
    p_user_id: userId
  });
  
  // Fetch all experience phases for reference
  const { data: phases } = await supabase
    .from('experience_phases')
    .select('*')
    .order('sequence');
  
  // Fetch user's completed milestones
  const { data: completedMilestones } = await supabase
    .from('user_phase_milestones')
    .select('milestone_id, completed_at')
    .eq('user_id', userId)
    .order('completed_at');
  
  // Fetch phase transitions for journey history
  const { data: phaseTransitions } = await supabase
    .from('user_phase_transitions')
    .select('from_phase, to_phase, transitioned_at')
    .eq('user_id', userId)
    .order('transitioned_at');
  
  // Calculate progress percentage for each phase with type guards/casts
  const phaseProgress = Array.isArray(phases)
    ? phases.map(phase => {
        // Defensive: check requirements structure
        const requirements = (phase.requirements && typeof phase.requirements === 'object' && !Array.isArray(phase.requirements))
          ? phase.requirements as { milestones?: unknown }
          : {};
        const milestones = Array.isArray(requirements.milestones)
          ? requirements.milestones.filter((m): m is string => typeof m === 'string')
          : [];
        const totalMilestones = milestones.length;
        const phaseId = phase.id as PhaseId;

        const phaseMilestones = Array.isArray(completedMilestones)
          ? completedMilestones.filter(
              m => typeof m.milestone_id === 'string' && m.milestone_id.startsWith(`${phase.id}_`)
            )
          : [];

        return {
          phaseId,
          phaseName: phase.name ?? '',
          description: phase.description ?? '',
          sequence: phase.sequence ?? 0,
          completed: phaseMilestones.length === totalMilestones && totalMilestones > 0,
          progress: totalMilestones > 0
            ? Math.round((phaseMilestones.length / totalMilestones) * 100)
            : 0,
          completedMilestones: phaseMilestones.map(m => m.milestone_id),
          isCurrentPhase:
            userProgress && typeof userProgress === 'object' && 'current_phase' in userProgress
              ? userProgress.current_phase === phaseId
              : false
        };
      })
    : [];

  // Defensive: ensure phaseTransitions are typed correctly
  const safePhaseTransitions = Array.isArray(phaseTransitions)
    ? phaseTransitions.map(t => ({
        from_phase: t.from_phase as PhaseId,
        to_phase: t.to_phase as PhaseId,
        transitioned_at: t.transitioned_at
      }))
    : [];

  // Defensive: get currentPhase from userProgress
  const currentPhase =
    userProgress && typeof userProgress === 'object' && 'current_phase' in userProgress
      ? (userProgress.current_phase as PhaseId)
      : 'discovery';

  // Calculate AI-based predictions for phase completion
  const predictedCompletionDates = await calculatePredictedCompletionDates(
    userId,
    phaseProgress,
    completedMilestones || []
  );

  return (
    <JourneyMapClient 
      phaseProgress={phaseProgress}
      currentPhase={currentPhase}
      phaseTransitions={safePhaseTransitions}
      predictedCompletionDates={predictedCompletionDates}
    />
  );
}

// AI-powered prediction function for phase completion dates
export async function calculatePredictedCompletionDates(
  userId: string,
  phaseProgress: any[],
  completedMilestones: any[]
) {
  // In a real implementation, this would call an ML model API
  // For now, we'll use a simple algorithm based on past completion rates
  
  const predictions: Record<string, string> = {};
  
  // Simple prediction logic - in real app would use ML model
  phaseProgress.forEach(phase => {
    if (!phase.completed && phase.progress > 0) {
      // Calculate average days between milestone completions
      const milestoneDates = completedMilestones
        .filter(m => m.milestone_id.startsWith(`${phase.phaseId}_`))
        .map(m => new Date(m.completed_at).getTime());
      
      if (milestoneDates.length > 1) {
        // Sort dates
        milestoneDates.sort((a, b) => a - b);
        
        // Calculate average time between completions
        let totalDays = 0;
        for (let i = 1; i < milestoneDates.length; i++) {
          const daysDiff = (milestoneDates[i] - milestoneDates[i-1]) / (1000 * 60 * 60 * 24);
          totalDays += daysDiff;
        }
        
        const avgDaysPerMilestone = totalDays / (milestoneDates.length - 1);
        
        // Estimate remaining time based on remaining milestones
        const remainingMilestones = 100 - phase.progress;
        const estimatedDays = (remainingMilestones / 100) * avgDaysPerMilestone * 10;
        
        // Calculate predicted completion date
        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + Math.round(estimatedDays));
        
        predictions[phase.phaseId] = completionDate.toISOString().split('T')[0];
      } else {
        // Not enough data for prediction
        predictions[phase.phaseId] = 'Insufficient data';
      }
    }
  });
  
  return predictions;
}
