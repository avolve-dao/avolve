"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HumanVerification } from "@/components/human-verification"
import { CommunityPuzzle } from "@/components/community-puzzle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"
import { Shield, Brain, Award, Lock, CheckCircle2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VerificationPage() {
  const { user } = useUser()
  const router = useRouter()
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchVerificationStatus()
    }
  }, [user?.id])

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get verification challenges status
      const { data: challengeData, error: challengeError } = await supabase
        .from('verification_challenges')
        .select(`
          id,
          status,
          verification_challenge_types (name)
        `)
        .eq('user_id', user?.id)
      
      if (challengeError) throw challengeError
      
      // Get trust score
      const { data: trustData, error: trustError } = await supabase
        .from('trust_scores')
        .select('score, level')
        .eq('user_id', user?.id)
        .single()
      
      if (trustError && trustError.code !== 'PGRST116') throw trustError
      
      // Get human verification status
      const { data: humanVerData, error: humanVerError } = await supabase
        .from('human_verifications')
        .select('is_verified')
        .eq('user_id', user?.id)
        .single()
      
      if (humanVerError && humanVerError.code !== 'PGRST116') throw humanVerError
      
      // Calculate completion percentages
      const totalChallenges = challengeData?.length || 0
      const completedChallenges = challengeData?.filter((c: any) => c.status === 'completed').length || 0
      
      setVerificationStatus({
        challenges: {
          total: totalChallenges,
          completed: completedChallenges,
          percentage: totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0
        },
        trustScore: trustData?.score || 0,
        trustLevel: trustData?.level || 1,
        isHumanVerified: humanVerData?.is_verified || false
      })
      
    } catch (error) {
      console.error('Error fetching verification status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrustLevelName = (level: number) => {
    switch(level) {
      case 1: return "Newcomer"
      case 2: return "Verified Member"
      case 3: return "Trusted Member"
      case 4: return "Established Member"
      case 5: return "Pillar of the Community"
      default: return `Level ${level}`
    }
  }

  const logVerificationActivity = async () => {
    try {
      const supabase = createClient()
      
      await supabase.rpc('log_user_activity', {
        p_activity_type: 'verification_page_visit',
        p_page: '/dashboard/verification',
        p_data: {}
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  useEffect(() => {
    logVerificationActivity()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold">Verification Center</h1>
        <p className="text-muted-foreground">Verify your humanity and build trust in our community</p>
        
        <div className="h-8 w-full bg-muted animate-pulse rounded-md"></div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[400px] w-full bg-muted animate-pulse rounded-md"></div>
          <div className="h-[400px] w-full bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Verification Center</h1>
      <p className="text-muted-foreground">Verify your humanity and build trust in our community</p>
      
      {/* Verification Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Trust Score */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Trust Score</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{verificationStatus?.trustScore || 0}</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {getTrustLevelName(verificationStatus?.trustLevel || 1)}
                </Badge>
              </div>
              <Progress 
                value={verificationStatus?.trustScore || 0} 
                max={200} 
                className="h-2"
              />
            </div>
            
            {/* Challenge Progress */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Challenge Progress</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {verificationStatus?.challenges.completed}/{verificationStatus?.challenges.total}
                </span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {verificationStatus?.challenges.percentage >= 100 ? 'Complete' : 'In Progress'}
                </Badge>
              </div>
              <Progress 
                value={verificationStatus?.challenges.percentage || 0} 
                className="h-2"
              />
            </div>
            
            {/* Human Verification */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Human Verification</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {verificationStatus?.isHumanVerified ? 'Verified' : 'Pending'}
                </span>
                <Badge 
                  variant="outline" 
                  className={verificationStatus?.isHumanVerified 
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                  }
                >
                  {verificationStatus?.isHumanVerified 
                    ? <CheckCircle2 className="h-3 w-3 mr-1" />
                    : <AlertTriangle className="h-3 w-3 mr-1" />
                  }
                  {verificationStatus?.isHumanVerified ? 'Verified' : 'Required'}
                </Badge>
              </div>
              <div className="h-2"></div>
              {!verificationStatus?.isHumanVerified && (
                <p className="text-xs text-muted-foreground">Complete challenges to verify your humanity</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <Tabs defaultValue="verification">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="puzzles">Community Puzzles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verification" className="mt-6">
          <HumanVerification />
        </TabsContent>
        
        <TabsContent value="puzzles" className="mt-6">
          <CommunityPuzzle />
        </TabsContent>
      </Tabs>
      
      {/* Why We Verify */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Why We Verify</CardTitle>
          <CardDescription>Our approach to creating a safe and engaging community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Protection</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Our verification process protects our community from bots, spammers, and bad actors, ensuring a high-quality experience for everyone.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Engagement</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We've gamified verification to make it enjoyable and engaging, turning a necessary security step into a fun experience.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Trust Building</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Each verification step you complete builds your trust score, unlocking new features and privileges within our community.
              </p>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p className="text-sm">
              At Avolve, we believe security and engagement go hand in hand. Our verification system is designed to protect privacy while creating meaningful interactions that benefit all members.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
