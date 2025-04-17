/**
 * Journey AI API Route
 * 
 * Provides AI-driven recommendations based on user's regen analytics
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
// import { Database } from '@/types/supabase'; // Temporarily removed due to missing export

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
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
      type UserRoleActivity = { role_type: string };
      const { data: userRole } = await supabase
        .from('user_role_activity' as any)
        .select('role_type')
        .eq('user_id', session.user.id)
        .single();
      const role = (userRole as UserRoleActivity | null)?.role_type;
      if (!role || role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Cannot access another user\'s recommendations' },
          { status: 403 }
        );
      }
    }
    
    // Fetch user's regen analytics data (type assertion for custom RPC)
    const { data: regenData, error: regenError } = await (supabase as any)
      .rpc('get_user_regen_analytics', { user_id_param: userId });
    
    if (regenError) {
      console.error('Error fetching regen analytics:', regenError);
      return NextResponse.json(
        { error: 'Failed to fetch user analytics' },
        { status: 500 }
      );
    }
    
    // Fetch user's journey progress (type assertion for custom RPC)
    const { data: journeyProgress, error: journeyError } = await (supabase as any)
      .rpc('get_user_progress', { user_id_param: userId });
    
    if (journeyError) {
      console.error('Error fetching journey progress:', journeyError);
      return NextResponse.json(
        { error: 'Failed to fetch user journey progress' },
        { status: 500 }
      );
    }
    
    // Fetch user's token balances (type assertion for missing generated type)
    const { data: tokenBalances, error: tokenError } = await (supabase as any)
      .from('user_balances')
      .select('token_id, balance, tokens(id, symbol, name, token_type)')
      .eq('user_id', userId);
    
    if (tokenError) {
      console.error('Error fetching token balances:', tokenError);
      return NextResponse.json(
        { error: 'Failed to fetch user token balances' },
        { status: 500 }
      );
    }
    
    // Fetch token flow analytics for personalized token recommendations (type assertion for custom RPC)
    const { data: tokenFlowData, error: tokenFlowError } = await (supabase as any)
      .rpc('get_user_token_health', { user_id_param: userId });
    
    if (tokenFlowError && tokenFlowError.code !== 'PGRST116') { // Not found is okay
      console.error('Error fetching token flow data:', tokenFlowError);
    }
    
    // Fetch upcoming events (type assertion for missing generated type)
    const { data: upcomingEvents, error: eventsError } = await (supabase as any)
      .from('events')
      .select('*, event_types(*)')
      .gt('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })
      .limit(10);
    
    if (eventsError) {
      console.error('Error fetching upcoming events:', eventsError);
      return NextResponse.json(
        { error: 'Failed to fetch upcoming events' },
        { status: 500 }
      );
    }
    
    // Fetch user's completed events (type assertion for missing generated type)
    const { data: completedEvents, error: completedError } = await (supabase as any)
      .from('event_completions')
      .select('event_id, completion_date')
      .eq('user_id', userId);
    
    if (completedError) {
      console.error('Error fetching completed events:', completedError);
      return NextResponse.json(
        { error: 'Failed to fetch completed events' },
        { status: 500 }
      );
    }
    
    // Fetch user's streak data
    const { data: streakData, error: streakError } = await (supabase as any)
      .from('user_token_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') { // Not found is okay
      console.error('Error fetching streak data:', streakError);
    }
    
    // Fetch user's recommendation interactions for personalization (type assertion for missing generated type)
    const { data: interactionData, error: interactionError } = await (supabase as any)
      .from('recommendation_interactions')
      .select('recommendation_id, action, interaction_date')
      .eq('user_id', userId)
      .order('interaction_date', { ascending: false })
      .limit(20);
    
    if (interactionError) {
      console.error('Error fetching recommendation interactions:', interactionError);
    }
    
    // Generate AI-driven recommendations based on collected data
    const recommendations = generateRecommendations(
      regenData,
      journeyProgress,
      tokenBalances,
      upcomingEvents,
      completedEvents,
      streakData,
      tokenFlowData,
      interactionData || []
    );
    
    // Log the recommendation generation without blocking response (type assertion for missing generated type)
    const { error } = await (supabase as any)
      .from('ai_recommendation_logs')
      .insert({
        user_id: userId,
        recommendation_type: 'journey',
        input_data: JSON.stringify({ regenData, journeyProgress, tokenBalances, upcomingEvents, completedEvents, streakData, tokenFlowData, interactionData }),
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error logging recommendation generation:', error);
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Unexpected error in journey-ai route:', error);
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
  streakData: any,
  tokenFlowData: any,
  interactionData: any[]
) {
  const recommendations: any[] = [];
  
  // Track which recommendation types we've already added
  const addedTypes = new Set();
  
  // Get user's current phase and level
  const currentPhase = journeyProgress?.current_phase || 'discovery';
  const regenLevel = regenData?.regen_level || 1;
  
  // Analyze past interactions to improve recommendations
  const clickedRecommendations = new Set(
    interactionData
      .filter(i => i.action === 'click')
      .map(i => i.recommendation_id)
  );
  
  const dismissedRecommendations = new Set(
    interactionData
      .filter(i => i.action === 'dismiss')
      .map(i => i.recommendation_id)
  );
  
  // Prioritize streak maintenance if streak exists
  if (streakData && streakData.current_daily_streak > 0) {
    // Calculate days until next Tesla milestone (3, 6, 9, etc.)
    const currentStreak = streakData.current_daily_streak;
    const nextMilestone = Math.ceil(currentStreak / 3) * 3;
    const daysToMilestone = nextMilestone - currentStreak;
    
    if (daysToMilestone <= 2) {
      // High priority recommendation to maintain streak for upcoming milestone
      recommendations.push({
        id: `streak-milestone-${nextMilestone}`,
        type: 'streak',
        title: `${nextMilestone}-Day Streak Milestone`,
        description: `You're only ${daysToMilestone} day${daysToMilestone > 1 ? 's' : ''} away from a ${getStreakMultiplier(nextMilestone)}x token bonus!`,
        icon: null,
        action: 'View Today\'s Challenge',
        actionUrl: '/challenges/today',
        priority: 95,
        reason: `Reaching a ${nextMilestone}-day streak will significantly boost your token earnings`
      });
      addedTypes.add('streak');
    }
  }
  
  // Add event recommendations
  if (upcomingEvents && upcomingEvents.length > 0) {
    // Filter out events the user has already completed
    const completedEventIds = new Set(completedEvents.map((e: any) => e.event_id));
    const relevantEvents = upcomingEvents.filter((event: any) => !completedEventIds.has(event.id));
    
    // Sort by relevance to user's journey
    relevantEvents.sort((a: any, b: any) => {
      const priorityA = calculateEventPriority(a, regenData);
      const priorityB = calculateEventPriority(b, regenData);
      return priorityB - priorityA;
    });
    
    // Add top 2 most relevant events
    relevantEvents.slice(0, 2).forEach((event: any) => {
      const eventPriority = calculateEventPriority(event, regenData);
      const recommendationId = `event-${event.id}`;
      
      // Skip if user has dismissed this recommendation recently
      if (dismissedRecommendations.has(recommendationId)) {
        return;
      }
      
      recommendations.push({
        id: recommendationId,
        type: 'event',
        title: event.title,
        description: event.description.length > 100 
          ? `${event.description.substring(0, 97)}...` 
          : event.description,
        icon: null,
        action: 'Join Event',
        actionUrl: `/events/${event.id}`,
        priority: eventPriority,
        reason: determineEventRecommendationReason(event, regenData)
      });
      addedTypes.add('event');
    });
  }
  
  // Add content recommendations based on journey phase
  if (!addedTypes.has('content') || recommendations.length < 3) {
    const contentRecommendations = generateContentRecommendations(journeyProgress, regenData);
    
    // Filter out dismissed recommendations
    const filteredContentRecs = contentRecommendations.filter(
      rec => !dismissedRecommendations.has(rec.id)
    );
    
    // Prioritize content types the user has clicked on before
    filteredContentRecs.sort((a, b) => {
      const aClicked = clickedRecommendations.has(a.id) ? 1 : 0;
      const bClicked = clickedRecommendations.has(b.id) ? 1 : 0;
      return bClicked - aClicked || b.priority - a.priority;
    });
    
    // Add top content recommendation
    if (filteredContentRecs.length > 0) {
      recommendations.push(filteredContentRecs[0]);
      addedTypes.add('content');
    }
  }
  
  // Add token recommendations if user has sufficient tokens
  if ((!addedTypes.has('token') || recommendations.length < 3) && tokenBalances) {
    const tokenRecommendations = generateTokenRecommendations(tokenBalances, streakData, regenData, tokenFlowData);
    
    // Filter out dismissed recommendations
    const filteredTokenRecs = tokenRecommendations.filter(
      rec => !dismissedRecommendations.has(rec.id)
    );
    
    // Add top token recommendation if available
    if (filteredTokenRecs.length > 0) {
      recommendations.push(filteredTokenRecs[0]);
      addedTypes.add('token');
    }
  }
  
  // Add community recommendations for users in scaffolding phase or higher
  if ((!addedTypes.has('community') || recommendations.length < 3) && 
      (currentPhase === 'scaffolding' || currentPhase === 'endgame')) {
    const communityRecommendations = generateCommunityRecommendations(regenData);
    
    // Filter out dismissed recommendations
    const filteredCommunityRecs = communityRecommendations.filter(
      rec => !dismissedRecommendations.has(rec.id)
    );
    
    // Add top community recommendation if available
    if (filteredCommunityRecs.length > 0) {
      recommendations.push(filteredCommunityRecs[0]);
      addedTypes.add('community');
    }
  }
  
  // Add journey progression recommendations
  if (!addedTypes.has('journey') && recommendations.length < 4) {
    // Calculate progress to next phase
    const phaseProgress = journeyProgress?.phase_progress || 0;
    
    if (phaseProgress >= 80 && currentPhase !== 'endgame') {
      const nextPhase = getNextPhase(currentPhase);
      recommendations.push({
        id: `journey-next-phase-${nextPhase}`,
        type: 'journey',
        title: `Almost to ${formatPhaseName(nextPhase)}!`,
        description: `You're ${100 - phaseProgress}% away from advancing to the next phase of your journey.`,
        icon: null,
        action: 'View Requirements',
        actionUrl: '/journey/phases',
        priority: 85,
        reason: 'Phase advancement unlocks new features and opportunities'
      });
      addedTypes.add('journey');
    }
  }
  
  // Sort recommendations by priority
  recommendations.sort((a, b) => b.priority - a.priority);
  
  // Limit to 5 recommendations
  return recommendations.slice(0, 5);
}

// Calculate priority for event recommendations
function calculateEventPriority(event: any, regenData: any): number {
  let priority = 50; // Base priority
  
  // Adjust based on event type match to user's journey
  if (event.event_types) {
    const eventType = event.event_types.type_name?.toLowerCase() || '';
    
    // Boost priority for events that match user's strengths
    if (
      (eventType.includes('personal') && regenData.event_count > 5) ||
      (eventType.includes('community') && regenData.team_count > 0) ||
      (eventType.includes('token') && regenData.token_transaction_count > 10)
    ) {
      priority += 15;
    }
    
    // Boost priority for events that help with user's weaknesses
    if (
      (eventType.includes('community') && regenData.community_engagement_score < 30) ||
      (eventType.includes('milestone') && regenData.recent_milestone_count < 2) ||
      (eventType.includes('streak') && (!regenData.current_streak || regenData.current_streak < 3))
    ) {
      priority += 20;
    }
  }
  
  // Adjust based on event timing
  const eventDate = new Date(event.event_date);
  const now = new Date();
  const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  
  if (daysDiff <= 1) {
    // Happening today or tomorrow
    priority += 25;
  } else if (daysDiff <= 3) {
    // Happening in the next 3 days
    priority += 15;
  } else if (daysDiff <= 7) {
    // Happening in the next week
    priority += 5;
  }
  
  // Adjust based on capacity
  const capacityPercentage = event.current_participants / event.max_participants * 100;
  if (capacityPercentage >= 80) {
    // Almost full
    priority += 10;
  }
  
  // Cap priority at 100
  return Math.min(priority, 100);
}

// Determine reason for recommending an event
function determineEventRecommendationReason(event: any, regenData: any): string {
  if (event.event_types) {
    const eventType = event.event_types.type_name?.toLowerCase() || '';
    
    // Personalized reason based on event type and user data
    if (eventType.includes('community') && regenData.community_engagement_score < 30) {
      return 'This event will boost your community engagement score';
    }
    
    if (eventType.includes('milestone') && regenData.recent_milestone_count < 2) {
      return 'Completing this event will help you achieve more milestones';
    }
    
    if (eventType.includes('streak') && (!regenData.current_streak || regenData.current_streak < 3)) {
      return 'This event will help you build your streak for bonus rewards';
    }
    
    if (eventType.includes('token')) {
      return 'Earn tokens and increase your regen score';
    }
  }
  
  // Default reasons based on timing
  const eventDate = new Date(event.event_date);
  const now = new Date();
  const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  
  if (daysDiff <= 1) {
    return 'Happening soon! Join to earn immediate rewards';
  }
  
  if (event.current_participants / event.max_participants >= 0.8) {
    return 'This event is filling up quickly';
  }
  
  return 'This event aligns with your journey goals';
}

// Generate content recommendations based on journey progress
function generateContentRecommendations(journeyProgress: any, regenData: any): any[] {
  const recommendations: any[] = [];
  const currentPhase = journeyProgress?.current_phase || 'discovery';
  
  // Discovery phase content
  if (currentPhase === 'discovery') {
    recommendations.push({
      id: 'content-platform-intro',
      type: 'content',
      title: 'Avolve Platform Introduction',
      description: 'Learn the basics of the platform and how to maximize your journey',
      icon: null,
      action: 'Watch Video',
      actionUrl: '/learn/platform-intro',
      priority: 80,
      reason: 'Essential knowledge for new members'
    });
    
    recommendations.push({
      id: 'content-token-guide',
      type: 'content',
      title: 'Token System Guide',
      description: 'Understand how tokens work and how to earn them',
      icon: null,
      action: 'Read Guide',
      actionUrl: '/learn/token-guide',
      priority: 75,
      reason: 'Helps you maximize token earnings'
    });
  }
  
  // Onboarding phase content
  if (currentPhase === 'onboarding' || currentPhase === 'scaffolding') {
    recommendations.push({
      id: 'content-streak-strategy',
      type: 'content',
      title: 'Tesla\'s 3-6-9 Streak Strategy',
      description: 'Learn how to maintain streaks for maximum rewards',
      icon: null,
      action: 'Read Guide',
      actionUrl: '/learn/streak-strategy',
      priority: 70,
      reason: 'Can increase your token earnings by up to 90%'
    });
    
    if (regenData?.team_count === 0) {
      recommendations.push({
        id: 'content-team-benefits',
        type: 'content',
        title: 'Benefits of Team Collaboration',
        description: 'Discover how joining a team accelerates your progress',
        icon: null,
        action: 'Read Article',
        actionUrl: '/learn/team-benefits',
        priority: 65,
        reason: 'Teams earn 30% more tokens on average'
      });
    }
  }
  
  // Scaffolding and endgame content
  if (currentPhase === 'scaffolding' || currentPhase === 'endgame') {
    recommendations.push({
      id: 'content-advanced-strategies',
      type: 'content',
      title: 'Advanced Regen Strategies',
      description: 'Expert techniques to accelerate your journey',
      icon: null,
      action: 'Read Guide',
      actionUrl: '/learn/advanced-strategies',
      priority: 60,
      reason: 'Perfect for your current journey phase'
    });
    
    if (regenData?.is_leader) {
      recommendations.push({
        id: 'content-leadership-guide',
        type: 'content',
        title: 'Effective Team Leadership',
        description: 'Maximize your team\'s potential and rewards',
        icon: null,
        action: 'Read Guide',
        actionUrl: '/learn/leadership',
        priority: 75,
        reason: 'Enhance your leadership effectiveness'
      });
    }
  }
  
  return recommendations;
}

// Generate token recommendations
function generateTokenRecommendations(
  tokenBalances: any[], 
  streakData: any, 
  regenData: any,
  tokenFlowData: any
): any[] {
  const recommendations: any[] = [];
  
  // Check if user has any tokens
  if (!tokenBalances || tokenBalances.length === 0) {
    recommendations.push({
      id: 'token-first-claim',
      type: 'token',
      title: 'Claim Your First Tokens',
      description: 'Complete today\'s challenge to start your token journey',
      icon: null,
      action: 'View Challenge',
      actionUrl: '/challenges/today',
      priority: 90,
      reason: 'Tokens are the foundation of your journey'
    });
    
    return recommendations;
  }
  
  // Recommend streak building if no active streak
  if (!streakData || streakData.current_daily_streak === 0) {
    recommendations.push({
      id: 'token-start-streak',
      type: 'token',
      title: 'Start Your Token Streak',
      description: 'Complete today\'s challenge to begin earning streak bonuses',
      icon: null,
      action: 'View Challenge',
      actionUrl: '/challenges/today',
      priority: 85,
      reason: streakData 
        ? 'Restart your streak to earn bonus multipliers' 
        : 'Daily claims build your streak for bonuses'
    });
  }
  
  // Check token balances and recommend actions
  const sapBalance = tokenBalances.find(tb => tb.tokens?.symbol === 'SAP')?.balance || 0;
  const scqBalance = tokenBalances.find(tb => tb.tokens?.symbol === 'SCQ')?.balance || 0;
  
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
  
  if (scqBalance >= 100 && regenData.regen_level >= 2) {
    recommendations.push({
      id: 'token-upgrade-scq',
      type: 'token',
      title: 'Upgrade Your SCQ Tokens',
      description: 'Convert SCQ to higher-level tokens for advanced features',
      icon: null,
      action: 'Upgrade',
      actionUrl: '/tokens/upgrade',
      priority: 65,
      reason: 'Unlocks community governance capabilities'
    });
  }
  
  // Add token health recommendations if available
  if (tokenFlowData && Array.isArray(tokenFlowData)) {
    // Find tokens with poor health
    const unhealthyTokens = tokenFlowData.filter(t => 
      t.health_status === 'poor' || t.health_status === 'critical'
    );
    
    if (unhealthyTokens.length > 0) {
      const token = unhealthyTokens[0];
      recommendations.push({
        id: `token-health-${token.symbol}`,
        type: 'token',
        title: `Improve ${token.symbol} Token Health`,
        description: `Your ${token.symbol} token needs attention to maintain its value`,
        icon: null,
        action: 'View Strategy',
        actionUrl: `/tokens/health/${token.symbol}`,
        priority: 75,
        reason: 'Maintaining token health preserves your investment'
      });
    }
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

// Helper function to get streak multiplier
function getStreakMultiplier(streak: number): number {
  if (streak >= 12) return 2.2;
  if (streak >= 9) return 1.9;
  if (streak >= 6) return 1.6;
  if (streak >= 3) return 1.3;
  return 1.0;
}

// Helper function to get next phase
function getNextPhase(currentPhase: string): string {
  switch (currentPhase) {
    case 'discovery': return 'onboarding';
    case 'onboarding': return 'scaffolding';
    case 'scaffolding': return 'endgame';
    default: return 'discovery';
  }
}

// Helper function to format phase name
function formatPhaseName(phase: string): string {
  return phase.charAt(0).toUpperCase() + phase.slice(1);
}

// Track recommendation interactions
export async function PUT(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
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
    const { userId, recommendationId, action, metadata = {} } = body;
    
    // Verify user ID matches authenticated user or is admin
    if (userId !== session.user.id) {
      type UserRoleActivity = { role_type: string };
      const { data: userRole } = await supabase
        .from('user_role_activity' as any)
        .select('role_type')
        .eq('user_id', session.user.id)
        .single();
      const role = (userRole as UserRoleActivity | null)?.role_type;
      if (!role || role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Cannot track interactions for another user' },
          { status: 403 }
        );
      }
    }
    
    // Record the interaction
    const { error } = await (supabase as any)
      .from('recommendation_interactions')
      .insert({
        user_id: userId,
        recommendation_id: recommendationId,
        action,
        interaction_date: new Date().toISOString(),
        metadata
      });
    
    if (error) {
      console.error('Error recording interaction:', error);
      return NextResponse.json(
        { error: 'Failed to record interaction' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in journey-ai route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
