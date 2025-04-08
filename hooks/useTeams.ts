import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { teamsService } from '../src/teams';
import { useToast } from './useToast';

/**
 * Hook for managing teams functionality
 * Provides methods for creating, joining, and managing teams
 */
export const useTeams = () => {
  const user = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibility, setEligibility] = useState<{
    isEligible: boolean;
    completedChallenges: number;
    requiredChallenges: number;
    reason?: string;
  } | null>(null);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  // Check team creation eligibility
  const checkEligibility = async () => {
    if (!user) return;
    
    setEligibilityLoading(true);
    try {
      const result = await teamsService.checkTeamEligibility(user.id);
      if (result.success && result.data) {
        setEligibility(result.data);
      } else {
        showToast('error', result.error || 'Failed to check eligibility');
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      showToast('error', 'An error occurred while checking eligibility');
    } finally {
      setEligibilityLoading(false);
    }
  };

  // Create a new team
  const createTeam = async (name: string, description?: string) => {
    if (!user) {
      showToast('error', 'You must be logged in to create a team');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await teamsService.createTeam(user.id, name, description);
      if (result.success && result.data) {
        showToast('success', 'Team created successfully!');
        await loadUserTeams();
        return { success: true, teamId: result.data.teamId };
      } else {
        showToast('error', result.error || 'Failed to create team');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error creating team:', error);
      showToast('error', 'An error occurred while creating the team');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Join an existing team
  const joinTeam = async (teamId: string) => {
    if (!user) {
      showToast('error', 'You must be logged in to join a team');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await teamsService.joinTeam(user.id, teamId);
      if (result.success) {
        showToast('success', result.message || 'Joined team successfully!');
        await loadUserTeams();
        return { success: true };
      } else {
        showToast('error', result.error || 'Failed to join team');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error joining team:', error);
      showToast('error', 'An error occurred while joining the team');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Leave a team
  const leaveTeam = async (teamId: string) => {
    if (!user) {
      showToast('error', 'You must be logged in to leave a team');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await teamsService.leaveTeam(user.id, teamId);
      if (result.success) {
        showToast('success', result.message || 'Left team successfully!');
        await loadUserTeams();
        return { success: true };
      } else {
        showToast('error', result.error || 'Failed to leave team');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error leaving team:', error);
      showToast('error', 'An error occurred while leaving the team');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Transfer team leadership
  const transferLeadership = async (teamId: string, newLeaderId: string) => {
    if (!user) {
      showToast('error', 'You must be logged in to transfer leadership');
      return { success: false };
    }
    
    setLoading(true);
    try {
      const result = await teamsService.transferLeadership(user.id, teamId, newLeaderId);
      if (result.success) {
        showToast('success', result.message || 'Leadership transferred successfully!');
        await loadTeamDetails(teamId);
        await loadUserTeams();
        return { success: true };
      } else {
        showToast('error', result.error || 'Failed to transfer leadership');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error transferring leadership:', error);
      showToast('error', 'An error occurred while transferring leadership');
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  // Load all teams
  const loadAllTeams = async () => {
    setLoading(true);
    try {
      const result = await teamsService.getAllTeams();
      if (result.success && result.data) {
        setAllTeams(result.data);
      } else {
        console.error('Failed to load teams:', result.error);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load teams the user is a member of
  const loadUserTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await teamsService.getUserTeams(user.id);
      if (result.success && result.data) {
        setUserTeams(result.data);
      } else {
        console.error('Failed to load user teams:', result.error);
      }
    } catch (error) {
      console.error('Error loading user teams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load team details
  const loadTeamDetails = async (teamId: string) => {
    setLoading(true);
    try {
      const result = await teamsService.getTeamDetails(teamId);
      if (result.success && result.data) {
        setSelectedTeam(result.data);
        return result.data;
      } else {
        console.error('Failed to load team details:', result.error);
        return null;
      }
    } catch (error) {
      console.error('Error loading team details:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is a member of a team
  const isTeamMember = (teamId: string) => {
    return userTeams.some(team => team.teamId === teamId);
  };

  // Check if user is the leader of a team
  const isTeamLeader = (teamId: string) => {
    const team = userTeams.find(t => t.teamId === teamId);
    return team?.team?.leader_id === user?.id;
  };

  // Load initial data when user changes
  useEffect(() => {
    if (user) {
      loadUserTeams();
      checkEligibility();
    } else {
      setUserTeams([]);
      setEligibility(null);
    }
  }, [user]);

  return {
    loading,
    eligibilityLoading,
    eligibility,
    userTeams,
    allTeams,
    selectedTeam,
    checkEligibility,
    createTeam,
    joinTeam,
    leaveTeam,
    transferLeadership,
    loadAllTeams,
    loadUserTeams,
    loadTeamDetails,
    isTeamMember,
    isTeamLeader,
    setSelectedTeam
  };
};

export default useTeams;
