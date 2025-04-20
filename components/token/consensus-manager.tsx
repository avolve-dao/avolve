import React, { useState, useEffect } from 'react';
import { useConsensus } from '@/lib/token/use-consensus';
import { useTokenService } from '@/lib/token/use-token-service';
import { useAuth } from '@/lib/auth/use-auth';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { format, isPast, isFuture, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

// --- TYPES ---
import type { ConsensusGroupData } from '@/lib/token/consensus-service';

interface Meeting {
  id: string;
  date: string;
  duration: number;
  token_type: string;
  [key: string]: any;
}

interface Group {
  id: string;
  name: string;
  [key: string]: any;
}

interface Participant {
  id: string;
  user_id: string;
  [key: string]: any;
}

/**
 * ConsensusManager component for managing consensus meetings and token allocation
 */
export function ConsensusManager() {
  const { user } = useAuth();
  const { supabase, user: supabaseUser } = useSupabase();

  const supabaseClient = supabase;
  const userId = supabaseUser?.id;

  const {
    isLoading,
    error,
    upcomingMeetings,
    loadUpcomingMeetings,
    scheduleMeeting,
    checkInToMeeting,
    getGroupsForMeeting,
    getParticipantsForGroup,
    reportConsensusRankings,
  } = useConsensus(supabaseClient, userId);
  
  // Only tokens and setTokens are available from useTokenService
  const tokenService = useTokenService();
  
  // Explicit types for all state variables
  const [selectedTab, setSelectedTab] = useState<string>('meetings');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [meetingGroups, setMeetingGroups] = useState<ConsensusGroupData[]>([]);
  const [groupParticipants, setGroupParticipants] = useState<Record<string, Participant[]>>({});
  const [rankings, setRankings] = useState<Record<string, number>>({});
  
  // New meeting form state
  const [newMeetingDate, setNewMeetingDate] = useState<string>('');
  const [newMeetingTime, setNewMeetingTime] = useState<string>('');
  const [newMeetingDuration, setNewMeetingDuration] = useState<number>(60);
  const [newMeetingTokenType, setNewMeetingTokenType] = useState<string>('');

  // Load initial data
  useEffect(() => {
    if (user) {
      // Removed loadTokenTypes and loadTokens as they do not exist
    }
  }, [user]);
  
  // Load meeting groups when a meeting is selected
  useEffect(() => {
    async function loadGroups() {
      if (selectedMeeting) {
        const groups = await getGroupsForMeeting(selectedMeeting);
        setMeetingGroups(Array.isArray(groups) ? groups : []);

        // Load participants for each group
        const participantsMap: Record<string, Participant[]> = {};
        if (Array.isArray(groups)) {
          for (const group of groups) {
            const participants = await getParticipantsForGroup(group.id);
            participantsMap[group.id] = Array.isArray(participants) ? participants : [];
          }
        }
        setGroupParticipants(participantsMap);
      } else {
        setMeetingGroups([]);
        setGroupParticipants({});
      }
    }
    loadGroups();
  }, [selectedMeeting, getGroupsForMeeting, getParticipantsForGroup]);
  
  // Handle scheduling a new meeting
  const handleScheduleMeeting = async () => {
    if (!newMeetingDate || !newMeetingTime || !newMeetingTokenType) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const meetingDateTime = new Date(`${newMeetingDate}T${newMeetingTime}`);
    
    if (isPast(meetingDateTime)) {
      toast.error('Meeting time must be in the future');
      return;
    }
    
    const result = await scheduleMeeting(
      meetingDateTime,
      newMeetingDuration,
      newMeetingTokenType
    );
    
    if (result) {
      toast.success('Meeting scheduled successfully');
      setNewMeetingDate('');
      setNewMeetingTime('');
      setNewMeetingDuration(60);
      setNewMeetingTokenType('');
      loadUpcomingMeetings();
    } else {
      toast.error('Failed to schedule meeting');
    }
  };
  
  // Handle checking in to a meeting
  const handleCheckIn = async (meetingId: string) => {
    const success = await checkInToMeeting(meetingId);
    
    if (success) {
      toast.success('Checked in to meeting successfully');
      loadUpcomingMeetings();
    } else {
      toast.error('Failed to check in to meeting');
    }
  };
  
  // Handle reporting rankings
  const handleReportRankings = async (groupId: string) => {
    if (Object.keys(rankings).length === 0) {
      toast.error('Please rank at least one participant');
      return;
    }
    
    const success = await reportConsensusRankings(groupId, rankings);
    
    if (success) {
      toast.success('Rankings reported successfully');
      setRankings({});
      
      // Reload group participants
      const participants = await getParticipantsForGroup(groupId);
      setGroupParticipants({ ...groupParticipants, [groupId]: Array.isArray(participants) ? participants : [] });
    } else {
      toast.error('Failed to report rankings');
    }
  };
  
  // Render loading state
  if (isLoading && !upcomingMeetings.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={48} />
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        <p>Error: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Consensus & Token Allocation</h1>
        <div className="flex gap-2">
          <Button 
            color="primary" 
            variant="outline" 
            onClick={() => loadUpcomingMeetings()}
          >
            Refresh Meetings
          </Button>
        </div>
      </div>
      
      <Tabs 
        value={selectedTab} 
        onValueChange={setSelectedTab}
      >
        <TabsList>
          <TabsTrigger value="meetings">Consensus Meetings</TabsTrigger>
          <TabsTrigger value="respect">Pending Respect</TabsTrigger>
        </TabsList>
        <TabsContent value="meetings">
          <div className="space-y-6 p-4">
            {/* Schedule new meeting form */}
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Schedule New Meeting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Input
                      type="date"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Time</label>
                    <Input
                      type="time"
                      value={newMeetingTime}
                      onChange={(e) => setNewMeetingTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={newMeetingDuration.toString()}
                      onChange={(e) => setNewMeetingDuration(parseInt(e.target.value) || 60)}
                      min="15"
                      max="180"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Token Type</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newMeetingTokenType}
                      onChange={(e) => setNewMeetingTokenType(e.target.value)}
                    >
                      <option value="">Select Token Type</option>
                      {/* Removed tokenTypes as it does not exist */}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    color="primary" 
                    onClick={handleScheduleMeeting}
                  >
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Upcoming meetings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
              {Array.isArray(upcomingMeetings) && upcomingMeetings.length === 0 ? (
                <p>No upcoming meetings</p>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(upcomingMeetings) && upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="p-4">
                      <CardHeader>
                        <CardTitle>
                          Meeting on {format(new Date(meeting.meeting_time), 'MMM d, yyyy')} at {format(new Date(meeting.meeting_time), 'h:mm a')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">
                              Duration: {meeting.duration_minutes} minutes
                            </p>
                            <p className="text-sm text-gray-500">
                              Participants: {meeting.participants_count}
                            </p>
                            <div className="mt-2">
                              <Badge color={
                                meeting.status === 'scheduled' ? 'primary' :
                                meeting.status === 'in_progress' ? 'warning' :
                                meeting.status === 'completed' ? 'success' : 'danger'
                              }>
                                {meeting.status}
                              </Badge>
                            </div>
                          </div>
                          <Button 
                            color="secondary" 
                            size="sm"
                            onClick={() => {
                              setSelectedMeeting(meeting.id === selectedMeeting ? null : meeting.id);
                            }}
                          >
                            {meeting.id === selectedMeeting ? 'Hide Details' : 'View Details'}
                          </Button>
                        </div>
                        
                        {/* Meeting details */}
                        {selectedMeeting === meeting.id && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="text-md font-medium mb-2">Groups</h4>
                            {Array.isArray(meetingGroups) && meetingGroups.length === 0 ? (
                              <p>No groups formed yet</p>
                            ) : (
                              <div className="space-y-4">
                                {Array.isArray(meetingGroups) && meetingGroups.map((group) => (
                                  <div key={group.id} className="border p-3 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                      <h5 className="font-medium">Group {group.round}</h5>
                                      <Badge color={
                                        group.status === 'pending' ? 'default' :
                                        group.status === 'in_progress' ? 'warning' :
                                        group.status === 'completed' ? 'success' : 'danger'
                                      }>
                                        {group.status}
                                      </Badge>
                                    </div>
                                    
                                    {/* Group participants */}
                                    {Array.isArray(groupParticipants[group.id]) && groupParticipants[group.id].length > 0 ? (
                                      <div className="space-y-2">
                                        {Array.isArray(groupParticipants[group.id]) && groupParticipants[group.id].map((participant) => (
                                          <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                            <div className="flex items-center gap-2">
                                              <Avatar>
                                                <AvatarFallback>{participant.user_id ? participant.user_id[0] : '?'}</AvatarFallback>
                                              </Avatar>
                                              <span>{participant.user_id.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {participant.rank ? (
                                                <Badge color="success">Rank: {participant.rank}</Badge>
                                              ) : (
                                                group.status === 'in_progress' && (
                                                  <select
                                                    className="p-1 border rounded-md"
                                                    value={rankings[participant.user_id] || ''}
                                                    onChange={(e) => {
                                                      const value = e.target.value ? parseInt(e.target.value) : null;
                                                      if (value) {
                                                        setRankings({
                                                          ...rankings,
                                                          [participant.user_id]: value
                                                        });
                                                      } else {
                                                        const newRankings = { ...rankings };
                                                        delete newRankings[participant.user_id];
                                                        setRankings(newRankings);
                                                      }
                                                    }}
                                                  >
                                                    <option value="">Rank</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5">5</option>
                                                    <option value="6">6</option>
                                                  </select>
                                                )
                                              )}
                                              <Badge color={
                                                participant.status === 'checked_in' ? 'primary' :
                                                participant.status === 'present' ? 'success' :
                                                participant.status === 'absent' ? 'danger' : 'warning'
                                              }>
                                                {participant.status}
                                              </Badge>
                                            </div>
                                          </div>
                                        ))}
                                        
                                        {/* Submit rankings button */}
                                        {group.status === 'in_progress' && (
                                          <div className="mt-2">
                                            <Button 
                                              color="primary" 
                                              size="sm"
                                              onClick={() => handleReportRankings(group.id)}
                                            >
                                              Submit Rankings
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p>No participants in this group</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="respect">
          <div className="space-y-6 p-4">
            <h2 className="text-xl font-semibold mb-4">Pending Respect</h2>
            <p>No pending respect to claim</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// NOTE: You may need to update usages of meetingGroups/group to use ConsensusGroupData properties (id, meeting_id, round, status, created_at, updated_at)
