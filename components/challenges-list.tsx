"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, ArrowRight, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  reward: number
  completed: boolean
  timeEstimate: string
}

interface ChallengesListProps {
  limit?: number
  filter?: "all" | "completed" | "incomplete"
}

export function ChallengesList({ limit, filter = "all" }: ChallengesListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockChallenges: Challenge[] = [
        {
          id: "1",
          title: "Create Daily Value",
          description: "Create something valuable for someone else every day for a week.",
          difficulty: "beginner",
          reward: 10,
          completed: true,
          timeEstimate: "7 days",
        },
        {
          id: "2",
          title: "Value-Based Decision Making",
          description: "Make 3 decisions based on value creation rather than value extraction.",
          difficulty: "beginner",
          reward: 15,
          completed: false,
          timeEstimate: "3 days",
        },
        {
          id: "3",
          title: "Identify Value Opportunities",
          description: "Identify 5 opportunities to create value in your community or workplace.",
          difficulty: "intermediate",
          reward: 25,
          completed: false,
          timeEstimate: "5 days",
        },
        {
          id: "4",
          title: "Value Creation Project",
          description: "Complete a project that creates significant value for others.",
          difficulty: "advanced",
          reward: 50,
          completed: false,
          timeEstimate: "14 days",
        },
        {
          id: "5",
          title: "Teach Value Creation",
          description: "Teach someone else how to create value in their life or work.",
          difficulty: "intermediate",
          reward: 30,
          completed: false,
          timeEstimate: "7 days",
        },
      ]

      // Apply filter
      let filteredChallenges = mockChallenges
      if (filter === "completed") {
        filteredChallenges = mockChallenges.filter((c) => c.completed)
      } else if (filter === "incomplete") {
        filteredChallenges = mockChallenges.filter((c) => !c.completed)
      }

      // Apply limit
      if (limit) {
        filteredChallenges = filteredChallenges.slice(0, limit)
      }

      setChallenges(filteredChallenges)
      setLoading(false)
    }, 1000)
  }, [limit, filter])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit || 3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-4 flex justify-between">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-8">
          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Challenges Found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "completed"
                ? "You haven't completed any challenges yet."
                : filter === "incomplete"
                  ? "You've completed all available challenges!"
                  : "No challenges are available at the moment."}
            </p>
            {filter !== "all" && (
              <Button variant="outline" size="sm">
                View All Challenges
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge, index) => (
        <Card
          key={challenge.id}
          className={cn("overflow-hidden transition-all hover:shadow-md", challenge.completed && "bg-muted/50")}
          data-tour={index === 0 ? "challenge-card" : undefined}
        >
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg flex items-center gap-2">
                  {challenge.title}
                  {challenge.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                </h3>
                <p className="text-muted-foreground text-sm">{challenge.description}</p>
              </div>
              <Badge
                variant={
                  challenge.difficulty === "beginner"
                    ? "outline"
                    : challenge.difficulty === "intermediate"
                      ? "secondary"
                      : "default"
                }
                className="ml-2"
              >
                {challenge.difficulty}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {challenge.timeEstimate}
              </div>

              <div
                className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400"
                data-tour={index === 0 ? "challenge-rewards" : undefined}
              >
                <Trophy className="h-4 w-4 mr-1" />
                {challenge.reward} GEN
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              {challenge.completed ? (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                >
                  Completed
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                >
                  In Progress
                </Badge>
              )}

              <Button size="sm" variant={challenge.completed ? "outline" : "default"}>
                {challenge.completed ? "View Details" : "Start Challenge"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
