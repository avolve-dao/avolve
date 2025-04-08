import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTeams } from '@/hooks/useTeams';
import { formatDistanceToNow } from 'date-fns';

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    description?: string;
    leader_id: string;
    created_at: string;
    memberCount: number;
  };
  showJoinButton?: boolean;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, showJoinButton = false }) => {
  const { isTeamMember, isTeamLeader, joinTeam, loading } = useTeams();
  
  const isMember = isTeamMember(team.id);
  const isLeader = isTeamLeader(team.id);
  
  const handleJoinTeam = async () => {
    await joinTeam(team.id);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{team.name}</CardTitle>
            <CardDescription className="text-slate-300">
              Created {formatDistanceToNow(new Date(team.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge variant={isMember ? "secondary" : "outline"} className="ml-2">
            {isMember ? (isLeader ? "Leader" : "Member") : `${team.memberCount} members`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 mb-2">
          {team.description || "No description provided."}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between bg-slate-50">
        <Link href={`/teams/${team.id}`} passHref>
          <Button variant="outline">View Details</Button>
        </Link>
        
        {showJoinButton && !isMember && (
          <Button 
            onClick={handleJoinTeam} 
            disabled={loading}
            className="bg-gradient-to-r from-slate-700 to-slate-900 text-white"
          >
            Join Team
          </Button>
        )}
        
        {isLeader && (
          <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-yellow-500">
            Team Leader
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default TeamCard;
