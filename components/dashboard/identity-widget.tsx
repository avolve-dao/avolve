/**
 * Identity Dashboard Widget
 *
 * Displays user's genius profile and achievements
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIdentityApi } from '@/lib/api/hooks';
import { GeniusProfile } from '@/lib/types/database.types';
import { useUser } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// [LEGACY CLEANUP] Remove achievement logic and types. Use progress/milestone data instead.
// Remove: achievements, GeniusAchievement[], and related UI
export function IdentityWidget() {
  const identityApi = useIdentityApi();
  const { user } = useUser();
  const [profile, setProfile] = useState<GeniusProfile | null>(null);
  const [levelInfo, setLevelInfo] = useState<{ level: number; progress: number }>({
    level: 1,
    progress: 0,
  });
  const [levelDefinition, setLevelDefinition] = useState<any | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);
      try {
        // Fetch profile
        const profileData = await identityApi.getGeniusProfile(user.id);
        setProfile(profileData);

        // Fetch achievements as milestones
        const achievements = await identityApi.getUserAchievements(user.id);
        setMilestones(achievements);

        // Fetch level info
        const level = await identityApi.calculateUserLevel(user.id);
        setLevelInfo(level);

        // Fetch level definition
        const levelDef = await identityApi.getLevelDefinition(level.level);
        setLevelDefinition(levelDef);
      } catch (error) {
        console.error('Error loading identity widget data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, identityApi]);

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Genius Identity</CardTitle>
          <CardDescription>Your profile and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Genius Identity</CardTitle>
        <CardDescription>Your profile and milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
            <AvatarFallback className="text-lg">
              {profile?.genius_id?.substring(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-medium">{profile?.genius_id || 'User'}</h3>
            <div className="flex items-center">
              <Badge className="mr-2">Level {levelInfo.level}</Badge>
              {levelDefinition && (
                <span className="text-xs text-muted-foreground">{levelDefinition.title}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {profile?.bio || 'No bio yet. Update your profile to add one.'}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Progress to Level {levelInfo.level + 1}</span>
            <span className="text-sm font-medium">{Math.round(levelInfo.progress * 100)}%</span>
          </div>
          <Progress value={levelInfo.progress * 100} className="h-2" />
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Milestones</h3>
          {milestones.length === 0 ? (
            <div className="text-zinc-400">No milestones yet. Start your journey!</div>
          ) : (
            <ul className="list-disc pl-5">
              {milestones.slice(0, 3).map(milestone => (
                <li key={milestone.id} className="text-sm text-zinc-700">
                  {milestone.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
