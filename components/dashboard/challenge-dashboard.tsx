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
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [userStreak, setUserStreak] = useState(0);
  const [todaysChallengeCompleted, setTodaysChallengeCompleted] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  
  // Today's token symbol
  const todayTokenSymbol = useMemo(() => getTodayTokenSymbol(), []);
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const tokenService = new TokenService(supabase);
        
        // Get user token balances
        const { data: tokens } = await tokenService.getUserTokenBalances(
          (await supabase.auth.getUser()).data.user?.id || ''
        );
        
        if (tokens) {
          setUserTokens(tokens);
          
          // Find today's token and get streak
          const todayToken = tokens.find(t => t.token_symbol === todayTokenSymbol);
          if (todayToken) {
            // Get streak from token data or calculate it
            setUserStreak(todayToken.streak || 0);
            
            // Check if today's challenge is completed
            const lastClaimed = todayToken.last_claimed ? new Date(todayToken.last_claimed) : null;
            const today = new Date();
            
            if (lastClaimed && 
                lastClaimed.getDate() === today.getDate() && 
                lastClaimed.getMonth() === today.getMonth() && 
                lastClaimed.getFullYear() === today.getFullYear()) {
              setTodaysChallengeCompleted(true);
            }
          }
        }
        
        // Get today's challenge
        const { data: challenges } = await supabase
          .from('daily_challenges')
          .select('*')
          .eq('day_of_week', new Date().getDay())
          .eq('is_active', true)
          .limit(1);
        
        if (challenges && challenges.length > 0) {
          setDailyChallenge(challenges[0]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase, toast, todayTokenSymbol]);
  
  // Claim daily token
  const claimDailyToken = async () => {
    if (claiming || todaysChallengeCompleted) return;
    
    setClaiming(true);
    try {
      const tokenService = new TokenService(supabase);
      
      // Get the challenge ID
      const challengeId = dailyChallenge?.id || 'daily-challenge';
      
      // Claim the token
      const { data: claimResult, error } = await tokenService.claimChallengeReward(
        (await supabase.auth.getUser()).data.user?.id || '',
        todayTokenSymbol,
        challengeId,
        '10' // Default amount as string if not specified in the challenge
      );
      
      if (error) {
        throw error;
      }
      
      if (claimResult) {
        // Show success message
        toast({
          title: "Success!",
          description: claimResult.message || "Successfully claimed your daily token!",
          variant: "default",
        });
        
        // Update UI state
        setTodaysChallengeCompleted(true);
        setUserStreak(prev => prev + 1);
        
        // Refresh token balances
        const { data: tokens } = await tokenService.getUserTokenBalances(
          (await supabase.auth.getUser()).data.user?.id || ''
        );
        
        if (tokens) {
          setUserTokens(tokens);
        }
      }
    } catch (error) {
      console.error('Error claiming daily token:', error);
      toast({
        title: "Error",
        description: "Failed to claim daily token. Please try again.",
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
    if (!dailyChallenge) return "Complete today's challenge to earn tokens!";
    
    const baseReward = dailyChallenge.base_reward || 10;
    const multiplier = getStreakMultiplier();
    const totalReward = baseReward * multiplier;
    
    return `${dailyChallenge.description || "Complete today's challenge"} to earn ${totalReward} ${todayTokenSymbol} tokens${multiplier > 1 ? ` (includes ${multiplier}x streak bonus)` : ''}!`;
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Daily Challenge</h2>
      <p className="text-slate-500 dark:text-slate-400">
        Complete daily challenges to earn tokens and build your streak. Longer streaks earn bonus rewards!
      </p>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
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
                  <h3 className="text-lg font-semibold mb-2">{dailyChallenge?.title || `${getTokenName(todayTokenSymbol)} Day`}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    {dailyChallenge?.long_description || `Today is ${getDayName(todayTokenSymbol)}, dedicated to ${getTokenName(todayTokenSymbol)}. Complete the daily challenge to earn tokens and build your streak.`}
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
