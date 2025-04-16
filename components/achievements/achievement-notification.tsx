import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TrophyIcon, CoinsIcon } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: string;
  reward_type: string;
  reward_amount?: number;
  reward_token_symbol?: string;
  earned_at?: string;
};

export function AchievementNotification({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = useSupabase() as any;
  const { claimAchievementReward, trackActivity } = useTokens();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [displayedAchievement, setDisplayedAchievement] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        const { data: userAchievements } = await supabase.rpc('get_user_achievements', {
          p_user_id: user.id,
        });

        if (userAchievements) {
          setAchievements(userAchievements);

          // Check for unclaimed achievements
          const unclaimed = userAchievements.find((a: Achievement) => !a.reward_token_symbol);
          if (unclaimed && !displayedAchievement) {
            setDisplayedAchievement(unclaimed);
            setIsVisible(true);

            // Track this view for analytics
            await trackActivity('view_achievement_notification', 'notification', unclaimed.id);
          }
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };

    fetchAchievements();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        fetchAchievements();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabase, trackActivity, displayedAchievement]);

  const handleClaim = async (achievementId: string) => {
    setClaimingId(achievementId);
    try {
      const success = await claimAchievementReward(achievementId);
      if (success) {
        // Track this action for analytics
        await trackActivity('claim_achievement_notification', 'notification', achievementId);

        // Update achievements state
        const updatedAchievements = achievements.map((a) =>
          a.id === achievementId ? { ...a, reward_token_symbol: a.reward_token_symbol || 'Claimed' } : a
        );
        setAchievements(updatedAchievements);
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
    } finally {
      setClaimingId(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {isVisible && displayedAchievement && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-6 max-w-xs border border-amber-200"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-100">
                <TrophyIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">Achievement Unlocked!</h3>
                <p className="font-medium text-gray-900 mt-1">{displayedAchievement.title}</p>
                <p className="text-gray-600 mt-1 text-sm">{displayedAchievement.description}</p>

                {displayedAchievement.reward_amount && displayedAchievement.reward_amount > 0 && (
                  <div className="mt-3 flex items-center gap-2 bg-blue-50 p-2 rounded-md">
                    <CoinsIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">
                      {displayedAchievement.reward_amount} {displayedAchievement.reward_token_symbol}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {displayedAchievement.reward_amount && displayedAchievement.reward_amount > 0 && !displayedAchievement.reward_token_symbol && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                      onClick={() => handleClaim(displayedAchievement.id)}
                      disabled={claimingId === displayedAchievement.id}
                    >
                      {claimingId === displayedAchievement.id ? (
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Claiming...
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CoinsIcon className="h-4 w-4" />
                          Claim Reward
                        </div>
                      )}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleDismiss}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
