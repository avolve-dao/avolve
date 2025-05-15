"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { SupercivilizationBrandScript } from "@/lib/branding/supercivilization-brandscript"

export function TransformationProgress() {
  const { transformationProgress, isLoading } = useUser()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Transformation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  const { hasAgreedToTerms, hasGeniusId, hasGenTokens, hasGenieAi } = transformationProgress

  const steps = [
    {
      id: "agreement",
      label: SupercivilizationBrandScript.plan[0],
      completed: hasAgreedToTerms,
      description: "Align with value creation principles",
    },
    {
      id: "genius-id",
      label: SupercivilizationBrandScript.plan[1],
      completed: hasGeniusId,
      description: "Establish your unique identity",
    },
    {
      id: "gen-tokens",
      label: SupercivilizationBrandScript.plan[2],
      completed: hasGenTokens,
      description: "Gain the currency of transformation",
    },
    {
      id: "genie-ai",
      label: SupercivilizationBrandScript.plan[3],
      completed: hasGenieAi,
      description: "Get personalized guidance",
    },
  ]

  const completedSteps = steps.filter((step) => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100
  const isComplete = completedSteps === steps.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Degen to Regen Journey</CardTitle>
        <CardDescription>
          {isComplete
            ? "You've unlocked all the tools to participate in the Supercivilization"
            : "Complete these steps to transform from Degen to Regen"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Degen</span>
            <span>Regen</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-3 mt-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-400 mt-0.5" />
              )}
              <div>
                <div className="font-medium">{step.label}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4 text-sm text-green-700 dark:text-green-400">
            <p className="font-medium">Congratulations, Regen!</p>
            <p>
              You've completed your initial transformation journey. Continue creating value in the Supercivilization.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
