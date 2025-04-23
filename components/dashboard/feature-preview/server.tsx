/**
 * Feature Preview Server Component
 * 
 * Displays upcoming features based on user's progress through experience phases
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { FeaturePreviewClient } from './client';

// Types
import type { Database } from '@/types/supabase';
import type { Feature, TokenRequirement } from '@/types/features';

// Feature definitions with unlock requirements
import { featureDefinitions } from '@/lib/features/definitions';

export async function FeaturePreviewServer({ userId }: { userId: string }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch user's current phase and progress
  const { data: userProgress } = await supabase.rpc('get_user_progress', {
    p_user_id: userId
  });
  
  // Fetch user's token balances
  const { data: userTokens } = await supabase
    .from('user_tokens')
    .select('token_id, balance')
    .eq('user_id', userId);
  
  // Fetch user's completed milestones
  const { data: completedMilestones } = await supabase
    .from('user_phase_milestones')
    .select('milestone_id')
    .eq('user_id', userId);
  
  // Create a map of token balances for easier lookup
  const tokenBalances = (userTokens || []).reduce((acc, token) => {
    acc[token.token_id] = token.balance;
    return acc;
  }, {} as Record<string, number>);
  
  // Create a set of completed milestone IDs for easier lookup
  const completedMilestoneIds = new Set(
    (completedMilestones || []).map(m => m.milestone_id)
  );
  
  // Determine which features to show based on current phase
  // Defensive: handle both array (legacy) and object (current)
  const phaseData = Array.isArray(userProgress) ? userProgress[0] : userProgress;
  const currentPhase = typeof phaseData === 'object' && phaseData !== null && 'current_phase' in phaseData
    ? (phaseData as any).current_phase
    : 'discovery';
  const currentPhaseIndex = ['discovery', 'onboarding', 'scaffolding', 'endgame']
    .indexOf(currentPhase);
  
  // Get features for current and next phase
  const featuresToShow = Object.keys(featureDefinitions).filter(featureKey => {
    const feature = featureDefinitions[featureKey];
    const featurePhaseIndex = ['discovery', 'onboarding', 'scaffolding', 'endgame']
      .indexOf(feature.phase);
    
    // Show features from current phase and next phase
    return featurePhaseIndex === currentPhaseIndex || 
           featurePhaseIndex === currentPhaseIndex + 1;
  });
  
  // Check if each feature is unlocked
  const featuresWithStatus = featuresToShow.map(featureKey => {
    const feature = featureDefinitions[featureKey];
    
    // Check token requirements
    const tokenRequirementsMet = feature.requirements.tokens.every(req => {
      const userBalance = tokenBalances[req.tokenId] || 0;
      return userBalance >= req.amount;
    });
    
    // Check milestone requirements
    const milestoneRequirementsMet = feature.requirements.milestones.every(
      milestoneId => completedMilestoneIds.has(milestoneId)
    );
    
    // Calculate missing requirements
    const missingTokens = feature.requirements.tokens
      .filter(req => {
        const userBalance = tokenBalances[req.tokenId] || 0;
        return userBalance < req.amount;
      })
      .map(req => ({
        tokenId: req.tokenId,
        current: tokenBalances[req.tokenId] || 0,
        required: req.amount
      }));
    
    const missingMilestones = feature.requirements.milestones
      .filter(milestoneId => !completedMilestoneIds.has(milestoneId));
    
    // Generate personalized AI recommendations for unlocking
    const unlockRecommendations = generateUnlockRecommendations(
      feature,
      missingTokens,
      missingMilestones,
      currentPhase
    );
    
    return {
      id: featureKey,
      name: feature.name,
      description: feature.description,
      phase: feature.phase,
      icon: feature.icon,
      unlocked: tokenRequirementsMet && milestoneRequirementsMet,
      tokenRequirements: feature.requirements.tokens,
      milestoneRequirements: feature.requirements.milestones,
      missingTokens,
      missingMilestones,
      unlockRecommendations
    };
  });
  
  // Use AI to predict which features the user is likely to unlock next
  const predictedNextUnlocks = predictNextUnlocks(
    featuresWithStatus.filter(f => !f.unlocked),
    tokenBalances,
    completedMilestoneIds,
    userProgress
  );
  
  return (
    <FeaturePreviewClient 
      features={featuresWithStatus}
      predictedNextUnlocks={predictedNextUnlocks}
    />
  );
}

// AI-powered recommendation generator for feature unlocking
function generateUnlockRecommendations(
  feature: Feature,
  missingTokens: Array<{ tokenId: string; current: number; required: number }>,
  missingMilestones: string[],
  currentPhase: string
): string[] {
  const recommendations: string[] = [];
  
  // In a real implementation, this would call an ML model API
  // For now, we'll use rule-based recommendations
  
  if (missingTokens.length > 0) {
    missingTokens.forEach(token => {
      const needed = token.required - token.current;
      
      // Generate token-specific recommendations
      switch (token.tokenId) {
        case 'GEN':
          recommendations.push(`Earn ${needed} more GEN tokens by completing daily challenges`);
          break;
        case 'SAP':
          recommendations.push(`Earn ${needed} more SAP tokens by completing Superachiever modules`);
          break;
        case 'PSP':
          recommendations.push(`Earn ${needed} more PSP tokens by setting and achieving personal goals`);
          break;
        default:
          recommendations.push(`Earn ${needed} more ${token.tokenId} tokens to unlock this feature`);
      }
    });
  }
  
  if (missingMilestones.length > 0) {
    missingMilestones.forEach(milestone => {
      // Extract phase and milestone number from ID (e.g., "discovery_3")
      const [phase, number] = milestone.split('_');
      
      recommendations.push(`Complete milestone #${number} in the ${phase} phase`);
    });
  }
  
  // Add phase-specific recommendations
  if (feature.phase !== currentPhase) {
    recommendations.push(`Progress to the ${feature.phase} phase to unlock this feature`);
  }
  
  return recommendations;
}

// AI-powered prediction of next features to be unlocked
function predictNextUnlocks(
  lockedFeatures: any[],
  tokenBalances: Record<string, number>,
  completedMilestoneIds: Set<string>,
  userProgress: any
): string[] {
  // Calculate "unlock proximity" for each feature
  const featuresWithProximity = lockedFeatures.map(feature => {
    // Calculate token proximity (percentage of tokens already acquired)
    const tokenProximity = feature.tokenRequirements.reduce((acc: number, req: TokenRequirement) => {
      const userBalance = tokenBalances[req.tokenId] || 0;
      const percentComplete = Math.min(userBalance / req.amount, 1);
      return acc + percentComplete;
    }, 0) / Math.max(feature.tokenRequirements.length, 1);
    
    // Calculate milestone proximity
    const milestoneProximity = feature.milestoneRequirements.reduce((acc: number, milestoneId: string) => {
      return acc + (completedMilestoneIds.has(milestoneId) ? 1 : 0);
    }, 0) / Math.max(feature.milestoneRequirements.length, 1);
    
    // Phase proximity (1 if same phase, 0.5 if next phase, 0 otherwise)
    const currentPhaseIndex = ['discovery', 'onboarding', 'scaffolding', 'endgame']
      .indexOf(userProgress?.current_phase || 'discovery');
    const featurePhaseIndex = ['discovery', 'onboarding', 'scaffolding', 'endgame']
      .indexOf(feature.phase);
    
    let phaseProximity = 0;
    if (featurePhaseIndex === currentPhaseIndex) {
      phaseProximity = 1;
    } else if (featurePhaseIndex === currentPhaseIndex + 1) {
      phaseProximity = 0.5;
    }
    
    // Calculate overall proximity (weighted average)
    const overallProximity = 
      (tokenProximity * 0.4) + 
      (milestoneProximity * 0.4) + 
      (phaseProximity * 0.2);
    
    return {
      id: feature.id,
      proximity: overallProximity
    };
  });
  
  // Sort by proximity and return top 3 feature IDs
  return featuresWithProximity
    .sort((a, b) => b.proximity - a.proximity)
    .slice(0, 3)
    .map(f => f.id);
}
