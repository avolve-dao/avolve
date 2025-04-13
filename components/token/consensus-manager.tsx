import React, { useState, useEffect } from 'react';
import { useConsensus } from '@/lib/token/use-consensus';
import { useTokenService } from '@/lib/token/use-token-service';
import { useAuth } from '@/lib/auth/use-auth';
import { Button, Card, Tabs, Tab, Text, Badge, Avatar, Spinner, Divider, Input, Textarea } from '@nextui-org/react';
import { format, isPast, isFuture, addDays } from 'date-fns';
import { toast } from 'react-hot-toast';

/**
 * ConsensusManager component for managing consensus meetings and token allocation
 */
export function ConsensusManager() {
  const { user } = useAuth();
  const { 
    isLoading, 
    error, 
    upcomingMeetings, 
    pendingRespect, 
    activeProposals,
    loadUpcomingMeetings,
    loadPendingRespect,
    loadActiveProposals,
    scheduleMeeting,
    checkInToMeeting,
    getGroupsForMeeting,
    getParticipantsForGroup,
    reportConsensusRankings,
    claimPendingRespect,
    createTokenAllocationProposal,
    voteOnProposal,
    getVotesForProposal,
    processProposals
  } = useConsensus();
  
  const { tokens, tokenTypes, loadTokens, loadTokenTypes } = useTokenService();
  
  const [selectedTab, setSelectedTab] = useState('meetings');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [meetingGroups, setMeetingGroups] = useState<any[]>([]);
  const [groupParticipants, setGroupParticipants] = useState<Record<string, any[]>>({});
  const [proposalVotes, setProposalVotes] = useState<Record<string, any[]>>({});
  const [rankings, setRankings] = useState<Record<string, number>>({});
  
  // New meeting form state
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingDuration, setNewMeetingDuration] = useState(60);
  const [newMeetingTokenType, setNewMeetingTokenType] = useState('');
  
  // New proposal form state
  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [newProposalDescription, setNewProposalDescription] = useState('');
  const [newProposalToken, setNewProposalToken] = useState('');
  const [newProposalAmount, setNewProposalAmount] = useState(0);
  const [newProposalRecipient, setNewProposalRecipient] = useState('');
  const [newProposalDuration, setNewProposalDuration] = useState(7);
  
  // Load initial data
  useEffect(() => {
    if (user) {
      loadTokens();
      loadTokenTypes();
    }
  }, [user, loadTokens, loadTokenTypes]);
  
  // Load meeting groups when a meeting is selected
  useEffect(() => {
    async function loadGroups() {
      if (selectedMeeting) {
        const groups = await getGroupsForMeeting(selectedMeeting);
        setMeetingGroups(groups);
        
        // Load participants for each group
        const participantsMap: Record<string, any[]> = {};
        for (const group of groups) {
          const participants = await getParticipantsForGroup(group.id);
          participantsMap[group.id] = participants;
        }
        setGroupParticipants(participantsMap);
      }
    }
    
    loadGroups();
  }, [selectedMeeting, getGroupsForMeeting, getParticipantsForGroup]);
  
  // Load proposal votes when a proposal is selected
  useEffect(() => {
    async function loadVotes() {
      if (selectedProposal) {
        const votes = await getVotesForProposal(selectedProposal);
        setProposalVotes({ ...proposalVotes, [selectedProposal]: votes });
      }
    }
    
    loadVotes();
  }, [selectedProposal, getVotesForProposal]);
  
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
      setGroupParticipants({ ...groupParticipants, [groupId]: participants });
    } else {
      toast.error('Failed to report rankings');
    }
  };
  
  // Handle claiming pending respect
  const handleClaimRespect = async (respectId: string) => {
    const success = await claimPendingRespect(respectId);
    
    if (success) {
      toast.success('Respect claimed successfully');
      loadPendingRespect();
    } else {
      toast.error('Failed to claim respect');
    }
  };
  
  // Handle creating a new proposal
  const handleCreateProposal = async () => {
    if (!newProposalTitle || !newProposalDescription || !newProposalToken || newProposalAmount <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const result = await createTokenAllocationProposal(
      newProposalTitle,
      newProposalDescription,
      newProposalToken,
      newProposalAmount,
      newProposalRecipient || undefined,
      undefined,
      newProposalDuration
    );
    
    if (result) {
      toast.success('Proposal created successfully');
      setNewProposalTitle('');
      setNewProposalDescription('');
      setNewProposalToken('');
      setNewProposalAmount(0);
      setNewProposalRecipient('');
      setNewProposalDuration(7);
      loadActiveProposals();
    } else {
      toast.error('Failed to create proposal');
    }
  };
  
  // Handle voting on a proposal
  const handleVote = async (proposalId: string, vote: 'approve' | 'reject') => {
    const success = await voteOnProposal(proposalId, vote);
    
    if (success) {
      toast.success(`Voted ${vote} successfully`);
      
      // Reload votes for this proposal
      const votes = await getVotesForProposal(proposalId);
      setProposalVotes({ ...proposalVotes, [proposalId]: votes });
    } else {
      toast.error('Failed to vote');
    }
  };
  
  // Handle processing proposals
  const handleProcessProposals = async () => {
    const count = await processProposals();
    
    if (count > 0) {
      toast.success(`Processed ${count} proposals`);
      loadActiveProposals();
    } else {
      toast.info('No proposals to process');
    }
  };
  
  // Render loading state
  if (isLoading && !upcomingMeetings.length && !pendingRespect.length && !activeProposals.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
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
            variant="flat" 
            onClick={() => loadUpcomingMeetings()}
          >
            Refresh Meetings
          </Button>
          <Button 
            color="primary" 
            variant="flat" 
            onClick={() => loadPendingRespect()}
          >
            Refresh Respect
          </Button>
          <Button 
            color="primary" 
            variant="flat" 
            onClick={() => loadActiveProposals()}
          >
            Refresh Proposals
          </Button>
        </div>
      </div>
      
      <Tabs 
        selectedKey={selectedTab} 
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab key="meetings" title="Consensus Meetings">
          <div className="space-y-6 p-4">
            {/* Schedule new meeting form */}
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Schedule New Meeting</h2>
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
                    {tokenTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
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
            </Card>
            
            {/* Upcoming meetings */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
              {upcomingMeetings.length === 0 ? (
                <p>No upcoming meetings</p>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">
                            Meeting on {format(new Date(meeting.meeting_time), 'MMM d, yyyy')} at {format(new Date(meeting.meeting_time), 'h:mm a')}
                          </h3>
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
                        <div className="flex gap-2">
                          {meeting.status === 'scheduled' && (
                            <Button 
                              color="primary" 
                              size="sm"
                              onClick={() => handleCheckIn(meeting.id)}
                            >
                              Check In
                            </Button>
                          )}
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
                      </div>
                      
                      {/* Meeting details */}
                      {selectedMeeting === meeting.id && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-md font-medium mb-2">Groups</h4>
                          {meetingGroups.length === 0 ? (
                            <p>No groups formed yet</p>
                          ) : (
                            <div className="space-y-4">
                              {meetingGroups.map((group) => (
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
                                  {groupParticipants[group.id]?.length > 0 ? (
                                    <div className="space-y-2">
                                      {groupParticipants[group.id].map((participant) => (
                                        <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                          <div className="flex items-center gap-2">
                                            <Avatar name={participant.user_id} size="sm" />
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
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Tab>
        
        <Tab key="respect" title="Pending Respect">
          <div className="space-y-6 p-4">
            <h2 className="text-xl font-semibold mb-4">Pending Respect</h2>
            {pendingRespect.length === 0 ? (
              <p>No pending respect to claim</p>
            ) : (
              <div className="space-y-4">
                {pendingRespect.map((respect) => {
                  const token = tokens.find(t => t.id === respect.token_id);
                  const canClaim = new Date(respect.can_claim_at) <= new Date();
                  
                  return (
                    <Card key={respect.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">
                            {respect.amount} {token?.symbol || 'tokens'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Source: {respect.source}
                          </p>
                          <p className="text-sm text-gray-500">
                            Can claim: {format(new Date(respect.can_claim_at), 'MMM d, yyyy')} at {format(new Date(respect.can_claim_at), 'h:mm a')}
                          </p>
                        </div>
                        <Button 
                          color="primary" 
                          disabled={!canClaim}
                          onClick={() => handleClaimRespect(respect.id)}
                        >
                          {canClaim ? 'Claim Now' : 'Not Claimable Yet'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Tab>
        
        <Tab key="proposals" title="Token Allocation Proposals">
          <div className="space-y-6 p-4">
            {/* Create new proposal form */}
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={newProposalTitle}
                    onChange={(e) => setNewProposalTitle(e.target.value)}
                    placeholder="Proposal title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={newProposalDescription}
                    onChange={(e) => setNewProposalDescription(e.target.value)}
                    placeholder="Describe your proposal"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Token</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={newProposalToken}
                      onChange={(e) => setNewProposalToken(e.target.value)}
                    >
                      <option value="">Select Token</option>
                      {tokens.map((token) => (
                        <option key={token.id} value={token.id}>
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <Input
                      type="number"
                      value={newProposalAmount.toString()}
                      onChange={(e) => setNewProposalAmount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Recipient (User ID)</label>
                    <Input
                      value={newProposalRecipient}
                      onChange={(e) => setNewProposalRecipient(e.target.value)}
                      placeholder="User ID (leave blank for team)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Voting Duration (days)</label>
                    <Input
                      type="number"
                      value={newProposalDuration.toString()}
                      onChange={(e) => setNewProposalDuration(parseInt(e.target.value) || 7)}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
                <div>
                  <Button 
                    color="primary" 
                    onClick={handleCreateProposal}
                  >
                    Create Proposal
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Process proposals button */}
            <div className="flex justify-end">
              <Button 
                color="secondary" 
                onClick={handleProcessProposals}
              >
                Process Completed Proposals
              </Button>
            </div>
            
            {/* Active proposals */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Active Proposals</h2>
              {activeProposals.length === 0 ? (
                <p>No active proposals</p>
              ) : (
                <div className="space-y-4">
                  {activeProposals.map((proposal) => {
                    const token = tokens.find(t => t.id === proposal.token_id);
                    const votingEnds = new Date(proposal.voting_ends_at);
                    const votingEnded = isPast(votingEnds);
                    
                    // Calculate votes
                    const votes = proposalVotes[proposal.id] || [];
                    const approveCount = votes.filter(v => v.vote === 'approve').length;
                    const rejectCount = votes.filter(v => v.vote === 'reject').length;
                    const userVote = votes.find(v => v.user_id === user?.id)?.vote;
                    
                    return (
                      <Card key={proposal.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{proposal.title}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge color="primary">
                                {proposal.allocation_amount} {token?.symbol || 'tokens'}
                              </Badge>
                              <Badge color={votingEnded ? 'danger' : 'success'}>
                                {votingEnded ? 'Voting Ended' : 'Voting Active'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                              Proposed by: {proposal.proposed_by.substring(0, 8)}...
                            </p>
                            <p className="text-sm text-gray-500">
                              Recipient: {proposal.recipient_id ? `${proposal.recipient_id.substring(0, 8)}...` : 'Team'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Voting ends: {format(votingEnds, 'MMM d, yyyy')} at {format(votingEnds, 'h:mm a')}
                            </p>
                          </div>
                          <Button 
                            color="secondary" 
                            size="sm"
                            onClick={() => {
                              setSelectedProposal(proposal.id === selectedProposal ? null : proposal.id);
                            }}
                          >
                            {proposal.id === selectedProposal ? 'Hide Details' : 'View Details'}
                          </Button>
                        </div>
                        
                        {/* Proposal details */}
                        {selectedProposal === proposal.id && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="mb-4">{proposal.description}</p>
                            
                            {/* Voting */}
                            <div className="mb-4">
                              <h4 className="text-md font-medium mb-2">Voting</h4>
                              <div className="flex gap-4 mb-2">
                                <div>
                                  <span className="text-green-600 font-medium">{approveCount}</span> Approve
                                </div>
                                <div>
                                  <span className="text-red-600 font-medium">{rejectCount}</span> Reject
                                </div>
                              </div>
                              
                              {!votingEnded && (
                                <div className="flex gap-2">
                                  <Button 
                                    color="success" 
                                    size="sm"
                                    disabled={userVote === 'approve'}
                                    onClick={() => handleVote(proposal.id, 'approve')}
                                  >
                                    {userVote === 'approve' ? 'Approved' : 'Approve'}
                                  </Button>
                                  <Button 
                                    color="danger" 
                                    size="sm"
                                    disabled={userVote === 'reject'}
                                    onClick={() => handleVote(proposal.id, 'reject')}
                                  >
                                    {userVote === 'reject' ? 'Rejected' : 'Reject'}
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {/* Votes list */}
                            <div>
                              <h4 className="text-md font-medium mb-2">Votes</h4>
                              {votes.length === 0 ? (
                                <p>No votes yet</p>
                              ) : (
                                <div className="space-y-2">
                                  {votes.map((vote) => (
                                    <div key={vote.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                      <div className="flex items-center gap-2">
                                        <Avatar name={vote.user_id} size="sm" />
                                        <span>{vote.user_id.substring(0, 8)}...</span>
                                      </div>
                                      <Badge color={vote.vote === 'approve' ? 'success' : 'danger'}>
                                        {vote.vote}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
