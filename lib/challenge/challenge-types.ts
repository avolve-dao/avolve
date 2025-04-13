/**
 * @ai-anchor #CHALLENGE_SYSTEM
 * @ai-context This file defines types for the challenge system in the Avolve platform
 * @ai-related-to token-types.ts, challenge-service.ts, challenge-repository.ts
 * @ai-sacred-geometry tesla-369
 * 
 * Challenge Types
 * 
 * This file defines the types for the challenge system, including daily and weekly challenges,
 * challenge streaks, and challenge completion tracking.
 */

import { Token } from '../token/token-types';

/**
 * Challenge result type
 */
export type ChallengeResult<T> = {
  data: T | null;
  error: ChallengeError | null;
};

/**
 * Challenge error type
 */
export class ChallengeError extends Error {
  public details: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ChallengeError';
    this.details = details;
  }
}

/**
 * Base challenge interface
 */
export interface BaseChallenge {
  id: string;
  token_type: string;
  challenge_name: string;
  challenge_description: string;
  completion_criteria: Record<string, any>;
  reward_amount: number;
  streak_bonus_multiplier: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Daily challenge interface
 */
export interface DailyChallenge extends BaseChallenge {
  day_of_week: number;
}

/**
 * Weekly challenge interface
 */
export interface WeeklyChallenge extends BaseChallenge {
  start_date: string;
  end_date: string;
}

/**
 * Challenge streak interface
 */
export interface ChallengeStreak {
  id: string;
  user_id: string;
  token_type: string;
  current_daily_streak: number;
  longest_daily_streak: number;
  current_weekly_streak: number;
  longest_weekly_streak: number;
  last_daily_completion_date: string | null;
  last_weekly_completion_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * User challenge completion interface
 */
export interface UserChallengeCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  completion_date: string;
  bonus_claimed: boolean;
  created_at: string;
}

/**
 * User weekly challenge interface
 */
export interface UserWeeklyChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: Record<string, any>;
  is_completed: boolean;
  completed_at: string | null;
  reward_claimed: boolean;
  reward_claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Challenge completion status
 */
export enum ChallengeCompletionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REWARD_CLAIMED = 'reward_claimed'
}

/**
 * Challenge with completion status
 */
export interface ChallengeWithStatus extends BaseChallenge {
  completion_status: ChallengeCompletionStatus;
  progress?: Record<string, any>;
  streak_bonus?: number;
}

/**
 * Daily challenge with completion status
 */
export interface DailyChallengeWithStatus extends DailyChallenge {
  completion_status: ChallengeCompletionStatus;
  streak_bonus?: number;
}

/**
 * Weekly challenge with completion status
 */
export interface WeeklyChallengeWithStatus extends WeeklyChallenge {
  completion_status: ChallengeCompletionStatus;
  progress?: Record<string, any>;
  streak_bonus?: number;
}

/**
 * Challenge dashboard data
 */
export interface ChallengeDashboardData {
  daily_challenges: DailyChallengeWithStatus[];
  weekly_challenges: WeeklyChallengeWithStatus[];
  streaks: Record<string, ChallengeStreak>;
  today_token: string;
}
