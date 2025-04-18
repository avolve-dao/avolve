"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"
import { CheckCircle2, Shield, Brain, Lock, Award, AlertTriangle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

type VerificationChallenge = {
  id: string
  challenge_type_id: string
  status: 'pending' | 'completed' | 'failed'
  data: any
  type_name?: string
  type_description?: string
  difficulty?: string
  points?: number
}

type TrustScore = {
  score: number
  level: number
  last_updated: string
}

export function HumanVerification() {
  const { user } = useUser()
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<VerificationChallenge[]>([])
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeChallenge, setActiveChallenge] = useState<VerificationChallenge | null>(null)
  const [challengeResponse, setChallengeResponse] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchVerificationData()
    }
  }, [user?.id])

  const fetchVerificationData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch verification challenges
      const { data: challengeData, error: challengeError } = await supabase
        .from('verification_challenges')
        .select(`
          id,
          challenge_type_id,
          status,
          data,
          verification_challenge_types (
            name,
            description,
            difficulty,
            points
          )
        `)
        .eq('user_id', user?.id)
      
      if (challengeError) throw challengeError
      
      // Format challenges
      const formattedChallenges = challengeData.map((challenge: any) => ({
        id: challenge.id,
        challenge_type_id: challenge.challenge_type_id,
        status: challenge.status,
        data: challenge.data,
        type_name: challenge.verification_challenge_types.name,
        type_description: challenge.verification_challenge_types.description,
        difficulty: challenge.verification_challenge_types.difficulty,
        points: challenge.verification_challenge_types.points
      }))
      
      setChallenges(formattedChallenges)
      
      // Fetch trust score
      const { data: trustData, error: trustError } = await supabase
        .from('trust_scores')
        .select('score, level, last_updated')
        .eq('user_id', user?.id)
        .single()
      
      if (trustError && trustError.code !== 'PGRST116') throw trustError
      
      if (trustData) {
        setTrustScore(trustData)
      }
      
      // Fetch badges
      const { data: badgeData, error: badgeError } = await supabase
        .from('user_badges')
        .select(`
          id,
          earned_at,
          member_badges (
            id,
            name,
            description,
            image_url,
            points
          )
        `)
        .eq('user_id', user?.id)
      
      if (badgeError) throw badgeError
      
      setBadges(badgeData.map((badge: any) => ({
        id: badge.id,
        earned_at: badge.earned_at,
        ...badge.member_badges
      })))
      
    } catch (error) {
      console.error('Error fetching verification data:', error)
      toast({
        title: "Error loading verification data",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const startChallenge = (challenge: VerificationChallenge) => {
    setActiveChallenge(challenge)
    setChallengeResponse({})
  }

  const submitChallengeResponse = async () => {
    if (!activeChallenge) return
    
    try {
      setSubmitting(true)
      const supabase = createClient()
      
      // Validate response based on challenge type
      let isValid = false
      
      switch (activeChallenge.type_name) {
        case 'email_verification':
          isValid = true // Email verification is handled separately
          break
          
        case 'identity_question':
          // Check if all questions are answered
          isValid = Object.keys(challengeResponse).length >= 3
          break
          
        case 'knowledge_quiz':
          // Check if all questions are answered correctly
          isValid = validateKnowledgeQuiz()
          break
          
        default:
          isValid = !!challengeResponse.answer
      }
      
      // Submit challenge response
      const { data, error } = await supabase.rpc('complete_verification_challenge', {
        p_challenge_id: activeChallenge.id,
        p_response: challengeResponse,
        p_success: isValid
      })
      
      if (error) throw error
      
      if (data.success) {
        toast({
          title: isValid ? "Challenge completed!" : "Challenge failed",
          description: isValid 
            ? `You earned ${data.points_earned} trust points` 
            : "Please try again or try a different challenge",
          variant: isValid ? "default" : "destructive"
        })
        
        // Refresh verification data
        fetchVerificationData()
      } else {
        toast({
          title: "Error completing challenge",
          description: data.message,
          variant: "destructive"
        })
      }
      
      // Reset active challenge
      setActiveChallenge(null)
      setChallengeResponse({})
      
    } catch (error) {
      console.error('Error submitting challenge:', error)
      toast({
        title: "Error submitting challenge",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const validateKnowledgeQuiz = () => {
    // Simple validation for knowledge quiz
    const correctAnswers = {
      'purpose': 'community',
      'privacy': 'protect',
      'contribution': 'value'
    }
    
    let correct = 0
    const total = Object.keys(correctAnswers).length
    
    for (const [key, value] of Object.entries(correctAnswers)) {
      if (challengeResponse[key] === value) {
        correct++
      }
    }
    
    return correct === total
  }

  const renderChallengeContent = () => {
    if (!activeChallenge) return null
    
    switch (activeChallenge.type_name) {
      case 'email_verification':
        return (
          <div className="space-y-4">
            <p>We've sent a verification link to your email address. Please check your inbox and click the link to verify your email.</p>
            <p className="text-sm text-muted-foreground">If you don't see the email, check your spam folder or request a new verification email.</p>
            <Button onClick={() => submitChallengeResponse()}>I've verified my email</Button>
          </div>
        )
        
      case 'identity_question':
        return (
          <div className="space-y-4">
            <p className="mb-4">Please answer these questions to help us verify you're human:</p>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="childhood">What was the name of your first pet?</Label>
                <Input 
                  id="childhood" 
                  value={challengeResponse.childhood || ''} 
                  onChange={(e) => setChallengeResponse({...challengeResponse, childhood: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="favorite">What's your favorite book or movie?</Label>
                <Input 
                  id="favorite" 
                  value={challengeResponse.favorite || ''} 
                  onChange={(e) => setChallengeResponse({...challengeResponse, favorite: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="reason">Why do you want to join our community?</Label>
                <Textarea 
                  id="reason" 
                  value={challengeResponse.reason || ''} 
                  onChange={(e) => setChallengeResponse({...challengeResponse, reason: e.target.value})}
                />
              </div>
            </div>
            
            <Button 
              onClick={submitChallengeResponse} 
              disabled={!challengeResponse.childhood || !challengeResponse.favorite || !challengeResponse.reason || submitting}
            >
              {submitting ? "Submitting..." : "Submit Answers"}
            </Button>
          </div>
        )
        
      case 'knowledge_quiz':
        return (
          <div className="space-y-4">
            <p className="mb-4">Complete this quiz about our community values:</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>What is the primary purpose of our community?</Label>
                <RadioGroup 
                  value={challengeResponse.purpose || ''} 
                  onValueChange={(value) => setChallengeResponse({...challengeResponse, purpose: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="profit" id="purpose-profit" />
                    <Label htmlFor="purpose-profit">Maximizing profit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="community" id="purpose-community" />
                    <Label htmlFor="purpose-community">Building a valuable community of extraordinary individuals</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entertainment" id="purpose-entertainment" />
                    <Label htmlFor="purpose-entertainment">Entertainment and social media</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>How do we approach privacy?</Label>
                <RadioGroup 
                  value={challengeResponse.privacy || ''} 
                  onValueChange={(value) => setChallengeResponse({...challengeResponse, privacy: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="privacy-sell" />
                    <Label htmlFor="privacy-sell">Sell user data to advertisers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ignore" id="privacy-ignore" />
                    <Label htmlFor="privacy-ignore">No specific privacy policy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="protect" id="privacy-protect" />
                    <Label htmlFor="privacy-protect">Protect user privacy as a core value</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>What do we value most from members?</Label>
                <RadioGroup 
                  value={challengeResponse.contribution || ''} 
                  onValueChange={(value) => setChallengeResponse({...challengeResponse, contribution: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="payment" id="contribution-payment" />
                    <Label htmlFor="contribution-payment">Payment and subscription fees</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="value" id="contribution-value" />
                    <Label htmlFor="contribution-value">Valuable contributions to the community</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="followers" id="contribution-followers" />
                    <Label htmlFor="contribution-followers">Bringing in more followers</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <Button 
              onClick={submitChallengeResponse} 
              disabled={!challengeResponse.purpose || !challengeResponse.privacy || !challengeResponse.contribution || submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        )
        
      default:
        return (
          <div className="space-y-4">
            <p>This challenge is not yet implemented. Please try another challenge.</p>
            <Button onClick={() => setActiveChallenge(null)}>Back to Challenges</Button>
          </div>
        )
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch(difficulty) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Easy</Badge>
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>
      case 'hard':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hard</Badge>
      default:
        return <Badge variant="outline">{difficulty}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  const getCompletedChallengesCount = () => {
    return challenges.filter(c => c.status === 'completed').length
  }

  const getTotalChallengesCount = () => {
    return challenges.length
  }

  const getVerificationProgress = () => {
    const completed = getCompletedChallengesCount()
    const total = getTotalChallengesCount()
    return total > 0 ? (completed / total) * 100 : 0
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Human Verification</CardTitle>
          <CardDescription>Complete challenges to verify you're human and build trust</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading verification challenges...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activeChallenge) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-medium">{activeChallenge.type_description}</CardTitle>
              <CardDescription>
                {getDifficultyBadge(activeChallenge.difficulty || 'medium')}
                <span className="ml-2">{activeChallenge.points} points</span>
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveChallenge(null)}>
              Back to Challenges
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderChallengeContent()}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Human Verification</CardTitle>
        <CardDescription>Complete challenges to verify you're human and build trust</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trust Score */}
        <div className="flex items-center gap-4 mb-6">
          <Shield className="h-6 w-6 text-blue-500" />
          <div>
            <div className="font-semibold text-lg">
              Trust Score:{' '}
              <span>
                {trustScore?.score !== undefined && trustScore?.score !== null ? trustScore.score.toFixed(1) : 'N/A'}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Level:{' '}
              <span>
                {trustScore?.level !== undefined && trustScore?.level !== null ? trustScore.level : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Verification Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Verification Progress</h3>
            <span className="text-sm text-muted-foreground">
              {getCompletedChallengesCount()}/{getTotalChallengesCount()} Challenges
            </span>
          </div>
          <Progress value={getVerificationProgress()} className="h-2" />
        </div>
        
        <Separator />
        
        {/* Challenges */}
        <div>
          <h3 className="font-medium mb-3">Verification Challenges</h3>
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className={`p-3 border rounded-lg ${challenge.status === 'completed' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'hover:bg-muted/50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{challenge.type_description}</div>
                    <div className="flex items-center mt-1">
                      {getDifficultyBadge(challenge.difficulty || 'medium')}
                      <span className="text-xs text-muted-foreground ml-2">{challenge.points} points</span>
                      <span className="mx-2 text-muted-foreground">•</span>
                      {getStatusBadge(challenge.status)}
                    </div>
                  </div>
                  {challenge.status === 'pending' && (
                    <Button size="sm" onClick={() => startChallenge(challenge)}>
                      Start
                    </Button>
                  )}
                  {challenge.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Badges */}
        <div>
          <h3 className="font-medium mb-3">Earned Badges</h3>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="p-3 border rounded-lg flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-xs text-muted-foreground">{badge.points} points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 border rounded-lg">
              <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Complete challenges to earn badges</p>
            </div>
          )}
        </div>
        
        {/* Security Tips */}
        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
            <h3 className="font-medium text-amber-800 dark:text-amber-400">Security Tips</h3>
          </div>
          <ul className="text-sm space-y-1 text-amber-800 dark:text-amber-400">
            <li>• Never share your password or verification codes with anyone</li>
            <li>• Use a unique password for your Avolve account</li>
            <li>• Enable two-factor authentication for additional security</li>
            <li>• Report any suspicious activity to our support team</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
