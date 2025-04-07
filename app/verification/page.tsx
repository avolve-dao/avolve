import { Metadata } from 'next'
import { HumanVerification } from '@/components/verification/HumanVerification'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Account Verification | Avolve',
  description: 'Verify your account to access all features of the Avolve platform',
}

export default async function VerificationPage() {
  const supabase = createClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login?callbackUrl=/verification')
  }
  
  // Check if user already has a member journey
  const { data: memberJourney } = await supabase
    .from('member_journey')
    .select('current_level')
    .single()
  
  // Check if user already has verification
  const { data: verification } = await supabase
    .from('human_verifications')
    .select('is_verified')
    .single()
  
  const isVerified = verification?.is_verified || false
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Account Verification
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete verification challenges to protect our community from bots and spammers
          </p>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <HumanVerification requiredScore={100} />
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Status</CardTitle>
                <CardDescription>Your current verification level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  isVerified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {isVerified ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Verified Account</p>
                        <p className="text-sm">Your account is fully verified</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Verification Required</p>
                        <p className="text-sm">Complete challenges to verify your account</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Verify?</CardTitle>
                <CardDescription>Benefits of account verification</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Access to all platform features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Ability to earn and use tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Participate in community governance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Increased trust score and reputation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Ability to invite others to the platform</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Member Journey</CardTitle>
                <CardDescription>Your progress in the Avolve community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Level</span>
                    <span className="text-sm font-medium capitalize">
                      {memberJourney?.current_level || 'Not Started'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${
                        memberJourney ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <span className={memberJourney ? 'font-medium' : 'text-muted-foreground'}>
                        Invited
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${
                        memberJourney?.current_level === 'vouched' ||
                        memberJourney?.current_level === 'contributor' ||
                        memberJourney?.current_level === 'full_member'
                          ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <span className={
                        memberJourney?.current_level === 'vouched' ||
                        memberJourney?.current_level === 'contributor' ||
                        memberJourney?.current_level === 'full_member'
                          ? 'font-medium' : 'text-muted-foreground'
                      }>
                        Vouched
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${
                        memberJourney?.current_level === 'contributor' ||
                        memberJourney?.current_level === 'full_member'
                          ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <span className={
                        memberJourney?.current_level === 'contributor' ||
                        memberJourney?.current_level === 'full_member'
                          ? 'font-medium' : 'text-muted-foreground'
                      }>
                        Contributor
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${
                        memberJourney?.current_level === 'full_member'
                          ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <span className={
                        memberJourney?.current_level === 'full_member'
                          ? 'font-medium' : 'text-muted-foreground'
                      }>
                        Full Member
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
