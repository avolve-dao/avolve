"use client";

import React, { useEffect } from 'react';
import { useTeams } from '@/hooks/useTeams';
import TeamCard from './TeamCard';
import { Button } from '@/components/ui/button';
import { PlusIcon, UsersIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface TeamsListProps {
  showCreateButton?: boolean;
  showJoinButtons?: boolean;
  userTeamsOnly?: boolean;
}

export const TeamsList: React.FC<TeamsListProps> = ({
  showCreateButton = true,
  showJoinButtons = true,
  userTeamsOnly = false
}) => {
  const router = useRouter();
  const { 
    loading, 
    userTeams, 
    loadUserTeams,
    eligibility
  } = useTeams();

  useEffect(() => {
    if (userTeamsOnly) {
      loadUserTeams();
    }
  }, [userTeamsOnly, loadUserTeams]);

  const handleCreateTeam = () => {
    router.push('/teams/create');
  };

  // Fix for property 'team' does not exist on type 'UserTeam'. Adjust as per actual UserTeam shape.
  const teamsToDisplay = userTeamsOnly 
    ? userTeams.map(membership => {
        if (typeof membership === 'object' && membership !== null && 'team' in membership) {
          return (membership as { team: unknown }).team;
        }
        return null;
      }).filter(Boolean)
    : [];

  if (!userTeamsOnly && eligibility && typeof eligibility.isEligible !== 'boolean') {
    return null;
  }

  if (loading && (!teamsToDisplay || teamsToDisplay.length === 0)) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCreateButton && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Teams</h2>
          <Button 
            onClick={handleCreateTeam}
            disabled={loading || (eligibility ? !eligibility.isEligible : false)}
            className="bg-gradient-to-r from-slate-700 to-slate-900 text-white"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      )}

      {teamsToDisplay.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-slate-50">
          <UsersIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium">No teams found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {userTeamsOnly 
              ? "You haven't joined any teams yet." 
              : "There are no teams available at the moment."}
          </p>
          {userTeamsOnly && (
            <Button 
              onClick={() => router.push('/teams')}
              variant="outline" 
              className="mt-4"
            >
              Browse Teams
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamsToDisplay.map((team, idx) => {
            if (
              typeof team === 'object' &&
              team !== null &&
              'id' in team &&
              'name' in team &&
              'leader_id' in team &&
              'created_at' in team &&
              'memberCount' in team
            ) {
              return (
                <TeamCard
                  key={(team as { id: string }).id}
                  team={team as { id: string; name: string; description?: string; leader_id: string; created_at: string; memberCount: number }}
                  showJoinButton={!!showJoinButtons && !userTeamsOnly}
                />
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default TeamsList;
