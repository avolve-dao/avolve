import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { TokenService } from './token-service';
import { 
  ConsensusService, 
  ConsensusMetingData, 
  ConsensusGroupData, 
  ConsensusParticipantData,
  PendingRespectData,
  TokenAllocationProposalData,
  TokenAllocationVoteData
} from './consensus-service';

/**
 * Hook for interacting with the consensus mechanism
 */
export function useConsensus(supabaseClient: SupabaseClient, userId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<ConsensusMetingData[]>([]);
  const [pendingRespect, setPendingRespect] = useState<PendingRespectData[]>([]);
  const [activeProposals, setActiveProposals] = useState<TokenAllocationProposalData[]>([]);
  
  // Initialize services
  const tokenService = new TokenService(supabaseClient);
  const consensusService = new ConsensusService(supabaseClient, tokenService);

  // Load upcoming meetings
  const loadUpcomingMeetings = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const meetings = await consensusService.getUpcomingMeetings();
      setUpcomingMeetings(meetings);
    } catch (err) {
      setError('Failed to load upcoming meetings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Load pending respect
  const loadPendingRespect = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const respect = await consensusService.getPendingRespect();
      setPendingRespect(respect);
    } catch (err) {
      setError('Failed to load pending respect');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Load active proposals
  const loadActiveProposals = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const proposals = await consensusService.getActiveProposals();
      setActiveProposals(proposals);
    } catch (err) {
      setError('Failed to load active proposals');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Schedule a meeting
  const scheduleMeeting = useCallback(async (
    meetingTime: Date,
    durationMinutes: number,
    tokenTypeId: string
  ) => {
    if (!userId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const meeting = await consensusService.scheduleMeeting(
        meetingTime,
        durationMinutes,
        tokenTypeId
      );
      
      if (meeting) {
        await loadUpcomingMeetings();
      }
      
      return meeting;
    } catch (err) {
      setError('Failed to schedule meeting');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService, loadUpcomingMeetings]);

  // Check in to a meeting
  const checkInToMeeting = useCallback(async (meetingId: string) => {
    if (!userId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await consensusService.checkInToMeeting(meetingId);
      return success;
    } catch (err) {
      setError('Failed to check in to meeting');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Get groups for a meeting
  const getGroupsForMeeting = useCallback(async (meetingId: string) => {
    if (!userId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const groups = await consensusService.getGroupsForMeeting(meetingId);
      return groups;
    } catch (err) {
      setError('Failed to get groups for meeting');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Get participants for a group
  const getParticipantsForGroup = useCallback(async (groupId: string) => {
    if (!userId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const participants = await consensusService.getParticipantsForGroup(groupId);
      return participants;
    } catch (err) {
      setError('Failed to get participants for group');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Report consensus rankings
  const reportConsensusRankings = useCallback(async (
    groupId: string,
    rankings: Record<string, number>
  ) => {
    if (!userId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await consensusService.reportConsensusRankings(groupId, rankings);
      return success;
    } catch (err) {
      setError('Failed to report consensus rankings');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Claim pending respect
  const claimPendingRespect = useCallback(async (pendingRespectId: string) => {
    if (!userId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await consensusService.claimPendingRespect(pendingRespectId);
      
      if (success) {
        await loadPendingRespect();
      }
      
      return success;
    } catch (err) {
      setError('Failed to claim pending respect');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService, loadPendingRespect]);

  // Create a token allocation proposal
  const createTokenAllocationProposal = useCallback(async (
    title: string,
    description: string,
    tokenId: string,
    allocationAmount: number,
    recipientId?: string,
    recipientTeamId?: string,
    votingDurationDays = 7
  ) => {
    if (!userId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const proposalId = await consensusService.createTokenAllocationProposal(
        title,
        description,
        tokenId,
        allocationAmount,
        recipientId,
        recipientTeamId,
        votingDurationDays
      );
      
      if (proposalId) {
        await loadActiveProposals();
      }
      
      return proposalId;
    } catch (err) {
      setError('Failed to create token allocation proposal');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService, loadActiveProposals]);

  // Vote on a proposal
  const voteOnProposal = useCallback(async (
    proposalId: string,
    vote: 'approve' | 'reject'
  ) => {
    if (!userId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await consensusService.voteOnProposal(proposalId, vote);
      return success;
    } catch (err) {
      setError('Failed to vote on proposal');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Get votes for a proposal
  const getVotesForProposal = useCallback(async (proposalId: string) => {
    if (!userId) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const votes = await consensusService.getVotesForProposal(proposalId);
      return votes;
    } catch (err) {
      setError('Failed to get votes for proposal');
      console.error(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService]);

  // Process proposals
  const processProposals = useCallback(async () => {
    if (!userId) return 0;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const count = await consensusService.processProposals();
      
      if (count > 0) {
        await loadActiveProposals();
      }
      
      return count;
    } catch (err) {
      setError('Failed to process proposals');
      console.error(err);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [userId, consensusService, loadActiveProposals]);

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadUpcomingMeetings();
      loadPendingRespect();
      loadActiveProposals();
    }
  }, [userId, loadUpcomingMeetings, loadPendingRespect, loadActiveProposals]);

  return {
    // State
    isLoading,
    error,
    upcomingMeetings,
    pendingRespect,
    activeProposals,
    
    // Data loading
    loadUpcomingMeetings,
    loadPendingRespect,
    loadActiveProposals,
    
    // Meeting functions
    scheduleMeeting,
    checkInToMeeting,
    getGroupsForMeeting,
    getParticipantsForGroup,
    reportConsensusRankings,
    
    // Respect functions
    claimPendingRespect,
    
    // Proposal functions
    createTokenAllocationProposal,
    voteOnProposal,
    getVotesForProposal,
    processProposals,
  };
}
