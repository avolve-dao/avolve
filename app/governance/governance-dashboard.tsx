"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import useGovernance from '@/hooks/useGovernance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, CheckIcon, XIcon, AlertTriangleIcon, VoteIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Governance Dashboard Component
 * 
 * Displays active proposals, allows proposal creation, and enables voting
 * in accordance with The Prime Law's principles of voluntary consent
 */
export default function GovernanceDashboard() {
  const user = useUser();
  const {
    loading,
    eligibility,
    eligibilityLoading,
    petitions,
    selectedPetition,
    userVote,
    checkEligibility,
    createPetition,
    voteOnPetition,
    loadPetitions,
    loadPetitionDetails,
    setSelectedPetition
  } = useGovernance();

  const [activeTab, setActiveTab] = useState('active');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Load petitions based on active tab
  useEffect(() => {
    const status = activeTab === 'active' ? 'pending' : activeTab === 'approved' ? 'approved' : 'rejected';
    loadPetitions(status);
  }, [activeTab, loadPetitions]);

  // Check eligibility when user changes
  useEffect(() => {
    if (user) {
      checkEligibility();
    }
  }, [user, checkEligibility]);

  // Handle proposal creation
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentGiven) {
      setError('You must give consent to create a proposal in accordance with The Prime Law');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Record consent before creating the proposal
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: 'governance_proposal',
          terms: {
            action: 'create',
            title,
            description
          },
          status: 'approved'
        })
      });
      
      const result = await createPetition(title, description);
      
      if (result.success) {
        setIsCreateDialogOpen(false);
        setTitle('');
        setDescription('');
        setConsentGiven(false);
        
        // Refresh the active proposals list
        loadPetitions('pending');
      } else {
        setError(result.error || 'Failed to create proposal');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle viewing a proposal
  const handleViewProposal = async (petitionId: string) => {
    const details = await loadPetitionDetails(petitionId);
    if (details) {
      setIsViewDialogOpen(true);
    }
  };

  // Handle voting on a proposal
  const handleVote = async () => {
    if (!selectedPetition || !user) return;
    
    if (!consentGiven) {
      setError('You must give consent to vote in accordance with The Prime Law');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Record consent before voting
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_type: 'governance_vote',
          terms: {
            action: 'vote',
            proposal_id: selectedPetition.id,
            proposal_title: selectedPetition.title
          },
          status: 'approved'
        })
      });
      
      const result = await voteOnPetition(selectedPetition.id);
      
      if (result.success) {
        setConsentGiven(false);
      } else {
        setError(result.error || 'Failed to vote on proposal');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Governance Dashboard</h1>
        
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={!user || !eligibility?.isEligible}
        >
          Create Proposal
        </Button>
      </div>
      
      {!user && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to participate in governance activities.
          </AlertDescription>
        </Alert>
      )}
      
      {user && eligibility && !eligibility.isEligible && (
        <Alert className="mb-6">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Eligibility Notice</AlertTitle>
          <AlertDescription>
            You need at least {eligibility.requiredGen} GEN tokens to create proposals. 
            You currently have {eligibility.genBalance} GEN tokens.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading active proposals...</div>
          ) : petitions.length === 0 ? (
            <div className="text-center py-8">No active proposals found</div>
          ) : (
            petitions.map(petition => (
              <Card key={petition.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{petition.title}</CardTitle>
                    <Badge variant={getBadgeVariant(petition.status)}>{petition.status}</Badge>
                  </div>
                  <CardDescription>
                    Created {formatDistanceToNow(new Date(petition.created_at), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{petition.description}</p>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Votes: {petition.voteCount}</span>
                    </div>
                    <Progress value={petition.voteCount} max={100} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => handleViewProposal(petition.id)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading approved proposals...</div>
          ) : petitions.length === 0 ? (
            <div className="text-center py-8">No approved proposals found</div>
          ) : (
            petitions.map(petition => (
              <Card key={petition.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{petition.title}</CardTitle>
                    <Badge variant="secondary">Approved</Badge>
                  </div>
                  <CardDescription>
                    Approved {formatDistanceToNow(new Date(petition.approved_at), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{petition.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => handleViewProposal(petition.id)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading rejected proposals...</div>
          ) : petitions.length === 0 ? (
            <div className="text-center py-8">No rejected proposals found</div>
          ) : (
            petitions.map(petition => (
              <Card key={petition.id} className="mb-4">
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{petition.title}</CardTitle>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                  <CardDescription>
                    Rejected {formatDistanceToNow(new Date(petition.rejected_at), { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{petition.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" onClick={() => handleViewProposal(petition.id)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Proposal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Proposal</DialogTitle>
            <DialogDescription>
              Submit a new governance proposal for the community to vote on.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateProposal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title">Title</label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Proposal title"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your proposal in detail..."
                  rows={5}
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  required
                />
                <label htmlFor="consent" className="text-sm">
                  I voluntarily consent to create this proposal in accordance with The Prime Law
                </label>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !title || !description || !consentGiven}>
                {isSubmitting ? 'Creating...' : 'Create Proposal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Proposal Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          {selectedPetition && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{selectedPetition.title}</DialogTitle>
                  <Badge variant={getBadgeVariant(selectedPetition.status)}>{selectedPetition.status}</Badge>
                </div>
                <DialogDescription>
                  Created by {selectedPetition.profiles?.username || 'Unknown'} 
                  {' '}{formatDistanceToNow(new Date(selectedPetition.created_at), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <p className="whitespace-pre-wrap">{selectedPetition.description}</p>
                
                <Separator className="my-4" />
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Votes ({selectedPetition.voteCount})</h3>
                  <Progress 
                    value={selectedPetition.voteCount} 
                    max={100} 
                    className="h-2 mb-4" 
                  />
                  
                  {!userVote?.hasVoted && user && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="vote-consent"
                          checked={consentGiven}
                          onChange={(e) => setConsentGiven(e.target.checked)}
                        />
                        <label htmlFor="vote-consent" className="text-sm">
                          I voluntarily consent to vote on this proposal in accordance with The Prime Law
                        </label>
                      </div>
                      
                      <Button 
                        onClick={handleVote} 
                        disabled={isSubmitting || !consentGiven}
                        className="w-full"
                      >
                        {isSubmitting ? 'Voting...' : 'Cast Vote'}
                      </Button>
                      
                      {error && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                  
                  {userVote?.hasVoted && (
                    <Alert className="mb-4">
                      <CheckIcon className="h-4 w-4" />
                      <AlertTitle>You've voted on this proposal</AlertTitle>
                      <AlertDescription>
                        Your vote weight: {userVote.voteWeight}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Recent Votes</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedPetition.votes && selectedPetition.votes.length > 0 ? (
                      selectedPetition.votes.map((vote: any) => (
                        <div key={vote.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={vote.profiles?.avatar_url} />
                              <AvatarFallback>
                                {vote.profiles?.username?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{vote.profiles?.username || 'Anonymous'}</span>
                          </div>
                          <span className="text-sm font-medium">Weight: {vote.vote_weight}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No votes yet</p>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
