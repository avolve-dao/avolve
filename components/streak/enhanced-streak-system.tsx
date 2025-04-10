'use client';

/**
 * Enhanced Streak System Component
 * 
 * Implements Tesla's 3-6-9 bonus system for user streaks
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Flame, Gift, Trophy, Star, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

// UI components
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Types
import type { Database } from '@/types/supabase';
import type { UserStreak } from '@/app/dashboard/dashboard-page';

interface EnhancedStreakSystemProps {
  userId: string;
  initialStreak?: UserStreak | null;
}

export function EnhancedStreakSystem({ userId, initialStreak }: EnhancedStreakSystemProps) {
  const [streak, setStreak] = useState<UserStreak | null>(initialStreak || null);
  const [loading, setLoading] = useState(!initialStreak);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'milestone' | 'bonus'>('milestone');
  const supabase = createClientComponentClient<Database>();
  
  // Tesla's 3-6-9 bonus system multipliers
  const bonusMultipliers = {
    3: 1.3,  // 30% bonus at 3 days
    6: 1.6,  // 60% bonus at 6 days
    9: 2.0,  // 100% bonus (double) at 9 days
    12: 2.2, // 120% bonus at 12 days
    15: 2.5, // 150% bonus at 15 days
    18: 3.0, // 200% bonus (triple) at 18 days
    21: 3.3  // 230% bonus at 21 days
  };
  
  // Get the current multiplier based on streak count
  const getCurrentMultiplier = (streakCount: number): number => {
    // Find the highest milestone that is less than or equal to the streak count
    const milestones = Object.keys(bonusMultipliers).map(Number).sort((a, b) => b - a);
    for (const milestone of milestones) {
      if (streakCount >= milestone) {
        return bonusMultipliers[milestone as keyof typeof bonusMultipliers];
      }
    }
    return 1.0; // Default multiplier
  };
  
  // Get the next milestone
  const getNextMilestone = (streakCount: number): number => {
    const milestones = Object.keys(bonusMultipliers).map(Number).sort((a, b) => a - b);
    for (const milestone of milestones) {
      if (streakCount < milestone) {
        return milestone;
      }
    }
    return milestones[milestones.length - 1]; // Return the highest milestone if all are achieved
  };
  
  // Calculate progress to next milestone
  const getProgressToNextMilestone = (streakCount: number): number => {
    const nextMilestone = getNextMilestone(streakCount);
    const prevMilestone = Object.keys(bonusMultipliers)
      .map(Number)
      .sort((a, b) => b - a)
      .find(m => m < nextMilestone) || 0;
    
    const range = nextMilestone - prevMilestone;
    const progress = streakCount - prevMilestone;
    
    return Math.round((progress / range) * 100);
  };
  
  // Trigger confetti celebration
  const triggerCelebration = (type: 'milestone' | 'bonus') => {
    setCelebrationType(type);
    setShowCelebration(true);
    
    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = type === 'milestone' 
      ? ['#FFD700', '#FFA500', '#FF4500'] // Gold, orange, red for milestones
      : ['#00BFFF', '#1E90FF', '#0000FF']; // Blue shades for bonuses
    
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    
    (function frame() {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) return;
      
      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { y: 0.6 },
        colors: colors,
        shapes: ['square', 'circle'],
        scalar: randomInRange(0.4, 1)
      });
      
      requestAnimationFrame(frame);
    }());
    
    // Hide celebration after 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };
  
  // Fetch streak data
  useEffect(() => {
    if (!initialStreak) {
      const fetchStreak = async () => {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching streak:', error);
        } else {
          setStreak(data);
        }
        
        setLoading(false);
      };
      
      fetchStreak();
    }
  }, [userId, initialStreak, supabase]);
  
  // Set up real-time subscription for streak updates
  useEffect(() => {
    const channel = supabase
      .channel('streak-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_streaks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const updatedStreak = payload.new as UserStreak;
          
          // Check if this is a milestone achievement
          if (streak && updatedStreak.streak_count > streak.streak_count) {
            const prevMultiplier = getCurrentMultiplier(streak.streak_count);
            const newMultiplier = getCurrentMultiplier(updatedStreak.streak_count);
            
            // If multiplier increased, trigger bonus celebration
            if (newMultiplier > prevMultiplier) {
              triggerCelebration('bonus');
            }
            // If streak count hit a milestone, trigger milestone celebration
            else if (Object.keys(bonusMultipliers).includes(updatedStreak.streak_count.toString())) {
              triggerCelebration('milestone');
            }
          }
          
          setStreak(updatedStreak);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, streak, supabase]);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="w-5 h-5 mr-2 text-orange-500" />
            Activity Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!streak) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="w-5 h-5 mr-2 text-orange-500" />
            Activity Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Start your streak by completing an activity today!</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            View Today's Activities
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const currentMultiplier = getCurrentMultiplier(streak.streak_count);
  const nextMilestone = getNextMilestone(streak.streak_count);
  const progressToNext = getProgressToNextMilestone(streak.streak_count);
  const nextMultiplier = bonusMultipliers[nextMilestone as keyof typeof bonusMultipliers];
  
  return (
    <Card className="relative overflow-hidden">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }}
              className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-xl text-center"
            >
              {celebrationType === 'milestone' ? (
                <>
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-bold mb-2">Milestone Achieved!</h3>
                  <p className="mb-4">You've reached a {streak.streak_count}-day streak!</p>
                </>
              ) : (
                <>
                  <Gift className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-bold mb-2">Bonus Unlocked!</h3>
                  <p className="mb-4">You now earn {(currentMultiplier * 100 - 100).toFixed(0)}% more tokens!</p>
                </>
              )}
              <Button onClick={() => setShowCelebration(false)}>
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Flame className="w-5 h-5 mr-2 text-orange-500" />
            Activity Streak
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            {streak.streak_count} {streak.streak_count === 1 ? 'day' : 'days'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current multiplier display */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Bonus</p>
            <p className="text-2xl font-bold">{(currentMultiplier * 100 - 100).toFixed(0)}%</p>
          </div>
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(3, Math.floor(currentMultiplier)) }).map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            ))}
            {currentMultiplier % 1 > 0 && (
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 opacity-50" />
            )}
          </div>
        </div>
        
        {/* Progress to next milestone */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Next milestone: {nextMilestone} days</span>
            <span>+{(nextMultiplier * 100 - 100).toFixed(0)}% bonus</span>
          </div>
          <div className="relative">
            <Progress value={progressToNext} className="h-2" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="absolute top-0 right-0 h-4 w-4 -mt-1 -mr-1 bg-orange-500 rounded-full border-2 border-white dark:border-zinc-900"
                    style={{ 
                      left: `${progressToNext}%` 
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{streak.streak_count} of {nextMilestone} days</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Milestone markers */}
        <div className="pt-4">
          <p className="text-sm font-medium mb-2">Bonus Milestones</p>
          <div className="flex justify-between">
            {Object.entries(bonusMultipliers).slice(0, 7).map(([days, multiplier], index) => (
              <TooltipProvider key={days}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-3 h-3 rounded-full mb-1 ${
                          Number(days) <= streak.streak_count 
                            ? 'bg-orange-500' 
                            : 'bg-muted'
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">{days}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{days} days: {(multiplier * 100 - 100).toFixed(0)}% bonus</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full" variant="outline">
          <Zap className="w-4 h-4 mr-2" />
          View Today's Activities
        </Button>
      </CardFooter>
    </Card>
  );
}
