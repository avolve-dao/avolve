/**
 * Avolve Analytics Server
 * 
 * @module analytics/server
 * Copyright 2025 Avolve DAO and the Joshua Seymour Family. All rights reserved. Proprietary and confidential.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Headers } from 'next/dist/compiled/@edge-runtime/primitives';
import type { Database } from '@/types/supabase';

interface PageViewEvent {
  userId: string;
  page: string;
  referrer: string;
}

interface UserBehaviorData {
  userId: string;
  currentPhase: string;
  phaseProgress: Record<string, number>;
  tokenBalances: Record<string, number>;
  completedMilestones: string[];
  recentActivities: {
    type: string;
    timestamp: string;
    details: Record<string, any>;
  }[];
  engagementMetrics: {
    loginFrequency: number;
    averageSessionDuration: number;
    completionRates: Record<string, number>;
  };
}

/**
 * Track page view for analytics
 */
export async function trackPageView(event: PageViewEvent) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Record the page view in the analytics table
  await supabase
    .from('analytics_page_views')
    .insert({
      user_id: event.userId,
      page: event.page,
      referrer: event.referrer,
      user_agent: headers().get('user-agent') || '',
      ip_address: headers().get('x-forwarded-for')?.split(',')[0] || '',
      timestamp: new Date().toISOString()
    });
    
  return { success: true };
}

/**
 * Get personalized content recommendations for a user
 */
export async function getPersonalizedRecommendations(userId: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Get user behavior data for AI model
  const userData = await getUserBehaviorData(userId);
  
  // In a production environment, this would call an ML model API
  // For now, we'll use a rule-based approach
  
  const recommendations = {
    content: await getContentRecommendations(userData),
    features: await getFeatureRecommendations(userData),
    milestones: await getMilestoneRecommendations(userData),
    learning: await getLearningPathRecommendations(userData)
  };
  
  // Record that recommendations were generated
  await supabase
    .from('analytics_recommendations')
    .insert({
      user_id: userId,
      recommendation_type: 'personalized',
      recommendations: recommendations,
      timestamp: new Date().toISOString()
    });
  
  return recommendations;
}

/**
 * Predict phase progression timeline for a user
 */
export async function predictPhaseProgression(userId: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Get user behavior data for AI model
  const userData = await getUserBehaviorData(userId);
  
  // Calculate predicted completion dates for each phase
  const predictions = {
    discovery: calculatePhaseCompletionDate(userData, 'discovery'),
    onboarding: calculatePhaseCompletionDate(userData, 'onboarding'),
    scaffolding: calculatePhaseCompletionDate(userData, 'scaffolding'),
    endgame: calculatePhaseCompletionDate(userData, 'endgame')
  };
  
  // Record predictions for future accuracy analysis
  await supabase
    .from('analytics_predictions')
    .insert({
      user_id: userId,
      prediction_type: 'phase_progression',
      predictions: predictions,
      timestamp: new Date().toISOString()
    });
  
  return predictions;
}

/**
 * Get user engagement metrics for analytics
 */
export async function getUserEngagementMetrics(userId: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Get user's login history
  const { data: loginHistory } = await supabase
    .from('analytics_user_sessions')
    .select('started_at, ended_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(30);
  
  // Calculate engagement metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentLogins = (loginHistory || []).filter(
    session => new Date(session.started_at) >= thirtyDaysAgo
  );
  
  const loginFrequency = recentLogins.length / 30; // Average logins per day
  
  const sessionDurations = recentLogins.map(session => {
    const start = new Date(session.started_at).getTime();
    const end = session.ended_at 
      ? new Date(session.ended_at).getTime() 
      : start + 10 * 60 * 1000; // Default to 10 minutes if no end time
    return (end - start) / (60 * 1000); // Duration in minutes
  });
  
  const averageSessionDuration = sessionDurations.length > 0
    ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length
    : 0;
  
  // Get milestone completion rates
  const { data: milestoneStats } = await supabase.rpc('get_milestone_completion_stats', {
    user_id_param: userId
  });
  
  return {
    loginFrequency,
    averageSessionDuration,
    completionRates: milestoneStats?.completion_rates || {},
    lastActive: recentLogins[0]?.started_at || null,
    totalSessions: recentLogins.length
  };
}

// Helper functions

async function getUserBehaviorData(userId: string): Promise<UserBehaviorData> {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Get user's current phase and progress
  const { data: userProgress } = await supabase.rpc('get_user_progress', {
    user_id_param: userId
  });
  
  // Get user's token balances
  const { data: userTokens } = await supabase
    .from('user_tokens')
    .select('token_id, balance')
    .eq('user_id', userId);
  
  // Get user's completed milestones
  const { data: completedMilestones } = await supabase
    .from('user_phase_milestones')
    .select('milestone_id, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  
  // Get user's recent activities
  const { data: recentActivities } = await supabase
    .from('user_activities')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(50);
  
  // Get engagement metrics
  const engagementMetrics = await getUserEngagementMetrics(userId);
  
  // Format the data for the AI model
  const tokenBalances = (userTokens || []).reduce((acc, token) => {
    acc[token.token_id] = token.balance;
    return acc;
  }, {} as Record<string, number>);
  
  const phaseProgress = {
    discovery: userProgress?.discovery_progress || 0,
    onboarding: userProgress?.onboarding_progress || 0,
    scaffolding: userProgress?.scaffolding_progress || 0,
    endgame: userProgress?.endgame_progress || 0
  };
  
  return {
    userId,
    currentPhase: userProgress?.current_phase || 'discovery',
    phaseProgress,
    tokenBalances,
    completedMilestones: (completedMilestones || []).map(m => m.milestone_id),
    recentActivities: (recentActivities || []).map(activity => ({
      type: activity.activity_type,
      timestamp: activity.timestamp,
      details: activity.details || {}
    })),
    engagementMetrics: {
      loginFrequency: engagementMetrics.loginFrequency,
      averageSessionDuration: engagementMetrics.averageSessionDuration,
      completionRates: engagementMetrics.completionRates
    }
  };
}

function calculatePhaseCompletionDate(userData: UserBehaviorData, phase: string): string | null {
  // Skip if phase is already completed
  if (
    (phase === 'discovery' && userData.phaseProgress.discovery >= 100) ||
    (phase === 'onboarding' && userData.phaseProgress.onboarding >= 100) ||
    (phase === 'scaffolding' && userData.phaseProgress.scaffolding >= 100) ||
    (phase === 'endgame' && userData.phaseProgress.endgame >= 100)
  ) {
    return null;
  }
  
  // Skip if user hasn't reached this phase yet
  const phaseOrder = ['discovery', 'onboarding', 'scaffolding', 'endgame'];
  const currentPhaseIndex = phaseOrder.indexOf(userData.currentPhase);
  const targetPhaseIndex = phaseOrder.indexOf(phase);
  
  if (targetPhaseIndex > currentPhaseIndex) {
    // Need to complete current phase first
    const currentPhaseCompletion = calculatePhaseCompletionDate(userData, userData.currentPhase);
    if (!currentPhaseCompletion) return null;
    
    // Add additional time for each phase in between
    const phasesInBetween = targetPhaseIndex - currentPhaseIndex;
    const baseDate = new Date(currentPhaseCompletion);
    baseDate.setDate(baseDate.getDate() + (phasesInBetween * 30)); // Rough estimate: 30 days per phase
    return baseDate.toISOString().split('T')[0];
  }
  
  // For current phase, calculate based on progress rate
  const progress = userData.phaseProgress[phase as keyof typeof userData.phaseProgress] || 0;
  const remainingProgress = 100 - progress;
  
  // Calculate progress rate based on milestone completions
  const milestoneDates = userData.recentActivities
    .filter(a => a.type === 'milestone_completed')
    .map(a => new Date(a.timestamp).getTime());
  
  if (milestoneDates.length < 2) {
    // Not enough data for prediction
    return null;
  }
  
  // Sort dates
  milestoneDates.sort((a, b) => a - b);
  
  // Calculate average time between completions
  let totalDays = 0;
  for (let i = 1; i < milestoneDates.length; i++) {
    const daysDiff = (milestoneDates[i] - milestoneDates[i-1]) / (1000 * 60 * 60 * 24);
    totalDays += daysDiff;
  }
  
  const avgDaysPerMilestone = totalDays / (milestoneDates.length - 1);
  
  // Adjust based on login frequency (more frequent = faster progress)
  const loginAdjustment = Math.min(Math.max(userData.engagementMetrics.loginFrequency / 0.5, 0.5), 2);
  
  // Estimate remaining time
  const estimatedDays = (remainingProgress / 10) * avgDaysPerMilestone / loginAdjustment;
  
  // Calculate predicted completion date
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + Math.round(estimatedDays));
  
  return completionDate.toISOString().split('T')[0];
}

async function getContentRecommendations(userData: UserBehaviorData) {
  // In a production environment, this would use a recommendation model
  // For now, we'll use a rule-based approach based on user phase and progress
  
  const recommendations = [];
  
  // Recommend content based on current phase
  switch (userData.currentPhase) {
    case 'discovery':
      recommendations.push(
        { id: 'intro_guide', title: 'Platform Introduction Guide', type: 'guide' },
        { id: 'token_basics', title: 'Understanding Tokens', type: 'article' },
        { id: 'quick_wins', title: 'Quick Wins for Beginners', type: 'checklist' }
      );
      break;
    case 'onboarding':
      recommendations.push(
        { id: 'superachiever_intro', title: 'Superachiever Methodology', type: 'course' },
        { id: 'goal_setting', title: 'Effective Goal Setting', type: 'workshop' },
        { id: 'habit_formation', title: 'Building Positive Habits', type: 'article' }
      );
      break;
    case 'scaffolding':
      recommendations.push(
        { id: 'business_planning', title: 'Business Success Planning', type: 'course' },
        { id: 'community_engagement', title: 'Community Engagement Strategies', type: 'guide' },
        { id: 'advanced_goals', title: 'Advanced Goal Achievement', type: 'workshop' }
      );
      break;
    case 'endgame':
      recommendations.push(
        { id: 'leadership', title: 'Leadership Principles', type: 'course' },
        { id: 'content_creation', title: 'Creating Valuable Content', type: 'workshop' },
        { id: 'governance', title: 'Platform Governance Guide', type: 'guide' }
      );
      break;
  }
  
  // Add recommendations based on token balances
  const lowTokens = Object.entries(userData.tokenBalances)
    .filter(([tokenId, balance]) => balance < 20)
    .map(([tokenId]) => tokenId);
  
  if (lowTokens.includes('SAP')) {
    recommendations.push({ 
      id: 'sap_earning', 
      title: 'Superachiever Points Guide', 
      type: 'guide' 
    });
  }
  
  if (lowTokens.includes('PSP')) {
    recommendations.push({ 
      id: 'psp_earning', 
      title: 'Personal Success Points Guide', 
      type: 'guide' 
    });
  }
  
  return recommendations;
}

async function getFeatureRecommendations(userData: UserBehaviorData) {
  // Recommend features based on user behavior and current phase
  const recommendations = [];
  
  // Get features that are close to being unlocked
  // In a real implementation, this would check against feature requirements
  
  if (userData.currentPhase === 'discovery' && userData.phaseProgress.discovery > 70) {
    recommendations.push({
      id: 'token_wallet',
      name: 'Token Wallet',
      reason: 'Almost unlocked! Complete 2 more discovery milestones.'
    });
  }
  
  if (userData.currentPhase === 'onboarding') {
    recommendations.push({
      id: 'goal_setting',
      name: 'Goal Setting Tools',
      reason: 'Will help you progress faster through the onboarding phase.'
    });
  }
  
  if (userData.currentPhase === 'scaffolding') {
    recommendations.push({
      id: 'community_forums',
      name: 'Community Forums',
      reason: 'Connect with others at your experience level.'
    });
  }
  
  return recommendations;
}

async function getMilestoneRecommendations(userData: UserBehaviorData) {
  // Recommend next milestones to complete based on user progress
  const recommendations = [];
  
  // In a real implementation, this would check against all available milestones
  // and recommend the most appropriate ones
  
  const phaseOrder = ['discovery', 'onboarding', 'scaffolding', 'endgame'];
  const currentPhaseIndex = phaseOrder.indexOf(userData.currentPhase);
  
  // Recommend completing current phase milestones
  const currentPhaseProgress = userData.phaseProgress[userData.currentPhase as keyof typeof userData.phaseProgress];
  
  if (currentPhaseProgress < 100) {
    recommendations.push({
      id: `${userData.currentPhase}_next`,
      name: `Complete ${userData.currentPhase} phase`,
      reason: `You're ${currentPhaseProgress}% through this phase.`
    });
  }
  
  // If almost complete, recommend preparing for next phase
  if (currentPhaseProgress > 80 && currentPhaseIndex < phaseOrder.length - 1) {
    const nextPhase = phaseOrder[currentPhaseIndex + 1];
    recommendations.push({
      id: `${nextPhase}_prep`,
      name: `Prepare for ${nextPhase} phase`,
      reason: 'You\'ll be entering this phase soon.'
    });
  }
  
  return recommendations;
}

async function getLearningPathRecommendations(userData: UserBehaviorData) {
  // Recommend learning paths based on user behavior and interests
  const recommendations = [];
  
  // In a real implementation, this would analyze user activity and content preferences
  // to recommend personalized learning paths
  
  // Basic recommendations based on phase
  switch (userData.currentPhase) {
    case 'discovery':
      recommendations.push({
        id: 'platform_basics',
        name: 'Platform Basics',
        description: 'Learn the fundamentals of the Avolve platform',
        modules: 5,
        estimatedTime: '2 hours'
      });
      break;
    case 'onboarding':
      recommendations.push({
        id: 'superachiever_fundamentals',
        name: 'Superachiever Fundamentals',
        description: 'Master the core principles of being a Superachiever',
        modules: 8,
        estimatedTime: '4 hours'
      });
      break;
    case 'scaffolding':
      recommendations.push({
        id: 'business_success',
        name: 'Business Success Pathway',
        description: 'Comprehensive guide to business success principles',
        modules: 12,
        estimatedTime: '6 hours'
      });
      break;
    case 'endgame':
      recommendations.push({
        id: 'leadership_mastery',
        name: 'Leadership Mastery',
        description: 'Advanced leadership techniques for Superachievers',
        modules: 10,
        estimatedTime: '5 hours'
      });
      break;
  }
  
  return recommendations;
}

export async function trackAnalytics(event: string, data: any) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    'X-Analytics-Event': event
  });

  // Rest of the function remains the same
}
