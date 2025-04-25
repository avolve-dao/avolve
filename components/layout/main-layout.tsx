import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
import ExperiencePhaseGuide from '@/components/onboarding/experience-phase-guide';
import DiscoveryTutorial from '@/components/onboarding/discovery-tutorial';
import Sidebar from '@/components/navigation/Sidebar';
import Header from '@/components/navigation/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MainLayoutProps {
  children: ReactNode;
  showPhaseGuide?: boolean;
}

export default function MainLayout({ children, showPhaseGuide = true }: MainLayoutProps) {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [session, setSession] = useState<any>(null);
  const {
    tokens,
    userBalances,
    transactions,
    balanceChanges,
    isLoading: tokensLoading,
    error: tokensError,
    fetchAllTokens,
    fetchUserBalances,
    fetchUserTransactions,
    transferTokens,
    spendGenTokens,
    addTokens,
    getTokenDetails,
    setSelectedToken,
    getTokenBalance,
    hasEnoughTokens,
    getTokenSupply,
    getToken,
    getUserToken,
    getTokenBalanceById,
    getAllTokenTypes,
    getUserTokenBalance,
    claimAchievementReward,
    trackActivity,
  } = useTokens();

  useEffect(() => {
    const fetchUserAndSession = async () => {
      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();
        setUser(currentUser ? { id: currentUser.id } : null);
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        setSession(currentSession || null);
      } catch (err) {
        setUser(null);
        setSession(null);
      }
    };
    fetchUserAndSession();
  }, [supabase]);

  const [experiencePhase, setExperiencePhase] = useState<string | null>(null);
  const [showDiscoveryTutorial, setShowDiscoveryTutorial] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Placeholder for phase logic: replace with actual logic as needed
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    // Example: Set phase based on balances or other user data
    setExperiencePhase('discovery');
    const hasCompletedTutorial = localStorage.getItem('avolve_tutorial_completed');
    if ('discovery' === 'discovery' && !hasCompletedTutorial) {
      setIsFirstVisit(true);
      setShowDiscoveryTutorial(true);
    }
    setIsLoading(false);
  }, [user]);

  const handleTutorialComplete = () => {
    setShowDiscoveryTutorial(false);
    localStorage.setItem('avolve_tutorial_completed', 'true');
    // Optionally: Track activity with your own analytics here
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
        <main className="flex-1">{children}</main>
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
            <DiscoveryTutorial onComplete={handleTutorialComplete} className="mt-4" />
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
