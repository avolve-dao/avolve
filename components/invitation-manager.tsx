"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"
import { Clipboard, Copy, Mail, RefreshCw, UserPlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Invitation = {
  id: string
  code: string
  email: string | null
  status: 'pending' | 'accepted' | 'expired'
  created_at: string
  expires_at: string
  accepted_at: string | null
}

type MemberJourneyStatus = {
  has_started: boolean
  current_level?: string
  invitation_limit?: number
  used_invitations?: number
}

export function InvitationManager() {
  const { user } = useUser()
  const { toast } = useToast()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [journeyStatus, setJourneyStatus] = useState<MemberJourneyStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [email, setEmail] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    if (user?.id) {
      fetchInvitations()
      fetchJourneyStatus()
    }
  }, [user?.id])

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setInvitations(data as Invitation[])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJourneyStatus = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('get_member_journey_status')
      
      if (error) throw error
      
      // Calculate invitation limits based on level
      const level = data.current_level || 'invited'
      const invitationLimit = 
        level === 'full_member' ? 5 :
        level === 'contributor' ? 3 :
        level === 'vouched' ? 1 : 0
      
      // Count used invitations in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const usedInvitations = invitations.filter(inv => 
        new Date(inv.created_at) > thirtyDaysAgo && 
        inv.status !== 'expired'
      ).length
      
      setJourneyStatus({
        ...data,
        invitation_limit: invitationLimit,
        used_invitations: usedInvitations
      })
    } catch (error) {
      console.error('Error fetching journey status:', error)
    }
  }

  const createInvitation = async () => {
    try {
      setCreating(true)
      const supabase = createClient()
      
      const { data, error } = await supabase.rpc('create_invitation', {
        p_email: email.trim() || null
      })
      
      if (error) throw error
      
      if (!data.success) {
        toast({
          title: "Couldn't create invitation",
          description: data.message,
          variant: "destructive"
        })
        return
      }
      
      // Add the new invitation to the list
      const newInvitation: Invitation = {
        id: data.invitation_id,
        code: data.code,
        email: email.trim() || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        accepted_at: null
      }
      
      setInvitations([newInvitation, ...invitations])
      setEmail("")
      
      // Update journey status to reflect the new invitation
      if (journeyStatus) {
        setJourneyStatus({
          ...journeyStatus,
          used_invitations: (journeyStatus.used_invitations || 0) + 1
        })
      }
      
      toast({
        title: "Invitation created",
        description: `Invitation code: ${data.code}`,
      })
    } catch (error) {
      console.error('Error creating invitation:', error)
      toast({
        title: "Error creating invitation",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setCreating(false)
    }
  }

  const copyInvitationLink = (code: string) => {
    const link = `${window.location.origin}?code=${code}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "Invitation link copied to clipboard"
    })
  }

  const copyInvitationCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Code copied",
      description: "Invitation code copied to clipboard"
    })
  }

  const sendInvitationEmail = (email: string, code: string) => {
    // In a real implementation, this would call an API endpoint to send the email
    // For now, we'll just open the default mail client
    const subject = "You're invited to join Avolve"
    const body = `You've been invited to join Avolve, a private community for extraordinary individuals.\n\nYour invitation code is: ${code}\n\nVisit ${window.location.origin} to sign up.`
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    
    toast({
      title: "Email client opened",
      description: "Compose your invitation email"
    })
  }

  const getInvitationStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">Pending</Badge>
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">Accepted</Badge>
      case 'expired':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredInvitations = invitations.filter(inv => {
    if (activeTab === "all") return true
    return inv.status === activeTab
  })

  const canCreateInvitation = journeyStatus && 
    journeyStatus.current_level && 
    journeyStatus.current_level !== 'invited' &&
    (journeyStatus.used_invitations || 0) < (journeyStatus.invitation_limit || 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Invitation Manager</CardTitle>
        <CardDescription>Invite new members to join Avolve</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invitation Limit Info */}
        <div className="bg-muted p-3 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <span>Monthly Invitation Limit</span>
            <Badge variant="outline">
              {journeyStatus?.used_invitations || 0}/{journeyStatus?.invitation_limit || 0}
            </Badge>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {canCreateInvitation ? (
              <p>You can invite {(journeyStatus?.invitation_limit || 0) - (journeyStatus?.used_invitations || 0)} more members this month</p>
            ) : (
              <p>You've reached your invitation limit for this month or need to progress to the next level</p>
            )}
          </div>
        </div>
        
        {/* Create New Invitation */}
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <div className="flex gap-2">
            <Input 
              id="email" 
              type="email" 
              placeholder="friend@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!canCreateInvitation || creating}
            />
            <Button 
              onClick={createInvitation} 
              disabled={!canCreateInvitation || creating}
              className="whitespace-nowrap"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {creating ? "Creating..." : "Create Invitation"}
            </Button>
          </div>
        </div>
        
        {/* Invitation List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Your Invitations</h3>
            <Button variant="ghost" size="sm" onClick={fetchInvitations} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-2">
              {loading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Loading invitations...
                </div>
              ) : filteredInvitations.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No {activeTab !== "all" ? activeTab : ""} invitations found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredInvitations.map((invitation) => (
                    <div key={invitation.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-mono text-sm mr-2">{invitation.code}</span>
                          {getInvitationStatusBadge(invitation.status)}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => copyInvitationCode(invitation.code)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => copyInvitationLink(invitation.code)}>
                            <Clipboard className="h-4 w-4" />
                          </Button>
                          {invitation.email && (
                            <Button variant="ghost" size="icon" onClick={() => sendInvitationEmail(invitation.email!, invitation.code)}>
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Created {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}</span>
                        {invitation.status === 'pending' && (
                          <span>Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}</span>
                        )}
                        {invitation.status === 'accepted' && invitation.accepted_at && (
                          <span>Accepted {formatDistanceToNow(new Date(invitation.accepted_at), { addSuffix: true })}</span>
                        )}
                      </div>
                      {invitation.email && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Email: </span>
                          <span>{invitation.email}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <p>Invitations expire after 14 days if not accepted</p>
      </CardFooter>
    </Card>
  )
}
