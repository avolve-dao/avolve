/**
 * Focus Mode Server Component
 *
 * Provides personalized recommendations and focus areas based on user progress
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { FocusModeClient } from './client';

// Types
import type { Database } from '@/types/supabase';
import type { FocusArea } from './client';
import type { MilestoneCompletion } from '@/types/experience';

// Analytics for personalized recommendations
import { getPersonalizedRecommendations } from '@/lib/analytics/server';

export async function FocusModeServer({ userId }: { userId: string }) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch user's current phase and progress
  const { data: userProgress } = await supabase.rpc('get_user_progress', {
    p_user_id: userId,
  });

  // Defensive: handle both array (legacy) and object (current)
  const phaseData = Array.isArray(userProgress) ? userProgress[0] : userProgress;
  const currentPhase =
    typeof phaseData === 'object' && phaseData !== null && 'current_phase' in phaseData
      ? (phaseData as any).current_phase
      : 'discovery';
  const discoveryProgress =
    typeof phaseData === 'object' && phaseData !== null && 'discovery_progress' in phaseData
      ? (phaseData as any).discovery_progress
      : undefined;
  const onboardingProgress =
    typeof phaseData === 'object' && phaseData !== null && 'onboarding_progress' in phaseData
      ? (phaseData as any).onboarding_progress
      : undefined;
  const scaffoldingProgress =
    typeof phaseData === 'object' && phaseData !== null && 'scaffolding_progress' in phaseData
      ? (phaseData as any).scaffolding_progress
      : undefined;
  const endgameProgress =
    typeof phaseData === 'object' && phaseData !== null && 'endgame_progress' in phaseData
      ? (phaseData as any).endgame_progress
      : undefined;
  const overallProgress =
    typeof phaseData === 'object' && phaseData !== null && 'overall_progress' in phaseData
      ? (phaseData as any).overall_progress
      : undefined;

  // Fetch user's recent activities
  const { data: recentActivities } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(10);

  // Fetch user profile data for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single();

  // Get AI-powered personalized recommendations
  const recommendations = await getPersonalizedRecommendations(userId);

  // Determine focus areas based on user progress and behavior
  const focusAreas = determineFocusAreas(
    phaseData,
    recentActivities || [],
    {} // No goals/preferences available in schema
  );

  // Get next milestones to complete
  const { data: nextMilestonesRaw } = await supabase.rpc('get_next_milestones', {
    user_id_param: userId,
    limit_param: 3,
  });
  // Defensive: only keep items that match MilestoneCompletion shape
  const nextMilestones = Array.isArray(nextMilestonesRaw)
    ? (nextMilestonesRaw.filter(
        m => m && typeof m === 'object' && 'milestone_id' in m && 'completed_at' in m
      ) as unknown as MilestoneCompletion[])
    : [];

  return (
    <FocusModeClient
      userName={profile?.full_name || 'User'}
      currentPhase={currentPhase}
      phaseProgress={{
        discovery: discoveryProgress || 0,
        onboarding: onboardingProgress || 0,
        scaffolding: scaffoldingProgress || 0,
        endgame: endgameProgress || 0,
      }}
      overallProgress={overallProgress || 0}
      focusAreas={focusAreas}
      contentRecommendations={recommendations.content}
      featureRecommendations={recommendations.features}
      learningPathRecommendations={recommendations.learning}
      nextMilestones={nextMilestones}
    />
  );
}

// Helper function to determine focus areas based on user data
function determineFocusAreas(
  userProgress: any,
  recentActivities: any[],
  userGoals: Record<string, any>
) {
  const focusAreas = [];

  // Current phase progress
  const currentPhase =
    typeof userProgress === 'object' && userProgress !== null && 'current_phase' in userProgress
      ? (userProgress as any).current_phase
      : 'discovery';
  const currentPhaseProgress =
    typeof userProgress === 'object' &&
    userProgress !== null &&
    `${currentPhase}_progress` in userProgress
      ? (userProgress as any)[`${currentPhase}_progress`]
      : 0;

  // If progress in current phase is low, focus on phase completion
  if (currentPhaseProgress < 50) {
    focusAreas.push({
      id: 'phase_progress',
      title: `${capitalizeFirstLetter(currentPhase)} Phase Progress`,
      description: `Focus on completing milestones in the ${currentPhase} phase`,
      priority: 'high',
      progress: currentPhaseProgress,
      actions: [
        {
          label: 'View next milestones',
          action: 'view_milestones',
        },
        {
          label: `Explore ${currentPhase} resources`,
          action: 'explore_resources',
        },
      ],
    });
  }

  // Check token accumulation
  if (
    (recentActivities || []).filter(
      activity =>
        activity.activity_type === 'token_earned' &&
        new Date(activity.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length < 3
  ) {
    focusAreas.push({
      id: 'token_earning',
      title: 'Token Accumulation',
      description:
        "You haven't earned many tokens recently. Focus on activities that award tokens.",
      priority: 'medium',
      progress: null,
      actions: [
        {
          label: 'View token opportunities',
          action: 'view_token_opportunities',
        },
        {
          label: 'Complete token challenges',
          action: 'token_challenges',
        },
      ],
    });
  }

  // Check user goals if available
  if (userGoals && Object.keys(userGoals).length > 0) {
    // Find goals with low progress
    const lowProgressGoals = Object.entries(userGoals)
      .filter(([_, goal]: [string, any]) => goal.progress < 40)
      .slice(0, 1);

    if (lowProgressGoals.length > 0) {
      const [goalId, goal] = lowProgressGoals[0];

      focusAreas.push({
        id: `goal_${goalId}`,
        title: `Goal: ${goal.title}`,
        description: `This goal needs attention with only ${goal.progress}% progress`,
        priority: 'medium',
        progress: goal.progress,
        actions: [
          {
            label: 'Update goal progress',
            action: 'update_goal',
          },
          {
            label: 'View goal details',
            action: 'view_goal',
          },
        ],
      });
    }
  }

  // Add community engagement focus if in scaffolding or endgame phase
  if (['scaffolding', 'endgame'].includes(currentPhase)) {
    const communityActivities = (recentActivities || []).filter(activity =>
      ['forum_post', 'forum_reply', 'community_event'].includes(activity.activity_type)
    );

    if (communityActivities.length < 2) {
      focusAreas.push({
        id: 'community_engagement',
        title: 'Community Engagement',
        description: 'Increase your participation in the community to accelerate your progress',
        priority: 'low',
        progress: null,
        actions: [
          {
            label: 'Browse community forums',
            action: 'browse_forums',
          },
          {
            label: 'Join upcoming events',
            action: 'view_events',
          },
        ],
      });
    }
  }

  return focusAreas as FocusArea[];
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
