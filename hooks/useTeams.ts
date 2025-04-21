'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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

interface UserTeam {
  id: string;
  teamId: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
}

interface TeamMemberWithTeam {
  team_id: string;
  role: 'owner' | 'admin' | 'member';
  teams: {
    id: string;
    name: string;
  };
}

interface EligibilityStatus {
  isEligible: boolean;
  completedChallenges: number;
  requiredChallenges: number;
  reason?: string;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userTeams, setUserTeams] = useState<UserTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const { toast } = useToast();

  const supabase = createClient();

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

  const loadUserTeams = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's teams
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          team_members!inner (
            role
          )
        `)
        .eq('team_members.user_id', user.id);

      if (error) {
        throw error;
      }

      // Transform data into UserTeam format
      const userTeamsData: UserTeam[] = [];
      
      if (data) {
        data.forEach(team => {
          if (team && team.team_members && team.team_members.length > 0) {
            userTeamsData.push({
              id: team.id,
              teamId: team.id,
              name: team.name,
              role: team.team_members[0].role as 'owner' | 'admin' | 'member'
            });
          }
        });
      }

      setUserTeams(userTeamsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load user teams: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    setEligibilityLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setEligibilityLoading(false);
        return;
      }

      // Get the number of completed challenges for the user
      const { data: completedChallenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select('count')
        .eq('user_id', user.id)
        .eq('completed', true)
        .single();

      if (challengesError && challengesError.code !== 'PGRST116') {
        throw challengesError;
      }

      // Get the required number of challenges from settings
      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'required_challenges_for_team')
        .single();

      if (settingsError) {
        throw settingsError;
      }

      const completedCount = completedChallenges?.count || 0;
      const requiredCount = parseInt(settings?.value || '3', 10);
      
      setEligibility({
        isEligible: completedCount >= requiredCount,
        completedChallenges: completedCount,
        requiredChallenges: requiredCount,
        reason: completedCount < requiredCount 
          ? `You need to complete at least ${requiredCount} challenges to create a team.` 
          : undefined
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to check eligibility: " + error.message,
        variant: "destructive"
      });
      
      // Set default eligibility status in case of error
      setEligibility({
        isEligible: false,
        completedChallenges: 0,
        requiredChallenges: 3,
        reason: "Unable to verify eligibility. Please try again later."
      });
    } finally {
      setEligibilityLoading(false);
    }
  };

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

  // Load teams on initial mount
  useEffect(() => {
    loadUserTeams();
  }, []);

  return {
    teams,
    teamMembers,
    userTeams,
    loading,
    createTeam,
    joinTeam,
    leaveTeam,
    loadUserTeams,
    checkEligibility,
    eligibility,
    eligibilityLoading
  };
}
