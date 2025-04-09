"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from '@/lib/supabase/use-supabase';
import { TokenService } from '@/lib/token/token-service';
import { DAY_TO_TOKEN_MAP } from '@/lib/token/token-types';
import { Loader2, Trophy, Star, Zap, Clock, Calendar, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sacred geometry inspired styles
const sacredGeometryClasses = {
  container: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
  card: "overflow-hidden border border-slate-200 rounded-lg shadow-sm bg-white dark:bg-slate-900 dark:border-slate-800",
  cardHeader: "p-6 pb-4 border-b border-slate-100 dark:border-slate-800",
  cardTitle: "text-xl font-semibold text-slate-900 dark:text-slate-50",
  cardDescription: "text-sm text-slate-500 dark:text-slate-400",
  cardContent: "p-6 pt-4",
  cardFooter: "flex items-center p-6 pt-0",
  button: "w-full",
  badge: "ml-auto",
  streakBadge: "flex items-center gap-1 text-xs font-medium",
  streakIcon: "h-3.5 w-3.5",
  progress: "h-2 w-full",
  tokenSymbol: "inline-flex items-center justify-center rounded-full w-8 h-8 text-xs font-medium",
  tokenAmount: "text-2xl font-bold",
  tokenName: "text-sm text-slate-500 dark:text-slate-400",
  streakContainer: "flex items-center justify-between mt-4",
  streakText: "text-sm font-medium",
  streakValue: "text-lg font-bold",
  streakProgress: "h-2.5 w-full mt-2",
  nextBonusContainer: "mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-md",
  nextBonusText: "text-sm font-medium",
  nextBonusValue: "text-lg font-bold text-indigo-600 dark:text-indigo-400",
  spiralContainer: "relative w-full aspect-square max-w-[200px] mx-auto my-6",
  harmonyStar: "absolute inset-0 flex items-center justify-center",
};

// Get token color based on symbol
const getTokenColor = (tokenType: string): string => {
  switch (tokenType) {
    case 'SPD': return 'bg-gradient-to-r from-red-500 to-blue-500 text-white'; // Red-Green-Blue
    case 'SHE': return 'bg-gradient-to-r from-rose-500 to-orange-500 text-white'; // Rose-Red-Orange
    case 'PSP': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'; // Amber-Yellow
    case 'SSA': return 'bg-gradient-to-r from-lime-500 to-emerald-500 text-white'; // Lime-Green-Emerald
    case 'BSP': return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'; // Teal-Cyan
    case 'SGB': return 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white'; // Sky-Blue-Indigo
    case 'SMS': return 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white'; // Violet-Purple-Fuchsia-Pink
    case 'SAP': return 'bg-gradient-to-r from-slate-500 to-slate-700 text-white'; // Stone gradient
    case 'SCQ': return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white'; // Slate gradient
    case 'GEN': return 'bg-gradient-to-r from-zinc-400 to-zinc-600 text-white'; // Zinc gradient
    default: return 'bg-gray-500 text-white';
  }
};

// Get today's token symbol based on day of week
const getTodayTokenSymbol = (): string => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return DAY_TO_TOKEN_MAP[dayOfWeek] || 'GEN';
};

// Get token name based on symbol
const getTokenName = (tokenSymbol: string): string => {
  switch (tokenSymbol) {
    case 'SPD': return 'Superpuzzle Developments';
    case 'SHE': return 'Superhuman Enhancements';
    case 'PSP': return 'Personal Success Puzzle';
    case 'SSA': return 'Supersociety Advancements';
    case 'BSP': return 'Business Success Puzzle';
    case 'SGB': return 'Supergenius Breakthroughs';
    case 'SMS': return 'Supermind Superpowers';
    case 'SAP': return 'Superachiever';
    case 'SCQ': return 'Superachievers';
    case 'GEN': return 'Supercivilization';
    default: return 'Unknown Token';
  }
};

// Get day name based on token symbol
const getDayName = (tokenSymbol: string): string => {
  switch (tokenSymbol) {
    case 'SPD': return 'Sunday';
    case 'SHE': return 'Monday';
    case 'PSP': return 'Tuesday';
    case 'SSA': return 'Wednesday';
    case 'BSP': return 'Thursday';
    case 'SGB': return 'Friday';
    case 'SMS': return 'Saturday';
    default: return 'Any day';
  }
};

/**
 * Tesla's 3-6-9 Spiral Component
 * 
 * A visual representation of the user's streak using Tesla's 3-6-9 pattern
 * The spiral animates and grows as the streak increases
 */
const Tesla369Spiral: React.FC<{ streak: number }> = ({ streak }) => {
  // Calculate which milestone the user is approaching (3, 6, or 9 days)
  const nextMilestone = streak < 3 ? 3 : streak < 6 ? 6 : streak < 9 ? 9 : 9;
  
  // Calculate progress toward next milestone (0-1)
  const milestoneProgress = streak < 3 ? streak / 3 : 
                            streak < 6 ? (streak - 3) / 3 : 
                            streak < 9 ? (streak - 6) / 3 : 1;
  
  // Determine the color based on milestone
  const getColor = () => {
    if (streak < 3) return 'text-amber-500';
    if (streak < 6) return 'text-emerald-500';
    return 'text-indigo-500';
  };
  
  // Calculate the size and rotation based on streak
  const size = 40 + (streak * 5); // Grows with streak
  const rotation = streak * 40; // Rotates with streak
  
  // Generate spiral points
  const generateSpiralPoints = () => {
    const points = [];
    const turns = Math.min(streak, 9) / 3; // Max 3 turns for 9-day streak
    const pointCount = 36 * turns;
    
    for (let i = 0; i <= pointCount; i++) {
      const angle = 0.1 * i;
      const radius = 2 + (0.3 * angle);
      const x = 50 + (radius * Math.cos(angle));
      const y = 50 + (radius * Math.sin(angle));
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  };
  
  return (
    <div className={sacredGeometryClasses.spiralContainer}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="1" />
        
        {/* Milestone markers */}
        <circle cx="50" cy="50" r="15" fill="none" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f0f0f0" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Milestone numbers */}
        <text x="50" y="35" textAnchor="middle" fontSize="6" fill={streak >= 3 ? '#10b981' : '#d1d5db'}>3</text>
        <text x="50" y="20" textAnchor="middle" fontSize="6" fill={streak >= 6 ? '#10b981' : '#d1d5db'}>6</text>
        <text x="50" y="5" textAnchor="middle" fontSize="6" fill={streak >= 9 ? '#10b981' : '#d1d5db'}>9</text>
        
        {/* Spiral path */}
        <polyline
          points={generateSpiralPoints()}
          fill="none"
          stroke={getColor()}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={1000 - (1000 * (streak / 9))}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        
        {/* Current position marker */}
        <circle 
          cx={50 + ((2 + (0.1 * streak * 3)) * Math.cos(0.1 * streak * 12))} 
          cy={50 + ((2 + (0.1 * streak * 3)) * Math.sin(0.1 * streak * 12))} 
          r="3" 
          fill={getColor()}
        />
      </svg>
      
      {/* Milestone indicator */}
      {streak >= 9 ? (
        <div className={`${sacredGeometryClasses.harmonyStar} text-indigo-500`}>
          <Star className="h-16 w-16 animate-pulse" />
          <span className="absolute text-xs font-bold">HARMONY</span>
        </div>
      ) : null}
    </div>
  );
};

/**
 * Next Bonus Component
 * 
 * Shows a countdown to the next streak bonus (3, 6, or 9 days)
 */
const NextBonusCountdown: React.FC<{ streak: number }> = ({ streak }) => {
  // Calculate which milestone the user is approaching (3, 6, or 9 days)
  const nextMilestone = streak < 3 ? 3 : streak < 6 ? 6 : streak < 9 ? 9 : 3; // Reset to 3 after 9
  
  // Calculate days remaining to next milestone
  const daysRemaining = nextMilestone - (streak % 9 || 9);
  
  // Determine the bonus multiplier for the next milestone
  const getNextBonusMultiplier = () => {
    if (streak < 3) return '1.5x';
    if (streak < 6) return '2x';
    if (streak < 9) return '3x';
    return '1.5x'; // Reset after 9
  };
  
  // Get the bonus name
  const getBonusName = () => {
    if (streak < 3) return 'Harmony Initiate';
    if (streak < 6) return 'Harmony Adept';
    if (streak < 9) return 'Harmony Master';
    return 'Harmony Cycle'; // After completing a 9-day cycle
  };
  
  return (
    <div className={sacredGeometryClasses.nextBonusContainer}>
      <div className="flex justify-between items-center">
        <div>
          <div className={sacredGeometryClasses.nextBonusText}>
            Next Bonus: {getBonusName()}
          </div>
          <div className={sacredGeometryClasses.nextBonusValue}>
            {daysRemaining === 0 ? (
              <span className="text-green-500">Available Today! ({getNextBonusMultiplier()})</span>
            ) : (
              <span>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} to {getNextBonusMultiplier()} bonus</span>
            )}
          </div>
        </div>
        <Clock className="h-8 w-8 text-slate-400" />
      </div>
      <Progress 
        value={(nextMilestone - daysRemaining) / nextMilestone * 100} 
        className={`${sacredGeometryClasses.streakProgress} mt-2`} 
      />
    </div>
  );
};

/**
 * Challenge Dashboard Component
 * 
 * Displays the current day's challenge, user streak progress, and available tokens
 */
const ChallengeDashboard: React.FC = () => {
  const router = useRouter();
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [userStreak, setUserStreak] = useState(0);
  const [todaysChallengeCompleted, setTodaysChallengeCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [todayChallenge, setTodayChallenge] = useState<any>(null);
  
  const todayTokenSymbol = useMemo(() => getTodayTokenSymbol(), []);
  
  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, [retryCount]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      const userId = session.user.id;
      
      // Get user tokens
      const { data: tokens, error: tokensError } = await supabase
        .from('user_balances')
        .select('*, tokens(*)')
        .eq('user_id', userId);
      
      if (tokensError) {
        console.error('Error fetching user tokens:', tokensError);
        setError('Failed to load your token balances. Please try again.');
        return;
      }
      
      setUserTokens(tokens || []);
      
      // Get user streak
      const { data: streak, error: streakError } = await supabase
        .from('challenge_streaks')
        .select('current_daily_streak')
        .eq('user_id', userId)
        .eq('token_type', todayTokenSymbol)
        .single();
      
      if (streakError && streakError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error fetching user streak:', streakError);
        // Don't set error for streak, just default to 0
      }
      
      setUserStreak(streak?.current_daily_streak || 0);
      
      // Get today's challenge
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      const { data: challenge, error: challengeError } = await supabase
        .from('daily_token_challenges')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('token_symbol', todayTokenSymbol)
        .single();
      
      if (challengeError) {
        console.error('Error fetching today\'s challenge:', challengeError);
        setError('Failed to load today\'s challenge. Please try again.');
        return;
      }
      
      setTodayChallenge(challenge);
      
      // Check if user has already completed today's challenge
      if (challenge) {
        const { data: completion, error: completionError } = await supabase
          .from('user_challenge_completions')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challenge.id)
          .eq('completion_date', today.toISOString().split('T')[0])
          .single();
        
        if (completionError && completionError.code !== 'PGRST116') {
          console.error('Error checking challenge completion:', completionError);
          // Don't set error for completion check, just default to false
        }
        
        setTodaysChallengeCompleted(!!completion);
      }
    } catch (error) {
      console.error('Unexpected error fetching user data:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Retry loading data
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };
  
  // Claim daily token
  const claimDailyToken = async () => {
    try {
      setClaiming(true);
      
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      if (!todayChallenge) {
        toast({
          title: "Error",
          description: "No challenge available for today",
          variant: "destructive",
        });
        return;
      }
      
      // Call the RPC function to claim the daily token
      const { data, error } = await supabase.rpc('process_daily_claim', {
        p_reward_id: todayChallenge.reward_id
      });
      
      if (error) {
        console.error('Error claiming daily token:', error);
        toast({
          title: "Claim Failed",
          description: error.message || "Failed to claim your daily token. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (data && data.success) {
        // Update local state
        setTodaysChallengeCompleted(true);
        setUserStreak(prev => prev + 1);
        
        // Show success toast with streak bonus if applicable
        if (data.data && data.data.streak_multiplier > 1) {
          toast({
            title: "Streak Bonus!",
            description: `You earned ${data.data.amount} ${todayTokenSymbol} tokens with a ${data.data.streak_multiplier}x streak bonus!`,
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
          });
        } else {
          toast({
            title: "Success",
            description: data.message || `You've claimed your daily ${todayTokenSymbol} tokens!`,
            variant: "default",
            className: "bg-green-50 border-green-200 text-green-800",
          });
        }
        
        // Refresh user data
        fetchUserData();
      } else {
        toast({
          title: "Claim Failed",
          description: data?.message || "Failed to claim your daily token. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected error claiming daily token:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };
  
  // Get token balance for today's token
  const getTodayTokenBalance = () => {
    const todayToken = userTokens.find(t => t.token_symbol === todayTokenSymbol);
    return todayToken?.amount || 0;
  };
  
  // Calculate streak bonus multiplier
  const getStreakMultiplier = () => {
    if (userStreak >= 9) return 3; // 3x for 9+ day streak
    if (userStreak >= 6) return 2; // 2x for 6-8 day streak
    if (userStreak >= 3) return 1.5; // 1.5x for 3-5 day streak
    return 1; // No bonus for < 3 day streak
  };
  
  // Format the challenge description
  const formatChallengeDescription = () => {
    if (!todayChallenge) return "Complete today's challenge to earn tokens!";
    
    const baseReward = todayChallenge.base_reward || 10;
    const multiplier = getStreakMultiplier();
    const totalReward = baseReward * multiplier;
    
    return `${todayChallenge.description || "Complete today's challenge"} to earn ${totalReward} ${todayTokenSymbol} tokens${multiplier > 1 ? ` (includes ${multiplier}x streak bonus)` : ''}!`;
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Daily Challenge</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading your daily challenge...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load challenge data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry
            </Button>
          </div>
        </div>
      ) : !todayChallenge ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-amber-100 p-3 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium text-amber-800 mb-2">No challenge available</h3>
            <p className="text-amber-600 mb-4">There is no challenge available for today. Please check back later.</p>
            <Button 
              variant="outline" 
              onClick={handleRetry}
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      ) : (
        <div className={sacredGeometryClasses.container}>
          {/* Today's Challenge Card */}
          <Card className={`${sacredGeometryClasses.card} col-span-2`}>
            <CardHeader className={sacredGeometryClasses.cardHeader}>
              <div className="flex items-center justify-between">
                <CardTitle className={sacredGeometryClasses.cardTitle}>
                  Today's {getDayName(todayTokenSymbol)} Challenge
                </CardTitle>
                <div className={`${sacredGeometryClasses.tokenSymbol} ${getTokenColor(todayTokenSymbol)}`}>
                  {todayTokenSymbol}
                </div>
              </div>
              <CardDescription className={sacredGeometryClasses.cardDescription}>
                {formatChallengeDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className={sacredGeometryClasses.cardContent}>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/2">
                  <h3 className="text-lg font-semibold mb-2">{todayChallenge?.title || `${getTokenName(todayTokenSymbol)} Day`}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {todayChallenge?.long_description || `Today is ${getDayName(todayTokenSymbol)}, dedicated to ${getTokenName(todayTokenSymbol)}. Complete the daily challenge to earn tokens and build your streak.`}
                  </p>
                  
                  {/* Streak information */}
                  <div className={sacredGeometryClasses.streakContainer}>
                    <div>
                      <div className={sacredGeometryClasses.streakText}>Your Current Streak</div>
                      <div className={sacredGeometryClasses.streakValue}>
                        {userStreak} day{userStreak !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${sacredGeometryClasses.streakBadge} ${userStreak >= 3 ? 'text-green-500' : 'text-slate-500'}`}
                    >
                      <Zap className={sacredGeometryClasses.streakIcon} />
                      {getStreakMultiplier()}x Bonus
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={(userStreak % 9) / 9 * 100} 
                    className={sacredGeometryClasses.streakProgress} 
                  />
                  
                  {/* Next bonus countdown */}
                  <NextBonusCountdown streak={userStreak} />
                </div>
                
                {/* Tesla's 3-6-9 Spiral Visualization */}
                <div className="w-full md:w-1/2 flex justify-center">
                  <Tesla369Spiral streak={userStreak} />
                </div>
              </div>
            </CardContent>
            <CardFooter className={sacredGeometryClasses.cardFooter}>
              <Button 
                className={sacredGeometryClasses.button} 
                onClick={claimDailyToken}
                disabled={claiming || todaysChallengeCompleted}
              >
                {claiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : todaysChallengeCompleted ? (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Already Claimed Today
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Claim Daily Token
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Token Balance Card */}
          <Card className={sacredGeometryClasses.card}>
            <CardHeader className={sacredGeometryClasses.cardHeader}>
              <CardTitle className={sacredGeometryClasses.cardTitle}>
                Today's Token
              </CardTitle>
              <CardDescription className={sacredGeometryClasses.cardDescription}>
                Your current {todayTokenSymbol} balance
              </CardDescription>
            </CardHeader>
            <CardContent className={sacredGeometryClasses.cardContent}>
              <div className="flex items-center gap-4">
                <div className={`${sacredGeometryClasses.tokenSymbol} ${getTokenColor(todayTokenSymbol)} w-12 h-12 text-base`}>
                  {todayTokenSymbol}
                </div>
                <div>
                  <div className={sacredGeometryClasses.tokenAmount}>
                    {getTodayTokenBalance()}
                  </div>
                  <div className={sacredGeometryClasses.tokenName}>
                    {getTokenName(todayTokenSymbol)}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Level Progress</span>
                  <span>Level {Math.floor(getTodayTokenBalance() / 100) + 1}</span>
                </div>
                <Progress value={(getTodayTokenBalance() % 100)} className={sacredGeometryClasses.progress} />
                <p className="text-xs text-slate-500 mt-1">
                  {100 - (getTodayTokenBalance() % 100)} more to next level
                </p>
              </div>
            </CardContent>
            <CardFooter className={sacredGeometryClasses.cardFooter}>
              <Button 
                variant="outline" 
                className={sacredGeometryClasses.button}
                onClick={() => router.push('/tokens/dashboard')}
              >
                View All Tokens
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChallengeDashboard;
