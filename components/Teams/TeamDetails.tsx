'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Users, Trophy, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface TeamDetailsProps {
  teamId: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  leader_id: string;
  members: Member[];
}

interface Member {
  id: string;
  userId: string;
  joinedAt: Date;
  profile: {
    avatar_url: string;
    full_name: string;
    username: string;
  };
}

interface Profile {
  avatar_url: string;
  full_name: string;
  username: string;
}

interface User {
  id: string;
  profile: Profile;
}

export const TeamDetails: React.FC<TeamDetailsProps> = ({ teamId }) => {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const supabase = createClient();

  const loadTeamAndUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user as User | null);
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    setTeam(team);
    setLoading(false);
  }, [supabase, teamId]);

  useEffect(() => {
    loadTeamAndUser();
  }, [loadTeamAndUser, teamId, supabase]);

  const handleJoinTeam = async () => {
    if (!currentUser) {
      // Removed unused useToast import
      return;
    }
    
    setJoining(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: currentUser.id
        });

      if (error) {
        // Removed unused useToast import
        return;
      }

      await loadTeamAndUser();
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentUser) return;
    
    setLeaving(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', currentUser.id);

      if (error) {
        // Removed unused useToast import
        return;
      }

      router.push('/teams');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Team not found or you don&apos;t have access to view it.</AlertDescription>
      </Alert>
    );
  }

  const isMember = team.members?.some((member: Member) => member.userId === currentUser?.id);
  const isLeader = team.leader_id === currentUser?.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <CardDescription className="text-slate-300">
                Created {formatDistanceToNow(new Date(team.created_at), { addSuffix: true })}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center">
                <Users className="mr-1 h-3 w-3" />
                {team.members?.length || 0} Members
              </Badge>
              
              {isLeader && (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500">
                  Team Leader
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-600 mb-6">
            {team.description || "No description provided."}
          </p>
          
          {!isMember && (
            <div className="flex justify-center mb-6">
              <Button 
                onClick={handleJoinTeam} 
                disabled={joining}
                className="bg-gradient-to-r from-slate-700 to-slate-900 text-white"
              >
                {joining ? 'Joining...' : 'Join Team'}
              </Button>
            </div>
          )}
          
          {isMember && !isLeader && (
            <div className="flex justify-center mb-6">
              <Button 
                variant="outline" 
                onClick={handleLeaveTeam}
                disabled={leaving}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {leaving ? 'Leaving...' : 'Leave Team'}
              </Button>
            </div>
          )}
          
          <Tabs value="overview" onValueChange={() => {}} className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="superpuzzles">Superpuzzles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="mr-2 h-5 w-5 text-slate-500" />
                      Team Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{team.members?.length || 0}</p>
                    <p className="text-sm text-slate-500">members</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-slate-500" />
                      Active Superpuzzles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-slate-500">in progress</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-slate-500" />
                      Team Age
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {Math.ceil((Date.now() - new Date(team.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                    <p className="text-sm text-slate-500">days</p>
                  </CardContent>
                </Card>
              </div>
              
              {isLeader && (
                <div className="mt-6">
                  <Button 
                    onClick={() => router.push(`/teams/${teamId}/manage`)}
                    variant="outline"
                    className="w-full"
                  >
                    Manage Team
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="members" className="mt-6">
              <div className="space-y-4">
                {team.members?.map((member: Member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile?.avatar_url} />
                        <AvatarFallback>
                          {member.profile?.username?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <p className="font-medium">
                          {member.profile?.full_name || member.profile?.username || 'Anonymous User'}
                        </p>
                        <p className="text-sm text-slate-500">
                          Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      {team.leader_id === member.userId && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500">
                          Team Leader
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="superpuzzles" className="mt-6">
              <div className="text-center py-12 border rounded-lg bg-slate-50">
                <Trophy className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium">No superpuzzles yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This team hasn&apos;t contributed to any superpuzzles yet.
                </p>
                {isMember && (
                  <Button
                    onClick={() => router.push('/superpuzzles')}
                    variant="outline"
                    className="mt-4"
                  >
                    Browse Superpuzzles
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDetails;
