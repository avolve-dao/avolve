import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
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

type UserAchievement = {
  id: string;
  title: string;
  description: string;
  category: string;
  reward_type: string;
  claimed_at?: string | null;
  earned_at?: string | null;
  reward_amount: number;
  reward_token_symbol: string;
};

export default function AchievementDashboard({
  className = '',
}: AchievementDashboardProps) {
  const supabaseHook = useSupabase();
  const { claimAchievementReward, trackActivity } = useTokens();
  
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<UserAchievement[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  
  // Achievement stats
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState(0);
  
  useEffect(() => {
    const fetchAchievements = async () => {
      // Use a safer approach to access user and supabase
      const typedHook = supabaseHook as any;
      const user = typedHook.user as { id: string } | null;
      const supabase = typedHook.supabase;
      
      if (!user) {
        console.error('User not available');
        return;
      }
      
      try {
        // Track this view for analytics
        await trackActivity?.('view_achievements', 'page', 'achievements');
        
        // Get user achievements
        const { data: userAchievements } = await supabase
          ?.rpc('get_user_achievements', { p_user_id: user.id });
        
        // Get all possible achievements
        const { data: allAchievements } = await supabase
          ?.from('achievements')
          .select('*');
        
        if (userAchievements && allAchievements) {
          // Set unlocked achievements
          const typedUserAchievements = userAchievements.map((a: any) => ({
            ...a,
            claimed_at: a.claimed_at ?? null,
            earned_at: a.earned_at ?? null,
            reward_amount: a.reward_amount ?? 0,
            reward_token_symbol: a.reward_token_symbol ?? ''
          } as UserAchievement));
          
          setUnlockedAchievements(typedUserAchievements);
          
          // Calculate locked achievements
          const unlockedIds = typedUserAchievements.map((a: UserAchievement) => a.id);
          const locked: UserAchievement[] = allAchievements
            .filter((a: any) => !unlockedIds.includes(a.id))
            .map((a: any) => {
              // Explicitly create UserAchievement with default values
              return {
                id: a.id,
                title: a.title,
                description: a.description,
                category: a.category,
                reward_type: a.reward_type,
                earned_at: null,
                claimed_at: null,
                reward_amount: 0,
                reward_token_symbol: ''
              } as UserAchievement;
            });
          
          setLockedAchievements(locked);
          
          // Set all achievements
          setAchievements([...typedUserAchievements, ...locked]);
          
          // Calculate stats
          setTotalAchievements(allAchievements.length);
          setUnlockedCount(typedUserAchievements.length);
          
          // Calculate total tokens earned
          const totalEarned = typedUserAchievements.reduce((total: number, a: UserAchievement) => {
            return total + (a.claimed_at ? a.reward_amount : 0);
          }, 0);
          
          setTotalTokensEarned(totalEarned);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      }
    };
    
    fetchAchievements();
  }, [supabaseHook, trackActivity]);
  
  const handleClaimReward = async (achievementId: string) => {
    // Use a safer approach to access user
    const typedHook = supabaseHook as any;
    const user = typedHook.user as { id: string } | null;
    
    if (!user) {
      console.error('User not available');
      return;
    }
    
    setClaimingId(achievementId);
    
    try {
      const success = await claimAchievementReward?.(achievementId);
      
      if (success) {
        // Track this action for analytics
        const achievement = unlockedAchievements.find(a => a.id === achievementId);
        
        if (achievement) {
          await trackActivity?.('claim_achievement', 'achievement', achievementId, {
            reward_amount: achievement.reward_amount,
            reward_token: achievement.reward_token_symbol
          });
        }
        
        // Update achievements state
        const updatedUnlocked = unlockedAchievements.map(a => 
          a.id === achievementId ? { ...a, claimed_at: new Date().toISOString() } : a
        );
        
        setUnlockedAchievements(updatedUnlocked);
      }
    } catch (error) {
      console.error('Error claiming achievement:', error);
    } finally {
      setClaimingId(null);
    }
  };
  
  const categoryIcon = (category: AchievementCategory) => {
    const icons = {
      'discovery': <StarIcon className="h-3 w-3" />,
      'onboarding': <RocketIcon className="h-3 w-3" />,
      'scaffolding': <LayersIcon className="h-3 w-3" />,
      'endgame': <BookOpenIcon className="h-3 w-3" />,
      'special': <TrophyIcon className="h-3 w-3" />
    };
    
    return icons[category] ?? <StarIcon className="h-3 w-3" />;
  };
  
  const categoryColor = (category: AchievementCategory) => {
    const colors = {
      'discovery': 'bg-purple-100 text-purple-700',
      'onboarding': 'bg-blue-100 text-blue-700',
      'scaffolding': 'bg-green-100 text-green-700',
      'endgame': 'bg-orange-100 text-orange-700',
      'special': 'bg-red-100 text-red-700'
    };
    
    return colors[category] ?? 'bg-gray-100 text-gray-700';
  };
  
  // Use a safer approach to access isLoading
  const isLoading = (supabaseHook as any).isLoading as boolean;
  
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
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Unlock achievements and earn rewards
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrophyIcon className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="font-bold text-gray-900">
                {unlockedCount} / {totalAchievements} Achievements
              </h3>
              <p className="text-gray-600 text-sm">
                Total tokens earned: {totalTokensEarned}
              </p>
            </div>
          </div>
          
          <Progress 
            value={(unlockedCount / totalAchievements) * 100} 
            className="w-1/3" 
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...unlockedAchievements, ...lockedAchievements].map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`border rounded-lg p-4 ${
                    achievement.earned_at 
                      ? 'bg-white border-gray-200' 
                      : 'bg-gray-50 border-gray-300 opacity-60'
                  }`}
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
                              Earned: {achievement.earned_at ? new Date(achievement.earned_at).toLocaleDateString() : 'Unknown'}
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
          </TabsContent>
          
          <TabsContent value="unlocked">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className="border rounded-lg p-4 bg-white border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-full bg-amber-100">
                        <TrophyIcon className="h-6 w-6 text-amber-600" />
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
                          
                          <div className="text-xs text-gray-500">
                            Earned: {achievement.earned_at ? new Date(achievement.earned_at).toLocaleDateString() : 'Unknown'}
                          </div>
                          
                          {achievement.claimed_at && (
                            <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                              <CheckCircleIcon className="h-3 w-3" />
                              Claimed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!achievement.claimed_at && achievement.reward_amount > 0 && (
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
          </TabsContent>
          
          <TabsContent value="locked">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className="border rounded-lg p-4 bg-gray-50 border-gray-300 opacity-60"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-full bg-gray-200">
                        <LockIcon className="h-6 w-6 text-gray-400" />
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
