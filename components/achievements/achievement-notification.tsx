import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useToken } from '@/lib/token/useToken';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrophyIcon, 
  CoinsIcon, 
  CheckCircleIcon,
  XIcon
} from 'lucide-react';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  category: string;
  reward_type: string;
  reward_amount: number;
  reward_token_symbol: string;
  earned_at: string;
  claimed_at: string | null;
};

export default function AchievementNotificationProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = useSupabase();
  const { claimAchievementReward, trackActivity } = useToken();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [open, setOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  // Listen for new achievements
  useEffect(() => {
    if (!user?.id) return;
    
    // Initial fetch of unclaimed achievements
    const fetchUnclaimed = async () => {
      try {
        const { data } = await supabase
          .rpc('get_user_achievements', { p_user_id: user.id })
          .eq('claimed_at', null);
        
        if (data && data.length > 0) {
          setAchievements(data);
          setCurrentAchievement(data[0]);
          setOpen(true);
        }
      } catch (error) {
        console.error('Error fetching unclaimed achievements:', error);
      }
    };
    
    fetchUnclaimed();
    
    // Subscribe to realtime updates for new achievements
    const achievementsChannel = supabase
      .channel('achievement_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newAchievement = payload.new as Achievement;
          
          // Only show notification for unclaimed achievements
          if (!newAchievement.claimed_at) {
            setAchievements(prev => [...prev, newAchievement]);
            
            // If no achievement is currently showing, show this one
            if (!currentAchievement) {
              setCurrentAchievement(newAchievement);
              setOpen(true);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(achievementsChannel);
    };
  }, [supabase, user?.id]);
  
  // Handle claiming achievement reward
  const handleClaim = async () => {
    if (!currentAchievement) return;
    
    try {
      // Claim the reward
      const success = await claimAchievementReward(currentAchievement.id);
      
      if (success) {
        // Track this action for analytics
        await trackActivity('claim_achievement', 'achievement', currentAchievement.id, {
          achievement_title: currentAchievement.title,
          reward_amount: currentAchievement.reward_amount,
          reward_token: currentAchievement.reward_token_symbol
        });
        
        // Remove from list and close
        setAchievements(prev => prev.filter(a => a.id !== currentAchievement.id));
        setOpen(false);
        
        // Show next achievement if any
        setTimeout(() => {
          if (achievements.length > 1) {
            setCurrentAchievement(achievements.find(a => a.id !== currentAchievement?.id) || null);
            setOpen(true);
          } else {
            setCurrentAchievement(null);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error claiming achievement reward:', error);
    }
  };
  
  // Handle dismissing notification
  const handleDismiss = () => {
    setOpen(false);
    
    // Show next achievement if any
    setTimeout(() => {
      if (achievements.length > 1) {
        setCurrentAchievement(achievements.find(a => a.id !== currentAchievement?.id) || null);
        setOpen(true);
      } else {
        setCurrentAchievement(null);
      }
    }, 500);
  };
  
  return (
    <ToastProvider>
      {children}
      {currentAchievement && (
        <Toast
          open={open}
          onOpenChange={setOpen}
          className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-5 w-5" />
                <ToastTitle className="text-lg font-bold">Achievement Unlocked!</ToastTitle>
              </div>
              <ToastClose asChild>
                <button className="text-white/80 hover:text-white">
                  <XIcon className="h-4 w-4" />
                </button>
              </ToastClose>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <TrophyIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{currentAchievement.title}</h3>
                <ToastDescription className="text-gray-600 mt-1">
                  {currentAchievement.description}
                </ToastDescription>
                
                <div className="mt-3 flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-700 border-none">
                    {currentAchievement.category}
                  </Badge>
                  {currentAchievement.reward_amount > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 border-none flex items-center gap-1">
                      <CoinsIcon className="h-3 w-3" />
                      {currentAchievement.reward_amount} {currentAchievement.reward_token_symbol}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleDismiss}>
                Dismiss
              </Button>
              {currentAchievement.reward_amount > 0 && !currentAchievement.claimed_at && (
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                  size="sm"
                  onClick={handleClaim}
                >
                  <CoinsIcon className="h-4 w-4 mr-1" />
                  Claim Reward
                </Button>
              )}
            </div>
          </div>
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
