import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
import ExperiencePhaseGuide from '@/components/onboarding/experience-phase-guide';
import DiscoveryTutorial from '@/components/onboarding/discovery-tutorial';
import Sidebar from '@/components/navigation/sidebar';
import Header from '@/components/navigation/header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MainLayoutProps {
  children: ReactNode;
  showPhaseGuide?: boolean;
}

export default function MainLayout({ 
  children,
  showPhaseGuide = true 
}: MainLayoutProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const session = supabase.session || supabase?.auth?.session || null;
  const user = supabase.user || supabase?.auth?.user || null;
  const { getUserExperiencePhase, trackActivity } = useTokens();
  
  const [experiencePhase, setExperiencePhase] = useState<string | null>(null);
  const [showDiscoveryTutorial, setShowDiscoveryTutorial] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkUserPhase = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const phase = await getUserExperiencePhase();
        setExperiencePhase(phase);
        const hasCompletedTutorial = localStorage.getItem('avolve_tutorial_completed');
        if (phase === 'discovery' && !hasCompletedTutorial) {
          setIsFirstVisit(true);
          setShowDiscoveryTutorial(true);
        }
        await trackActivity('page_view', 'page', router.pathname);
      } catch (error) {
        console.error('Error checking user phase:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      checkUserPhase();
    } else {
      setIsLoading(false);
    }
  }, [user, getUserExperiencePhase, trackActivity, router.pathname]);

  const handleTutorialComplete = () => {
    setShowDiscoveryTutorial(false);
    localStorage.setItem('avolve_tutorial_completed', 'true');
    trackActivity('tutorial_completed', 'tutorial', 'discovery');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {showPhaseGuide && experiencePhase && (
            <div className="mb-6">
              <ExperiencePhaseGuide />
            </div>
          )}
          {children}
        </main>
        <Dialog open={showDiscoveryTutorial} onOpenChange={setShowDiscoveryTutorial}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Welcome to Avolve</DialogTitle>
            </DialogHeader>
            <DiscoveryTutorial 
              onComplete={handleTutorialComplete} 
              className="mt-4"
            />
            {!isFirstVisit && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setShowDiscoveryTutorial(false)}>
                  Skip Tutorial
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
