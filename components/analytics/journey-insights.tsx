'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalytics } from '@/hooks/use-analytics';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface JourneyData {
  name: string;
  immersion: number;
  users: number;
  activities: number;
  tesla369: number;
}

interface FocusAreaData {
  name: string;
  value: number;
}

interface JourneyAnalytics {
  token_type: string;
  total_immersion: number;
  unique_users: number;
  total_activities: number;
  journey_completion_rate: number;
  popular_focus_areas: FocusAreaData[];
  last_refreshed: string;
}

export function JourneyInsights({
  journeyType = 'SAP',
  tokenType,
}: {
  journeyType?: string;
  tokenType?: string;
}) {
  const {
    isLoading,
    journeyAnalytics,
    communityInsights,
    tesla369Streak,
    fetchJourneyAnalytics,
    fetchCommunityInsights,
    fetchTesla369Streak,
    subscribeToEventUpdates,
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchJourneyAnalytics(journeyType, tokenType);
    fetchCommunityInsights(tokenType);
    fetchTesla369Streak();

    // Subscribe to real-time updates
    const subscription = subscribeToEventUpdates(() => {
      // Refresh data when new events are completed
      fetchJourneyAnalytics(journeyType, tokenType);
      fetchCommunityInsights(tokenType);
      fetchTesla369Streak();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    journeyType,
    tokenType,
    fetchJourneyAnalytics,
    fetchCommunityInsights,
    fetchTesla369Streak,
    subscribeToEventUpdates,
  ]);

  // Format journey analytics data for charts
  const journeyData: JourneyData[] =
    journeyAnalytics?.map((item: JourneyAnalytics) => ({
      name: item.token_type || 'Unknown',
      immersion: item.total_immersion,
      users: item.unique_users,
      activities: item.total_activities,
      tesla369: item.journey_completion_rate,
    })) || [];

  // Format focus area data for pie chart
  const focusAreaData: FocusAreaData[] =
    journeyAnalytics?.[0]?.popular_focus_areas?.map((area: FocusAreaData) => ({
      name: area.name,
      value: area.value,
    })) || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Journey Insights</CardTitle>
        <CardDescription>Real-time analytics and insights for your journey</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tesla369">Tesla 3-6-9</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Immersion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {journeyAnalytics?.[0]?.total_immersion?.toLocaleString() || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {journeyAnalytics?.[0]?.unique_users?.toLocaleString() || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(journeyAnalytics?.[0]?.journey_completion_rate * 100 || 0).toFixed(1)}%
                      </div>
                      <Progress
                        value={journeyAnalytics?.[0]?.journey_completion_rate * 100 || 0}
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Immersion by Token Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={journeyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="immersion" fill="#8884d8" name="Immersion Level" />
                          <Bar dataKey="users" fill="#82ca9d" name="Active Users" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Focus Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={focusAreaData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {focusAreaData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="tesla369" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {tesla369Streak?.current_streak || 0} days
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Digital Root Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {tesla369Streak?.digital_root_score || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Based on Tesla 3-6-9 principles
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Reward Potential</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {tesla369Streak?.reward_potential?.toFixed(0) || 0}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Golden Ratio: {(tesla369Streak?.golden_ratio_multiplier || 1).toFixed(3)}x
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tesla 3-6-9 Activity</CardTitle>
                    <CardDescription>
                      Your activity on Sundays (3), Wednesdays (6), and Saturdays (9)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-semibold">Sunday</div>
                        <div className="text-3xl font-bold mt-2">
                          {tesla369Streak?.days_breakdown?.sunday || 0}
                        </div>
                        <Badge
                          className="mt-2"
                          variant={
                            tesla369Streak?.days_breakdown?.sunday > 0 ? 'default' : 'outline'
                          }
                        >
                          3
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-semibold">Wednesday</div>
                        <div className="text-3xl font-bold mt-2">
                          {tesla369Streak?.days_breakdown?.wednesday || 0}
                        </div>
                        <Badge
                          className="mt-2"
                          variant={
                            tesla369Streak?.days_breakdown?.wednesday > 0 ? 'default' : 'outline'
                          }
                        >
                          6
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-semibold">Saturday</div>
                        <div className="text-3xl font-bold mt-2">
                          {tesla369Streak?.days_breakdown?.saturday || 0}
                        </div>
                        <Badge
                          className="mt-2"
                          variant={
                            tesla369Streak?.days_breakdown?.saturday > 0 ? 'default' : 'outline'
                          }
                        >
                          9
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm text-muted-foreground">
                      Last Tesla day:{' '}
                      {tesla369Streak?.last_tesla_day
                        ? format(new Date(tesla369Streak.last_tesla_day), 'PPP')
                        : 'None'}
                    </div>
                  </CardFooter>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="community" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {communityInsights?.[0]?.active_users?.toLocaleString() || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Event Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {communityInsights?.[0]?.event_participants?.toLocaleString() || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {communityInsights?.[0]?.total_rewards?.toLocaleString() || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Journey Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {communityInsights?.[0]?.journey_distribution?.map(
                        (
                          journey: { journey: string; user_count: number; percentage: number },
                          index: number
                        ) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{journey.journey}</div>
                              <div className="text-sm text-muted-foreground">
                                {journey.user_count} users ({(journey.percentage * 100).toFixed(1)}
                                %)
                              </div>
                            </div>
                            <Progress value={journey.percentage * 100} className="h-2" />
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tesla 3-6-9 Community Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {communityInsights?.[0]?.tesla_369_activity?.map(
                        (
                          day: {
                            day_of_week: string;
                            unique_users: number;
                            total_immersion: number;
                          },
                          index: number
                        ) => (
                          <div key={index} className="flex flex-col items-center">
                            <div className="text-lg font-semibold">{day.day_of_week}</div>
                            <div className="text-3xl font-bold mt-2">
                              {day.unique_users?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {day.total_immersion?.toLocaleString() || 0} immersion
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Last updated:{' '}
        {journeyAnalytics?.[0]?.last_refreshed
          ? format(new Date(journeyAnalytics[0].last_refreshed), 'PPP p')
          : 'Never'}
      </CardFooter>
    </Card>
  );
}
