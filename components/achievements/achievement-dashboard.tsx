import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useTokens } from '@/hooks/use-tokens';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  LayersIcon,
} from 'lucide-react';

type AchievementCategory = 'discovery' | 'onboarding' | 'scaffolding' | 'endgame' | 'special';

type AchievementDashboardProps = {
  className?: string;
};

type UserAchievement = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  reward_type: string;
  claimed_at?: string | null;
  earned_at?: string | null;
  reward_amount: number;
  reward_token_symbol: string;
};

export default function AchievementDashboard({ className = '' }: AchievementDashboardProps) {
  const { supabase } = useSupabase();
  const { claimAchievementReward, trackActivity } = useTokens();

  const [unlockedAchievements, setUnlockedAchievements] = useState<UserAchievement[]>([]);
  const [lockedAchievements, setLockedAchievements] = useState<UserAchievement[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Achievement stats
  const [totalAchievements, setTotalAchievements] = useState<number>(0);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [totalTokensEarned, setTotalTokensEarned] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (currentUser && typeof currentUser.id === 'string') {
        setUser({ id: currentUser.id });
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user || typeof user.id !== 'string') {
        console.error('User not available or missing id');
        return;
      }
      setLoading(true);
      try {
        await trackActivity?.('view_achievements', 'page', 'achievements');
        const { data: userAchievements } = await supabase?.rpc('get_user_achievements', {
          p_user_id: user.id,
        });
        const { data: allAchievements } = await supabase?.from('achievements').select('*');
        if (userAchievements && allAchievements) {
          const typedUserAchievements: UserAchievement[] = userAchievements.map(
            (a: Partial<UserAchievement>) => {
              if (!a.id) {
                throw new Error('User achievement is missing id property');
              }
              return {
                id: a.id,
                title: a.title ?? '',
                description: a.description ?? '',
                category: (a.category ?? 'personal') as AchievementCategory,
                reward_type: a.reward_type ?? '',
                claimed_at: a.claimed_at ?? null,
                earned_at: a.earned_at ?? null,
                reward_amount: a.reward_amount ?? 0,
                reward_token_symbol: a.reward_token_symbol ?? '',
              };
            }
          );
          setUnlockedAchievements(typedUserAchievements);
          const unlockedIds = typedUserAchievements.map(a => a.id);
          const locked: UserAchievement[] = allAchievements
            .filter((a: Partial<UserAchievement>) => !!a.id && !unlockedIds.includes(a.id))
            .map((a: Partial<UserAchievement>) => {
              if (!a.id) {
                throw new Error('Achievement is missing id property');
              }
              return {
                id: a.id,
                title: a.title ?? '',
                description: a.description ?? '',
                category: (a.category ?? 'personal') as AchievementCategory,
                reward_type: a.reward_type ?? '',
                claimed_at: a.claimed_at ?? null,
                earned_at: a.earned_at ?? null,
                reward_amount: a.reward_amount ?? 0,
                reward_token_symbol: a.reward_token_symbol ?? '',
              };
            });
          setLockedAchievements(locked);
          setTotalAchievements(allAchievements.length);
          setUnlockedCount(typedUserAchievements.length);
          setTotalTokensEarned(
            typedUserAchievements.reduce((sum, a) => sum + (a.reward_amount || 0), 0)
          );
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user && typeof user.id === 'string') fetchAchievements();
  }, [supabase, trackActivity, user]);

  const handleClaimReward = async (achievementId: string) => {
    if (!user || typeof user.id !== 'string') {
      console.error('User not available or missing id');
      return;
    }
    setClaimingId(achievementId);
    try {
      await claimAchievementReward?.(achievementId, user.id);
      // Refresh achievements after claiming
      const { data: userAchievements } = await supabase?.rpc('get_user_achievements', {
        p_user_id: user.id,
      });
      if (userAchievements) {
        const typedUserAchievements: UserAchievement[] = userAchievements.map(
          (a: Partial<UserAchievement>) => {
            if (!a.id) {
              throw new Error('User achievement is missing id property');
            }
            return {
              id: a.id,
              title: a.title ?? '',
              description: a.description ?? '',
              category: (a.category ?? 'personal') as AchievementCategory,
              reward_type: a.reward_type ?? '',
              claimed_at: a.claimed_at ?? null,
              earned_at: a.earned_at ?? null,
              reward_amount: a.reward_amount ?? 0,
              reward_token_symbol: a.reward_token_symbol ?? '',
            };
          }
        );
        setUnlockedAchievements(typedUserAchievements);
      }
    } catch (err) {
      console.error('Error claiming reward:', err);
    } finally {
      setClaimingId(null);
    }
  };

  const categoryIcon = (category: AchievementCategory) => {
    const icons: Record<AchievementCategory, JSX.Element> = {
      discovery: <StarIcon className="h-3 w-3" />,
      onboarding: <RocketIcon className="h-3 w-3" />,
      scaffolding: <LayersIcon className="h-3 w-3" />,
      endgame: <BookOpenIcon className="h-3 w-3" />,
      special: <TrophyIcon className="h-3 w-3" />,
    };

    return icons[category] ?? <StarIcon className="h-3 w-3" />;
  };

  const categoryColor = (category: AchievementCategory) => {
    const colors: Record<AchievementCategory, string> = {
      discovery: 'bg-purple-100 text-purple-700',
      onboarding: 'bg-blue-100 text-blue-700',
      scaffolding: 'bg-green-100 text-green-700',
      endgame: 'bg-orange-100 text-orange-700',
      special: 'bg-red-100 text-red-700',
    };

    return colors[category] ?? 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Unlock achievements and earn rewards</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrophyIcon className="h-6 w-6 text-amber-600" />
            <div>
              <h3 className="font-bold text-gray-900">
                {unlockedCount} / {totalAchievements} Achievements
              </h3>
              <p className="text-gray-600 text-sm">Total tokens earned: {totalTokensEarned}</p>
            </div>
          </div>

          <Progress value={(unlockedCount / totalAchievements) * 100} className="w-1/3" />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...unlockedAchievements, ...lockedAchievements].map(
                (achievement: UserAchievement) => (
                  <div
                    key={achievement.id}
                    className={`border rounded-lg p-4 ${
                      achievement.earned_at
                        ? 'bg-white border-zinc-200'
                        : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-3 rounded-full ${
                            achievement.earned_at ? 'bg-amber-100' : 'bg-gray-200'
                          }`}
                        >
                          {achievement.earned_at ? (
                            <TrophyIcon className="h-6 w-6 text-amber-600" />
                          ) : (
                            <LockIcon className="h-6 w-6 text-gray-400" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                          <p className="text-gray-600 mt-1">{achievement.description}</p>

                          <div className="mt-3 flex items-center gap-2 flex-wrap">
                            <Badge
                              className={`flex items-center gap-1 ${categoryColor(
                                achievement.category
                              )}`}
                            >
                              {categoryIcon(achievement.category)}
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
                                Earned:{' '}
                                {achievement.earned_at
                                  ? new Date(achievement.earned_at).toLocaleDateString()
                                  : 'Unknown'}
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

                      {achievement.earned_at &&
                        !achievement.claimed_at &&
                        achievement.reward_amount > 0 && (
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
                )
              )}
            </div>
          </TabsContent>

          <TabsContent value="unlocked">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement: UserAchievement) => (
                <div
                  key={achievement.id}
                  className="border rounded-lg p-4 bg-white border-zinc-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-full bg-amber-100">
                        <TrophyIcon className="h-6 w-6 text-amber-600" />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                        <p className="text-gray-600 mt-1">{achievement.description}</p>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`flex items-center gap-1 ${categoryColor(
                              achievement.category
                            )}`}
                          >
                            {categoryIcon(achievement.category)}
                            {achievement.category}
                          </Badge>

                          {achievement.reward_amount > 0 && (
                            <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                              <CoinsIcon className="h-3 w-3" />
                              {achievement.reward_amount} {achievement.reward_token_symbol}
                            </Badge>
                          )}

                          <div className="text-xs text-gray-500">
                            Earned:{' '}
                            {achievement.earned_at
                              ? new Date(achievement.earned_at).toLocaleDateString()
                              : 'Unknown'}
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
              {lockedAchievements.map((achievement: UserAchievement) => (
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
                        <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                        <p className="text-gray-600 mt-1">{achievement.description}</p>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`flex items-center gap-1 ${categoryColor(
                              achievement.category
                            )}`}
                          >
                            {categoryIcon(achievement.category)}
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
