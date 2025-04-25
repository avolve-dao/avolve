'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '../../lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import {
  MessageSquare,
  Award,
  Coins,
  CheckCircle,
  Users,
  ThumbsUp,
  Puzzle,
  RefreshCw,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface ActivityFeedProps {
  userId: string;
  limit?: number;
  showPersonal?: boolean;
  showCommunity?: boolean;
}

interface ActivityItem {
  id: string;
  type: string;
  actor_id: string;
  actor_name: string;
  actor_avatar: string;
  target_id?: string;
  target_name?: string;
  target_type?: string;
  action: string;
  details?: any;
  created_at: string;
  link?: string;
}

export function ActivityFeed({
  userId,
  limit = 10,
  showPersonal = true,
  showCommunity = true,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'community'>(
    showPersonal && showCommunity ? 'all' : showPersonal ? 'personal' : 'community'
  );
  const supabase = createClient();

  // Fetch activity data
  useEffect(() => {
    async function fetchActivities() {
      setIsLoading(true);

      try {
        // Fetch user's activities
        const { data: userActivities, error: userError } = await supabase
          .from('user_activities')
          .select(
            `
            id,
            type,
            actor_id,
            actor:actor_id(display_name, avatar_url),
            target_id,
            target_type,
            target_name,
            action,
            details,
            created_at
          `
          )
          .eq('actor_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);

        // Fetch community activities
        const { data: communityActivities, error: communityError } = await supabase
          .from('user_activities')
          .select(
            `
            id,
            type,
            actor_id,
            actor:actor_id(display_name, avatar_url),
            target_id,
            target_type,
            target_name,
            action,
            details,
            created_at
          `
          )
          .neq('actor_id', userId)
          .in('type', [
            'comment',
            'reaction',
            'team_join',
            'superpuzzle_contribution',
            'milestone',
            'feature',
          ])
          .order('created_at', { ascending: false })
          .limit(limit);

        if (userError || communityError) {
          console.error('Error fetching activities:', userError || communityError);
          setActivities([]);
          setIsLoading(false);
          return;
        }

        // Process user activities
        const processedUserActivities = (userActivities || []).map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          actor_id: activity.actor_id,
          actor_name: activity.actor?.display_name || 'Unknown User',
          actor_avatar: activity.actor?.avatar_url || '',
          target_id: activity.target_id,
          target_name: activity.target_name,
          target_type: activity.target_type,
          action: activity.action,
          details: activity.details,
          created_at: activity.created_at,
          link: getActivityLink(activity),
        }));

        // Process community activities
        const processedCommunityActivities = (communityActivities || []).map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          actor_id: activity.actor_id,
          actor_name: activity.actor?.display_name || 'Unknown User',
          actor_avatar: activity.actor?.avatar_url || '',
          target_id: activity.target_id,
          target_name: activity.target_name,
          target_type: activity.target_type,
          action: activity.action,
          details: activity.details,
          created_at: activity.created_at,
          link: getActivityLink(activity),
        }));

        // Combine and sort all activities
        const allActivities = [
          ...(showPersonal ? processedUserActivities : []),
          ...(showCommunity ? processedCommunityActivities : []),
        ]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit);

        setActivities(allActivities);
      } catch (error) {
        console.error('Error in activity fetch:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();

    // Set up realtime subscription for new activities
    const activityChannel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
        },
        payload => {
          // Only update if it's relevant to the current view
          if (
            (showPersonal && payload.new.actor_id === userId) ||
            (showCommunity && payload.new.actor_id !== userId)
          ) {
            fetchActivities();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(activityChannel);
    };
  }, [userId, limit, showPersonal, showCommunity, supabase]);

  // Get appropriate link for an activity
  function getActivityLink(activity: any): string {
    // [LEGACY CLEANUP] Remove achievement activity type
    switch (activity.type) {
      case 'token':
        return '/tokens';
      case 'component_completion':
        return `/dashboard/journey/${activity.data?.component_id || ''}`;
      case 'milestone':
        return '/dashboard/journey';
      case 'feature':
        return '/dashboard/features';
      default:
        return '#';
    }
  }

  // Get icon for activity type
  function getActivityIcon(type: string) {
    switch (type) {
      case 'token':
        return <Coins className="h-5 w-5 text-blue-500" />;
      case 'component_completion':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'milestone':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'feature':
        return <Puzzle className="h-5 w-5 text-orange-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'reaction':
        return <ThumbsUp className="h-5 w-5 text-pink-500" />;
      case 'team_join':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'superpuzzle_contribution':
        return <Puzzle className="h-5 w-5 text-orange-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  }

  // Format activity message
  function formatActivityMessage(activity: ActivityItem): string {
    const isYou = activity.actor_id === userId;
    const actor = isYou ? 'You' : activity.actor_name;

    switch (activity.type) {
      case 'token':
        return `${actor} received ${activity.details?.amount} ${activity.details?.token_type} tokens`;
      case 'component_completion':
        return `${actor} completed the "${activity.target_name}" component`;
      case 'milestone':
        return `${actor} reached the "${activity.target_name}" milestone`;
      case 'feature':
        return `${actor} unlocked the "${activity.target_name}" feature`;
      case 'comment':
        return `${actor} commented on ${activity.target_type === 'superpuzzle' ? 'a superpuzzle' : 'a post'}`;
      case 'reaction':
        return `${actor} reacted to a post`;
      case 'team_join':
        return `${actor} joined the "${activity.target_name}" team`;
      case 'superpuzzle_contribution':
        return `${actor} contributed to the "${activity.target_name}" superpuzzle`;
      default:
        return `${actor} performed an action`;
    }
  }

  // Filter activities based on active tab
  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'all') return true;
    if (activeTab === 'personal') return activity.actor_id === userId;
    if (activeTab === 'community') return activity.actor_id !== userId;
    return true;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Feed</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 500);
            }}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>Recent activities and achievements</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {showPersonal && showCommunity && (
          <div className="flex border-b border-zinc-800">
            <Button
              variant="ghost"
              className={`flex-1 rounded-none ${activeTab === 'all' ? 'bg-zinc-800/50' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none ${activeTab === 'personal' ? 'bg-zinc-800/50' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              Your Activity
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 rounded-none ${activeTab === 'community' ? 'bg-zinc-800/50' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              Community
            </Button>
          </div>
        )}

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredActivities.length > 0 ? (
            <div className="divide-y divide-zinc-800">
              {filteredActivities.map(activity => (
                <div key={activity.id} className="p-4">
                  <div className="flex">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={activity.actor_avatar} />
                      <AvatarFallback>{activity.actor_name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">
                              {activity.actor_id === userId ? 'You' : activity.actor_name}
                            </span>{' '}
                            <span className="text-muted-foreground">{activity.action}</span>
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {formatActivityMessage(activity)}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex items-center">
                          {getActivityIcon(activity.type)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </div>

                        {activity.link && (
                          <Link href={activity.link}>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              View
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <p className="text-muted-foreground mb-2">No recent activity to display</p>
              <p className="text-sm text-muted-foreground">
                Activities will appear here as you interact with the platform
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-zinc-800 py-3">
        <Link href="/dashboard/activity" className="w-full">
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
