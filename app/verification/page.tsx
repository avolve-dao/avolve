import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Shield } from 'lucide-react'
import { VerificationClient } from '@/components/verification/VerificationClient'

export const metadata: Metadata = {
  title: 'Account Verification | Avolve',
  description: 'Verify your account to access all features of the Avolve platform',
}

export default async function VerificationPage() {
  const supabase = await createClient()
  
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
          <VerificationClient isVerified={isVerified} memberJourney={memberJourney} />
        </div>
      </div>
    </div>
  )
}
