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

// Import component files
import { TodayEventCard } from "@/components/dashboard/today-event-card";
import { ValueCard } from "@/components/dashboard/value-card";
import { MentorshipTeaser } from "@/components/dashboard/mentorship-teaser";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { NotificationBell } from "@/components/notifications/notification-bell";

// Import local components
import { LeaderboardSection } from "@/app/dashboard/components/leaderboard-section";
import { LockedFeatures } from "@/app/dashboard/components/locked-features";
import { DashboardWidgets } from "@/app/dashboard/components/dashboard-widgets";

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

  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-end p-4">
            <NotificationBell userId={userId} />
          </div>
          <AppNavbar />
          <div className="container mx-auto py-6 space-y-8">
            <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
            
            {/* SSA Banner */}
            <section className="relative overflow-hidden rounded-lg border border-blue-800 bg-gradient-to-r from-blue-950 to-indigo-950">
              <div className="absolute top-0 right-0 opacity-20">
                <Image 
                  src="/ssa-network.png" 
                  alt="SSA Network" 
                  width={300} 
                  height={200}
                  priority
                  className="object-cover"
                />
              </div>
              <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Superachievers Network</h2>
                  <p className="text-blue-200 max-w-md">Connect with like-minded individuals and contribute to our collective success.</p>
                </div>
                <div className="flex-shrink-0">
                  <Image 
                    src="/ssa-badge.png" 
                    alt="SSA Badge" 
                    width={80} 
                    height={80}
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </section>
            
            {/* Today's Event Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Today's Event</h2>
              {todayEvent ? (
                <TodayEventCard event={todayEvent} userId={userId} />
              ) : (
                <Card className="border-zinc-800 bg-zinc-950/50 p-6">
                  <p className="text-center text-zinc-400">No events available today. Check back later!</p>
                </Card>
              )}
            </section>
            
            {/* Analytics Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ValueCard userId={userId} />
                <MentorshipTeaser userId={userId} />
                <Card className="border-zinc-800 bg-zinc-950/50 p-4">
                  <h3 className="text-xl font-semibold mb-2">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Days</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Events Completed</span>
                      <span className="font-medium">18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tokens Earned</span>
                      <span className="font-medium">240 GEN</span>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
            
            {/* Leaderboard Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">SSA Leaderboard</h2>
              <Card className="border-zinc-800 bg-zinc-950/50 p-4">
                <Suspense fallback={<LeaderboardSkeleton />}>
                  <LeaderboardSection userId={userId} />
                </Suspense>
              </Card>
            </section>
            
            {/* Locked Features Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Locked Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Suspense fallback={<FeaturesSkeleton />}>
                  <LockedFeatures userId={userId} />
                </Suspense>
              </div>
            </section>
            
            {/* Dashboard Widgets Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
              <Suspense fallback={<WidgetsSkeleton />}>
                <DashboardWidgets userId={userId} />
              </Suspense>
            </section>
            
            {/* Feedback Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Your Feedback</h2>
              <FeedbackForm userId={userId} />
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

// Skeleton loaders for suspense boundaries
function TodayEventSkeleton() {
  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
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
        <Card key={i} className="border-zinc-800 bg-zinc-950/50">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ))}
    </>
  );
}

function WidgetsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array(3).fill(0).map((_, i) => (
        <Card key={i} className="border-zinc-800 bg-zinc-950/50">
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
