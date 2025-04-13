import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useToken } from '@/lib/token/useToken';
import { Achievement } from './achievement-notification';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrophyIcon, 
  CoinsIcon, 
  CheckCircleIcon,
  LockIcon,
  StarIcon,
  BookOpenIcon,
  RocketIcon,
  LayersIcon
} from 'lucide-react';

type AchievementCategory = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame' | 'special';

type AchievementDashboardProps = {
  className?: string;
};

export default function AchievementDashboard({
  className = '',
}: AchievementDashboardProps) {
  const { supabase, user } = useSupabase();
  const { claimAchievementReward, trackActivity } = useToken();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  
  // Achievement stats
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Track this view for analytics
        await trackActivity('view_achievements', 'page', 'achievements');
        
        // Get user achievements
        const { data: userAchievements } = await supabase
          .rpc('get_user_achievements', { p_user_id: user.id });
        
        // Get all possible achievements
        const { data: allAchievements } = await supabase
          .from('achievements')
          .select('*');
        
        if (userAchievements && allAchievements) {
          // Set unlocked achievements
          setUnlockedAchievements(userAchievements);
          
          // Calculate locked achievements
          const unlockedIds = userAchievements.map(a => a.id);
          const locked = allAchievements
            .filter(a => !unlockedIds.includes(a.id))
            .map(a => ({
              ...a,
              earned_at: null,
              claimed_at: null
            }));
          
          setLockedAchievements(locked);
          
          // Set all achievements
          setAchievements([...userAchievements, ...locked]);
          
          // Calculate stats
          setTotalAchievements(allAchievements.length);
          setUnlockedCount(userAchievements.length);
          
          // Calculate total tokens earned
          const totalEarned = userAchievements.reduce((total, a) => {
            return total + (a.claimed_at ? a.reward_amount : 0);
          }, 0);
          
          setTotalTokensEarned(totalEarned);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, [supabase, user?.id, trackActivity]);
  
  const handleClaimReward = async (achievementId: string) => {
    setClaimingId(achievementId);
    
    try {
      const success = await claimAchievementReward(achievementId);
      
      if (success) {
        // Track this action for analytics
        const achievement = unlockedAchievements.find(a => a.id === achievementId);
        
        if (achievement) {
          await trackActivity('claim_achievement', 'achievement', achievementId, {
            achievement_title: achievement.title,
            reward_amount: achievement.reward_amount,
            reward_token: achievement.reward_token_symbol
          });
        }
        
        // Update local state
        setUnlockedAchievements(prev => 
          prev.map(a => 
            a.id === achievementId 
              ? { ...a, claimed_at: new Date().toISOString() } 
              : a
          )
        );
        
        // Update all achievements
        setAchievements(prev => 
          prev.map(a => 
            a.id === achievementId 
              ? { ...a, claimed_at: new Date().toISOString() } 
              : a
          )
        );
        
        // Update total tokens earned
        const achievement = unlockedAchievements.find(a => a.id === achievementId);
        if (achievement) {
          setTotalTokensEarned(prev => prev + achievement.reward_amount);
        }
      }
    } catch (error) {
      console.error('Error claiming achievement reward:', error);
    } finally {
      setClaimingId(null);
    }
  };
  
  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : activeTab === 'unlocked' 
      ? unlockedAchievements 
      : lockedAchievements;
  
  const categoryIcon = (category: AchievementCategory) => {
    switch (category) {
      case 'discovery':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'onboarding':
        return <RocketIcon className="h-4 w-4" />;
      case 'scaffolding':
        return <LayersIcon className="h-4 w-4" />;
      case 'endgame':
        return <StarIcon className="h-4 w-4" />;
      case 'special':
        return <TrophyIcon className="h-4 w-4" />;
      default:
        return <TrophyIcon className="h-4 w-4" />;
    }
  };
  
  const categoryColor = (category: AchievementCategory) => {
    switch (category) {
      case 'discovery':
        return 'bg-blue-100 text-blue-700';
      case 'onboarding':
        return 'bg-green-100 text-green-700';
      case 'scaffolding':
        return 'bg-purple-100 text-purple-700';
      case 'endgame':
        return 'bg-amber-100 text-amber-700';
      case 'special':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-6 w-6" />
          <div>
            <CardTitle>Your Achievements</CardTitle>
            <CardDescription className="text-white/80">
              Track your progress and earn rewards
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Achievement Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Achievements Unlocked</div>
            <div className="text-2xl font-bold">{unlockedCount} / {totalAchievements}</div>
            <Progress 
              value={(unlockedCount / totalAchievements) * 100} 
              className="h-1.5 mt-2" 
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Tokens Earned</div>
            <div className="text-2xl font-bold flex items-center">
              <CoinsIcon className="h-5 w-5 mr-1 text-blue-500" />
              {totalTokensEarned}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              From claimed achievements
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Completion Rate</div>
            <div className="text-2xl font-bold">
              {Math.round((unlockedCount / totalAchievements) * 100)}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Keep going to unlock more!
            </div>
          </div>
        </div>
        
        {/* Achievement Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {filteredAchievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No achievements found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAchievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`border rounded-lg p-4 ${!achievement.earned_at ? 'bg-gray-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-full ${
                          achievement.earned_at 
                            ? 'bg-amber-100' 
                            : 'bg-gray-200'
                        }`}>
                          {achievement.earned_at ? (
                            <TrophyIcon className="h-6 w-6 text-amber-600" />
                          ) : (
                            <LockIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {achievement.description}
                          </p>
                          
                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <Badge 
                              className={`flex items-center gap-1 ${
                                categoryColor(achievement.category as AchievementCategory)
                              }`}
                            >
                              {categoryIcon(achievement.category as AchievementCategory)}
                              {achievement.category}
                            </Badge>
                            
                            {achievement.reward_amount > 0 && (
                              <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                                <CoinsIcon className="h-3 w-3" />
                                {achievement.reward_amount} {achievement.reward_token_symbol}
                              </Badge>
                            )}
                            
                            {achievement.earned_at && (
                              <div className="text-xs text-gray-500">
                                Earned: {new Date(achievement.earned_at).toLocaleDateString()}
                              </div>
                            )}
                            
                            {achievement.claimed_at && (
                              <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                                <CheckCircleIcon className="h-3 w-3" />
                                Claimed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {achievement.earned_at && !achievement.claimed_at && achievement.reward_amount > 0 && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                          onClick={() => handleClaimReward(achievement.id)}
                          disabled={claimingId === achievement.id}
                        >
                          {claimingId === achievement.id ? (
                            <div className="flex items-center gap-1">
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Claiming...
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CoinsIcon className="h-4 w-4" />
                              Claim
                            </div>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
