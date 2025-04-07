"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import { Heart, DollarSign, Users, CheckCircle, Clock, ArrowRight } from "lucide-react"
import { completeWeeklyCheckin } from "@/app/actions/complete-weekly-checkin"
import { PSPGoalForm } from "@/components/onboarding/psp-goal-form"
import { formatDistanceToNow } from "date-fns"

interface PSPGoal {
  id: string
  psp_area: string
  goal_description: string
  current_state: string
  desired_state: string
  created_at: string
  updated_at: string
}

interface TokenBalance {
  token_symbol: string
  balance: number
}

export function PSPDashboard() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [goal, setGoal] = useState<PSPGoal | null>(null)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch the user's active PSP goal
      const { data: goalData, error: goalError } = await supabase
        .from('user_psp_goals')
        .select('*')
        .eq('is_active_mvp_goal', true)
        .single()

      if (goalError && goalError.code !== 'PGRST116') {
        console.error('Error fetching goal:', goalError)
      }

      if (goalData) {
        setGoal(goalData as PSPGoal)
      }

      // Fetch token balances for SAP and PSP
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_tokens')
        .select('tokens(symbol), balance')
        .in('tokens.symbol', ['SAP', 'PSP'])

      if (tokenError) {
        console.error('Error fetching token balances:', tokenError)
      } else if (tokenData) {
        const formattedBalances = tokenData.map((item: any) => ({
          token_symbol: item.tokens?.symbol || 'Unknown',
          balance: item.balance || 0
        }))
        setTokenBalances(formattedBalances)
      }

      // Fetch last check-in time
      const { data: questData, error: questError } = await supabase
        .from('user_quests')
        .select('last_completed_at')
        .eq('quest_type', 'psp_weekly_checkin')
        .single()

      if (questError && questError.code !== 'PGRST116') {
        console.error('Error fetching quest data:', questError)
      }

      if (questData && questData.last_completed_at) {
        setLastCheckIn(questData.last_completed_at)
      }
    } catch (error) {
      console.error('Error in fetchData:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const result = await completeWeeklyCheckin()
      
      if (result.success) {
        toast({
          title: "Check-in Complete!",
          description: "You've earned 10 PSP tokens for your weekly check-in.",
        })
        fetchData() // Refresh data
      } else if (result.cooldown) {
        toast({
          title: "Already Checked In",
          description: "You've already completed your weekly check-in. Come back later!",
          variant: "default"
        })
      } else {
        throw new Error(result.error || "Failed to complete check-in")
      }
    } catch (error) {
      console.error('Error during check-in:', error)
      toast({
        title: "Check-in Failed",
        description: "There was a problem completing your check-in. Please try again.",
        variant: "destructive"
      })
    } finally {
      setCheckingIn(false)
    }
  }

  // If no goal exists yet, show the goal creation form
  if (!loading && !goal) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Personal Success Journey</CardTitle>
            <CardDescription>
              Let's start by defining your first goal in one of the Personal Success Puzzle areas.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <PSPGoalForm onComplete={fetchData} />
      </div>
    )
  }

  // Get the appropriate icon based on PSP area
  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'health_energy':
        return <Heart className="h-5 w-5 text-amber-500" />
      case 'wealth_career':
        return <DollarSign className="h-5 w-5 text-amber-500" />
      case 'peace_people':
        return <Users className="h-5 w-5 text-amber-500" />
      default:
        return <Heart className="h-5 w-5 text-amber-500" />
    }
  }

  // Get the human-readable area name
  const getAreaName = (area: string) => {
    switch (area) {
      case 'health_energy':
        return 'Health & Energy'
      case 'wealth_career':
        return 'Wealth & Career'
      case 'peace_people':
        return 'Peace & People'
      default:
        return 'Personal Success'
    }
  }

  // Calculate if check-in is available (not in cooldown)
  const isCheckInAvailable = () => {
    if (!lastCheckIn) return true
    
    const lastDate = new Date(lastCheckIn)
    const now = new Date()
    
    // Check if it's been at least 6 days since last check-in
    const diffInDays = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    return diffInDays >= 6
  }

  return (
    <div className="space-y-6">
      {/* Token Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
          </>
        ) : (
          <>
            {tokenBalances.map((token) => (
              <Card key={token.token_symbol} className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-amber-800 dark:text-amber-300">
                    {token.token_symbol === 'SAP' ? 'Superachiever Progress' : 'Personal Success Progress'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">{token.balance}</span>
                    <span className="ml-2 text-sm text-amber-600 dark:text-amber-400">{token.token_symbol}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Active Goal */}
      {loading ? (
        <Skeleton className="h-[300px] rounded-lg" />
      ) : goal ? (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              {getAreaIcon(goal.psp_area)}
              <CardTitle>{getAreaName(goal.psp_area)} Goal</CardTitle>
            </div>
            <CardDescription>
              Created {formatDistanceToNow(new Date(goal.created_at))} ago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Goal</h3>
              <p className="text-muted-foreground">{goal.goal_description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-medium mb-1 flex items-center">
                  <span className="bg-amber-100 dark:bg-amber-900 p-1 rounded-full mr-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </span>
                  Current State
                </h3>
                <p className="text-sm text-muted-foreground">{goal.current_state}</p>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <h3 className="font-medium mb-1 flex items-center">
                  <span className="bg-amber-100 dark:bg-amber-900 p-1 rounded-full mr-2">
                    <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </span>
                  Desired State
                </h3>
                <p className="text-sm text-muted-foreground">{goal.desired_state}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Weekly Check-in */}
      {loading ? (
        <Skeleton className="h-[150px] rounded-lg" />
      ) : goal ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Check-in</CardTitle>
            <CardDescription>
              Review your progress and earn PSP tokens by checking in weekly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastCheckIn && (
              <p className="text-sm text-muted-foreground mb-4">
                Last check-in: {formatDistanceToNow(new Date(lastCheckIn))} ago
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCheckIn}
              disabled={checkingIn || !isCheckInAvailable()}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
            >
              {checkingIn ? (
                "Processing..."
              ) : isCheckInAvailable() ? (
                <span className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Weekly Check-in (+10 PSP)
                </span>
              ) : (
                <span className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Check-in Available in {formatDistanceToNow(new Date(new Date(lastCheckIn!).getTime() + 6 * 24 * 60 * 60 * 1000))}
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : null}
    </div>
  )
}
