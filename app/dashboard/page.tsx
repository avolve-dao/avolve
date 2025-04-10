"use server";

import { Suspense } from "react";
import { AppNavbar } from "@/components/app-navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createServerComponentClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Sparkles, Zap, Award, TrendingUp, Brain } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { ToastProvider } from "@/components/ui/toast";

// Import component files
import { TodayEventCard } from "@/components/dashboard/today-event-card";
import { ValueCard } from "@/components/dashboard/value-card";
import { MentorshipTeaser } from "@/components/dashboard/mentorship-teaser";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { NotificationBell } from "@/components/notifications/notification-bell";

// Import token components
import { TokenVisualization } from "@/components/tokens/token-visualization";
import { TokenRewards } from "@/components/tokens/token-rewards";

// Import local components
import { LeaderboardSection } from "@/app/dashboard/components/leaderboard-section";
import { LockedFeatures } from "@/app/dashboard/components/locked-features";
import { DashboardWidgets } from "@/app/dashboard/components/dashboard-widgets";

// Import AI and journey components
import { AIInsightsServer } from "@/components/dashboard/ai-insights/server";
import { JourneyMapServer } from "@/components/dashboard/journey-map/server";
import { JourneyProgress } from "@/components/dashboard/journey-progress";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";

export default async function DashboardPage() {
  const supabase = createServerComponentClient();
  
  // Get user session on the server
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  // Redirect if not authenticated
  if (!userId) {
    redirect('/auth/login');
  }
  
  // Fetch optimized_events server-side for better performance
  const { data: events } = await supabase
    .from('optimized_events')
    .select('*')
    .order('event_date', { ascending: true })
    .limit(1);
    
  const todayEvent = events?.[0] || null;

  // Fetch user's regen analytics data
  const { data: regenData } = await supabase
    .rpc('get_user_regen_analytics', { user_id_param: userId });
  
  // Determine pillar theme based on user's journey
  const pillarTheme = getPillarTheme(regenData?.regen_level || 1, regenData?.journey_pillar || 'superachiever');

  return (
    <ThemeProvider>
      <SidebarProvider>
        <ToastProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center justify-end p-4">
              <NotificationBell userId={userId} />
            </div>
            <AppNavbar />
            <div className="container mx-auto py-6 space-y-8">
              {/* Journey Banner with dynamic theme based on user's pillar */}
              <section className={`relative overflow-hidden rounded-xl border shadow-lg transform transition-all duration-300 hover:scale-[1.01] ${pillarTheme.borderColor} ${pillarTheme.bgGradient}`}>
                <div className="absolute top-0 right-0 opacity-20 animate-pulse-slow">
                  <Image 
                    src={pillarTheme.backgroundImage} 
                    alt={pillarTheme.name} 
                    width={300} 
                    height={200}
                    priority
                    className="object-cover"
                  />
                </div>
                <div className="relative z-10 p-6 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Sparkles className={`w-5 h-5 mr-2 ${pillarTheme.iconColor}`} />
                      <h2 className="text-2xl font-bold text-white">{pillarTheme.name}</h2>
                    </div>
                    <p className={`${pillarTheme.textColor} max-w-md text-balance`}>
                      {pillarTheme.description}
                    </p>
                    <div className="flex items-center mt-2 text-sm">
                      <div className={`flex items-center ${pillarTheme.statColor} mr-4`}>
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>Level {regenData?.regen_level || 1}</span>
                      </div>
                      <div className={`flex items-center ${pillarTheme.statColor}`}>
                        <Award className="w-4 h-4 mr-1" />
                        <span>{regenData?.milestone_count || 0} Milestones</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 relative">
                    <div className={`absolute -inset-1 ${pillarTheme.glowEffect} blur-md opacity-75 rounded-full`}></div>
                    <Image 
                      src={pillarTheme.badgeImage} 
                      alt={`${pillarTheme.name} Badge`} 
                      width={80} 
                      height={80}
                      priority
                      className="relative object-contain animate-float"
                    />
                  </div>
                </div>
              </section>
              
              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Journey Progress */}
                <div className="md:col-span-2 space-y-6">
                  <Suspense fallback={<JourneyProgressSkeleton />}>
                    <JourneyProgress userId={userId} />
                  </Suspense>
                  
                  <Suspense fallback={<JourneyMapSkeleton />}>
                    <JourneyMapServer userId={userId} />
                  </Suspense>
                  
                  <Suspense fallback={<AIInsightsSkeleton />}>
                    <AIInsightsServer userId={userId} />
                  </Suspense>
                </div>
                
                {/* Right Column: AI Recommendations and Today's Event */}
                <div className="space-y-6">
                  <Suspense fallback={<RecommendationsSkeleton />}>
                    <AIRecommendations userId={userId} />
                  </Suspense>
                  
                  <Suspense fallback={<TodayEventSkeleton />}>
                    {todayEvent && <TodayEventCard event={todayEvent} userId={userId} />}
                  </Suspense>
                  
                  <Suspense fallback={<LeaderboardSkeleton />}>
                    <LeaderboardSection userId={userId} />
                  </Suspense>
                </div>
              </div>
              
              {/* Locked Features Section */}
              <h3 className="text-xl font-semibold mt-8 mb-4">Unlock Your Potential</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Suspense fallback={<FeaturesSkeleton />}>
                  <LockedFeatures userId={userId} />
                </Suspense>
              </div>
              
              {/* Value Widgets */}
              <h3 className="text-xl font-semibold mt-8 mb-4">Maximize Your Journey</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Suspense fallback={<WidgetsSkeleton />}>
                  <DashboardWidgets userId={userId} />
                </Suspense>
              </div>
              
              {/* Token Ecosystem Section */}
              <h3 className="text-xl font-semibold mt-8 mb-4">Your Token Ecosystem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Token Visualization */}
                <div className="md:col-span-2">
                  <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>}>
                    <TokenVisualization userId={userId} />
                  </Suspense>
                </div>
                
                {/* Token Rewards */}
                <div>
                  <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>}>
                    <TokenRewards userId={userId} />
                  </Suspense>
                </div>
              </div>
              
              {/* Feedback Form */}
              <div className="mt-12 border-t border-zinc-800 pt-8">
                <FeedbackForm userId={userId} />
              </div>
            </div>
          </SidebarInset>
        </ToastProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

// Helper function to determine pillar theme based on regen level and journey pillar
function getPillarTheme(regenLevel: number, journeyPillar: string) {
  let theme;
  
  // Determine base theme by pillar
  if (journeyPillar === 'superachiever') {
    theme = {
      name: 'Superachiever Journey',
      description: 'Your personal growth path focused on developing individual excellence and mastery.',
      bgGradient: 'bg-gradient-to-br from-amber-400 to-yellow-600',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-100',
      iconColor: 'text-amber-300',
      statColor: 'text-amber-200',
      glowEffect: 'bg-amber-500',
      backgroundImage: '/superachiever-bg.png',
      badgeImage: '/superachiever-badge.png'
    };
  } else if (journeyPillar === 'superachievers') {
    theme = {
      name: 'Superachievers Journey',
      description: 'Your collective growth path focused on community collaboration and shared advancement.',
      bgGradient: 'bg-gradient-to-br from-emerald-400 to-green-600',
      borderColor: 'border-emerald-500',
      textColor: 'text-emerald-100',
      iconColor: 'text-emerald-300',
      statColor: 'text-emerald-200',
      glowEffect: 'bg-emerald-500',
      backgroundImage: '/superachievers-bg.png',
      badgeImage: '/superachievers-badge.png'
    };
  } else {
    theme = {
      name: 'Supercivilization Journey',
      description: 'Your ecosystem growth path focused on building regenerative systems and infrastructure.',
      bgGradient: 'bg-gradient-to-br from-blue-400 to-indigo-600',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-100',
      iconColor: 'text-blue-300',
      statColor: 'text-blue-200',
      glowEffect: 'bg-blue-500',
      backgroundImage: '/supercivilization-bg.png',
      badgeImage: '/supercivilization-badge.png'
    };
  }
  
  // Enhance theme based on regen level
  if (regenLevel >= 4) {
    theme.bgGradient = theme.bgGradient.replace('from-', 'from-opacity-80 from-');
    theme.bgGradient += ' bg-noise';
    theme.glowEffect += ' animate-pulse';
  }
  
  return theme;
}

// Skeleton loaders for suspense boundaries
function JourneyProgressSkeleton() {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50 overflow-hidden">
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      </div>
      <div className="animate-pulse bg-gradient-to-r from-zinc-900 to-zinc-950 h-1"></div>
    </Card>
  );
}

function RecommendationsSkeleton() {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50 overflow-hidden">
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="animate-pulse bg-gradient-to-r from-zinc-900 to-zinc-950 h-1"></div>
    </Card>
  );
}

function JourneyMapSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-md" />
    </div>
  );
}

function AIInsightsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    </div>
  );
}

function TodayEventSkeleton() {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50 overflow-hidden">
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="animate-pulse bg-gradient-to-r from-zinc-900 to-zinc-950 h-1"></div>
    </Card>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2 border-b border-zinc-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

function FeaturesSkeleton() {
  return (
    <>
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="border-zinc-800 bg-zinc-950/50 overflow-hidden">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="animate-pulse bg-gradient-to-r from-zinc-900 to-zinc-950 h-1"></div>
        </Card>
      ))}
    </>
  );
}

function WidgetsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="border-zinc-800 bg-zinc-950/50 overflow-hidden">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="animate-pulse bg-gradient-to-r from-zinc-900 to-zinc-950 h-1"></div>
        </Card>
      ))}
    </div>
  );
}
