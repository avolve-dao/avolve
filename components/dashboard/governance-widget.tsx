/**
 * Governance Dashboard Widget
 *
 * Displays upcoming meetings and user participation
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGovernanceApi } from '@/lib/api/hooks';
import { WeeklyMeeting, MeetingParticipant } from '@/lib/types/database.types';
import { useUser } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday } from 'date-fns';

export function GovernanceWidget() {
  const governanceApi = useGovernanceApi();
  const { user } = useUser();
  const [upcomingMeetings, setUpcomingMeetings] = useState<WeeklyMeeting[]>([]);
  const [userMeetings, setUserMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Load upcoming meetings
        const meetingsData = await governanceApi.getUpcomingMeetings(5);
        setUpcomingMeetings(meetingsData);

        if (user?.id) {
          // Load user's meetings
          const userMeetingsData = await governanceApi.getUserMeetings(user.id);
          setUserMeetings(userMeetingsData);
        }
      } catch (error) {
        console.error('Error loading governance data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [governanceApi, user?.id]);

  // Check if user is registered for a meeting
  const isRegisteredForMeeting = (meetingId: string) => {
    return userMeetings.some(um => um.meeting_id === meetingId);
  };

  // Get participant status for a meeting
  const getParticipantStatus = (meetingId: string) => {
    const meeting = userMeetings.find(um => um.meeting_id === meetingId);
    return meeting?.status || null;
  };

  // Format participant status for display
  const formatParticipantStatus = (status: string) => {
    switch (status) {
      case 'registered':
        return 'Registered';
      case 'checked_in':
        return 'Checked In';
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Handle registration for a meeting
  const handleRegister = async (meetingId: string) => {
    if (!user?.id) return;

    try {
      await governanceApi.registerForMeeting(user.id, meetingId);

      // Refresh user meetings
      const userMeetingsData = await governanceApi.getUserMeetings(user.id);
      setUserMeetings(userMeetingsData);
    } catch (error) {
      console.error('Error registering for meeting:', error);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Governance</CardTitle>
        <CardDescription>Upcoming meetings and your participation</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          <>
            <div className="space-y-3">
              {upcomingMeetings.map(meeting => {
                const meetingDate = new Date(meeting.start_time);
                const isRegistered = isRegisteredForMeeting(meeting.id);
                const participantStatus = getParticipantStatus(meeting.id);
                const isPastMeeting = isPast(meetingDate) && !isToday(meetingDate);

                return (
                  <div key={meeting.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <div className="text-sm text-muted-foreground mb-1">
                          {format(meetingDate, 'EEEE, MMMM d, yyyy')} at{' '}
                          {format(meetingDate, 'h:mm a')}
                        </div>

                        <div className="flex items-center mt-2">
                          <Badge
                            variant={meeting.status === 'scheduled' ? 'outline' : 'default'}
                            className="mr-2"
                          >
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </Badge>

                          {isRegistered && (
                            <Badge variant="secondary">
                              {formatParticipantStatus(participantStatus)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!isPastMeeting && !isRegistered && user?.id && (
                        <Button size="sm" onClick={() => handleRegister(meeting.id)}>
                          Register
                        </Button>
                      )}

                      {isRegistered && meeting.status === 'scheduled' && (
                        <a href={`/meetings/${meeting.id}`}>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {upcomingMeetings.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No upcoming meetings scheduled.
                </div>
              )}
            </div>

            {upcomingMeetings.length > 0 && (
              <div className="text-center mt-4">
                <a href="/meetings" className="text-sm text-primary hover:underline">
                  View all meetings
                </a>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
