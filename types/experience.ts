/**
 * Experience Phase Types
 *
 * Type definitions for the experience phases system
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

export type PhaseId = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame';

export interface ExperiencePhase {
  id: PhaseId;
  name: string;
  description: string;
  sequence: number;
  requirements: {
    milestones: string[];
    tokens: {
      tokenId: string;
      amount: number;
    }[];
  };
}

export interface UserProgress {
  user_id: string;
  current_phase: PhaseId;
  discovery_progress: number;
  onboarding_progress: number;
  scaffolding_progress: number;
  endgame_progress: number;
  overall_progress: number;
  last_milestone_completed_at: string | null;
}

export interface PhaseProgress {
  phaseId: PhaseId;
  phaseName: string;
  description: string;
  sequence: number;
  completed: boolean;
  progress: number;
  completedMilestones: string[];
  isCurrentPhase: boolean;
}

export interface PhaseTransition {
  from_phase: PhaseId;
  to_phase: PhaseId;
  transitioned_at: string;
}

export interface MilestoneCompletion {
  milestone_id: string;
  completed_at: string;
}
