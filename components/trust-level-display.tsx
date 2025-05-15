"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Users, Zap, Award, Lock } from "lucide-react"

interface TrustLevelDisplayProps {
  level: 1 | 2 | 3 | 4
  progress: number
  pointsToNextLevel?: number
  contributions: number
  invitations: number
  reputation: number
}

export function TrustLevelDisplay({
  level = 1,
  progress = 0,
  pointsToNextLevel,
  contributions = 0,
  invitations = 0,
  reputation = 0,
}: TrustLevelDisplayProps) {
  const levelInfo = {
    1: {
      name: "Explorer",
      description: "You're beginning your journey in the Supercivilization",
      color: "zinc",
      icon: Lightbulb,
    },
    2: {
      name: "Contributor",
      description: "You're actively contributing to the Supercivilization",
      color: "blue",
      icon: Users,
    },
    3: {
      name: "Builder",
      description: "You're building significant value in the Supercivilization",
      color: "purple",
      icon: Zap,
    },
    4: {
      name: "Steward",
      description: "You're a steward of the Supercivilization's principles",
      color: "amber",
      icon: Award,
    },
  }

  const currentLevel = levelInfo[level]
  const Icon = currentLevel.icon

  const getBadgeColor = () => {
    switch (level) {
      case 1:
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
      case 2:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case 3:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case 4:
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
    }
  }

  const getProgressColor = () => {
    switch (level) {
      case 1:
        return "bg-zinc-600 dark:bg-zinc-400"
      case 2:
        return "bg-blue-600 dark:bg-blue-400"
      case 3:
        return "bg-purple-600 dark:bg-purple-400"
      case 4:
        return "bg-amber-600 dark:bg-amber-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trust Level</CardTitle>
            <CardDescription>Your standing in the Supercivilization</CardDescription>
          </div>
          <Badge className={`${getBadgeColor()} flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            <span>
              Level {level}: {currentLevel.name}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1 text-sm">
            <span>{currentLevel.description}</span>
            {level < 4 && pointsToNextLevel && (
              <span className="text-muted-foreground">{pointsToNextLevel} points to next level</span>
            )}
          </div>
          <Progress value={progress} className="h-2" indicatorClassName={getProgressColor()} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{contributions}</div>
            <div className="text-xs text-muted-foreground">Contributions</div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{invitations}</div>
            <div className="text-xs text-muted-foreground">Invitations</div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold">{reputation}</div>
            <div className="text-xs text-muted-foreground">Reputation</div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Level Privileges</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Zap className={`h-4 w-4 ${level >= 1 ? "text-green-500" : "text-muted-foreground"}`} />
              <span className={level >= 1 ? "" : "text-muted-foreground"}>Access to learning resources</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Zap className={`h-4 w-4 ${level >= 2 ? "text-green-500" : "text-muted-foreground"}`} />
              <span className={level >= 2 ? "" : "text-muted-foreground"}>Collaboration opportunities</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Zap className={`h-4 w-4 ${level >= 3 ? "text-green-500" : "text-muted-foreground"}`} />
              <span className={level >= 3 ? "" : "text-muted-foreground"}>Invitation privileges</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Zap className={`h-4 w-4 ${level >= 4 ? "text-green-500" : "text-muted-foreground"}`} />
              <span className={level >= 4 ? "" : "text-muted-foreground"}>Governance participation</span>
            </div>
          </div>
        </div>

        {level < 4 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Next Level: {levelInfo[(level + 1) as 2 | 3 | 4].name}
                </h4>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                  Continue creating value and contributing to the community to advance to the next level.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
