"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/lib/hooks/use-user"
import { CheckCircle2, Clock, Lock, Trophy } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type MemberJourneyStatus = {
  has_started: boolean
  user_id?: string
  current_level?: string
  vouch_count?: number
  contribution_count?: number
  has_paid?: boolean
  journey_started_at?: string
  level_updated_at?: string
  achievements?: Array<{
    type: string
    data: any
    unlocked_at: string
  }>
  progress?: {
    invited: number
    vouched: number
    contributor: number
    full_member: number
  }
  message?: string
}

export function MemberJourney() {
  const { user } = useUser()
  const [journeyStatus, setJourneyStatus] = useState<MemberJourneyStatus | null>(null)
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
        
        setJourneyStatus(data as MemberJourneyStatus)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJourneyStatus()
  }, [user?.id])

  const getLevelInfo = (level: string) => {
    switch(level) {
      case 'invited':
        return {
          title: 'Invited',
          description: 'You\'ve been invited to join Avolve',
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          color: 'text-amber-500',
          bgColor: 'bg-amber-100 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-800'
        }
      case 'vouched':
        return {
          title: 'Vouched',
          description: 'You\'ve been vouched for by community members',
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800'
        }
      case 'contributor':
        return {
          title: 'Contributor',
          description: 'You\'re actively contributing to the community',
          icon: <Trophy className="h-5 w-5 text-blue-500" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800'
        }
      case 'full_member':
        return {
          title: 'Full Member',
          description: 'You have full access to all Avolve features',
          icon: <Trophy className="h-5 w-5 text-purple-500" />,
          color: 'text-purple-500',
          bgColor: 'bg-purple-100 dark:bg-purple-950/30',
          borderColor: 'border-purple-200 dark:border-purple-800'
        }
      default:
        return {
          title: 'Unknown',
          description: 'Unknown level',
          icon: <Lock className="h-5 w-5 text-gray-500" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800/30',
          borderColor: 'border-gray-200 dark:border-gray-700'
        }
    }
  }

  const getNextSteps = () => {
    if (!journeyStatus || !journeyStatus.current_level) return null
    
    switch(journeyStatus.current_level) {
      case 'invited':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">Next steps:</h4>
            <div className="text-sm space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-amber-700 text-xs font-bold">1</span>
                </div>
                <p>Get vouched for by <strong>2 existing members</strong> to unlock more features.</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-amber-700 text-xs font-bold">2</span>
                </div>
                <p>Explore the platform and connect with other members.</p>
              </div>
            </div>
            <div className="pt-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800">
                {journeyStatus.vouch_count || 0}/2 Vouches Received
              </Badge>
            </div>
          </div>
        )
      case 'vouched':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">Next steps:</h4>
            <div className="text-sm space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-green-700 text-xs font-bold">1</span>
                </div>
                <p>Make <strong>3 contributions</strong> to the community to become a Contributor.</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-green-700 text-xs font-bold">2</span>
                </div>
                <p>Or upgrade to Full Member with a $100/month subscription.</p>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800">
                {journeyStatus.contribution_count || 0}/3 Contributions
              </Badge>
              <Button variant="outline" size="sm" className="text-xs">
                Upgrade Now
              </Button>
            </div>
          </div>
        )
      case 'contributor':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">Next steps:</h4>
            <div className="text-sm space-y-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">1</span>
                </div>
                <p>Make <strong>7 more contributions</strong> to become a Full Member.</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-blue-700 text-xs font-bold">2</span>
                </div>
                <p>Or upgrade to Full Member with a $100/month subscription.</p>
              </div>
            </div>
            <div className="pt-2 flex gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                {journeyStatus.contribution_count || 0}/10 Contributions
              </Badge>
              <Button variant="outline" size="sm" className="text-xs">
                Upgrade Now
              </Button>
            </div>
          </div>
        )
      case 'full_member':
        return (
          <div className="space-y-2">
            <h4 className="font-medium">Congratulations!</h4>
            <p className="text-sm">You're a Full Member with complete access to all Avolve features and benefits.</p>
            <div className="pt-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800">
                Full Access Unlocked
              </Badge>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderAchievements = () => {
    if (!journeyStatus?.achievements || journeyStatus.achievements.length === 0) {
      return (
        <div className="text-center py-2 text-sm text-muted-foreground">
          No achievements yet
        </div>
      )
    }

    // Sort achievements by unlock date (newest first)
    const sortedAchievements = [...journeyStatus.achievements].sort((a, b) => 
      new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime()
    )

    // Only show the 3 most recent achievements
    const recentAchievements = sortedAchievements.slice(0, 3)

    return (
      <div className="space-y-2">
        {recentAchievements.map((achievement, index) => {
          const achievementTitle = achievement.type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
          
          return (
            <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
              <div className="flex items-center">
                <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                <span>{achievementTitle}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Member Journey</CardTitle>
          <CardDescription>Your progress towards full membership</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!journeyStatus?.has_started) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Member Journey</CardTitle>
          <CardDescription>Your progress towards full membership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="mb-4 text-muted-foreground">You haven't started your member journey yet</p>
            <Button variant="default">Get Started</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentLevel = journeyStatus.current_level || 'invited'
  const levelInfo = getLevelInfo(currentLevel)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Member Journey</CardTitle>
        <CardDescription>Your progress towards full membership</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Level */}
          <div className={`p-4 rounded-lg ${levelInfo.bgColor} border ${levelInfo.borderColor}`}>
            <div className="flex items-center gap-3">
              {levelInfo.icon}
              <div>
                <h3 className={`font-bold ${levelInfo.color}`}>{levelInfo.title} Level</h3>
                <p className="text-sm">{levelInfo.description}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Invited</span>
              <span>Vouched</span>
              <span>Contributor</span>
              <span>Full Member</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 via-green-500 to-purple-600 rounded-full" 
                   style={{ 
                     width: `${journeyStatus.progress?.full_member === 100 ? 100 : 
                             journeyStatus.progress?.contributor === 100 ? 75 :
                             journeyStatus.progress?.vouched === 100 ? 50 : 25}%` 
                   }} />
            </div>
          </div>
          
          {/* Next Steps */}
          {getNextSteps()}
          
          {/* Recent Achievements */}
          <div className="space-y-2">
            <h4 className="font-medium">Recent Achievements</h4>
            {renderAchievements()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
