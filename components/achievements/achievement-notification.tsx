import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TrophyIcon, CoinsIcon } from 'lucide-react';
import { Database } from '@/lib/database.types';

// Use the same type as dashboard for consistency
type AchievementCategory = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame' | 'special';
type Achievement = Database['public']['Tables']['achievements']['Row'];
type UserAchievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory | string;
  reward_type: string;
  claimed_at?: string | null;
  earned_at?: string | null;
  reward_amount: number;
  reward_token_symbol: string;
};

export function AchievementNotification({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = useSupabase();
  const { claimAchievementReward, trackActivity } = useTokens();
  
  const [displayedAchievement, setDisplayedAchievement] = useState<UserAchievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (!supabase?.auth?.getUser) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [supabase]);

  const fetchAchievements = useCallback(async () => {
    try {
      const { data: userAchievements } = await supabase.rpc('get_user_achievements', {
        p_user_id: user?.id,
      });
      if (userAchievements) {
        const normalized: UserAchievement[] = userAchievements.map((a: Achievement) => {
          const meta = (a.data && typeof a.data === 'object' && !Array.isArray(a.data))
            ? a.data as Record<string, any>
            : {};
          return {
            id: a.id,
            title: meta.title ?? '',
            description: meta.description ?? '',
            category: meta.category ?? 'personal',
            reward_type: meta.reward_type ?? '',
            claimed_at: meta.claimed_at ?? null,
            earned_at: meta.earned_at ?? null,
            reward_amount: meta.reward_amount ?? 0,
            reward_token_symbol: meta.reward_token_symbol ?? ''
          };
        });
        const unclaimed = normalized.find((a) => !a.reward_token_symbol);
        if (unclaimed && !displayedAchievement) {
          setDisplayedAchievement(unclaimed);
          setIsVisible(true);
          if (trackActivity) {
            await trackActivity('view_achievement_notification', 'notification', unclaimed.id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [user, trackActivity, displayedAchievement, supabase]);

  useEffect(() => {
    if (!user) return;
    fetchAchievements();
  }, [user, supabase, fetchAchievements]);

  const handleClaim = async (achievementId: string) => {
    if (!user || !displayedAchievement) return;
    setClaimingId(achievementId);
    try {
      await claimAchievementReward(achievementId, user.id);
      // Refresh achievements after claiming
      await fetchAchievements();
      setIsVisible(false);
      setDisplayedAchievement(null);
    } catch (error) {
      console.error('Error claiming achievement reward:', error);
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
