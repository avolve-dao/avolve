"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MemberJourney } from "@/components/member-journey"
import { InvitationManager } from "@/components/invitation-manager"
import { VouchManager } from "@/components/vouch-manager"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"
import { Skeleton } from "@/components/ui/skeleton"

export default function MembershipPage() {
  const { user } = useUser()
  const [journeyStatus, setJourneyStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJourneyStatus() {
      if (!user?.id) return

      try {
        setLoading(true)
        const supabase = createClient()
        
        const { data, error } = await supabase.rpc('get_member_journey_status')
        
        if (error) {
          console.error('Error fetching journey status:', error)
          return
        }
        
        setJourneyStatus(data)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJourneyStatus()
  }, [user?.id])

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Membership</h1>
        <p className="text-muted-foreground">Manage your membership journey and invite others to join Avolve</p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Membership</h1>
      <p className="text-muted-foreground">Manage your membership journey and invite others to join Avolve</p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <MemberJourney />
        
        <Tabs defaultValue="invitations">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="vouching">Vouching</TabsTrigger>
          </TabsList>
          <TabsContent value="invitations">
            <InvitationManager />
          </TabsContent>
          <TabsContent value="vouching">
            <VouchManager />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Membership Benefits Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Membership Benefits</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Invited Level */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <h3 className="font-bold">Invited</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Basic platform access</li>
              <li>• View community content</li>
              <li>• Limited token earning</li>
              <li>• No invitation privileges</li>
            </ul>
          </div>
          
          {/* Vouched Level */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="font-bold">Vouched</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Enhanced platform access</li>
              <li>• Participate in discussions</li>
              <li>• Standard token earning</li>
              <li>• 1 invitation per month</li>
            </ul>
          </div>
          
          {/* Contributor Level */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="font-bold">Contributor</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>• Full platform access</li>
              <li>• Create community content</li>
              <li>• Enhanced token earning</li>
              <li>• 3 invitations per month</li>
              <li>• Vouch for new members</li>
            </ul>
          </div>
          
          {/* Full Member Level */}
          <div className="border rounded-lg p-4 md:col-span-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <h3 className="font-bold">Full Member</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <ul className="space-y-2 text-sm">
                <li className="font-medium">Platform Access:</li>
                <li>• Complete platform access</li>
                <li>• Early access to new features</li>
                <li>• Exclusive member events</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="font-medium">Community Privileges:</li>
                <li>• Create and moderate content</li>
                <li>• Participate in governance</li>
                <li>• Access to private channels</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li className="font-medium">Tokenomics Benefits:</li>
                <li>• Maximum token earning rate</li>
                <li>• 5 invitations per month</li>
                <li>• Vouch for new members</li>
                <li>• Token staking opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">How do I progress to the next level?</h3>
            <p className="text-sm">You can progress through two paths: contribution or payment. Make valuable contributions to the community to advance naturally, or upgrade instantly with a membership subscription.</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">What counts as a contribution?</h3>
            <p className="text-sm">Contributions include creating quality content, helping other members, participating in community initiatives, and adding value to discussions. Each contribution is tracked and counts toward your progression.</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">Why is vouching important?</h3>
            <p className="text-sm">Vouching ensures our community maintains high quality by having existing members verify new ones. It creates a chain of trust and accountability that strengthens our community.</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-2">How do tokens work in the membership system?</h3>
            <p className="text-sm">Tokens represent your contribution and standing in the community. You earn tokens through participation and can use them to access features, services, and opportunities within the platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
