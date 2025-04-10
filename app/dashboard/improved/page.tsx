/**
 * Dashboard Page - Implemented with React Server Components
 * 
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Component imports
import { JourneyMapServer } from '@/components/dashboard/journey-map/server';
import { FocusModeServer } from '@/components/dashboard/focus-mode/server';
import { FeaturePreviewServer } from '@/components/dashboard/feature-preview/server';
import { ActivityFeedServer } from '@/components/dashboard/activity-feed/server';
import { TokenBalanceServer } from '@/components/tokens/token-balance/server';
import { AIInsightsServer } from '@/components/dashboard/ai-insights/server';
import { EnhancedStreakSystem } from '@/components/streak/enhanced-streak-system';
import { RealTimeSSALeaderboard } from '@/components/leaderboard/real-time-ssa-leaderboard';

// Skeleton loaders
import { JourneyMapSkeleton } from '@/components/dashboard/journey-map/skeleton';
import { FocusModeSkeleton } from '@/components/dashboard/focus-mode/skeleton';
import { FeaturePreviewSkeleton } from '@/components/dashboard/feature-preview/skeleton';
import { ActivityFeedSkeleton } from '@/components/dashboard/activity-feed/skeleton';
import { TokenBalanceSkeleton } from '@/components/tokens/token-balance/skeleton';
import { AIInsightsSkeleton } from '@/components/dashboard/ai-insights/skeleton';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Analytics for server-side tracking
import { trackPageView } from '@/lib/analytics/server';

// Token gradients from dashboard page
import { TOKEN_GRADIENTS } from '@/app/dashboard/dashboard-page';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Get the user session
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect if not authenticated
  if (!session?.user) {
    redirect('/login');
  }
  
  const userId = session.user.id;
  
  // Track page view for analytics
  await trackPageView({
    userId,
    page: 'dashboard',
    referrer: '',
  });
  
  // Fetch user profile data (can be used by multiple components)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, experience_level, preferences')
    .eq('id', userId)
    .single();
  
  // Fetch user journey preferences to determine UI theme
  const { data: journeyPreferences } = await supabase
    .from('user_journey_preferences')
    .select('primary_journey, secondary_journey')
    .eq('user_id', userId)
    .single();
  
  // Determine primary journey for UI customization
  const primaryJourney = journeyPreferences?.primary_journey || 'superachiever'; // Default to Superachiever
  
  // Set gradient styles based on user journey
  const gradientStyle = 
    primaryJourney === 'superachiever' 
      ? 'from-amber-500 to-yellow-500' // SAP tokens - Amber-Yellow gradients
      : primaryJourney === 'superachievers'
      ? 'from-slate-500 to-slate-700' // SCQ tokens - Slate gradients
      : 'from-zinc-400 to-zinc-600'; // Default/GEN tokens
  
  // Fetch user's streak data
  const { data: userStreak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Get today's day of the week to determine which events to highlight
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Wednesday (3) is SSA day, Tuesday (2) is PSP day
  const isSSADay = dayOfWeek === 3;
  const isPSPDay = dayOfWeek === 2;
  
  return (
    <div className="space-y-6 pb-8">
      {/* Header with personalized greeting and token balance */}
      <div className={`rounded-lg p-6 bg-gradient-to-r ${gradientStyle} text-white`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.display_name || 'User'}!</h1>
            <p className="text-white/80">
              {primaryJourney === 'superachiever' 
                ? 'Focus on your personal success journey today'
                : primaryJourney === 'superachievers'
                ? 'Connect with the community for collective transformation'
                : 'Build the ecosystem for a better future'}
            </p>
          </div>
          
          {/* Token balance display with Suspense */}
          <div className="w-full md:w-auto bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <Suspense fallback={<TokenBalanceSkeleton />}>
              <TokenBalanceServer userId={userId} />
            </Suspense>
          </div>
        </div>
      </div>
      
      {/* AI Insights and Streak System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Insights with predictions */}
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Personalized predictions for your journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<AIInsightsSkeleton />}>
              <AIInsightsServer userId={userId} />
            </Suspense>
          </CardContent>
        </Card>
        
        {/* Enhanced Streak System with Tesla's 3-6-9 bonuses */}
        <EnhancedStreakSystem userId={userId} initialStreak={userStreak} />
      </div>
      
      {/* Focus Mode and Feature Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Focus Mode with personalized recommendations */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Focus Mode</CardTitle>
              <CardDescription>
                {primaryJourney === 'superachiever'
                  ? 'Your personal success priorities'
                  : primaryJourney === 'superachievers'
                  ? 'Community engagement opportunities'
                  : 'Ecosystem development focus areas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<FocusModeSkeleton />}>
                <FocusModeServer userId={userId} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        
        {/* Feature Preview with unlock requirements */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Feature Unlocks</CardTitle>
              <CardDescription>Coming soon on your journey</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<FeaturePreviewSkeleton />}>
                <FeaturePreviewServer userId={userId} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Journey Map with experience phases */}
      <Card>
        <CardHeader>
          <CardTitle>Your Journey</CardTitle>
          <CardDescription>Track your progress from Degen to Regen</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<JourneyMapSkeleton />}>
            <JourneyMapServer userId={userId} />
          </Suspense>
        </CardContent>
      </Card>
      
      {/* Conditional content based on day of week and primary journey */}
      {isSSADay && (
        <Card className="border-emerald-200">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardTitle className="text-emerald-700 dark:text-emerald-400">Wednesday SSA Events</CardTitle>
            <CardDescription>Superachievers community events happening today</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <RealTimeSSALeaderboard userId={userId} />
          </CardContent>
        </Card>
      )}
      
      {isPSPDay && (
        <Card className="border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardTitle className="text-amber-700 dark:text-amber-400">Tuesday PSP Events</CardTitle>
            <CardDescription>Personal Success Puzzle events happening today</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* PSP Events content would go here */}
            <p className="text-center py-4 text-muted-foreground">
              Personal success events are available today. Check the events tab for details.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Activity Feed with recent events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <ActivityFeedServer userId={userId} limit={5} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
