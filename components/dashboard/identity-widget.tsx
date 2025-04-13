/**
 * Identity Dashboard Widget
 * 
 * Displays user's genius profile and achievements
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIdentityApi } from '@/lib/api/hooks';
import { GeniusProfile, GeniusAchievement, GeniusLevelDefinition } from '@/lib/types/database.types';
import { useUser } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function IdentityWidget() {
  const identityApi = useIdentityApi();
  const { user } = useUser();
  const [profile, setProfile] = useState<GeniusProfile | null>(null);
  const [achievements, setAchievements] = useState<GeniusAchievement[]>([]);
  const [levelInfo, setLevelInfo] = useState<{ level: number; progress: number }>({ level: 1, progress: 0 });
  const [levelDefinition, setLevelDefinition] = useState<GeniusLevelDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Load genius profile
        const profileData = await identityApi.getGeniusProfile(user.id);
        setProfile(profileData);
        
        // Load achievements
        const achievementsData = await identityApi.getUserAchievements(user.id);
        setAchievements(achievementsData);
        
        // Calculate level
        const levelData = await identityApi.calculateUserLevel(user.id);
        setLevelInfo(levelData);
        
        // Get level definition
        const levelDef = await identityApi.getLevelDefinition(levelData.level);
        setLevelDefinition(levelDef);
      } catch (error) {
        console.error('Error loading identity data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [identityApi, user?.id]);

  // Format achievement type for display
  const formatAchievementType = (type: string) => {
    switch (type) {
      case 'pillar_completion':
        return 'Pillar Completion';
      case 'route_completion':
        return 'Route Completion';
      case 'meeting_contribution':
        return 'Meeting Contribution';
      case 'token_milestone':
        return 'Token Milestone';
      case 'recruitment':
        return 'Recruitment';
      default:
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  // Get initials from user's name or email
  const getInitials = () => {
    if (!user) return '??';
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    
    return user.email?.substring(0, 2).toUpperCase() || '??';
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Genius Identity</CardTitle>
        <CardDescription>Your profile and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{profile?.genius_id || user?.email}</h3>
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
              <h3 className="text-sm font-medium mb-2">Recent Achievements</h3>
              <div className="space-y-2">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-start p-2 rounded-lg border">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11" />
                        <circle cx="12" cy="8" r="7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{achievement.title}</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {achievement.description || formatAchievementType(achievement.achievement_type)}
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">+{achievement.points} points</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(achievement.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {achievements.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No achievements yet. Complete activities to earn achievements.
                  </div>
                )}
              </div>
              
              {achievements.length > 3 && (
                <div className="text-center mt-2">
                  <a href="/profile/achievements" className="text-sm text-primary hover:underline">
                    View all {achievements.length} achievements
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
