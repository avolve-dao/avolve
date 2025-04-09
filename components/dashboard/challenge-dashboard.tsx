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
import { DebugData, Challenge, ChallengeStreak, TokenBalance } from '@/lib/supabase/types';

// Dynamically import the debug panel component for better code splitting
const DebugPanel = dynamic(() => import('@/components/debug/debug-panel'), {
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
  const user = supabaseContext.session?.user || null;
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
    state: null
  });

  const userId = user?.id;
  const tokenService = useMemo(() => new TokenService(supabase), [supabase]);
  const todayTokenSymbol = getTodayTokenSymbol();

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
  const getStreakMultiplier = () => {
    if (userStreak >= 9) return 3;
    if (userStreak >= 6) return 2;
    if (userStreak >= 3) return 1.5;
    return 1;
  };

  // Fetch user data including tokens and streak
  const fetchUserData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const startTime = performance.now();
      
      // Fetch user tokens
      const { data: userTokens, error: tokensError } = await supabase
        .from('user_balances')
        .select('*, tokens(*)')
        .eq('user_id', userId);
      
      const tokensTime = performance.now();
      trackQuery('user_balances', `SELECT * FROM user_balances WHERE user_id = '${userId}'`, tokensTime - startTime, tokensError);
      
      if (tokensError) {
        throw new Error(`Error fetching user tokens: ${tokensError.message}`);
      }
      
      // Fetch user streak
      const { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('token_type', todayTokenSymbol)
        .single();
      
      const streakTime = performance.now();
      trackQuery('streaks', `SELECT * FROM streaks WHERE user_id = '${userId}' AND token_type = '${todayTokenSymbol}'`, streakTime - tokensTime, streakError);
      
      if (streakError && streakError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine for new users
        throw new Error(`Error fetching user streak: ${streakError.message}`);
      }
      
      // Fetch today's challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('day_of_week', new Date().getDay())
        .eq('is_active', true)
        .single();
      
      const challengeTime = performance.now();
      trackQuery('challenges', `SELECT * FROM challenges WHERE day_of_week = ${new Date().getDay()} AND is_active = true`, challengeTime - streakTime, challengeError);
      
      if (challengeError && challengeError.code !== 'PGRST116') {
        throw new Error(`Error fetching today's challenge: ${challengeError.message}`);
      }
      
      // Check if today's challenge is completed
      if (challengeData && userId) {
        const today = new Date().toISOString().split('T')[0];
        
        const { data: completionData, error: completionError } = await supabase
          .from('challenge_completions')
          .select('*')
          .eq('user_id', userId)
          .eq('challenge_id', challengeData.id)
          .gte('completed_at', `${today}T00:00:00`)
          .lte('completed_at', `${today}T23:59:59`);
        
        const completionTime = performance.now();
        trackQuery('challenge_completions', `SELECT * FROM challenge_completions WHERE user_id = '${userId}' AND challenge_id = '${challengeData.id}' AND completed_at BETWEEN '${today}T00:00:00' AND '${today}T23:59:59'`, completionTime - challengeTime, completionError);
        
        if (completionError) {
          throw new Error(`Error checking challenge completion: ${completionError.message}`);
        }
        
        setTodaysChallengeCompleted(completionData && completionData.length > 0);
      }
      
      // Process and set data
      if (userTokens) {
        const processedTokens: TokenBalance[] = userTokens.map((item: any) => ({
          token_id: item.token_id,
          token_name: item.tokens.name,
          token_symbol: item.tokens.symbol,
          amount: item.amount,
          is_locked: item.is_locked,
          level: Math.floor(Math.log2(item.amount + 1)),
          last_claimed: item.last_claimed
        }));
        
        setTokens(processedTokens);
      }
      
      if (streakData) {
        setUserStreak(streakData.streak_length || 0);
      }
      
      if (challengeData) {
        setTodayChallenge(challengeData);
      }
      
      // Track overall performance
      const endTime = performance.now();
      trackPerformance('fetchUserData', endTime - startTime);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      updateDebugState();
    }
  };

  // Claim today's token reward
  const claimDailyToken = async () => {
    if (!userId || !todayChallenge || claiming || todaysChallengeCompleted) return;
    
    try {
      setClaiming(true);
      const startTime = performance.now();
      
      const multiplier = getStreakMultiplier();
      const amount = Math.round(todayChallenge.base_reward * multiplier);
      
      // Claim the token using the token service
      const result = await tokenService.claimDailyToken(
        userId,
        todayChallenge.id,
        amount,
        multiplier,
        `Daily challenge completion: ${todayChallenge.title}`
      );
      
      const endTime = performance.now();
      trackPerformance('claimDailyToken', endTime - startTime);
      
      if (result.error) {
        throw result.error;
      }
      
      // Update UI
      setTodaysChallengeCompleted(true);
      
      // Refresh user data to show updated tokens and streak
      fetchUserData();
      
      // Show success message
      toast({
        title: "Success!",
        description: `You claimed ${amount} tokens with a ${multiplier}x streak bonus!`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error claiming daily token:', error);
      toast({
        title: "Claim Failed",
        description: error instanceof Error ? error.message : "Failed to claim your daily token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaiming(false);
      updateDebugState();
    }
  };

  // Fetch user data on component mount and when user changes
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // CSS classes for sacred geometry visualization
  const sacredGeometryClasses = {
    streakContainer: "text-center mb-2",
    streakText: "text-sm text-gray-500 dark:text-gray-400",
    streakValue: "text-3xl font-bold",
    streakBadge: "mt-1 inline-flex items-center",
    streakIcon: "h-3 w-3 mr-1",
    streakProgress: "h-2 mb-4"
  };

  return (
    <div className="container mx-auto py-6">
      {/* Debug Panel Toggle - Only in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDebugPanel}
            className="flex items-center gap-1 text-xs"
          >
            <Bug size={14} />
            {showDebugPanel ? 'Hide' : 'Show'} Debug
          </Button>
        </div>
      )}
      
      {/* Debug Panel */}
      {showDebugPanel && process.env.NODE_ENV !== 'production' && (
        <Suspense fallback={<div className="p-4 text-center text-sm text-gray-500">Loading debug tools...</div>}>
          <DebugPanel 
            data={debugData}
            onClose={() => setShowDebugPanel(false)}
          />
        </Suspense>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Challenge Card */}
        <div className="md:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
                Today's Challenge
              </CardTitle>
              <CardDescription>Complete daily challenges to earn tokens and build your streak</CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchUserData} 
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              ) : !todayChallenge ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No challenge available for today. Check back tomorrow!</p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{todayChallenge.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{todayChallenge.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="outline" className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {todayChallenge.base_reward} Base Tokens
                      </Badge>
                      
                      <Badge variant="outline" className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][todayChallenge.day_of_week]}
                      </Badge>
                      
                      <Badge variant="outline" className="flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {['Easy', 'Medium', 'Hard', 'Expert'][todayChallenge.difficulty - 1] || 'Unknown'} Difficulty
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      onClick={claimDailyToken}
                      disabled={!userId || claiming || todaysChallengeCompleted}
                      className="w-full"
                    >
                      {claiming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Claiming...
                        </>
                      ) : todaysChallengeCompleted ? (
                        "Already Claimed Today"
                      ) : (
                        "Claim Daily Reward"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Streak Card */}
        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-6 w-6 text-purple-500" />
                Your Streak
              </CardTitle>
              <CardDescription>Maintain your daily streak for bonus rewards</CardDescription>
            </CardHeader>
            
            <CardContent>
              <FeatureFlagged 
                flag={FEATURE_FLAGS.ENHANCED_STREAK_VISUALIZATION}
                fallback={
                  <>
                    <div className="mb-4">
                      <div className={sacredGeometryClasses.streakContainer}>
                        <div className={sacredGeometryClasses.streakText}>Current Streak</div>
                        <div className={sacredGeometryClasses.streakValue}>{userStreak} days</div>
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
                  </>
                }
              >
                {/* Enhanced visualization with Tesla's 3-6-9 spiral */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <div className="mb-4">
                      <div className={sacredGeometryClasses.streakContainer}>
                        <div className={sacredGeometryClasses.streakText}>Current Streak</div>
                        <div className={sacredGeometryClasses.streakValue}>{userStreak} days</div>
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
