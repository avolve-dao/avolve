import { useState, useEffect, useCallback, useMemo } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { TokenService } from './token-service';
import { 
  ConsensusService, 
  ConsensusMetingData
} from './consensus-service';

// Temporary: define TokenAllocationProposalData as 'any' until type is properly exported
type TokenAllocationProposalData = any;

/**
 * Hook for interacting with the consensus mechanism
 */
export function useConsensus(supabaseClient: SupabaseClient, userId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<ConsensusMetingData[]>([]);
  
  // Initialize services
  const tokenService = new TokenService(supabaseClient);
  const consensusService = useMemo(() => new ConsensusService(supabaseClient, tokenService), [supabaseClient, tokenService]);

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

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadUpcomingMeetings();
    }
  }, [userId, loadUpcomingMeetings]);

  // NOTE: Proposal and respect logic has been deprecated. See GovernanceService for new flows (circles, peer review, reputation).

  return {
    // State
    isLoading,
    error,
    upcomingMeetings,
    
    // Data loading
    loadUpcomingMeetings,
    
    // Meeting functions
    scheduleMeeting,
    checkInToMeeting,
    getGroupsForMeeting,
    getParticipantsForGroup,
    reportConsensusRankings,
  };
}
