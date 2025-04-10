/**
 * Journey AI Recommendations API Route
 * 
 * Provides personalized AI-driven recommendations based on user's regen analytics
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { userId } = body;
    
    // Verify user ID matches authenticated user or is admin
    if (userId !== session.user.id) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (!userRole || userRole.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Cannot access another user\'s recommendations' },
          { status: 403 }
        );
      }
    }
    
    // Fetch user's regen analytics data
    const { data: regenData, error: regenError } = await supabase
      .from('regen_analytics_mv')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (regenError) {
      console.error('Error fetching regen analytics:', regenError);
      return NextResponse.json(
        { error: 'Failed to fetch user analytics' },
        { status: 500 }
      );
    }
    
    // Fetch user's journey progress
    const { data: journeyProgress, error: journeyError } = await supabase.rpc(
      'get_user_progress',
      { user_id_param: userId }
    );
    
    if (journeyError) {
      console.error('Error fetching journey progress:', journeyError);
      return NextResponse.json(
        { error: 'Failed to fetch user journey progress' },
        { status: 500 }
      );
    }
    
    // Fetch user's token balances
    const { data: tokenBalances, error: tokenError } = await supabase
      .from('user_balances')
      .select('token_id, balance')
      .eq('user_id', userId);
    
    if (tokenError) {
      console.error('Error fetching token balances:', tokenError);
      return NextResponse.json(
        { error: 'Failed to fetch user token balances' },
        { status: 500 }
      );
    }
    
    // Fetch upcoming events
    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .gt('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(5);
    
    if (eventsError) {
      console.error('Error fetching upcoming events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch upcoming events' },
        { status: 500 }
      );
    }
    
    // Fetch user's completed events
    const { data: completedEvents, error: completedError } = await supabase
      .from('event_completions')
      .select('event_id')
      .eq('user_id', userId);
    
    if (completedError) {
      console.error('Error fetching completed events:', completedError);
      return NextResponse.json(
        { error: 'Failed to fetch completed events' },
        { status: 500 }
      );
    }
    
    // Fetch user's streak data
    const { data: streakData, error: streakError } = await supabase
      .from('user_token_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') { // Not found is okay
      console.error('Error fetching streak data:', streakError);
      return NextResponse.json(
        { error: 'Failed to fetch streak data' },
        { status: 500 }
      );
    }
    
    // Generate AI-driven recommendations based on collected data
    const recommendations = generateRecommendations(
      regenData,
      journeyProgress,
      tokenBalances,
      upcomingEvents,
      completedEvents || [],
      streakData
    );
    
    // Return recommendations
    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Unexpected error in journey-ai recommendations route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate recommendations based on user data
function generateRecommendations(
  regenData: any,
  journeyProgress: any,
  tokenBalances: any[],
  upcomingEvents: any[],
  completedEvents: any[],
  streakData: any
) {
  const recommendations: any[] = [];
  const completedEventIds = new Set(completedEvents.map(e => e.event_id));
  
  // 1. Recommend upcoming events that the user hasn't completed
  const eventRecommendations = upcomingEvents
    .filter(event => !completedEventIds.has(event.id))
    .map(event => ({
      id: `event-${event.id}`,
      type: 'event',
      title: event.title,
      description: event.description || 'Join this upcoming event',
      icon: null, // Will be set by the client component
      action: 'Join Event',
      actionUrl: `/events/${event.id}`,
      priority: calculateEventPriority(event, regenData),
      reason: determineEventRecommendationReason(event, regenData)
    }));
  
  recommendations.push(...eventRecommendations);
  
  // 2. Recommend content based on journey progress
  if (journeyProgress) {
    const contentRecommendations = generateContentRecommendations(journeyProgress, regenData);
    recommendations.push(...contentRecommendations);
  }
  
  // 3. Recommend token actions based on balances and streaks
  const tokenRecommendations = generateTokenRecommendations(tokenBalances, streakData, regenData);
  recommendations.push(...tokenRecommendations);
  
  // 4. Recommend community engagement based on regen level
  const communityRecommendations = generateCommunityRecommendations(regenData);
  recommendations.push(...communityRecommendations);
  
  return recommendations;
}

// Calculate priority for event recommendations
function calculateEventPriority(event: any, regenData: any): number {
  let priority = 50; // Base priority
  
  // Increase priority for events happening soon
  const eventDate = new Date(event.event_date);
  const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilEvent <= 1) {
    priority += 30; // Happening today or tomorrow
  } else if (daysUntilEvent <= 3) {
    priority += 20; // Happening in the next 3 days
  } else if (daysUntilEvent <= 7) {
    priority += 10; // Happening in the next week
  }
  
  // Adjust priority based on event relevance to user's journey
  if (event.tags && Array.isArray(event.tags)) {
    // Higher priority for events matching user's current pillar
    if (regenData.regen_level <= 2 && event.tags.includes('superachiever')) {
      priority += 15;
    } else if (regenData.regen_level >= 3 && regenData.regen_level <= 4 && event.tags.includes('superachievers')) {
      priority += 15;
    } else if (regenData.regen_level >= 5 && event.tags.includes('supercivilization')) {
      priority += 15;
    }
    
    // Bonus for featured events
    if (event.tags.includes('featured')) {
      priority += 10;
    }
  }
  
  return Math.min(priority, 100); // Cap at 100
}

// Determine reason for recommending an event
function determineEventRecommendationReason(event: any, regenData: any): string {
  const eventDate = new Date(event.event_date);
  const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilEvent <= 1) {
    return 'This event is happening very soon';
  }
  
  if (event.tags && Array.isArray(event.tags)) {
    if (regenData.regen_level <= 2 && event.tags.includes('superachiever')) {
      return 'Aligns with your Superachiever journey focus';
    } else if (regenData.regen_level >= 3 && regenData.regen_level <= 4 && event.tags.includes('superachievers')) {
      return 'Perfect for your Superachievers Network engagement';
    } else if (regenData.regen_level >= 5 && event.tags.includes('supercivilization')) {
      return 'Advances your Supercivilization ecosystem participation';
    }
    
    if (event.tags.includes('featured')) {
      return 'This is a featured event with high value';
    }
  }
  
  return 'This event aligns with your journey progress';
}

// Generate content recommendations based on journey progress
function generateContentRecommendations(journeyProgress: any, regenData: any): any[] {
  const recommendations: any[] = [];
  
  // Recommend next module based on current progress
  if (journeyProgress.current_phase && journeyProgress.completed_milestones) {
    const currentPhase = journeyProgress.current_phase;
    const completedMilestones = journeyProgress.completed_milestones;
    
    // Find incomplete milestones in current phase
    const incompleteMilestones = currentPhase.milestones.filter(
      (milestone: any) => !completedMilestones.some((cm: any) => cm.id === milestone.id)
    );
    
    if (incompleteMilestones.length > 0) {
      // Recommend the first incomplete milestone
      const nextMilestone = incompleteMilestones[0];
      recommendations.push({
        id: `content-${nextMilestone.id}`,
        type: 'content',
        title: nextMilestone.title,
        description: `Complete this milestone in your ${currentPhase.title} journey`,
        icon: null,
        action: 'Start Learning',
        actionUrl: `/journey/milestones/${nextMilestone.id}`,
        priority: 85, // High priority for next milestone
        reason: 'Next step in your learning journey'
      });
    }
    
    // Recommend review of completed content if user has low engagement score
    if (regenData.engagement_score < 70 && completedMilestones.length > 0) {
      // Find a milestone completed more than 30 days ago
      const oldMilestone = completedMilestones.find((cm: any) => {
        const completionDate = new Date(cm.completion_date);
        const daysSinceCompletion = Math.ceil((Date.now() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCompletion > 30;
      });
      
      if (oldMilestone) {
        recommendations.push({
          id: `content-review-${oldMilestone.id}`,
          type: 'content',
          title: `Review: ${oldMilestone.title}`,
          description: 'Refresh your knowledge on this important topic',
          icon: null,
          action: 'Review',
          actionUrl: `/journey/milestones/${oldMilestone.id}`,
          priority: 60, // Medium priority for review
          reason: 'Reinforcing previous learning improves retention'
        });
      }
    }
  }
  
  return recommendations;
}

// Generate token recommendations
function generateTokenRecommendations(tokenBalances: any[], streakData: any, regenData: any): any[] {
  const recommendations: any[] = [];
  
  // Check if user needs to claim daily tokens
  const lastClaimDate = streakData?.last_claim_date ? new Date(streakData.last_claim_date) : null;
  const today = new Date();
  const needsDailyClaim = !lastClaimDate || 
    lastClaimDate.getDate() !== today.getDate() || 
    lastClaimDate.getMonth() !== today.getMonth() || 
    lastClaimDate.getFullYear() !== today.getFullYear();
  
  if (needsDailyClaim) {
    recommendations.push({
      id: 'token-daily-claim',
      type: 'token',
      title: 'Daily Token Claim',
      description: streakData?.current_daily_streak 
        ? `Maintain your ${streakData.current_daily_streak} day streak` 
        : 'Start your daily streak',
      icon: null,
      action: 'Claim',
      actionUrl: '/tokens/claim',
      priority: 95, // Very high priority
      reason: streakData?.current_daily_streak && streakData.current_daily_streak % 3 === 0 
        ? 'Claim today to receive a streak bonus!' 
        : 'Daily claims build your streak for bonuses'
    });
  }
  
  // Check token balances and recommend actions
  const sapBalance = tokenBalances.find(tb => tb.token_id === 'sap')?.balance || 0;
  
  if (sapBalance >= 100 && regenData.regen_level >= 2) {
    recommendations.push({
      id: 'token-upgrade-sap',
      type: 'token',
      title: 'Upgrade Your SAP Tokens',
      description: 'Convert SAP to higher-level tokens for advanced features',
      icon: null,
      action: 'Upgrade',
      actionUrl: '/tokens/upgrade',
      priority: 70,
      reason: 'Unlocks more powerful platform capabilities'
    });
  }
  
  return recommendations;
}

// Generate community recommendations
function generateCommunityRecommendations(regenData: any): any[] {
  const recommendations: any[] = [];
  
  // Recommend community engagement based on regen level
  if (regenData.regen_level >= 2) {
    if (regenData.community_engagement_score < 50) {
      recommendations.push({
        id: 'community-connect',
        type: 'community',
        title: 'Connect with Peers',
        description: 'Find like-minded individuals in the community',
        icon: null,
        action: 'Explore',
        actionUrl: '/community/explore',
        priority: 75,
        reason: 'Community connections accelerate your growth'
      });
    }
    
    if (regenData.regen_level >= 3 && !regenData.has_team) {
      recommendations.push({
        id: 'community-team',
        type: 'community',
        title: 'Join a Team',
        description: 'Collaborate with others on shared goals',
        icon: null,
        action: 'Find Teams',
        actionUrl: '/teams/explore',
        priority: 80,
        reason: 'Team collaboration unlocks new opportunities'
      });
    }
    
    if (regenData.regen_level >= 4 && regenData.contribution_score < 30) {
      recommendations.push({
        id: 'community-contribute',
        type: 'community',
        title: 'Contribute to Projects',
        description: 'Share your skills and earn recognition',
        icon: null,
        action: 'View Projects',
        actionUrl: '/projects/explore',
        priority: 65,
        reason: 'Contributions increase your influence and token earnings'
      });
    }
  }
  
  return recommendations;
}
