'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { useSuperpuzzles } from '@/hooks/useSuperpuzzles';
import { useTeams } from '@/hooks/useTeams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Trophy, Users, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface SuperpuzzleDetailsProps {
  superpuzzleId: string;
}

type TeamContribution = {
  id: string;
  points: number;
  teams?: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  completed_at?: string;
  created_at?: string;
  team_id?: string;
};

export const SuperpuzzleDetails: React.FC<SuperpuzzleDetailsProps> = ({ superpuzzleId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const {
    loading: superpuzzleLoading,
    selectedSuperpuzzle,
    loadSuperpuzzleDetails,
  } = useSuperpuzzles();

  const { loading: teamsLoading, userTeams, loadUserTeams } = useTeams();

  const [user, setUser] = useState<User | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user as User | null);
      if (user) {
        loadUserTeams();
      }
    }
    loadSuperpuzzleDetails(superpuzzleId);
    loadData();
  }, [superpuzzleId, supabase, loadSuperpuzzleDetails, loadUserTeams]);

  useEffect(() => {
    // Set the first team as default if user has teams
    if (userTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(userTeams[0].teamId);
    }
  }, [userTeams, selectedTeamId]);

  const loading = superpuzzleLoading || teamsLoading;

  // Get gradient class based on token symbol
  const getGradientClass = (symbol: string) => {
    switch (symbol) {
      case 'SPD': // Sunday
        return 'from-red-500 via-green-500 to-blue-500';
      case 'SHE': // Monday
        return 'from-rose-500 via-red-500 to-orange-500';
      case 'PSP': // Tuesday
        return 'from-amber-500 to-yellow-500';
      case 'SSA': // Wednesday
        return 'from-lime-500 via-green-500 to-emerald-500';
      case 'BSP': // Thursday
        return 'from-teal-500 to-cyan-500';
      case 'SGB': // Friday
        return 'from-sky-500 via-blue-500 to-indigo-500';
      case 'SMS': // Saturday
        return 'from-violet-500 via-purple-500 to-fuchsia-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const handleContribute = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to contribute',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTeamId) {
      toast({
        title: 'Error',
        description: 'Please select a team to contribute with',
        variant: 'destructive',
      });
      return;
    }

    router.push(`/superpuzzles/${superpuzzleId}/contribute?teamId=${selectedTeamId}`);
  };

  if (loading && !selectedSuperpuzzle) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!selectedSuperpuzzle) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Superpuzzle not found.</AlertDescription>
      </Alert>
    );
  }

  const gradientClass = getGradientClass(selectedSuperpuzzle.tokens.symbol);
  const isCompleted = selectedSuperpuzzle.status === 'completed';

  const teamContributions = selectedSuperpuzzle.teamContributions as TeamContribution[] | undefined;
  const totalPoints =
    teamContributions?.reduce((sum, contribution) => sum + (contribution?.points ?? 0), 0) || 0;

  const progress = Math.min(
    100,
    Math.round((totalPoints / (selectedSuperpuzzle.required_points || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className={`bg-gradient-to-r ${gradientClass} text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {selectedSuperpuzzle.name || selectedSuperpuzzle.title}
              </CardTitle>
              <CardDescription className="text-white text-opacity-90">
                {selectedSuperpuzzle.tokens.name} ({selectedSuperpuzzle.tokens.symbol})
              </CardDescription>
            </div>
            <Badge
              variant={isCompleted ? 'secondary' : 'outline'}
              className="ml-2 text-white border-white"
            >
              {isCompleted ? 'Completed' : 'Active'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-600 mb-6">
            {selectedSuperpuzzle.description || 'No description provided.'}
          </p>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>
                {totalPoints} / {selectedSuperpuzzle.required_points} points
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {!isCompleted &&
            user &&
            userTeams.length > 0 &&
            ((
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium mb-2">Contribute to this Superpuzzle</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleContribute}>Contribute with Team</Button>
                </div>
              </div>
            ) as React.ReactNode)}

          {!user && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                You must be logged in to contribute to this superpuzzle.
              </AlertDescription>
            </Alert>
          )}

          {user &&
            userTeams.length === 0 &&
            ((
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Teams</AlertTitle>
                <AlertDescription>
                  You need to be part of a team to contribute to this superpuzzle.
                </AlertDescription>
              </Alert>
            ) as React.ReactNode)}

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Team Contributions
            </h3>

            {teamContributions?.length === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-slate-50">
                <Trophy className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-medium">No contributions yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Be the first team to contribute to this superpuzzle!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamContributions
                  ?.sort((a, b) => b.points - a.points)
                  .map(contribution => (
                    <div key={contribution.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-slate-500" />
                          <h4 className="font-medium">{contribution.teams?.name}</h4>
                        </div>
                        <Badge
                          variant={contribution.completed_at ? 'default' : 'outline'}
                          className={
                            contribution.completed_at
                              ? `bg-gradient-to-r ${gradientClass} text-white`
                              : ''
                          }
                        >
                          {contribution.completed_at ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>

                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Contribution</span>
                          <span>
                            {contribution.points} / {selectedSuperpuzzle.required_points} points
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            100,
                            (contribution.points / (selectedSuperpuzzle.required_points || 1)) * 100
                          )}
                          className="h-2"
                        />
                      </div>

                      <div className="mt-4 text-sm text-slate-500 flex justify-between">
                        <span>
                          {contribution.completed_at
                            ? `Completed ${formatDistanceToNow(new Date(contribution.completed_at), { addSuffix: true })}`
                            : contribution.created_at
                              ? `Started ${formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true })}`
                              : 'Start date unknown'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-blue-600"
                          onClick={() => router.push(`/teams/${contribution.team_id}`)}
                        >
                          View Team <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>

                      <div className="mt-4">
                        <span>Points: {contribution.points}</span>
                        {contribution.teams && (
                          <span>Teams: {JSON.stringify(contribution.teams)}</span>
                        )}
                        {contribution.completed_at && (
                          <span>
                            Completed: {new Date(contribution.completed_at).toLocaleString()}
                          </span>
                        )}
                        {contribution.created_at && (
                          <span>Created: {new Date(contribution.created_at).toLocaleString()}</span>
                        )}
                        {contribution.team_id && <span>Team ID: {contribution.team_id}</span>}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperpuzzleDetails;
