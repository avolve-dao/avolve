'use client';

import { useEffect, useState } from 'react';
import { useTokens } from '@/hooks/use-tokens';
import { TokenDisplay } from '@/components/token/token-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  Gift 
} from 'lucide-react';

/**
 * Component that displays the user's journey through the platform
 * Implements the 4 experience phases of gamification:
 * 1. Discovery - Onboarding and introduction to the platform
 * 2. Onboarding - Learning the basics and earning first tokens
 * 3. Scaffolding - Regular engagement and progress through pillars
 * 4. Endgame - Advanced achievements and community contributions
 */
export function JourneyDashboard() {
  const { 
    tokens, 
    userBalances, 
    transactions, 
    balanceChanges, 
    getToken, 
    getUserToken, 
    getTokenBalance, 
    getAllTokenTypes, 
    getUserTokenBalance, 
    isLoading 
  } = useTokens();
  
  const [pillarsProgress, setPillarsProgress] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('progress');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [experiencePhase, setExperiencePhase] = useState<
    'discovery' | 'onboarding' | 'scaffolding' | 'endgame'
  >('discovery');
  const [showGettingStarted, setShowGettingStarted] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Get pillars progress
      const progressResult = await getAllPillarsProgress();
      if (progressResult.data) {
        setPillarsProgress(progressResult.data);
      }
      
      // Get achievements
      const achievementsResult = await getUserAchievements();
      if (achievementsResult.data) {
        setAchievements(achievementsResult.data);
      }
      
      // Determine experience phase based on progress
      determineExperiencePhase(tokens, progressResult.data, achievementsResult.data);
    };
    
    fetchData();
  }, [getAllPillarsProgress, getUserAchievements]);
  
  // Determine which experience phase the user is in based on their progress
  const determineExperiencePhase = (
    tokens: any[] | null, 
    progress: any[] | null, 
    achievements: any[] | null
  ) => {
    if (!tokens || tokens.length === 0) {
      setExperiencePhase('discovery');
      setShowGettingStarted(true);
      return;
    }
    
    const hasCompletedPillar = progress?.some(p => p.progress_percentage >= 100);
    const achievementCount = achievements?.filter(a => a.earned_at)?.length || 0;
    const tokenCount = tokens.length;
    
    if (tokenCount >= 7 && hasCompletedPillar && achievementCount >= 10) {
      setExperiencePhase('endgame');
      setShowGettingStarted(false);
    } else if (tokenCount >= 3 && achievementCount >= 5) {
      setExperiencePhase('scaffolding');
      setShowGettingStarted(false);
    } else if (tokenCount >= 1) {
      setExperiencePhase('onboarding');
      setShowGettingStarted(true);
    } else {
      setExperiencePhase('discovery');
      setShowGettingStarted(true);
    }
  };
  
  // Handle claiming achievement rewards
  const handleClaimReward = async (achievementId: string) => {
    setClaimingId(achievementId);
    const success = await claimAchievementReward(achievementId);
    if (success) {
      // Refresh achievements and tokens
      const achievementsResult = await getUserAchievements();
      if (achievementsResult.data) {
        setAchievements(achievementsResult.data);
      }
      
      const tokensResult = await getToken();
      if (tokensResult.data) {
        setTokens(tokensResult.data);
      }
    }
    setClaimingId(null);
  };
  
  if (isLoading && tokens.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Phase Indicator */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Your Journey Phase</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {experiencePhase === 'discovery' && 'Discovering the Avolve platform'}
              {experiencePhase === 'onboarding' && 'Learning the basics and earning your first tokens'}
              {experiencePhase === 'scaffolding' && 'Building your token portfolio and making progress'}
              {experiencePhase === 'endgame' && 'Mastering the platform and contributing to the community'}
            </p>
          </div>
          <Badge 
            className={`
              ${experiencePhase === 'discovery' ? 'bg-blue-500' : ''}
              ${experiencePhase === 'onboarding' ? 'bg-green-500' : ''}
              ${experiencePhase === 'scaffolding' ? 'bg-purple-500' : ''}
              ${experiencePhase === 'endgame' ? 'bg-amber-500' : ''}
              text-white px-3 py-1 rounded-full
            `}
          >
            {experiencePhase === 'discovery' && 'Discovery'}
            {experiencePhase === 'onboarding' && 'Onboarding'}
            {experiencePhase === 'scaffolding' && 'Scaffolding'}
            {experiencePhase === 'endgame' && 'Endgame'}
          </Badge>
        </div>
      </div>
      
      {/* Getting Started Guide - Only shown for Discovery and Onboarding phases */}
      {showGettingStarted && (
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50">
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Getting Started with Avolve
            </CardTitle>
            <CardDescription>
              Follow these steps to begin your transformation journey
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Explore the Three Pillars</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Discover the Superachiever, Superachievers, and Supercivilization pillars to understand the Avolve ecosystem.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = '/'}
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    View Pillars
                  </Button>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-bold text-green-600 dark:text-green-400">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Complete Your First Section</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Start with the Superachiever pillar and complete your first section to earn tokens.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = '/superachiever'}
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Start Superachiever
                  </Button>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-bold text-purple-600 dark:text-purple-400">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Earn Your First Achievement</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Complete activities to unlock achievements and earn token rewards.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setActiveTab('achievements')}
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    View Achievements
                  </Button>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/50 w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="font-bold text-amber-600 dark:text-amber-400">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Check Your Token Balance</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    View your token portfolio and learn how to use tokens to unlock more content.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setActiveTab('tokens')}
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    View Tokens
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowGettingStarted(false)}
            >
              Hide Guide
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              onClick={() => window.location.href = '/superachiever'}
            >
              Start Your Journey
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Experience Phase Banner */}
      <Card className={`bg-gradient-to-r ${
        experiencePhase === 'discovery' ? 'from-blue-500 to-purple-500' :
        experiencePhase === 'onboarding' ? 'from-green-500 to-teal-500' :
        experiencePhase === 'scaffolding' ? 'from-orange-500 to-amber-500' :
        'from-red-500 to-pink-500'
      } text-white`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {experiencePhase === 'discovery' && <Star className="h-6 w-6" />}
            {experiencePhase === 'onboarding' && <Zap className="h-6 w-6" />}
            {experiencePhase === 'scaffolding' && <Trophy className="h-6 w-6" />}
            {experiencePhase === 'endgame' && <Award className="h-6 w-6" />}
            <span className="capitalize">{experiencePhase} Phase</span>
          </CardTitle>
          <CardDescription className="text-white/80">
            {experiencePhase === 'discovery' && 'Welcome to Avolve! Discover the platform and earn your first token.'}
            {experiencePhase === 'onboarding' && 'You\'re learning the ropes. Complete sections to earn more tokens.'}
            {experiencePhase === 'scaffolding' && 'You\'re making great progress! Continue your journey through the pillars.'}
            {experiencePhase === 'endgame' && 'You\'re a veteran! Share your knowledge and help others on their journey.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {tokens.map(token => (
              <TokenDisplay 
                key={token.token_id} 
                token={{
                  id: token.token_id,
                  symbol: token.token_symbol,
                  name: token.token_name,
                  gradient_class: token.gradient_class,
                  balance: token.balance,
                  staked_balance: token.staked_balance,
                  parent_token_id: token.parent_token_id,
                  parent_token_symbol: token.parent_token_symbol
                }}
                size="md"
                showBalance
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>
        
        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <h3 className="text-xl font-semibold">Your Pillar Progress</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pillarsProgress.map(pillar => (
              <Card key={pillar.pillar_id} className={`${!pillar.has_access ? 'opacity-70' : ''}`}>
                <CardHeader className={`bg-gradient-to-r ${
                  pillar.pillar_token_symbol === 'GEN' ? 'from-zinc-500 to-zinc-700' :
                  pillar.pillar_token_symbol === 'SAP' ? 'from-stone-500 to-stone-700' :
                  'from-slate-500 to-slate-700'
                } text-white rounded-t-lg`}>
                  <CardTitle>{pillar.pillar_title}</CardTitle>
                  <CardDescription className="text-white/80">
                    {pillar.completed_sections} of {pillar.total_sections} sections completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Progress value={pillar.progress_percentage} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{Math.round(pillar.progress_percentage)}% complete</span>
                      {pillar.progress_percentage >= 100 && (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={!pillar.has_access}
                  >
                    {pillar.has_access ? (
                      <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Locked <Clock className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Next Steps based on Experience Phase */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Recommended actions based on your current progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {experiencePhase === 'discovery' && (
                  <>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Complete your profile to earn your first token</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Explore the Supercivilization pillar to understand the platform</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Complete the onboarding tutorial for a GEN token reward</span>
                    </li>
                  </>
                )}
                
                {experiencePhase === 'onboarding' && (
                  <>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Complete your first section in the Superachiever pillar</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Earn the SAP token to unlock more content</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Complete 3 achievements to progress to the next phase</span>
                    </li>
                  </>
                )}
                
                {experiencePhase === 'scaffolding' && (
                  <>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Complete sections in all three pillars</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Earn specialized tokens (PSP, BSP, SMS) by completing their sections</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Stake your tokens to earn rewards over time</span>
                    </li>
                  </>
                )}
                
                {experiencePhase === 'endgame' && (
                  <>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Mentor new users to earn mentor badges</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Contribute content to earn creator tokens</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Participate in governance to shape the platform's future</span>
                    </li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <h3 className="text-xl font-semibold">Your Achievements</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.filter(a => a.earned_at).map(achievement => (
              <Card key={achievement.id} className="overflow-hidden">
                <CardHeader className={`bg-gradient-to-r ${achievement.gradient_class || 'from-gray-500 to-gray-700'} text-white`}>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>{achievement.title}</span>
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    {achievement.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {achievement.difficulty || 'Standard'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Earned: {new Date(achievement.earned_at).toLocaleDateString()}
                      </span>
                    </div>
                    {achievement.token_symbol && achievement.token_amount && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Reward:</span>
                        <Badge className={`bg-gradient-to-r ${
                          achievement.token_symbol === 'GEN' ? 'from-zinc-500 to-zinc-700' :
                          achievement.token_symbol === 'SAP' ? 'from-stone-500 to-stone-700' :
                          achievement.token_symbol === 'SCQ' ? 'from-slate-500 to-slate-700' :
                          'from-gray-500 to-gray-700'
                        }`}>
                          {achievement.token_amount} {achievement.token_symbol}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                {achievement.token_symbol && achievement.token_amount && !achievement.is_claimed && (
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full"
                      onClick={() => handleClaimReward(achievement.id)}
                      disabled={claimingId === achievement.id}
                    >
                      {claimingId === achievement.id ? (
                        <Spinner size="sm" className="mr-2" />
                      ) : (
                        <Gift className="mr-2 h-4 w-4" />
                      )}
                      Claim Reward
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
            
            {achievements.filter(a => a.earned_at).length === 0 && (
              <div className="col-span-2 p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No achievements yet</h3>
                <p className="text-gray-500 mt-1">
                  Complete sections and interact with the platform to earn achievements.
                </p>
              </div>
            )}
          </div>
          
          {/* Locked Achievements */}
          {achievements.filter(a => !a.earned_at).length > 0 && (
            <>
              <h3 className="text-xl font-semibold mt-8">Locked Achievements</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.filter(a => !a.earned_at).slice(0, 4).map(achievement => (
                  <Card key={achievement.id} className="overflow-hidden opacity-70">
                    <CardHeader className="bg-gray-200 dark:bg-gray-800">
                      <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>{achievement.title}</span>
                      </CardTitle>
                      <CardDescription>
                        {achievement.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {achievement.difficulty || 'Standard'}
                        </Badge>
                        {achievement.token_symbol && achievement.token_amount && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Reward:</span>
                            <Badge variant="outline">
                              {achievement.token_amount} {achievement.token_symbol}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Tokens Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <h3 className="text-xl font-semibold">Your Tokens</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tokens.map(token => (
              <Card key={token.token_id}>
                <CardHeader className={`bg-gradient-to-r ${token.gradient_class} text-white rounded-t-lg`}>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      {token.token_symbol}
                    </div>
                    <span>{token.token_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span className="font-medium">{token.balance}</span>
                    </div>
                    {token.staked_balance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Staked</span>
                        <span className="font-medium">{token.staked_balance}</span>
                      </div>
                    )}
                    {token.pending_release > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Pending</span>
                        <span className="font-medium">{token.pending_release}</span>
                      </div>
                    )}
                    {token.parent_token_symbol && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Parent Token</span>
                        <Badge variant="outline">{token.parent_token_symbol}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">Transfer</Button>
                  <Button variant="outline" size="sm">Stake</Button>
                </CardFooter>
              </Card>
            ))}
            
            {tokens.length === 0 && (
              <div className="col-span-3 p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No tokens yet</h3>
                <p className="text-gray-500 mt-1">
                  Complete sections and achievements to earn tokens.
                </p>
              </div>
            )}
          </div>
          
          {/* Token Acquisition Guide */}
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Tokens</CardTitle>
              <CardDescription>
                Complete these actions to earn more tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Complete Sections</span>
                    <p className="text-sm text-gray-500">Finish sections in each pillar to earn tokens</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Earn Achievements</span>
                    <p className="text-sm text-gray-500">Unlock achievements to receive token rewards</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Stake Your Tokens</span>
                    <p className="text-sm text-gray-500">Stake tokens to earn passive rewards over time</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Contribute to the Community</span>
                    <p className="text-sm text-gray-500">Help others and create content to earn special tokens</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
