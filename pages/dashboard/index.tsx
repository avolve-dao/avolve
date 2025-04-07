import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useToken } from '@/lib/token/useToken';
import { ExperiencePhase } from '@/lib/token/useToken';
import AchievementDashboard from '@/components/achievements/achievement-dashboard';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboardIcon, 
  TrophyIcon, 
  CoinsIcon, 
  ActivityIcon,
  BookOpenIcon,
  RocketIcon,
  LayersIcon,
  StarIcon
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { session, user } = useSupabase();
  const { 
    getUserTokens, 
    getAllPillarsProgress, 
    getUserExperiencePhase,
    getNextRecommendedActions,
    trackActivity
  } = useToken();
  
  const [tokens, setTokens] = useState<any[]>([]);
  const [pillarsProgress, setPillarsProgress] = useState<any[]>([]);
  const [experiencePhase, setExperiencePhase] = useState<ExperiencePhase>('discovery');
  const [nextActions, setNextActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Track dashboard view
        await trackActivity('view_dashboard', 'page', 'dashboard');
        
        // Get user tokens
        const tokensResult = await getUserTokens();
        if (tokensResult.data) {
          setTokens(tokensResult.data);
        }
        
        // Get pillars progress
        const progressResult = await getAllPillarsProgress();
        if (progressResult.data) {
          setPillarsProgress(progressResult.data);
        }
        
        // Get user experience phase
        const phase = await getUserExperiencePhase();
        setExperiencePhase(phase);
        
        // Get next recommended actions
        const actions = await getNextRecommendedActions(3);
        setNextActions(actions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [
    user, 
    getUserTokens, 
    getAllPillarsProgress, 
    getUserExperiencePhase,
    getNextRecommendedActions,
    trackActivity
  ]);
  
  const handleActionClick = (action: any) => {
    if (action.path) {
      router.push(action.path);
    }
  };
  
  const getPhaseIcon = (phase: ExperiencePhase) => {
    switch (phase) {
      case 'discovery':
        return <BookOpenIcon className="h-5 w-5 text-blue-500" />;
      case 'onboarding':
        return <RocketIcon className="h-5 w-5 text-green-500" />;
      case 'scaffolding':
        return <LayersIcon className="h-5 w-5 text-purple-500" />;
      case 'endgame':
        return <StarIcon className="h-5 w-5 text-amber-500" />;
      default:
        return <BookOpenIcon className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getPhaseColor = (phase: ExperiencePhase) => {
    switch (phase) {
      case 'discovery':
        return 'text-blue-500';
      case 'onboarding':
        return 'text-green-500';
      case 'scaffolding':
        return 'text-purple-500';
      case 'endgame':
        return 'text-amber-500';
      default:
        return 'text-blue-500';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboardIcon className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <CoinsIcon className="h-4 w-4" />
            <span>Tokens</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <TrophyIcon className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Experience Phase Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="h-5 w-5" />
                Your Journey
              </CardTitle>
              <CardDescription>
                Track your progress through the Avolve platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Phase */}
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full bg-${experiencePhase}-100`}>
                    {getPhaseIcon(experiencePhase)}
                  </div>
                  <div>
                    <div className="font-medium">Current Phase</div>
                    <div className={`text-xl font-bold ${getPhaseColor(experiencePhase)}`}>
                      {experiencePhase.charAt(0).toUpperCase() + experiencePhase.slice(1)}
                    </div>
                  </div>
                </div>
                
                {/* Phase Progress */}
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Discovery</span>
                    <span>Onboarding</span>
                    <span>Scaffolding</span>
                    <span>Endgame</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full bg-gradient-to-r ${
                            experiencePhase === 'discovery' ? 'w-1/4 from-blue-400 to-blue-600' :
                            experiencePhase === 'onboarding' ? 'w-2/4 from-blue-400 via-green-400 to-green-600' :
                            experiencePhase === 'scaffolding' ? 'w-3/4 from-blue-400 via-green-400 via-purple-400 to-purple-600' :
                            'w-full from-blue-400 via-green-400 via-purple-400 to-amber-600'
                          }`}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between w-full px-2">
                      <div className={`h-4 w-4 rounded-full ${experiencePhase === 'discovery' ? 'bg-blue-500 ring-4 ring-blue-200' : 'bg-blue-500'}`}></div>
                      <div className={`h-4 w-4 rounded-full ${experiencePhase === 'onboarding' ? 'bg-green-500 ring-4 ring-green-200' : experiencePhase === 'scaffolding' || experiencePhase === 'endgame' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-4 w-4 rounded-full ${experiencePhase === 'scaffolding' ? 'bg-purple-500 ring-4 ring-purple-200' : experiencePhase === 'endgame' ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                      <div className={`h-4 w-4 rounded-full ${experiencePhase === 'endgame' ? 'bg-amber-500 ring-4 ring-amber-200' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                </div>
                
                {/* Next Actions */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Recommended Next Steps</h3>
                  <div className="space-y-3">
                    {nextActions.map((action, index) => (
                      <div 
                        key={index}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleActionClick(action)}
                      >
                        <div className="font-medium">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                    ))}
                    
                    {nextActions.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No recommended actions available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Pillar Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pillar Progress</CardTitle>
              <CardDescription>
                Your progress through the three main pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pillarsProgress.map((pillar) => (
                  <div key={pillar.pillar_id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{pillar.pillar_title}</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(pillar.progress_percentage)}%
                      </span>
                    </div>
                    <Progress 
                      value={pillar.progress_percentage} 
                      className={`h-2 bg-gray-100 ${
                        pillar.gradient_class.includes('stone') ? 'bg-gradient-to-r from-stone-400 to-stone-600' :
                        pillar.gradient_class.includes('slate') ? 'bg-gradient-to-r from-slate-400 to-slate-600' :
                        pillar.gradient_class.includes('zinc') ? 'bg-gradient-to-r from-zinc-400 to-zinc-600' :
                        'bg-gradient-to-r from-blue-400 to-blue-600'
                      }`} 
                    />
                    <div className="text-xs text-gray-500">
                      {pillar.completed_components}/{pillar.total_components} components completed
                    </div>
                  </div>
                ))}
                
                {pillarsProgress.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No progress data available
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/superachiever')}
              >
                Explore Pillars
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tokens Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CoinsIcon className="h-5 w-5" />
                Your Tokens
              </CardTitle>
              <CardDescription>
                Manage your token collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokens.map((token) => (
                  <Card key={token.id} className="overflow-hidden">
                    <div className={`bg-gradient-to-r ${token.gradientClass} p-4 text-white`}>
                      <div className="flex justify-between items-center">
                        <div className="font-bold text-xl">{token.symbol}</div>
                        <div className="text-2xl font-bold">{token.balance}</div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="font-medium">{token.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{token.description}</div>
                      
                      {token.parentTokenSymbol && (
                        <div className="text-xs text-gray-500 mt-2">
                          Parent: {token.parentTokenSymbol}
                        </div>
                      )}
                      
                      {token.stakedBalance > 0 && (
                        <div className="text-xs text-blue-500 mt-2">
                          Staked: {token.stakedBalance}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {tokens.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    No tokens owned yet. Complete content to earn tokens!
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/tokens')}
              >
                View Token Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <AchievementDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
