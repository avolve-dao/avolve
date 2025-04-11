'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
  owner_id: string;
  members: number;
  total_points: number;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  contribution_points: number;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadTeams() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .or(`owner_id.eq.${user.id},id.in.(${
          supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', user.id)
            .then(({ data }) => data?.map(d => d.team_id).join(','))
        })`);

      if (teamError) {
        toast({
          title: "Error",
          description: "Failed to load teams",
          variant: "destructive"
        });
        return;
      }

      setTeams(teamData || []);

      // Get team members for all teams
      const memberPromises = teamData?.map(team => 
        supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.id)
      );

      if (memberPromises) {
        const memberResults = await Promise.all(memberPromises);
        const allMembers = memberResults.flatMap(result => result.data || []);
        setTeamMembers(allMembers);
      }

      setLoading(false);

      // Subscribe to team updates
      const teamChannel = supabase
        .channel('team_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'teams',
            filter: `owner_id=eq.${user.id}`
          }, 
          () => {
            loadTeams();
          }
        )
        .subscribe();

      // Subscribe to team member updates
      const memberChannel = supabase
        .channel('member_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'team_members',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadTeams();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(teamChannel);
        supabase.removeChannel(memberChannel);
      };
    }

    loadTeams();
  }, [supabase, toast]);

  const createTeam = async (name: string, description: string) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a team",
        variant: "destructive"
      });
      return;
    }

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        description,
        owner_id: user.id
      })
      .select()
      .single();

    if (teamError) {
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
      return;
    }

    // Add creator as team member with owner role
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) {
      toast({
        title: "Error",
        description: "Failed to add you as team owner",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Team created successfully!"
    });

    return team;
  };

  const joinTeam = async (teamId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to join a team",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.id,
        role: 'member'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to join team",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Successfully joined the team!"
    });
  };

  const leaveTeam = async (teamId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to leave a team",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to leave team",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Successfully left the team"
    });
  };

  return {
    teams,
    teamMembers,
    loading,
    createTeam,
    joinTeam,
    leaveTeam
  };
}
