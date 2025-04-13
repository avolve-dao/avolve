"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RegenScoreWidgetProps {
  userId: string
}

export function RegenScoreWidget({ userId }: RegenScoreWidgetProps) {
  const [immersionLevel, setImmersionLevel] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [trend, setTrend] = useState<number>(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchImmersionLevel() {
      try {
        setIsLoading(true)
        
        // Get current immersion level
        const { data: currentData, error: currentError } = await supabase
          .from('user_activity_log')
          .select('immersion_level')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false })
          .limit(1)
        
        if (currentError) throw currentError
        
        // Get previous immersion level (from 7 days ago)
        const { data: previousData, error: previousError } = await supabase
          .from('user_activity_log')
          .select('immersion_level')
          .eq('user_id', userId)
          .lt('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('timestamp', { ascending: false })
          .limit(1)
        
        if (previousError) throw previousError
        
        if (currentData && currentData.length > 0) {
          setImmersionLevel(currentData[0].immersion_level)
          
          // Calculate trend
          if (previousData && previousData.length > 0) {
            const previousLevel = previousData[0].immersion_level
            setTrend(currentData[0].immersion_level - previousLevel)
          }
        }
      } catch (error) {
        console.error("Error fetching immersion level:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      fetchImmersionLevel()
    }
  }, [userId])

  // Get score level text
  const getScoreLevel = (score: number) => {
    if (score < 20) return "Beginner"
    if (score < 40) return "Explorer"
    if (score < 60) return "Practitioner"
    if (score < 80) return "Advocate"
    return "Regenerator"
  }

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score < 20) return "bg-blue-500"
    if (score < 40) return "bg-teal-500"
    if (score < 60) return "bg-green-500"
    if (score < 80) return "bg-yellow-500"
    return "bg-purple-500"
  }

  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Regen Score
            </CardTitle>
            <CardDescription>
              Your regenerative impact level
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Your Regen Score measures your regenerative impact based on platform activity, community engagement, and token utilization.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">{immersionLevel}</span>
            <span className="text-sm font-medium">
              {getScoreLevel(immersionLevel)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={immersionLevel} 
              max={100} 
              className="h-2"
              indicatorClassName={getScoreColor(immersionLevel)}
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Explorer</span>
              <span>Practitioner</span>
              <span>Advocate</span>
              <span>Regenerator</span>
            </div>
          </div>
          
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'transform rotate-180' : ''}`} />
              <span>{trend > 0 ? '+' : ''}{trend} since last week</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Detailed Analytics
        </Button>
      </CardFooter>
    </Card>
  )
}
