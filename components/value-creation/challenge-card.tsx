"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, ArrowRight, Trophy, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

interface ChallengeCardProps {
  id: string
  title: string
  description: string
  tokenReward: number
  difficulty: "beginner" | "intermediate" | "advanced"
  timeEstimate: string
  steps: string[]
  onAccept: (id: string) => void
  onComplete: (id: string) => void
}

export function ChallengeCard({
  id,
  title,
  description,
  tokenReward,
  difficulty,
  timeEstimate,
  steps,
  onAccept,
  onComplete,
}: ChallengeCardProps) {
  const [status, setStatus] = useState<"available" | "in-progress" | "completed">("available")
  const [currentStep, setCurrentStep] = useState(0)
  const { toast } = useToast()

  const handleAccept = () => {
    setStatus("in-progress")
    onAccept(id)
    toast({
      title: "Challenge accepted!",
      description: "You've started a new value creation challenge.",
    })
  }

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setStatus("completed")
      onComplete(id)
      toast({
        title: "Challenge completed!",
        description: `You've earned ${tokenReward} GEN tokens for creating value.`,
      })
    }
  }

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500 hover:bg-green-600"
      case "intermediate":
        return "bg-blue-500 hover:bg-blue-600"
      case "advanced":
        return "bg-purple-500 hover:bg-purple-600"
      default:
        return ""
    }
  }

  const progress = status === "in-progress" ? ((currentStep + 1) / steps.length) * 100 : 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge className={getDifficultyColor()}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">Reward: {tokenReward} GEN Tokens</span>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Estimated time: {timeEstimate}</span>
        </div>

        {status === "available" && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Challenge Steps:</h4>
            <ol className="list-decimal list-inside space-y-1">
              {steps.map((step, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {status === "in-progress" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current Step:</h4>
              <p className="text-sm">{steps[currentStep]}</p>
            </div>
          </div>
        )}

        {status === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30 flex items-center gap-3"
          >
            <Trophy className="h-8 w-8 text-amber-500" />
            <div>
              <h4 className="font-medium text-green-700 dark:text-green-400">Challenge Completed!</h4>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">
                You've successfully created value and earned {tokenReward} GEN tokens.
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
      <CardFooter>
        {status === "available" && (
          <Button onClick={handleAccept} className="w-full">
            Accept Challenge
          </Button>
        )}

        {status === "in-progress" && (
          <Button onClick={handleNextStep} className="w-full flex items-center gap-2">
            {currentStep < steps.length - 1 ? "Complete Step" : "Finish Challenge"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {status === "completed" && (
          <Button variant="outline" className="w-full" asChild>
            <a href="/challenges">Find More Challenges</a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
