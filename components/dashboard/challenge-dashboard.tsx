import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSupabase } from '@/lib/supabase/use-supabase';
import { TokenService } from '@/lib/token/token-service';
import { DAY_TO_TOKEN_MAP } from '@/lib/token/token-types';
import { Loader2, Trophy, Star, Zap, Clock, Calendar, Award, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFeatureFlags, FeatureFlagged, FEATURE_FLAGS } from '@/lib/feature-flags/feature-flags';
import { DebugData, ChallengeStreak, TokenBalance } from '@/lib/supabase/types';
import { User } from '@supabase/supabase-js';

// Extend the Challenge type to include token_reward
interface Challenge {
  id: string;
  title: string;
  description: string;
  token_type: string;
  difficulty: number;
  day_of_week: number;
  base_reward: number;
  token_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Define DebugPanelProps interface
interface DebugPanelProps {
  data: DebugData;
  onClose: () => void;  // Make onClose required
}

// Dynamically import the debug panel component for better code splitting
const DebugPanel = dynamic(() => import('@/components/debug/debug-panel').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-sm text-gray-500">Loading debug tools...</div>
});

// Types for component props and state
interface ChallengeDashboardProps {}

const ChallengeDashboard: React.FC<ChallengeDashboardProps> = () => {
  const router = useRouter();
  const { toast } = useToast();
  const supabaseContext = useSupabase();
  const supabase = supabaseContext.supabase;
  const [user, setUser] = useState<User | null>(null);
  const { isEnabled } = useFeatureFlags();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStreak, setUserStreak] = useState(0);
  const [todaysChallengeCompleted, setTodaysChallengeCompleted] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugData, setDebugData] = useState<DebugData>({
    queries: [],
    performance: {},
    session: null,
    state: {} as Record<string, any>
  });

  const userId = user?.id;
  const tokenService = useMemo(() => new TokenService(supabase), [supabase]);
  const todayTokenSymbol = getTodayTokenSymbol();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, [supabase]);

  // Track query performance
  const trackQuery = (table: string, query: string, duration: number, error?: any) => {
    if (process.env.NODE_ENV !== 'production' && isEnabled(FEATURE_FLAGS.ADVANCED_ANALYTICS)) {
      setDebugData(prev => ({
        ...prev,
        queries: [
          { table, query, duration, error: error?.message },
          ...prev.queries.slice(0, 9) // Keep last 10 queries
        ]
      }));
    }
  };

  // Track performance metrics
  const trackPerformance = (metric: string, duration: number) => {
    if (process.env.NODE_ENV !== 'production' && isEnabled(FEATURE_FLAGS.ADVANCED_ANALYTICS)) {
      setDebugData(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          [metric]: duration
        }
      }));
    }
  };

  // Update debug state data
  const updateDebugState = () => {
    if (process.env.NODE_ENV !== 'production' && isEnabled(FEATURE_FLAGS.ADVANCED_ANALYTICS)) {
      setDebugData(prev => ({
        ...prev,
        session: user,
        state: {
          userStreak,
          todaysChallengeCompleted,
          claiming,
          tokens,
          todayChallenge
        }
      }));
    }
  };

  // Toggle debug panel visibility
  const toggleDebugPanel = () => {
    setShowDebugPanel(prev => !prev);
    updateDebugState();
  };

  // Get today's token symbol based on day of week
  function getTodayTokenSymbol() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return DAY_TO_TOKEN_MAP[dayOfWeek] || 'DEFAULT';
  }

  // Get streak multiplier based on user's streak length
  function getStreakMultiplier() {
    if (userStreak >= 9) return 3;
    if (userStreak >= 6) return 2;
    if (userStreak >= 3) return 1.5;
    return 1;
  }

  // Fetch user data including tokens and streak
  const fetchUserData = async () => {
    if (!userId) return;
    
    const startTime = performance.now();
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user's token balances
      const tokenBalancesStart = performance.now();
      const { data: tokenBalances, error: tokenError } = await supabase
        .from('user_balances')
        .select(`
          id,
          user_id,
          token_id,
          balance,
          tokens (
            id,
            symbol,
            name,
            icon_url
          )
        `)
        .eq('user_id', userId);
      
      const tokenBalancesDuration = performance.now() - tokenBalancesStart;
      trackQuery('user_balances', 'Get user token balances', tokenBalancesDuration, tokenError);
      
      if (tokenError) throw new Error(tokenError.message);
      
      if (tokenBalances) {
        setTokens(tokenBalances.map(balance => {
          // Extract token data safely
          const tokenData = balance.tokens as any; // Type assertion to handle the structure
          return {
            token_id: balance.token_id,
            token_name: tokenData?.name || 'Unknown',
            token_symbol: tokenData?.symbol || 'UNK',
            amount: balance.balance,
            is_locked: false, // Default value since it's not in the query
            level: Math.floor(Math.log2(balance.balance + 1)), // Calculate level based on balance
            last_claimed: undefined
          };
        }));
      }
      
      // Fetch user's streak data
      const streakStart = performance.now();
      const { data: streakData, error: streakError } = await supabase
        .from('challenge_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      const streakDuration = performance.now() - streakStart;
      trackQuery('challenge_streaks', 'Get user streak', streakDuration, streakError);
      
      if (streakError && streakError.code !== 'PGRST116') { // Not found error is ok
        throw new Error(streakError.message);
      }
      
      if (streakData) {
        setUserStreak(streakData.current_streak);
      }
      
      // Fetch today's challenge
      const challengeStart = performance.now();
      const { data: challenges, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      const challengeDuration = performance.now() - challengeStart;
      trackQuery('daily_challenges', 'Get today challenge', challengeDuration, challengeError);
      
      if (challengeError) throw new Error(challengeError.message);
      
      if (challenges && challenges.length > 0) {
        // Map the challenge data to our Challenge interface
        const challenge = challenges[0] as any;
        setTodayChallenge({
          ...challenge,
          token_reward: challenge.base_reward || 10, // Default to base_reward or 10
        });
        
        // Check if user has already completed this challenge
        const completionStart = performance.now();
        const { data: completion, error: completionError } = await supabase
          .from('challenge_completions')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challenges[0].id)
          .limit(1);
        
        const completionDuration = performance.now() - completionStart;
        trackQuery('challenge_completions', 'Check challenge completion', completionDuration, completionError);
        
        if (completionError) throw new Error(completionError.message);
        
        setTodaysChallengeCompleted(completion && completion.length > 0);
      }
      
      const totalDuration = performance.now() - startTime;
      trackPerformance('fetchUserData', totalDuration);
      
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      updateDebugState();
    }
  };

  // Claim today's token reward
  const claimDailyToken = async () => {
    if (!userId || !todayChallenge || todaysChallengeCompleted) return;
    
    setClaiming(true);
    
    try {
      // Calculate token amount based on streak
      const multiplier = getStreakMultiplier();
      const amount = Math.round(todayChallenge.token_reward * multiplier);
      
      // Log the completion
      const { error: completionError } = await supabase
        .from('challenge_completions')
        .insert({
          user_id: userId,
          challenge_id: todayChallenge.id,
          completed_at: new Date().toISOString(),
          reward_multiplier: multiplier
        });
      
      if (completionError) throw new Error(completionError.message);
      
      // Award the tokens - using the token service
      // Note: We're using the claimDailyToken method from TokenService
      await tokenService.claimDailyToken({
        userId,
        tokenId: todayChallenge.token_type || todayTokenSymbol,
        amount,
        challengeId: todayChallenge.id,
        multiplier,
        reason: `Daily challenge completion: ${todayChallenge.title}`
      });
      
      // Update UI state
      setTodaysChallengeCompleted(true);
      
      // Refresh token balances
      await fetchUserData();
      
      // Show success message
      toast({
        title: "Challenge Completed!",
        description: `You earned ${amount} ${todayTokenSymbol} tokens with a ${multiplier}x streak multiplier!`,
        duration: 5000
      });
      
    } catch (err: any) {
      console.error('Error claiming reward:', err);
      toast({
        title: "Error Claiming Reward",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setClaiming(false);
      updateDebugState();
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Find the token balance for today's token
  const todayTokenBalance = tokens.find(t => t.token_symbol === todayTokenSymbol)?.amount || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug button for development */}
      {process.env.NODE_ENV !== 'production' && isEnabled(FEATURE_FLAGS.ADVANCED_ANALYTICS) && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDebugPanel}
            className="bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <Bug className="h-4 w-4 mr-2" />
            {showDebugPanel ? 'Hide Debug' : 'Debug'}
          </Button>
          
          <AnimatePresence>
            {showDebugPanel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-12 right-0 w-96"
              >
                <Suspense fallback={<div className="p-4 bg-white shadow rounded">Loading debug tools...</div>}>
                  <DebugPanel 
                    data={debugData} 
                    onClose={() => setShowDebugPanel(false)}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Daily Challenge</h1>
          <p className="text-gray-500 dark:text-gray-400">Complete daily challenges to earn tokens and build your streak</p>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Challenge</CardTitle>
                  <CardDescription>Earn {todayTokenSymbol} tokens and increase your streak</CardDescription>
                </div>
                
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                  <Star className="h-3 w-3 mr-1 text-amber-500" />
                  {userStreak} Day Streak
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={fetchUserData} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              ) : !todayChallenge ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active challenge today. Check back later!</p>
                </div>
              ) : (
                <>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">{todayChallenge.title}</h3>
                    <p className="text-muted-foreground mb-4">{todayChallenge.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-amber-500" />
                        <span>
                          Reward: {Math.round(todayChallenge.token_reward * getStreakMultiplier())} {todayTokenSymbol}
                          {getStreakMultiplier() > 1 && (
                            <span className="text-sm text-green-600 ml-1">
                              ({getStreakMultiplier()}x multiplier)
                            </span>
                          )}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={claimDailyToken} 
                        disabled={todaysChallengeCompleted || claiming}
                      >
                        {claiming ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Claiming...
                          </>
                        ) : todaysChallengeCompleted ? (
                          <>
                            <Trophy className="h-4 w-4 mr-2" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Trophy className="h-4 w-4 mr-2" />
                            Complete Challenge
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Your {todayTokenSymbol} Balance</h3>
                      <span className="text-2xl font-bold">{todayTokenBalance}</span>
                    </div>
                    <Progress value={Math.min(todayTokenBalance / 100 * 100, 100)} className="h-2" />
                  </div>
                  
                  <div className="pt-2">
                    <NextBonusCountdown streak={userStreak} />
                  </div>
                </>
              )}
              
              {/* Streak visualization */}
              <FeatureFlagged flag={FEATURE_FLAGS.ENHANCED_STREAK_VISUALIZATION}>
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t">
                  <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <h3 className="font-medium mb-2">Streak Multipliers</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">3 days</span>
                        <Badge variant={userStreak >= 3 ? "default" : "outline"}>1.5x</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">6 days</span>
                        <Badge variant={userStreak >= 6 ? "default" : "outline"}>2x</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">9 days</span>
                        <Badge variant={userStreak >= 9 ? "default" : "outline"}>3x</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tesla's 3-6-9 Spiral Visualization */}
                  <div className="w-full md:w-1/2 flex justify-center">
                    <Tesla369Spiral streak={userStreak} />
                  </div>
                </div>
              </FeatureFlagged>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={fetchUserData} disabled={loading}>
                Refresh
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/challenges/history')}
              >
                View History
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Next bonus countdown component
interface NextBonusCountdownProps {
  streak: number;
}

const NextBonusCountdown: React.FC<NextBonusCountdownProps> = ({ streak }) => {
  let nextMilestone = 3;
  
  if (streak >= 3) nextMilestone = 6;
  if (streak >= 6) nextMilestone = 9;
  if (streak >= 9) nextMilestone = Math.ceil(streak / 9) * 9;
  
  const daysToNextMilestone = nextMilestone - streak;
  
  return (
    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center justify-center">
        <Clock className="h-3 w-3 mr-1" />
        {daysToNextMilestone > 0 ? (
          <span>{daysToNextMilestone} day{daysToNextMilestone > 1 ? 's' : ''} until next bonus level</span>
        ) : (
          <span>You've reached a bonus milestone!</span>
        )}
      </div>
    </div>
  );
};

// Tesla's 3-6-9 Spiral visualization component
interface Tesla369SpiralProps {
  streak: number;
}

const Tesla369Spiral: React.FC<Tesla369SpiralProps> = ({ streak }) => {
  // Calculate which segments to highlight based on streak
  const highlightThree = streak >= 3;
  const highlightSix = streak >= 6;
  const highlightNine = streak >= 9;
  
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="2" />
        
        {/* 3-6-9 segments */}
        <path 
          d="M50,50 L50,5 A45,45 0 0,1 88.97,73.97 Z" 
          fill={highlightThree ? "rgba(34, 197, 94, 0.2)" : "rgba(226, 232, 240, 0.2)"} 
          stroke={highlightThree ? "#22c55e" : "#e2e8f0"} 
          strokeWidth="2"
        />
        <path 
          d="M50,50 L88.97,73.97 A45,45 0 0,1 11.03,73.97 Z" 
          fill={highlightSix ? "rgba(168, 85, 247, 0.2)" : "rgba(226, 232, 240, 0.2)"} 
          stroke={highlightSix ? "#a855f7" : "#e2e8f0"} 
          strokeWidth="2"
        />
        <path 
          d="M50,50 L11.03,73.97 A45,45 0 0,1 50,5 Z" 
          fill={highlightNine ? "rgba(59, 130, 246, 0.2)" : "rgba(226, 232, 240, 0.2)"} 
          stroke={highlightNine ? "#3b82f6" : "#e2e8f0"} 
          strokeWidth="2"
        />
        
        {/* Numbers */}
        <text x="50" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill={highlightThree ? "#22c55e" : "#94a3b8"}>3</text>
        <text x="80" y="80" textAnchor="middle" fontSize="12" fontWeight="bold" fill={highlightSix ? "#a855f7" : "#94a3b8"}>6</text>
        <text x="20" y="80" textAnchor="middle" fontSize="12" fontWeight="bold" fill={highlightNine ? "#3b82f6" : "#94a3b8"}>9</text>
        
        {/* Center point */}
        <circle cx="50" cy="50" r="4" fill="#475569" />
        
        {/* Current streak indicator */}
        <g transform={`rotate(${(streak % 9) * 40}, 50, 50)`}>
          <circle cx="50" cy="15" r="3" fill="#ef4444" />
        </g>
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-500">{streak % 9}/9</span>
      </div>
    </div>
  );
};

export default ChallengeDashboard;
