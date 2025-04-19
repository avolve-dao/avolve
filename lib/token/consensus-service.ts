import { SupabaseClient } from '@supabase/supabase-js';
import { TokenService } from './token-service';

/**
 * Interface for consensus meeting data
 */
export interface ConsensusMetingData {
  id: string;
  meeting_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  participants_count: number;
  token_type_id: string;
  total_tokens_distributed: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for consensus group data
 */
export interface ConsensusGroupData {
  id: string;
  meeting_id: string;
  round: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

/**
 * Interface for consensus participant data
 */
export interface ConsensusParticipantData {
  id: string;
  group_id: string;
  user_id: string;
  rank?: number;
  respect_earned?: number;
  status: 'checked_in' | 'present' | 'absent' | 'ranked';
  created_at: string;
  updated_at: string;
}

// Import new types/services for circles, peer review, and reputation
import { Circle, CircleMember } from '@/lib/governance/types';
import { PeerReview, Reputation } from '@/lib/governance/types';

/**
 * Service for managing the consensus mechanism
 */
export class ConsensusService {
  private client: SupabaseClient;
  private tokenService: TokenService;

  /**
   * Constructor for ConsensusService
   * @param client Supabase client
   * @param tokenService TokenService instance
   */
  constructor(client: SupabaseClient, tokenService: TokenService) {
    this.client = client;
    this.tokenService = tokenService;
  }

  /**
   * Schedule a new consensus meeting
   * @param meetingTime Time of the meeting
   * @param durationMinutes Duration of the meeting in minutes
   * @param tokenTypeId ID of the token type for the meeting
   * @returns The created meeting or null if there was an error
   */
  async scheduleMeeting(
    meetingTime: Date,
    durationMinutes: number,
    tokenTypeId: string
  ): Promise<ConsensusMetingData | null> {
    try {
      const { data, error } = await this.client.rpc('schedule_consensus_meeting', {
        p_meeting_time: meetingTime.toISOString(),
        p_duration_minutes: durationMinutes,
        p_token_type_id: tokenTypeId,
      });

      if (error) {
        console.error('Error scheduling consensus meeting:', error);
        return null;
      }

      // Fetch the created meeting
      const meetingId = data;
      return await this.getMeetingById(meetingId);
    } catch (error) {
      console.error('Unexpected error scheduling consensus meeting:', error);
      return null;
    }
  }

  /**
   * Get a consensus meeting by ID
   * @param meetingId ID of the meeting
   * @returns The meeting data or null if not found
   */
  async getMeetingById(meetingId: string): Promise<ConsensusMetingData | null> {
    try {
      const { data, error } = await this.client
        .from('consensus_meetings')
        .select('*')
        .eq('id', meetingId)
        .single();

      if (error) {
        console.error('Error getting consensus meeting:', error);
        return null;
      }

      return data as ConsensusMetingData;
    } catch (error) {
      console.error('Unexpected error getting consensus meeting:', error);
      return null;
    }
  }

  /**
   * Get all upcoming consensus meetings
   * @returns Array of upcoming meetings
   */
  async getUpcomingMeetings(): Promise<ConsensusMetingData[]> {
    try {
      const { data, error } = await this.client
        .from('consensus_meetings')
        .select('*')
        .gte('meeting_time', new Date().toISOString())
        .order('meeting_time', { ascending: true });

      if (error) {
        console.error('Error getting upcoming consensus meetings:', error);
        return [];
      }

      return data as ConsensusMetingData[];
    } catch (error) {
      console.error('Unexpected error getting upcoming consensus meetings:', error);
      return [];
    }
  }

  /**
   * Check in to a consensus meeting
   * @param meetingId ID of the meeting
   * @returns True if check-in was successful, false otherwise
   */
  async checkInToMeeting(meetingId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await this.client.rpc('check_in_to_consensus_meeting', {
        p_meeting_id: meetingId,
        p_user_id: userId,
      });

      if (error) {
        console.error('Error checking in to consensus meeting:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Unexpected error checking in to consensus meeting:', error);
      return false;
    }
  }

  /**
   * Form consensus groups for a meeting
   * @param meetingId ID of the meeting
   * @returns Number of groups formed or 0 if there was an error
   */
  async formConsensusGroups(meetingId: string): Promise<number> {
    try {
      const { data, error } = await this.client.rpc('form_consensus_groups', {
        p_meeting_id: meetingId,
      });

      if (error) {
        console.error('Error forming consensus groups:', error);
        return 0;
      }

      return data as number;
    } catch (error) {
      console.error('Unexpected error forming consensus groups:', error);
      return 0;
    }
  }

  /**
   * Get groups for a meeting
   * @param meetingId ID of the meeting
   * @returns Array of consensus groups
   */
  async getGroupsForMeeting(meetingId: string): Promise<ConsensusGroupData[]> {
    try {
      const { data, error } = await this.client
        .from('consensus_groups')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('round', { ascending: true });

      if (error) {
        console.error('Error getting consensus groups for meeting:', error);
        return [];
      }

      return data as ConsensusGroupData[];
    } catch (error) {
      console.error('Unexpected error getting consensus groups for meeting:', error);
      return [];
    }
  }

  /**
   * Get participants for a group
   * @param groupId ID of the group
   * @returns Array of consensus participants
   */
  async getParticipantsForGroup(groupId: string): Promise<ConsensusParticipantData[]> {
    try {
      const { data, error } = await this.client
        .from('consensus_participants')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting consensus participants for group:', error);
        return [];
      }

      return data as ConsensusParticipantData[];
    } catch (error) {
      console.error('Unexpected error getting consensus participants for group:', error);
      return [];
    }
  }

  /**
   * Report consensus rankings
   * @param groupId ID of the group
   * @param rankings Map of user IDs to rankings
   * @returns True if reporting was successful, false otherwise
   */
  async reportConsensusRankings(
    groupId: string,
    rankings: Record<string, number>
  ): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('report_consensus_rankings', {
        p_group_id: groupId,
        p_rankings: rankings,
      });

      if (error) {
        console.error('Error reporting consensus rankings:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Unexpected error reporting consensus rankings:', error);
      return false;
    }
  }

  /**
   * Get the current user ID
   * @returns The current user ID
   */
  private async getCurrentUserId(): Promise<string> {
    try {
      const { data } = await this.client.auth.getUser();
      return data.user?.id || '';
    } catch (error) {
      console.error('Unexpected error getting current user ID:', error);
      return '';
    }
  }
}

// ============================
// REFACTORED FOR FRACTAL GOVERNANCE
// ============================
// Legacy token allocation proposal, voting, and respect logic removed.
// New flows: circle-based governance, peer review, and merit-based reputation.

export class GovernanceService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // Circles
  async getCircles(): Promise<Circle[]> {
    const { data, error } = await this.client.from('circles').select('*');
    if (error) throw error;
    return data as Circle[];
  }
  async joinCircle(circleId: string): Promise<void> {
    await this.client.from('circle_members').insert({ circle_id: circleId });
  }
  async leaveCircle(circleId: string): Promise<void> {
    await this.client.from('circle_members').delete().eq('circle_id', circleId);
  }
  async getCircleMembers(circleId: string): Promise<CircleMember[]> {
    const { data, error } = await this.client.from('circle_members').select('*').eq('circle_id', circleId);
    if (error) throw error;
    return data as CircleMember[];
  }

  // Peer Reviews
  async submitPeerReview({ circleId, revieweeId, feedback, score }: { circleId: string; revieweeId: string; feedback: string; score: number }): Promise<void> {
    await this.client.from('peer_reviews').insert({ circle_id: circleId, reviewee_id: revieweeId, feedback, score });
  }
  async getPeerReviews(circleId: string): Promise<PeerReview[]> {
    const { data, error } = await this.client.from('peer_reviews').select('*').eq('circle_id', circleId);
    if (error) throw error;
    return data as PeerReview[];
  }

  // Reputation
  async getReputation(userId: string): Promise<Reputation> {
    const { data, error } = await this.client.from('user_reputation').select('*').eq('user_id', userId).single();
    if (error) throw error;
    return data as Reputation;
  }
}
