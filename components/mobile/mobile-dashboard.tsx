'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabase, hasUser } from '@/lib/supabase/use-supabase';
import {
  Award,
  Coins,
  Calendar,
  Layers,
  ChevronRight,
  Bell,
  Users,
  Puzzle,
  ArrowRight,
  Target,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ContextualTooltip } from '@/components/ui/contextual-tooltip';

interface MobileDashboardProps {
  userId: string;
}

export function MobileDashboard({ userId }: MobileDashboardProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>({
    journeyProgress: 0,
    achievementsCount: 0,
    nextEvent: null,
    teamInvites: 0,
    superpuzzles: [],
  });
  const [activeTab, setActiveTab] = useState('overview');
  const supabaseHook = useSupabase();
  const { supabase, user } = supabaseHook;

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        if (!hasUser(supabaseHook)) return;

        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', supabaseHook.user!.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        // Fetch user tokens
        const { data: tokens } = await supabase
          .from('user_tokens')
          .select('token_type, amount')
          .eq('user_id', supabaseHook.user!.id);

        if (tokens) {
          setUserTokens(tokens);
        }

        // Fetch journey progress
        const { data: components } = await supabase
          .from('component_progress')
          .select('status')
          .eq('user_id', supabaseHook.user!.id);

        if (components) {
          const completedCount = components.filter(c => c.status === 'completed').length;
          const totalCount = components.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          setUserProgress((prev: typeof userProgress) => ({
            ...prev,
            journeyProgress: progress,
          }));
        }

        // Fetch achievements count
        const { count: achievementsCount } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', supabaseHook.user!.id);

        setUserProgress((prev: typeof userProgress) => ({
          ...prev,
          achievementsCount: achievementsCount || 0,
        }));

        // Fetch next event
        const { data: events } = await supabase
          .from('optimized_events')
          .select('*')
          .gt('event_date', new Date().toISOString())
          .order('event_date', { ascending: true })
          .limit(1);

        if (events && events.length > 0) {
          setUserProgress((prev: typeof userProgress) => ({
            ...prev,
            nextEvent: events[0],
          }));
        }

        // Fetch team invites
        const { count: invitesCount } = await supabase
          .from('team_invitations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', supabaseHook.user!.id)
          .eq('status', 'pending');

        setUserProgress((prev: typeof userProgress) => ({
          ...prev,
          teamInvites: invitesCount || 0,
        }));

        // Fetch superpuzzles
        const { data: superpuzzles } = await supabase
          .from('superpuzzle_contributions')
          .select(
            `
            id,
            superpuzzle:superpuzzle_id(
              id,
              title,
              description
            ),
            status,
            completion_percentage
          `
          )
          .eq('user_id', supabaseHook.user!.id)
          .in('status', ['started', 'in_progress'])
          .order('updated_at', { ascending: false })
          .limit(3);

        if (superpuzzles) {
          setUserProgress((prev: typeof userProgress) => ({
            ...prev,
            superpuzzles: superpuzzles,
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUserData();
  }, [supabase, supabaseHook]);

  // Get token amount by type
  const getTokenAmount = (type: string) => {
    const token = userTokens.find(t => t.token_type === type);
    return token ? token.amount : 0;
  };

  return (
    <div className="pb-16 md:hidden">
      {/* User Profile Summary */}
      <div className="bg-gradient-to-b from-zinc-900 to-background p-4 mb-4 rounded-b-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{userProfile?.display_name || 'Welcome'}</h1>
            <p className="text-sm text-muted-foreground">
              {userProfile?.experience_phase?.charAt(0).toUpperCase() +
                userProfile?.experience_phase?.slice(1) || 'Discovery'}{' '}
              Phase
            </p>
          </div>
          <Link href="/notifications">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {userProfile?.unread_notifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                  {userProfile.unread_notifications > 9 ? '9+' : userProfile.unread_notifications}
                </span>
              )}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link href="/tokens" className="block">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <Coins className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-lg font-bold">{getTokenAmount('GEN')}</span>
                <span className="text-xs text-muted-foreground">GEN</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/achievements" className="block">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <Award className="h-5 w-5 text-yellow-500 mb-1" />
                <span className="text-lg font-bold">{userProgress.achievementsCount}</span>
                <span className="text-xs text-muted-foreground">Awards</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/journey" className="block">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3 flex flex-col items-center justify-center">
                <Target className="h-5 w-5 text-green-500 mb-1" />
                <span className="text-lg font-bold">
                  {Math.round(userProgress.journeyProgress)}%
                </span>
                <span className="text-xs text-muted-foreground">Progress</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Next Action */}
          <Card className="border-zinc-800">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-2">Next Action</h2>
              <div className="bg-zinc-900/50 rounded-lg p-3 flex items-start">
                <div className="p-2 rounded-full bg-blue-900/30 mr-3">
                  <Layers className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Continue Your Journey</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete your next component to earn tokens and progress
                  </p>
                  <Link href="/dashboard/journey">
                    <Button size="sm" className="w-full">
                      View Journey
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Event */}
          {userProgress.nextEvent && (
            <Card className="border-zinc-800">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-2">Upcoming Event</h2>
                <div className="bg-zinc-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{userProgress.nextEvent.title}</h3>
                    <Badge variant="outline" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(userProgress.nextEvent.event_date), {
                        addSuffix: true,
                      })}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {userProgress.nextEvent.description?.substring(0, 100)}
                    {userProgress.nextEvent.description?.length > 100 ? '...' : ''}
                  </p>
                  <Link href={`/events/${userProgress.nextEvent.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Token Summary */}
          <Card className="border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Your Tokens</h2>
                <ContextualTooltip type="gen_token">
                  <span className="text-sm text-blue-500 underline">About Tokens</span>
                </ContextualTooltip>
              </div>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2">
                  {userTokens.map((token, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-md bg-zinc-900/50"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center mr-2">
                          <img
                            src={`/tokens/${token.token_type.toLowerCase()}.svg`}
                            alt={token.token_type}
                            className="w-5 h-5"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{token.token_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {token.token_type === 'GEN' ? 'General Token' : 'Utility Token'}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold">{token.amount}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-3">
                <Link href="/tokens">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Tokens
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          {/* Journey Progress */}
          <Card className="border-zinc-800">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-2">Journey Progress</h2>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm">{Math.round(userProgress.journeyProgress)}%</span>
                </div>
                <Progress value={userProgress.journeyProgress} className="h-2" />
              </div>
              <Link href="/dashboard/journey">
                <Button className="w-full">
                  Continue Journey
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Achievements</h2>
                <Badge variant="outline">{userProgress.achievementsCount} Earned</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Complete achievements to earn tokens and unlock new features
              </p>
              <Link href="/dashboard/achievements">
                <Button variant="outline" className="w-full">
                  View Achievements
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card className="border-zinc-800">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-2">Quick Access</h2>
              <div className="space-y-2">
                <Link href="/dashboard/journey" className="block">
                  <div className="flex items-center justify-between p-3 rounded-md bg-zinc-900/50">
                    <div className="flex items-center">
                      <Layers className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Journey Map</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/tokens" className="block">
                  <div className="flex items-center justify-between p-3 rounded-md bg-zinc-900/50">
                    <div className="flex items-center">
                      <Coins className="h-5 w-5 text-blue-500 mr-2" />
                      <span>Token Dashboard</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/dashboard/achievements" className="block">
                  <div className="flex items-center justify-between p-3 rounded-md bg-zinc-900/50">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Achievements</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          {/* Team Invites */}
          {userProgress.teamInvites > 0 && (
            <Card className="border-zinc-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold">Team Invites</h2>
                  <Badge>{userProgress.teamInvites}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  You have pending team invitations waiting for your response
                </p>
                <Link href="/teams/invitations">
                  <Button className="w-full">View Invitations</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Superpuzzles */}
          <Card className="border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Superpuzzles</h2>
                <ContextualTooltip type="superpuzzles">
                  <span className="text-sm text-blue-500 underline">What are these?</span>
                </ContextualTooltip>
              </div>

              {userProgress.superpuzzles.length > 0 ? (
                <div className="space-y-3 mb-3">
                  {userProgress.superpuzzles.map((puzzle: any, index: number) => (
                    <div key={index} className="p-3 rounded-md bg-zinc-900/50">
                      <h3 className="font-medium mb-1">{puzzle.superpuzzle.title}</h3>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs">{puzzle.completion_percentage}%</span>
                      </div>
                      <Progress value={puzzle.completion_percentage} className="h-1 mb-2" />
                      <Link href={`/superpuzzles/${puzzle.superpuzzle.id}/contribute`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Continue
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-3">
                  Contribute to community superpuzzles to earn SCQ tokens
                </p>
              )}

              <Link href="/superpuzzles">
                <Button
                  variant={userProgress.superpuzzles.length > 0 ? 'outline' : 'default'}
                  className="w-full"
                >
                  {userProgress.superpuzzles.length > 0
                    ? 'View All Superpuzzles'
                    : 'Explore Superpuzzles'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Community Links */}
          <Card className="border-zinc-800">
            <CardContent className="p-4">
              <h2 className="text-lg font-bold mb-2">Community</h2>
              <div className="space-y-2">
                <Link href="/teams" className="block">
                  <div className="flex items-center justify-between p-3 rounded-md bg-zinc-900/50">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-purple-500 mr-2" />
                      <span>Teams</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/superpuzzles" className="block">
                  <div className="flex items-center justify-between p-3 rounded-md bg-zinc-900/50">
                    <div className="flex items-center">
                      <Puzzle className="h-5 w-5 text-orange-500 mr-2" />
                      <span>Superpuzzles</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link href="/events" className="block">
                  <div className="flex items-center justify-between p-3 rounded-md bg-zinc-900/50">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-500 mr-2" />
                      <span>Events</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
