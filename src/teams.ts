import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { TeamRoles, TeamChallengeStatuses, type TeamRole, type TeamChallengeStatus } from '@/types/platform';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Interfaces for type safety
interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  created_at: string;
  memberCount: number;
  [key: string]: unknown;
}

interface Profile {
  id: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  [key: string]: unknown;
}

/**
 * TeamsService - Manages team creation, membership, and collaboration
 * Handles team operations and growth metrics tracking
 */
export class TeamsService {
  private client: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = client || supabase;
  }

  /**
   * Check if a user is eligible to create a team
   * Users must complete at least 10 challenges or claim 3 different day tokens
   * 
   * @param userId User ID to check eligibility for
   * @returns Eligibility status and details
   */
  async checkTeamEligibility(userId: string): Promise<{
    success: boolean;
    data?: {
      isEligible: boolean;
      completedChallenges: number;
      requiredChallenges: number;
      uniqueTokensClaimed: number;
      requiredTokens: number;
      reason?: string;
    };
    error?: string;
  }> {
    try {
      // Check completed challenges
      const { data: challengeData, error: challengeError } = await this.client
        .from('completed_challenges')
        .select('id')
        .eq('user_id', userId);

      if (challengeError) throw challengeError;

      // Check day token claims
      const { data: tokenData, error: tokenError } = await this.client
        .from('daily_claims')
        .select('token_id')
        .eq('user_id', userId);

      if (tokenError) throw tokenError;

      // Count unique tokens claimed
      const uniqueTokens = new Set();
      tokenData?.forEach(claim => uniqueTokens.add(claim.token_id));
      
      const completedChallenges = challengeData?.length || 0;
      const uniqueTokensClaimed = uniqueTokens.size;
      const isEligible = completedChallenges >= 10 || uniqueTokensClaimed >= 3;
      
      const result = {
        isEligible,
        completedChallenges,
        requiredChallenges: 10,
        uniqueTokensClaimed,
        requiredTokens: 3,
        reason: isEligible 
          ? 'You are eligible to create a team!' 
          : `You need either 10 completed challenges (you have ${completedChallenges}) or 3 different day tokens claimed (you have ${uniqueTokensClaimed}).`
      };

      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Check team eligibility error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error checking team eligibility'
      };
    }
  }

  /**
   * Create a new team
   * - Forms teams of 4-12 members
   * - Unlocked after 10 challenges or claiming 3 different day tokens
   * - Boosts Growth Rate in metrics per new member
   * 
   * @param userId User ID creating the team (becomes leader)
   * @param name Team name (must be unique)
   * @param description Optional team description
   * @returns Result of team creation
   */
  async createTeam(name: string, description: string, ownerId: string): Promise<{
    success: boolean;
    data?: {
      teamId: string;
      message: string;
    };
    error?: string;
  }> {
    try {
      // First check eligibility
      const eligibility = await this.checkTeamEligibility(ownerId);
      
      if (!eligibility.success || !eligibility.data?.isEligible) {
        return {
          success: false,
          error: eligibility.data?.reason || 'You are not eligible to create a team'
        };
      }
      
      // Create the team
      const { data: teamData, error: teamError } = await this.client
        .from('teams')
        .insert({
          name,
          description: description || '',
          leader_id: ownerId,
          role: TeamRoles.OWNER,
        })
        .select('id')
        .single();

      if (teamError) throw teamError;
      
      const teamId = teamData.id;
      
      // Add creator as team leader
      const { error: memberError } = await this.client
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: ownerId,
          role: TeamRoles.OWNER
        });
        
      if (memberError) throw memberError;

      // Record growth metric
      await this.recordTeamMetric(
        teamId,
        'growth',
        1,
        { action: 'team_created', creator_id: ownerId }
      );

      return {
        success: true,
        data: {
          teamId,
          message: 'Team created successfully'
        }
      };
    } catch (error) {
      console.error('Create team error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating team'
      };
    }
  }

  /**
   * Join an existing team
   * 
   * @param userId User ID joining the team
   * @param teamId Team ID to join
   * @returns Result of joining the team
   */
  async joinTeam(userId: string, teamId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Check if user is already in the team
      const { data: existingMember, error: checkError } = await this.client
        .from('team_members')
        .select('id')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingMember) {
        return {
          success: false,
          message: 'You are already a member of this team'
        };
      }
      
      // Check team member count
      const { count, error: countError } = await this.client
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);
        
      if (countError) throw countError;
      
      if ((count || 0) >= 12) {
        return {
          success: false,
          message: 'This team has reached the maximum number of members (12)'
        };
      }
      
      // Join the team
      const { error: joinError } = await this.client
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: TeamRoles.MEMBER
        });
        
      if (joinError) throw joinError;

      // Record team growth metric
      await this.recordTeamMetric(
        teamId,
        'growth',
        1,
        { action: 'member_joined', user_id: userId }
      );

      return {
        success: true,
        message: 'Successfully joined the team'
      };
    } catch (error) {
      console.error('Join team error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error joining team'
      };
    }
  }

  /**
   * Leave a team
   * 
   * @param userId User ID leaving the team
   * @param teamId Team ID to leave
   * @returns Result of leaving the team
   */
  async leaveTeam(userId: string, teamId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Check if user is the team leader
      const { data: teamData, error: teamError } = await this.client
        .from('teams')
        .select('leader_id')
        .eq('id', teamId)
        .single();
        
      if (teamError) throw teamError;
      
      if (teamData.leader_id === userId) {
        return {
          success: false,
          message: 'Team leaders cannot leave. Transfer leadership first or delete the team.'
        };
      }
      
      // Leave the team
      const { error: leaveError } = await this.client
        .from('team_members')
        .delete()
        .eq('user_id', userId)
        .eq('team_id', teamId);
        
      if (leaveError) throw leaveError;

      // Record team metric
      await this.recordTeamMetric(
        teamId,
        'growth',
        -1,
        { action: 'member_left', user_id: userId }
      );

      return {
        success: true,
        message: 'Successfully left the team'
      };
    } catch (error) {
      console.error('Leave team error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error leaving team'
      };
    }
  }

  /**
   * Transfer team leadership to another member
   * 
   * @param leaderId Current leader's user ID
   * @param teamId Team ID
   * @param newLeaderId New leader's user ID
   * @returns Result of leadership transfer
   */
  async transferLeadership(leaderId: string, teamId: string, newLeaderId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Verify current leader
      const { data: teamData, error: teamError } = await this.client
        .from('teams')
        .select('leader_id')
        .eq('id', teamId)
        .single();
        
      if (teamError) throw teamError;
      
      if (teamData.leader_id !== leaderId) {
        return {
          success: false,
          message: 'Only the current team leader can transfer leadership'
        };
      }
      
      // Verify new leader is a team member
      const { data: memberData, error: memberError } = await this.client
        .from('team_members')
        .select('id')
        .eq('user_id', newLeaderId)
        .eq('team_id', teamId)
        .maybeSingle();
        
      if (memberError) throw memberError;
      
      if (!memberData) {
        return {
          success: false,
          message: 'The new leader must be a member of the team'
        };
      }
      
      // Update team leader
      const { error: updateTeamError } = await this.client
        .from('teams')
        .update({ leader_id: newLeaderId })
        .eq('id', teamId);
        
      if (updateTeamError) throw updateTeamError;
      
      // Update member roles
      const { error: updateOldLeaderError } = await this.client
        .from('team_members')
        .update({ role: TeamRoles.MEMBER })
        .eq('user_id', leaderId)
        .eq('team_id', teamId);
        
      if (updateOldLeaderError) throw updateOldLeaderError;
      
      const { error: updateNewLeaderError } = await this.client
        .from('team_members')
        .update({ role: TeamRoles.OWNER })
        .eq('user_id', newLeaderId)
        .eq('team_id', teamId);
        
      if (updateNewLeaderError) throw updateNewLeaderError;

      // Record team metric
      await this.recordTeamMetric(
        teamId,
        'interaction',
        1,
        { 
          action: 'leadership_transfer', 
          previous_leader: leaderId,
          new_leader: newLeaderId
        }
      );

      return {
        success: true,
        message: 'Leadership transferred successfully'
      };
    } catch (error) {
      console.error('Transfer leadership error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error transferring leadership'
      };
    }
  }

  /**
   * Get all teams
   * 
   * @returns List of all teams with member counts
   */
  async getAllTeams(): Promise<{
    success: boolean;
    data?: Array<{
      id: string;
      name: string;
      description: string | null;
      leader_id: string;
      created_at: string;
      memberCount: number;
    }>;
    error?: string;
  }> {
    try {
      const { data, error } = await this.client
        .from('teams')
        .select(`
          id,
          name,
          description,
          leader_id,
          created_at
        `);

      if (error) throw error;

      // Get member counts for each team using separate queries
      const teamIds = data.map(team => team.id);
      
      // Create a map to store counts
      const countMap = new Map<string, number>();
      
      // For each team, get the count of members
      for (const teamId of teamIds) {
        const { count, error: countError } = await this.client
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamId);
          
        if (countError) throw countError;
        countMap.set(teamId, count || 0);
      }

      // Format the response - ensure no null values
      const formattedTeams = data.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description ?? '', // Provide default for null
        leader_id: team.leader_id,
        created_at: team.created_at ?? new Date().toISOString(), // Provide default for null
        memberCount: countMap.get(team.id) || 0
      }));

      return {
        success: true,
        data: formattedTeams
      };
    } catch (error) {
      console.error('Get all teams error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting teams'
      };
    }
  }

  /**
   * Get teams that a user is a member of
   * 
   * @param userId User ID to get teams for
   * @returns List of teams the user is a member of
   */
  async getUserTeams(userId: string): Promise<{
    success: boolean;
    data?: Array<{
      teamId: string;
      role: string;
      joinedAt: string;
      team: {
        id: string;
        name: string;
        description: string | null;
        leader_id: string;
        created_at: string;
        memberCount: number;
      };
    }>;
    error?: string;
  }> {
    try {
      // Get team memberships for the user
      const { data: memberships, error: membershipError } = await this.client
        .from('team_members')
        .select(`
          team_id,
          role,
          joined_at
        `)
        .eq('user_id', userId);

      if (membershipError) throw membershipError;

      if (!memberships || memberships.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      // Get team details
      const teamIds = memberships.map(m => m.team_id);
      const { data: teams, error: teamsError } = await this.client
        .from('teams')
        .select(`
          id,
          name,
          description,
          leader_id,
          created_at
        `)
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      // Get member counts for each team using separate queries
      const countMap = new Map<string, number>();
      
      // For each team, get the count of members
      for (const teamId of teamIds) {
        const { count, error: countError } = await this.client
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamId);
          
        if (countError) throw countError;
        countMap.set(teamId, count || 0);
      }

      // Create a map of team ID to team details
      const teamMap = new Map<string, Team>();
      teams.forEach(team => {
        teamMap.set(team.id, {
          ...team,
          memberCount: countMap.get(team.id) || 0
        });
      });

      // Format the response - handle nullable fields
      const userTeams = memberships
        .filter(membership => teamMap.has(membership.team_id))
        .map(membership => {
          const team = teamMap.get(membership.team_id);
          return {
            teamId: membership.team_id,
            role: membership.role,
            joinedAt: membership.joined_at ?? new Date().toISOString(), // Provide default for null
            team: {
              id: team.id,
              name: team.name,
              description: team.description ?? '', // Provide default for null
              leader_id: team.leader_id,
              created_at: team.created_at ?? new Date().toISOString(), // Provide default for null
              memberCount: team.memberCount
            }
          };
        });

      return {
        success: true,
        data: userTeams
      };
    } catch (error) {
      console.error('Get user teams error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting user teams'
      };
    }
  }

  /**
   * Get a team's details including members
   * 
   * @param teamId Team ID to get details for
   * @returns Team details with members
   */
  async getTeamDetails(teamId: string): Promise<{
    success: boolean;
    data?: {
      id: string;
      name: string;
      description: string | null;
      leader_id: string;
      created_at: string;
      members: Array<{
        id: string;
        user_id: string;
        role: string;
        joined_at: string;
        profile: {
          id: string;
          username: string;
          fullName: string | null;
          avatarUrl: string | null;
        } | null;
      }>;
    };
    error?: string;
  }> {
    try {
      // Get team details
      const { data: teamData, error: teamError } = await this.client
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;

      if (!teamData) {
        throw new Error('Team not found');
      }

      // Get team members
      const { data: membersData, error: membersError } = await this.client
        .from('team_members')
        .select(`
          id,
          user_id,
          role,
          joined_at
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (membersError) throw membersError;

      // Get profiles for each member using a custom RPC function
      // This is a workaround since 'profiles' is not in the Database type
      const userIds = membersData.map(member => member.user_id);
      
      // Create a map to store profile data
      const profileMap = new Map<string, Profile>();
      
      // Fetch profile data for each user ID
      // Note: In a real implementation, you would create an RPC function to get profiles
      for (const userId of userIds) {
        try {
          // This would be replaced with an actual RPC call to get profile data
          // const { data: profile } = await this.supabase.rpc('get_user_profile', { user_id: userId });
          
          // Simulated profile data for now
          const profile: Profile = {
            id: userId,
            username: `user_${userId}`,
            fullName: `User ${userId}`,
            avatarUrl: undefined
          };
          
          profileMap.set(userId, profile);
        } catch (e) {
          console.error(`Error fetching profile for user ${userId}:`, e);
          // Continue with other profiles even if one fails
        }
      }

      // Format the response - handle nullable fields
      const formattedMembers = membersData.map(member => {
        const profile = profileMap.get(member.user_id);
        return {
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at ?? new Date().toISOString(), // Provide default for null
          profile: profile ? {
            id: profile.id,
            username: profile.username,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl
          } : null
        };
      });

      const teamDetails = {
        id: teamData.id,
        name: teamData.name,
        description: teamData.description ?? '', // Provide default for null
        leader_id: teamData.leader_id,
        created_at: teamData.created_at ?? new Date().toISOString(), // Provide default for null
        members: formattedMembers
      };

      return {
        success: true,
        data: teamDetails
      };
    } catch (error) {
      console.error('Get team details error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting team details'
      };
    }
  }

  /**
   * Record a team metric
   * 
   * @param teamId Team ID
   * @param metricType Type of metric
   * @param value Metric value
   * @param metadata Additional metadata
   * @returns Success status
   */
  private async recordTeamMetric(
    teamId: string,
    metricType: string,
    value: number,
    metadata: Record<string, unknown> = {}
  ): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('team_metrics')
        .insert({
          team_id: teamId,
          metric_type: metricType,
          value,
          metadata,
          recorded_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('Record team metric error:', error);
      return false;
    }
  }

  /**
   * Start a team challenge
   * 
   * @param teamId Team ID
   * @param challengeId Challenge ID
   * @returns Result of starting the challenge
   */
  async startTeamChallenge(teamId: string, challengeId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Check if the team is already working on this challenge
      const { data: existingChallenge, error: checkError } = await this.client
        .from('team_challenges')
        .select('id, status')
        .eq('team_id', teamId)
        .eq('challenge_id', challengeId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingChallenge) {
        if (existingChallenge.status === TeamChallengeStatuses.COMPLETED) {
          return {
            success: false,
            message: 'This challenge has already been completed by your team'
          };
        } else if (existingChallenge.status === TeamChallengeStatuses.IN_PROGRESS) {
          return {
            success: false,
            message: 'Your team is already working on this challenge'
          };
        }
      }
      
      // Start the challenge
      const { error: startError } = await this.client
        .from('team_challenges')
        .insert({
          team_id: teamId,
          challenge_id: challengeId,
          status: TeamChallengeStatuses.IN_PROGRESS,
          started_at: new Date().toISOString()
        });
        
      if (startError) throw startError;

      // Record team metric
      await this.recordTeamMetric(
        teamId,
        'interaction',
        1,
        { action: 'challenge_started', challenge_id: challengeId }
      );

      return {
        success: true,
        message: 'Challenge started successfully'
      };
    } catch (error) {
      console.error('Start team challenge error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error starting team challenge'
      };
    }
  }

  /**
   * Complete a team challenge
   * 
   * @param teamId Team ID
   * @param challengeId Challenge ID
   * @returns Result of completing the challenge
   */
  async completeTeamChallenge(teamId: string, challengeId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Check if the team is working on this challenge
      const { data: existingChallenge, error: checkError } = await this.client
        .from('team_challenges')
        .select('id, status')
        .eq('team_id', teamId)
        .eq('challenge_id', challengeId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (!existingChallenge) {
        return {
          success: false,
          message: 'Your team is not working on this challenge'
        };
      }
      
      if (existingChallenge.status === TeamChallengeStatuses.COMPLETED) {
        return {
          success: false,
          message: 'This challenge has already been completed'
        };
      }
      
      // Complete the challenge
      const { error: completeError } = await this.client
        .from('team_challenges')
        .update({
          status: TeamChallengeStatuses.COMPLETED,
          completed_at: new Date().toISOString()
        })
        .eq('id', existingChallenge.id);
        
      if (completeError) throw completeError;

      // Record team metric
      await this.recordTeamMetric(
        teamId,
        'interaction',
        5,
        { action: 'challenge_completed', challenge_id: challengeId }
      );

      return {
        success: true,
        message: 'Challenge completed successfully'
      };
    } catch (error) {
      console.error('Complete team challenge error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error completing team challenge'
      };
    }
  }

  async addTeamMember(teamId: string, userId: string): Promise<void> {
    const { error: memberError } = await this.client
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: TeamRoles.MEMBER
      });
      
    if (memberError) throw memberError;
  }

  async updateTeamLeader(teamId: string, oldLeaderId: string, newLeaderId: string): Promise<void> {
    // Update old leader to member
    const { error: oldLeaderError } = await this.client
      .from('team_members')
      .update({ role: TeamRoles.MEMBER })
      .eq('user_id', oldLeaderId)
      .eq('team_id', teamId);
      
    if (oldLeaderError) throw oldLeaderError;
    
    // Update new leader
    const { error: newLeaderError } = await this.client
      .from('team_members')
      .update({ role: TeamRoles.OWNER })
      .eq('user_id', newLeaderId)
      .eq('team_id', teamId);
      
    if (newLeaderError) throw newLeaderError;
  }

  async updateTeamMemberRole(teamId: string, userId: string, role: TeamRole): Promise<void> {
    const { error } = await this.client
      .from('team_members')
      .update({
        role: role,
      })
      .match({
        team_id: teamId,
        user_id: userId,
      });

    if (error) {
      throw new Error(`Failed to update team member role: ${error.message}`);
    }
  }

  async updateChallengeStatus(teamId: string, challengeId: string, status: TeamChallengeStatus): Promise<void> {
    const { error } = await this.client
      .from('team_challenges')
      .update({
        status: status,
      })
      .match({
        team_id: teamId,
        challenge_id: challengeId,
      });

    if (error) {
      throw new Error(`Failed to update challenge status: ${error.message}`);
    }
  }
}

// Export a singleton instance
export const teamsService = new TeamsService();

// Export default for direct imports
export default teamsService;
