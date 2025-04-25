/**
 * Feature Types
 *
 * Type definitions for the feature system
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

export interface TokenRequirement {
  tokenId: string;
  amount: number;
}

export interface FeatureRequirements {
  tokens: TokenRequirement[];
  milestones: string[];
}

export interface Feature {
  name: string;
  description: string;
  phase: 'discovery' | 'onboarding' | 'scaffolding' | 'endgame';
  icon: string;
  requirements: FeatureRequirements;
}

export interface MissingToken {
  tokenId: string;
  current: number;
  required: number;
}

export interface FeatureWithStatus extends Omit<Feature, 'requirements'> {
  id: string;
  unlocked: boolean;
  tokenRequirements: TokenRequirement[];
  milestoneRequirements: string[];
  missingTokens: MissingToken[];
  missingMilestones: string[];
  unlockRecommendations: string[];
}
