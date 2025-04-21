'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, Award, Zap, TrendingUp, Brain, Calendar, Clock, Trophy, Gift, Star, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

// Types
import type { Database } from '@/types/supabase';

interface JourneyProgressProps {
  userId: string;
}

export function JourneyProgress({ userId }: JourneyProgressProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [regenData, setRegenData] = useState<any>(null);
  const [streakData, setStreakData] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTokens, setRecentTokens] = useState<any[]>([]);
  
  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      
      try {
        // Fetch regen analytics data
        const { data: regenAnalytics } = await supabase
          .rpc('get_user_regen_analytics', { user_id_param: userId });
        
        if (regenAnalytics) {
          setRegenData(regenAnalytics);
          
          // Calculate progress to next level
          if (regenAnalytics.next_level_threshold) {
            const currentScore = regenAnalytics.regen_score;
            const prevThreshold = getThresholdForLevel(regenAnalytics.regen_level);
            const nextThreshold = regenAnalytics.next_level_threshold;
            const levelRange = nextThreshold - prevThreshold;
            const progress = ((currentScore - prevThreshold) / levelRange) * 100;
            setProgressPercent(Math.min(Math.max(progress, 0), 100));
          }
        }
        
        // Fetch streak data
        const { data: streaks } = await supabase
          .from('user_token_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (streaks) {
          setStreakData(streaks);
          
          // Show confetti for Tesla's 3-6-9 streaks
          const currentStreak = streaks.current_daily_streak;
          if (currentStreak % 3 === 0 && currentStreak > 0) {
            setShowConfetti(true);
            triggerConfetti();
          }
        }
        
        // Fetch recent events
        const { data: events } = await supabase
          .from('event_completions')
          .select('*, events(*)')
          .eq('user_id', userId)
          .order('completion_date', { ascending: false })
          .limit(5);
        
        if (events) {
          setRecentEvents(events);
        }
        
        // Fetch token balances
        const { data: balances } = await supabase
          .from('user_balances')
          .select('token_id, balance')
          .eq('user_id', userId);
        
        // Fetch token metadata
        const { data: tokens } = await supabase
          .from('tokens')
          .select('id, symbol, name, token_type');
        
        if (balances && tokens) {
          const balanceMap: Record<string, number> = {};
          balances.forEach(balance => {
            const token = tokens.find(t => t.id === balance.token_id);
            if (token) {
              balanceMap[token.symbol] = balance.balance;
            }
          });
          setTokenBalances(balanceMap);
        }
        
        // Fetch recent token transactions
        const { data: transactions } = await supabase
          .from('token_transactions')
          .select('*, tokens(*)')
          .eq('to_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (transactions) {
          setRecentTokens(transactions);
        }
      } catch (error) {
        console.error('Error fetching journey data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
    
    // Set up real-time subscriptions
    const regenChannel = supabase.channel('regen-progress');
    regenChannel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_completions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Update recent events
        setRecentEvents(prev => {
          const newEvent = payload.new as any;
          return [newEvent, ...prev].slice(0, 5);
        });
        
        // Show toast notification
        toast({
          title: "Event Completed!",
          description: "Your progress has been updated.",
          variant: "default"
        });
        
        // Refresh regen data
        fetchRegenData();
      })
      .subscribe();
    
    const tokenChannel = supabase.channel('token-updates');
    tokenChannel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'token_transactions',
        filter: `to_user_id=eq.${userId}`
      }, (payload) => {
        // Update token balances
        fetchTokenBalances();
        
        // Update recent tokens
        const newToken = payload.new as any;
        setRecentTokens(prev => [newToken, ...prev].slice(0, 3));
        
        // Show toast notification
        toast({
          title: "Tokens Received!",
          description: `+${newToken.amount} tokens added to your wallet.`,
          variant: "default"
        });
      })
      .subscribe();
    
    const streakChannel = supabase.channel('streak-updates');
    streakChannel
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_token_streaks',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Update streak data
        fetchStreakData();
        
        const newStreak = (payload.new as any).current_daily_streak;
        const oldStreak = (payload.old as any).current_daily_streak;
        
        // Check if streak milestone reached
        if (newStreak % 3 === 0 && newStreak > oldStreak) {
          setShowConfetti(true);
          triggerConfetti();
          
          // Show toast notification
          toast({
            title: "Streak Milestone!",
            description: `${newStreak} day streak achieved! ${getStreakBonus(newStreak)}x bonus activated.`,
            variant: "default"
          });
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(regenChannel);
      supabase.removeChannel(tokenChannel);
      supabase.removeChannel(streakChannel);
    };
  }, [userId, supabase, toast]);
  
  // Helper functions to fetch updated data
  async function fetchRegenData() {
    const { data: regenAnalytics } = await supabase
      .rpc('get_user_regen_analytics', { user_id_param: userId });
    
    if (regenAnalytics) {
      setRegenData(regenAnalytics);
      
      // Calculate progress to next level
      if (regenAnalytics.next_level_threshold) {
        const currentScore = regenAnalytics.regen_score;
        const prevThreshold = getThresholdForLevel(regenAnalytics.regen_level);
        const nextThreshold = regenAnalytics.next_level_threshold;
        const levelRange = nextThreshold - prevThreshold;
        const progress = ((currentScore - prevThreshold) / levelRange) * 100;
        setProgressPercent(Math.min(Math.max(progress, 0), 100));
      }
    }
  }
  
  async function fetchTokenBalances() {
    const { data: balances } = await supabase
      .from('user_balances')
      .select('token_id, balance')
      .eq('user_id', userId);
    
    const { data: tokens } = await supabase
      .from('tokens')
      .select('id, symbol');
    
    if (balances && tokens) {
      const balanceMap: Record<string, number> = {};
      balances.forEach(balance => {
        const token = tokens.find(t => t.id === balance.token_id);
        if (token) {
          balanceMap[token.symbol] = balance.balance;
        }
      });
      setTokenBalances(balanceMap);
    }
  }
  
  async function fetchStreakData() {
    const { data: streaks } = await supabase
      .from('user_token_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streaks) {
      setStreakData(streaks);
    }
  }
  
  // Get threshold for specific regen level
  function getThresholdForLevel(level: number): number {
    switch (level) {
      case 1: return 0;
      case 2: return 100;
      case 3: return 250;
      case 4: return 500;
      case 5: return 1000;
      default: return 0;
    }
  }
  
  // Trigger confetti animation for streak milestones
  function triggerConfetti() {
    if (confettiCanvasRef.current) {
      // Use any type to bypass TypeScript errors with the confetti library
      const myConfetti = confetti.create(confettiCanvasRef.current, {
        resize: true,
        useWorker: true
      }) as any;
      
      // Fire confetti from left edge
      myConfetti({
        particleCount: 50,
        spread: 70,
        origin: { x: 0.1, y: 0.5 }
      });
      
      // Fire confetti from right edge
      setTimeout(() => {
        myConfetti({
          particleCount: 50,
          spread: 70,
          origin: { x: 0.9, y: 0.5 }
        });
      }, 250);
      
      // Fire confetti from center
      setTimeout(() => {
        myConfetti({
          particleCount: 100,
          spread: 100,
          origin: { x: 0.5, y: 0.5 }
        });
      }, 500);
      
      // Clean up
      setTimeout(() => {
        setShowConfetti(false);
      }, 2500);
    }
  }
  
  // Calculate streak bonus based on Tesla's 3-6-9 pattern
  function getStreakBonus(streak: number): number {
    if (streak >= 12) return 2.2;
    if (streak >= 9) return 1.9;
    if (streak >= 6) return 1.6;
    if (streak >= 3) return 1.3;
    return 1.0;
  }
  
  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  }
  
  // Get token color based on token type
  function getTokenColor(tokenType: string): string {
    switch (tokenType) {
      case 'SAP': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'SCQ': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'GEN': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  }
  
  if (isLoading) {
    return (
      <Card className="border-zinc-800 bg-zinc-950/50 animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
            <span>Journey Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-800 rounded"></div>
            <div className="h-8 w-full bg-zinc-800 rounded-full"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-zinc-800 rounded-lg"></div>
            <div className="h-20 bg-zinc-800 rounded-lg"></div>
            <div className="h-20 bg-zinc-800 rounded-lg"></div>
          </div>
          <div className="h-24 bg-zinc-800 rounded-lg"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 bg-zinc-800 rounded"></div>
            <div className="h-12 bg-zinc-800 rounded-lg"></div>
            <div className="h-12 bg-zinc-800 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-zinc-800 bg-zinc-950/50 overflow-hidden transition-all duration-300 hover:border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
          <span>Journey Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Regen Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
              <span className="text-sm font-medium">Regen Level {regenData?.regen_level || 1}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {regenData?.regen_score || 0} / {regenData?.next_level_threshold || 100} points
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {Math.round(progressPercent)}% to Level {(regenData?.regen_level || 1) + 1}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Token Balances */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-3 transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="text-xs text-amber-400 mb-1">SAP</div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-amber-400 mr-1" />
                <div className="text-xl font-bold">{tokenBalances.SAP || 0}</div>
              </div>
              <div className="text-xs text-amber-400/70 mt-1">Superachiever</div>
            </div>
          </div>
          
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-lg p-3 transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="text-xs text-emerald-400 mb-1">SCQ</div>
              <div className="flex items-center">
                <Users className="w-4 h-4 text-emerald-400 mr-1" />
                <div className="text-xl font-bold">{tokenBalances.SCQ || 0}</div>
              </div>
              <div className="text-xs text-emerald-400/70 mt-1">Superachievers</div>
            </div>
          </div>
          
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-3 transition-transform duration-300 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="text-xs text-blue-400 mb-1">GEN</div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-blue-400 mr-1" />
                <div className="text-xl font-bold">{tokenBalances.GEN || 0}</div>
              </div>
              <div className="text-xs text-blue-400/70 mt-1">Supercivilization</div>
            </div>
          </div>
        </div>
        
        {/* Recent Token Earnings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center">
            <Gift className="w-4 h-4 text-purple-400 mr-2" />
            Recent Token Earnings
          </h4>
          <div className="space-y-2">
            <AnimatePresence>
              {recentTokens.length > 0 ? (
                recentTokens.map((token, index) => (
                  <motion.div
                    key={token.id}
                    initial={index === 0 ? { opacity: 0, y: -20 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-2 rounded-md border border-zinc-800 bg-zinc-900/30 transition-all duration-300 hover:bg-zinc-900/50"
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTokenColor(token.tokens?.token_type || '')}`}>
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium">{token.tokens?.name || 'Token'}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(token.created_at)}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getTokenColor(token.tokens?.token_type || '')}>
                      +{token.amount}
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm">No recent token earnings</p>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Streak Bonus */}
        {streakData && streakData.current_daily_streak > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium flex items-center mb-2">
              <Trophy className="w-4 h-4 text-amber-400 mr-2" />
              Tesla's 3-6-9 Streak Bonus
            </h4>
            <div className="bg-gradient-to-r from-amber-950/50 to-orange-950/50 border border-amber-900/50 rounded-lg p-4 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/streak-pattern.svg')] bg-repeat"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-amber-400 mr-2" />
                    <div>
                      <div className="font-medium">{streakData.current_daily_streak} Day Streak</div>
                      <div className="text-xs text-amber-400/80">
                        {streakData.current_daily_streak % 3 === 0 
                          ? `${getStreakBonus(streakData.current_daily_streak)}x bonus active!` 
                          : `Next bonus at ${Math.ceil(streakData.current_daily_streak / 3) * 3} days`}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-amber-400/80">
                    Longest: {streakData.longest_streak} days
                  </div>
                </div>
                
                {/* Tesla's 3-6-9 milestone indicators */}
                <div className="relative h-3 bg-amber-950/70 rounded-full mb-2 overflow-hidden">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((streakData.current_daily_streak / 9) * 100, 100)}%` 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                
                <div className="flex justify-between">
                  {[3, 6, 9].map(milestone => (
                    <div 
                      key={milestone}
                      className="flex flex-col items-center"
                    >
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all duration-300 ${
                          streakData.current_daily_streak >= milestone 
                            ? 'bg-amber-400 text-amber-950 shadow-glow-amber' 
                            : 'bg-amber-950/50 text-amber-400/50 border border-amber-900/50'
                        }`}
                      >
                        {milestone}
                      </div>
                      <div className="text-xs text-amber-400/80">
                        {milestone === 3 ? '1.3x' : milestone === 6 ? '1.6x' : '1.9x'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recent Activity */}
        <div>
          <h4 className="text-sm font-medium flex items-center mb-2">
            <Calendar className="w-4 h-4 text-blue-400 mr-2" />
            Recent Activity
          </h4>
          <div className="space-y-2">
            <AnimatePresence>
              {recentEvents.length > 0 ? (
                recentEvents.map((event, index) => (
                  <motion.div
                    key={event.completion_id}
                    initial={index === 0 ? { opacity: 0, y: -20 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-2 rounded-md border border-zinc-800 bg-zinc-900/30 transition-all duration-300 hover:bg-zinc-900/50"
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm">{event.events?.title || 'Event Completed'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-2">
                        {formatDate(event.completion_date)}
                      </span>
                      <Badge variant="outline" className="bg-blue-950/30 text-blue-400 border-blue-800">
                        +{event.total_reward}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-sm">No recent activity</p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-900/30 border-t border-zinc-800 px-6 py-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardFooter>
      
      {/* Confetti canvas */}
      {showConfetti && (
        <canvas 
          ref={confettiCanvasRef}
          className="fixed inset-0 pointer-events-none z-50"
        />
      )}
    </Card>
  );
}
