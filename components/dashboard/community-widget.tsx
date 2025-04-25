/**
 * Community Dashboard Widget
 *
 * Displays community structure information and user progress
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCommunityApi } from '@/lib/api/hooks';
import { Pillar, UserJourney } from '@/lib/types/database.types';
import { useUser } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function CommunityWidget() {
  const communityApi = useCommunityApi();
  const { user } = useUser();
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [userJourneys, setUserJourneys] = useState<UserJourney[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const pillarsData = await communityApi.getPillars();
        setPillars(pillarsData);

        if (user?.id) {
          const journeysData = await communityApi.getUserJourneys(user.id);
          setUserJourneys(journeysData);
        }
      } catch (error) {
        console.error('Error loading community data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [communityApi, user?.id]);

  // Calculate overall progress across all pillars
  const calculateOverallProgress = () => {
    if (!userJourneys.length) return 0;

    const totalProgress = userJourneys.reduce((sum, journey) => sum + journey.progress, 0);
    return Math.round((totalProgress / userJourneys.length) * 100) / 100;
  };

  const overallProgress = calculateOverallProgress();

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Community Journey</CardTitle>
        <CardDescription>Your progress through the Avolve pillars</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{Math.round(overallProgress * 100)}%</span>
              </div>
              <Progress value={overallProgress * 100} className="h-2" />
            </div>

            <div className="space-y-4">
              {pillars.map(pillar => {
                const journey = userJourneys.find(j => j.pillar_id === pillar.id);
                const progress = journey ? journey.progress * 100 : 0;
                const status = journey?.status || 'not_started';

                return (
                  <div key={pillar.id} className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${pillar.gradient_class}`}
                    >
                      {pillar.icon_url ? (
                        <img src={pillar.icon_url} alt={pillar.title} className="w-6 h-6" />
                      ) : (
                        <span className="text-white font-bold">{pillar.title.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{pillar.title}</span>
                        <Badge variant={status === 'completed' ? 'default' : 'outline'}>
                          {status === 'not_started'
                            ? 'Not Started'
                            : status === 'in_progress'
                              ? 'In Progress'
                              : 'Completed'}
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">
                        {pillar.subtitle || pillar.description || ''}
                      </p>
                    </div>
                  </div>
                );
              })}

              {pillars.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No community pillars found. Start your journey by exploring the available paths.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
