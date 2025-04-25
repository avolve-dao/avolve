/**
 * Governance API Client
 *
 * This client handles interactions with the governance system of the Avolve platform,
 * including weekly meetings, meeting groups, participants, and consensus notes.
 */

import { ApiClient } from './client';
import type {
  WeeklyMeeting,
  MeetingGroup,
  MeetingParticipant,
  MeetingNote,
  MeetingStatus,
  ParticipantStatus,
} from '../types/database.types';

export class GovernanceApi extends ApiClient {
  /**
   * Get all upcoming weekly meetings
   * @param limit Optional limit on the number of meetings returned
   * @returns Array of upcoming meetings
   */
  async getUpcomingMeetings(limit: number = 10): Promise<WeeklyMeeting[]> {
    const { data, error } = await this.client
      .from('weekly_meetings')
      .select('*')
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(limit);

    this.handleError(error);
    return data || [];
  }

  /**
   * Get a specific weekly meeting by ID
   * @param meetingId The ID of the meeting
   * @returns The meeting or null if not found
   */
  async getMeeting(meetingId: string): Promise<WeeklyMeeting | null> {
    const { data, error } = await this.client
      .from('weekly_meetings')
      .select('*')
      .eq('id', meetingId)
      .single();

    this.handleError(error);
    return data;
  }

  /**
   * Create a new weekly meeting
   * @param meeting The meeting data to create
   * @returns The created meeting
   */
  async createMeeting(
    meeting: Omit<WeeklyMeeting, 'id' | 'created_at' | 'updated_at'>
  ): Promise<WeeklyMeeting> {
    const { data, error } = await this.client
      .from('weekly_meetings')
      .insert(meeting)
      .select()
      .single();

    this.handleError(error);
    return data;
  }

  /**
   * Update a weekly meeting
   * @param meetingId The ID of the meeting to update
   * @param updates The fields to update
   * @returns The updated meeting
   */
  async updateMeeting(
    meetingId: string,
    updates: Partial<Omit<WeeklyMeeting, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<WeeklyMeeting> {
    const { data, error } = await this.client
      .from('weekly_meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single();

    this.handleError(error);
    return data;
  }

  /**
   * Get all meeting groups for a specific meeting
   * @param meetingId The ID of the meeting
   * @returns Array of meeting groups
   */
  async getMeetingGroups(meetingId: string): Promise<MeetingGroup[]> {
    const { data, error } = await this.client
      .from('meeting_groups')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    this.handleError(error);
    return data || [];
  }

  /**
   * Create a new meeting group
   * @param group The group data to create
   * @returns The created group
   */
  async createMeetingGroup(
    group: Omit<MeetingGroup, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MeetingGroup> {
    const { data, error } = await this.client
      .from('meeting_groups')
      .insert(group)
      .select()
      .single();

    this.handleError(error);
    return data;
  }

  /**
   * Update a meeting group
   * @param groupId The ID of the group to update
   * @param updates The fields to update
   * @returns The updated group
   */
  async updateMeetingGroup(
    groupId: string,
    updates: Partial<Omit<MeetingGroup, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<MeetingGroup> {
    const { data, error } = await this.client
      .from('meeting_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    this.handleError(error);
    return data;
  }

  /**
   * Register a user for a meeting
   * @param userId The ID of the user
   * @param meetingId The ID of the meeting
   * @returns The ID of the created participant record
   */
  async registerForMeeting(userId: string, meetingId: string): Promise<string> {
    const { data, error } = await this.client.rpc('register_for_meeting', {
      p_user_id: userId,
      p_meeting_id: meetingId,
    });

    this.handleError(error);
    return data;
  }

  /**
   * Get all participants for a meeting
   * @param meetingId The ID of the meeting
   * @returns Array of meeting participants
   */
  async getMeetingParticipants(meetingId: string): Promise<MeetingParticipant[]> {
    const { data, error } = await this.client
      .from('meeting_participants')
      .select('*')
      .eq('meeting_id', meetingId);

    this.handleError(error);
    return data || [];
  }

  /**
   * Update a participant's status
   * @param participantId The ID of the participant record
   * @param status The new status
   * @returns The updated participant record
   */
  async updateParticipantStatus(
    participantId: string,
    status: ParticipantStatus
  ): Promise<MeetingParticipant> {
    const { data, error } = await this.client
      .from('meeting_participants')
      .update({ status })
      .eq('id', participantId)
      .select()
      .single();

    this.handleError(error);
    return data;
  }

  /**
   * Get all notes for a meeting
   * @param meetingId The ID of the meeting
   * @returns Array of meeting notes
   */
  async getMeetingNotes(meetingId: string): Promise<MeetingNote[]> {
    const { data, error } = await this.client
      .from('meeting_notes')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true });

    this.handleError(error);
    return data || [];
  }

  /**
   * Create a new meeting note
   * @param note The note data to create
   * @returns The created note
   */
  async createMeetingNote(
    note: Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MeetingNote> {
    const { data, error } = await this.client.from('meeting_notes').insert(note).select().single();

    this.handleError(error);
    return data;
  }

  /**
   * Update a meeting note
   * @param noteId The ID of the note to update
   * @param updates The fields to update
   * @returns The updated note
   */
  async updateMeetingNote(
    noteId: string,
    updates: Partial<Omit<MeetingNote, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<MeetingNote> {
    const { data, error } = await this.client
      .from('meeting_notes')
      .update(updates)
      .eq('id', noteId)
      .select()
      .single();

    this.handleError(error);
    return data;
  }

  /**
   * Distribute respect tokens to meeting participants based on contributions
   * @param meetingId The ID of the meeting
   * @returns True if successful
   */
  async distributeMeetingRespect(meetingId: string): Promise<boolean> {
    const { data, error } = await this.client.rpc('distribute_meeting_respect', {
      p_meeting_id: meetingId,
    });

    this.handleError(error);
    return data;
  }

  /**
   * Get meetings for a specific user
   * @param userId The ID of the user
   * @param limit Optional limit on the number of meetings returned
   * @returns Array of meetings the user is participating in
   */
  async getUserMeetings(userId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.client
      .from('meeting_participants')
      .select(
        `
        *,
        meeting:meeting_id(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    this.handleError(error);
    return data || [];
  }
}
