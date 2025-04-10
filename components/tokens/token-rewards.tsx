'use client';

/**
 * Token Rewards Component
 * 
 * Displays available and upcoming token rewards with interactive claiming
 * functionality and visual feedback.
 * Copyright 2025 Avolve DAO. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Gift, 
  Calendar, 
  Trophy, 
  Clock, 
  CheckCircle, 
  LockIcon, 
  Sparkles,
  Flame,
  Target
} from 'lucide-react';

// Types
import type { Database } from '@/types/supabase';
import type { TokenSymbol } from '@/types/supabase';

interface TokenRewardsProps {
  userId: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  tokenSymbol: TokenSymbol;
  amount: number;
  type: 'daily' | 'streak' | 'achievement' | 'event';
  status: 'available' | 'claimed' | 'upcoming' | 'locked';
  expiresAt?: string;
  progress?: number;
  progressMax?: number;
  unlockRequirement?: string;
}

export function TokenRewards({ userId }: TokenRewardsProps) {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchRewards() {
      setIsLoading(true);
      
      try {
        // Fetch daily claims
        const { data: dailyClaims, error: dailyError } = await supabase
          .from('daily_claims')
          .select('*')
          .eq('user_id', userId)
          .gte('expires_at', new Date().toISOString());
        
        if (dailyError) {
          console.error('Error fetching daily claims:', dailyError);
        }
        
        // Fetch streak data
        const { data: streakData, error: streakError } = await supabase
          .from('user_token_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (streakError && streakError.code !== 'PGRST116') {
          console.error('Error fetching streak data:', streakError);
        }
        
        // Fetch achievement progress
        const { data: achievements, error: achievementError } = await supabase
          .from('user_achievements')
          .select(`
            id,
            achievement_id,
            progress,
            completed,
            claimed,
            achievements (
              id,
              title,
              description,
              token_id,
              token_amount,
              requirement,
              requirement_value,
              tokens (symbol)
            )
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (achievementError) {
          console.error('Error fetching achievements:', achievementError);
        }
        
        // Fetch upcoming events with rewards
        const { data: events, error: eventError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            event_date,
            token_rewards (
              token_id,
              amount,
              tokens (symbol)
            )
          `)
          .gt('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(3);
        
        if (eventError) {
          console.error('Error fetching events:', eventError);
        }
        
        // Process and combine rewards
        const allRewards: Reward[] = [];
        
        // Add daily claims
        dailyClaims?.forEach(claim => {
          allRewards.push({
            id: `daily-${claim.id}`,
            title: 'Daily Token Claim',
            description: 'Claim your daily tokens to maintain your streak',
            tokenSymbol: claim.token_symbol as TokenSymbol,
            amount: claim.amount,
            type: 'daily',
            status: claim.claimed ? 'claimed' : 'available',
            expiresAt: claim.expires_at
          });
        });
        
        // Add streak rewards
        if (streakData) {
          const currentStreak = streakData.current_daily_streak;
          const nextMilestone = Math.ceil(currentStreak / 3) * 3;
          const progress = currentStreak % 3 === 0 ? 3 : currentStreak % 3;
          
          // Only add if we haven't hit a milestone or if the milestone reward is unclaimed
          if (currentStreak % 3 !== 0 || (currentStreak % 3 === 0 && !streakData.last_streak_reward_claimed)) {
            allRewards.push({
              id: `streak-${currentStreak}-${nextMilestone}`,
              title: `${nextMilestone}-Day Streak Reward`,
              description: `Maintain your daily streak to earn a ${getStreakBonus(nextMilestone)}x token bonus`,
              tokenSymbol: 'GEN',
              amount: 50 * getStreakBonus(nextMilestone),
              type: 'streak',
              status: currentStreak % 3 === 0 ? 'available' : 'upcoming',
              progress: progress,
              progressMax: 3
            });
          }
        }
        
        // Add achievement rewards
        achievements?.forEach(achievement => {
          const achievementData = achievement.achievements as any;
          if (achievementData) {
            allRewards.push({
              id: `achievement-${achievement.id}`,
              title: achievementData.title,
              description: achievementData.description,
              tokenSymbol: achievementData.tokens.symbol as TokenSymbol,
              amount: achievementData.token_amount,
              type: 'achievement',
              status: achievement.completed 
                ? (achievement.claimed ? 'claimed' : 'available')
                : 'locked',
              progress: achievement.progress,
              progressMax: achievementData.requirement_value,
              unlockRequirement: achievementData.requirement
            });
          }
        });
        
        // Add event rewards
        events?.forEach(event => {
          const tokenRewards = event.token_rewards as any[];
          if (tokenRewards && tokenRewards.length > 0) {
            tokenRewards.forEach(reward => {
              allRewards.push({
                id: `event-${event.id}-${reward.token_id}`,
                title: `Event: ${event.title}`,
                description: event.description,
                tokenSymbol: reward.tokens.symbol as TokenSymbol,
                amount: reward.amount,
                type: 'event',
                status: 'upcoming',
                expiresAt: event.event_date
              });
            });
          }
        });
        
        // Sort rewards by status (available first, then upcoming, then locked, then claimed)
        const statusOrder = { 'available': 0, 'upcoming': 1, 'locked': 2, 'claimed': 3 };
        allRewards.sort((a, b) => {
          return statusOrder[a.status] - statusOrder[b.status];
        });
        
        setRewards(allRewards);
      } catch (error) {
        console.error('Error in fetchRewards:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRewards();
    
    // Set up real-time subscription for reward updates
    const channel = supabase.channel('reward-updates');
    channel
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'daily_claims',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchRewards();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_achievements',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchRewards();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_token_streaks',
        filter: `user_id=eq.${userId}`
      }, () => {
        fetchRewards();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);
  
  // Handle reward claim
  async function claimReward(reward: Reward) {
    setClaimingId(reward.id);
    
    try {
      let success = false;
      let message = '';
      
      if (reward.type === 'daily') {
        const claimId = reward.id.replace('daily-', '');
        const { error } = await supabase.rpc('claim_daily_token', {
          claim_id_param: claimId,
          user_id_param: userId
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        success = true;
        message = `Claimed ${reward.amount} ${reward.tokenSymbol} tokens!`;
      } 
      else if (reward.type === 'streak') {
        const { error } = await supabase.rpc('claim_streak_reward', {
          user_id_param: userId
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        success = true;
        message = `Streak bonus of ${reward.amount} ${reward.tokenSymbol} claimed!`;
      }
      else if (reward.type === 'achievement') {
        const achievementId = reward.id.replace('achievement-', '');
        const { error } = await supabase.rpc('claim_achievement_reward', {
          user_achievement_id_param: achievementId,
          user_id_param: userId
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        success = true;
        message = `Achievement reward of ${reward.amount} ${reward.tokenSymbol} claimed!`;
      }
      
      if (success) {
        toast({
          title: "Reward Claimed!",
          description: message,
          variant: "default"
        });
        
        // Update the local state to show claimed
        setRewards(prev => prev.map(r => 
          r.id === reward.id ? { ...r, status: 'claimed' } : r
        ));
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast({
        title: "Claim Failed",
        description: `There was an error claiming your reward. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setClaimingId(null);
    }
  }
  
  // Get streak bonus multiplier
  function getStreakBonus(streak: number): number {
    if (streak >= 12) return 2.2;
    if (streak >= 9) return 1.9;
    if (streak >= 6) return 1.6;
    if (streak >= 3) return 1.3;
    return 1.0;
  }
  
  // Get icon for reward type
  function getRewardIcon(type: string) {
    switch (type) {
      case 'daily': return <Calendar className="w-5 h-5" />;
      case 'streak': return <Flame className="w-5 h-5" />;
      case 'achievement': return <Trophy className="w-5 h-5" />;
      case 'event': return <Target className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  }
  
  // Get color for reward type
  function getRewardColor(type: string) {
    switch (type) {
      case 'daily': return 'blue';
      case 'streak': return 'amber';
      case 'achievement': return 'purple';
      case 'event': return 'emerald';
      default: return 'zinc';
    }
  }
  
  // Format time until expiration
  function formatTimeUntil(dateString: string) {
    const now = new Date();
    const expirationDate = new Date(dateString);
    const diffMs = expirationDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 24) {
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    
    return `${diffMins}m`;
  }
  
  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Gift className="w-5 h-5 text-amber-400 mr-2" />
          Token Rewards
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-zinc-900/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : rewards.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {rewards.slice(0, 5).map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative border border-${getRewardColor(reward.type)}-800/50 bg-${getRewardColor(reward.type)}-950/20 rounded-lg p-4 transition-all duration-300 hover:bg-${getRewardColor(reward.type)}-950/30`}
                >
                  {/* Status badge */}
                  <Badge 
                    className={`absolute top-3 right-3 ${
                      reward.status === 'available' ? 'bg-green-600/20 text-green-400 border-green-800/50' :
                      reward.status === 'upcoming' ? 'bg-blue-600/20 text-blue-400 border-blue-800/50' :
                      reward.status === 'locked' ? 'bg-zinc-600/20 text-zinc-400 border-zinc-800/50' :
                      'bg-amber-600/20 text-amber-400 border-amber-800/50'
                    }`}
                  >
                    {reward.status === 'available' ? 'Available' :
                     reward.status === 'upcoming' ? 'Upcoming' :
                     reward.status === 'locked' ? 'Locked' :
                     'Claimed'}
                  </Badge>
                  
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${getRewardColor(reward.type)}-900/50 flex items-center justify-center mr-3`}>
                      {getRewardIcon(reward.type)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium pr-20">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                      
                      {/* Progress bar for achievements and streaks */}
                      {(reward.progress !== undefined && reward.progressMax !== undefined) && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{reward.progress} / {reward.progressMax}</span>
                            <span>{Math.round((reward.progress / reward.progressMax) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(reward.progress / reward.progressMax) * 100} 
                            className={`h-2 bg-${getRewardColor(reward.type)}-950`}
                          />
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Sparkles className={`w-4 h-4 text-${getRewardColor(reward.type)}-400 mr-1`} />
                          <span className="font-medium">{reward.amount} {reward.tokenSymbol}</span>
                        </div>
                        
                        {reward.expiresAt && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeUntil(reward.expiresAt)}
                          </div>
                        )}
                        
                        {reward.status === 'available' && (
                          <Button 
                            size="sm" 
                            onClick={() => claimReward(reward)}
                            disabled={claimingId === reward.id}
                            className={`ml-2 bg-${getRewardColor(reward.type)}-900/50 hover:bg-${getRewardColor(reward.type)}-900/70 text-${getRewardColor(reward.type)}-400`}
                          >
                            {claimingId === reward.id ? (
                              <span className="flex items-center">
                                <span className="animate-spin mr-1">⟳</span> Claiming
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" /> Claim
                              </span>
                            )}
                          </Button>
                        )}
                        
                        {reward.status === 'locked' && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <LockIcon className="w-3 h-3 mr-1" />
                            {reward.unlockRequirement}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {rewards.length > 5 && (
              <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                View All Rewards ({rewards.length})
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No rewards available right now</p>
            <p className="text-sm mt-1">Complete activities to earn token rewards</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
