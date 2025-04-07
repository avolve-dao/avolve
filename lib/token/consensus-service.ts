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

/**
 * Interface for pending respect data
 */
export interface PendingRespectData {
  id: string;
  user_id: string;
  token_id: string;
  amount: number;
  source: string;
  source_id?: string;
  can_claim_at: string;
  created_at: string;
  claimed_at?: string;
}

/**
 * Interface for token allocation proposal data
 */
export interface TokenAllocationProposalData {
  id: string;
  title: string;
  description: string;
  proposed_by: string;
  token_id: string;
  allocation_amount: number;
  recipient_id?: string;
  recipient_team_id?: string;
  status: 'active' | 'approved' | 'rejected' | 'executed';
  voting_ends_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for token allocation vote data
 */
export interface TokenAllocationVoteData {
  id: string;
  proposal_id: string;
  user_id: string;
  vote: 'approve' | 'reject';
  created_at: string;
}

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
   * Get pending respect for the current user
   * @returns Array of pending respect
   */
  async getPendingRespect(): Promise<PendingRespectData[]> {
    try {
      const userId = await this.getCurrentUserId();
      
      const { data, error } = await this.client
        .from('pending_respect')
        .select('*')
        .eq('user_id', userId)
        .is('claimed_at', null)
        .lte('can_claim_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting pending respect:', error);
        return [];
      }

      return data as PendingRespectData[];
    } catch (error) {
      console.error('Unexpected error getting pending respect:', error);
      return [];
    }
  }

  /**
   * Claim pending respect
   * @param pendingRespectId ID of the pending respect
   * @returns True if claiming was successful, false otherwise
   */
  async claimPendingRespect(pendingRespectId: string): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('claim_pending_respect', {
        p_pending_respect_id: pendingRespectId,
      });

      if (error) {
        console.error('Error claiming pending respect:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Unexpected error claiming pending respect:', error);
      return false;
    }
  }

  /**
   * Create a token allocation proposal
   * @param title Title of the proposal
   * @param description Description of the proposal
   * @param tokenId ID of the token
   * @param allocationAmount Amount to allocate
   * @param recipientId ID of the recipient user (optional)
   * @param recipientTeamId ID of the recipient team (optional)
   * @param votingDurationDays Duration of voting in days
   * @returns ID of the created proposal or null if there was an error
   */
  async createTokenAllocationProposal(
    title: string,
    description: string,
    tokenId: string,
    allocationAmount: number,
    recipientId?: string,
    recipientTeamId?: string,
    votingDurationDays = 7
  ): Promise<string | null> {
    try {
      const { data, error } = await this.client.rpc('create_token_allocation_proposal', {
        p_title: title,
        p_description: description,
        p_token_id: tokenId,
        p_allocation_amount: allocationAmount,
        p_recipient_id: recipientId,
        p_recipient_team_id: recipientTeamId,
        p_voting_duration_days: votingDurationDays,
      });

      if (error) {
        console.error('Error creating token allocation proposal:', error);
        return null;
      }

      return data as string;
    } catch (error) {
      console.error('Unexpected error creating token allocation proposal:', error);
      return null;
    }
  }

  /**
   * Get all active token allocation proposals
   * @returns Array of active proposals
   */
  async getActiveProposals(): Promise<TokenAllocationProposalData[]> {
    try {
      const { data, error } = await this.client
        .from('token_allocation_proposals')
        .select('*')
        .eq('status', 'active')
        .order('voting_ends_at', { ascending: true });

      if (error) {
        console.error('Error getting active token allocation proposals:', error);
        return [];
      }

      return data as TokenAllocationProposalData[];
    } catch (error) {
      console.error('Unexpected error getting active token allocation proposals:', error);
      return [];
    }
  }

  /**
   * Get a token allocation proposal by ID
   * @param proposalId ID of the proposal
   * @returns The proposal data or null if not found
   */
  async getProposalById(proposalId: string): Promise<TokenAllocationProposalData | null> {
    try {
      const { data, error } = await this.client
        .from('token_allocation_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error) {
        console.error('Error getting token allocation proposal:', error);
        return null;
      }

      return data as TokenAllocationProposalData;
    } catch (error) {
      console.error('Unexpected error getting token allocation proposal:', error);
      return null;
    }
  }

  /**
   * Vote on a token allocation proposal
   * @param proposalId ID of the proposal
   * @param vote 'approve' or 'reject'
   * @returns True if voting was successful, false otherwise
   */
  async voteOnProposal(
    proposalId: string,
    vote: 'approve' | 'reject'
  ): Promise<boolean> {
    try {
      const { data, error } = await this.client.rpc('vote_on_token_allocation_proposal', {
        p_proposal_id: proposalId,
        p_vote: vote,
      });

      if (error) {
        console.error('Error voting on token allocation proposal:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Unexpected error voting on token allocation proposal:', error);
      return false;
    }
  }

  /**
   * Get votes for a proposal
   * @param proposalId ID of the proposal
   * @returns Array of votes
   */
  async getVotesForProposal(proposalId: string): Promise<TokenAllocationVoteData[]> {
    try {
      const { data, error } = await this.client
        .from('token_allocation_votes')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting votes for token allocation proposal:', error);
        return [];
      }

      return data as TokenAllocationVoteData[];
    } catch (error) {
      console.error('Unexpected error getting votes for token allocation proposal:', error);
      return [];
    }
  }

  /**
   * Process token allocation proposals
   * @returns Number of processed proposals
   */
  async processProposals(): Promise<number> {
    try {
      const { data, error } = await this.client.rpc('process_token_allocation_proposals');

      if (error) {
        console.error('Error processing token allocation proposals:', error);
        return 0;
      }

      return data as number;
    } catch (error) {
      console.error('Unexpected error processing token allocation proposals:', error);
      return 0;
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
