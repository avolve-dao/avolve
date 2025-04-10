'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

// Import UI components
import { Container } from '@/components/ui/design-system';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { UnifiedNav } from '@/components/navigation/unified-nav';
import { TouchNavigation } from '@/components/mobile/touch-navigation';
import { GestureNavigation } from '@/components/mobile/gesture-navigation';
import { MobileDashboard } from '@/components/mobile/mobile-dashboard';
import { CustomizableDashboard } from '@/components/dashboard/customizable-dashboard';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { FocusMode } from '@/components/dashboard/focus-mode';
import { GuidedTour } from '@/components/onboarding/guided-tour';
import { QuickStartGuide } from '@/components/onboarding/quick-start-guide';
import { ToastListener } from '@/components/ui/enhanced-toast';
import { ProgressionCenter } from '@/components/notifications/progression-center';
import { PhaseBadge, PhaseProgress } from '@/components/ui/experience-phases';

export default function ImprovedDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userPhase, setUserPhase] = useState<string>('discovery');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Check authentication and fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push('/auth/login');
          return;
        }
        
        setUserId(session.user.id);
        
        // Fetch user's experience phase
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('experience_phase')
          .eq('user_id', session.user.id)
          .single();
        
        if (profileData) {
          setUserPhase(profileData.experience_phase || 'discovery');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, [supabase, router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  if (!userId) {
    return null;
  }
  
  return (
    <GestureNavigation userId={userId} currentPath="/dashboard">
      {/* Unified Navigation */}
      <UnifiedNav userId={userId} />
      
      {/* Mobile Navigation */}
      <TouchNavigation userId={userId} />
      
      {/* Toast Listener for Realtime Notifications */}
      <ToastListener userId={userId} />
      
      {/* Guided Tour for New Users */}
      <GuidedTour userId={userId} />
      
      {/* Mobile Dashboard (shown only on mobile) */}
      <MobileDashboard userId={userId} />
      
      {/* Desktop Dashboard */}
      <div className="hidden md:block">
        <Container maxWidth="xl" padding={6}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Breadcrumbs />
            </div>
            <div className="flex items-center space-x-2">
              <PhaseBadge 
                phase={userPhase} 
                showTooltip={true}
                userId={userId}
              />
              <ProgressionCenter userId={userId} />
            </div>
          </div>
          
          <PhaseProgress currentPhase={userPhase} className="mb-6" />
          
          <div className="grid grid-cols-3 gap-6">
            {/* Focus Mode - Left Column */}
            <div className="col-span-1 space-y-6">
              <FocusMode userId={userId} />
              <ActivityFeed userId={userId} limit={5} />
            </div>
            
            {/* Main Content - Middle and Right Columns */}
            <div className="col-span-2 space-y-6">
              <QuickStartGuide userId={userId} />
              <CustomizableDashboard userId={userId} />
            </div>
          </div>
        </Container>
      </div>
    </GestureNavigation>
  );
}
