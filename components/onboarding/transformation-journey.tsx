"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, CheckCircle, Circle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ROUTES } from "@/constants"
import { useUser } from "@/contexts/user-context"
import { SupercivilizationBrandScript } from "@/lib/branding/supercivilization-brandscript"

export function TransformationJourney() {
  const { transformationProgress, isLoading } = useUser()
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    if (!isLoading) {
      // Calculate the active step based on completed steps
      const { hasAgreedToTerms, hasGeniusId, hasGenTokens, hasGenieAi } = transformationProgress

      if (hasGenieAi) {
        setActiveStep(5) // All steps completed
      } else if (hasGenTokens) {
        setActiveStep(4) // Need to complete Genie AI
      } else if (hasGeniusId) {
        setActiveStep(3) // Need to complete GEN Tokens
      } else if (hasAgreedToTerms) {
        setActiveStep(2) // Need to complete Genius ID
      } else {
        setActiveStep(1) // Need to complete Agreement
      }
    }
  }, [transformationProgress, isLoading])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Transformation Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-40 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
        </CardContent>
      </Card>
    )
  }

  const steps = [
    {
      id: 1,
      title: SupercivilizationBrandScript.plan[0],
      description: "Understand and commit to value-creating principles",
      route: ROUTES.AGREEMENT,
      completed: transformationProgress.hasAgreedToTerms,
    },
    {
      id: 2,
      title: SupercivilizationBrandScript.plan[1],
      description: "Establish your unique identity as a value creator",
      route: ROUTES.UNLOCK_GENIUS_ID,
      completed: transformationProgress.hasGeniusId,
    },
    {
      id: 3,
      title: SupercivilizationBrandScript.plan[2],
      description: "Gain the currency of value creation",
      route: ROUTES.UNLOCK_GEN_TOKEN,
      completed: transformationProgress.hasGenTokens,
    },
    {
      id: 4,
      title: SupercivilizationBrandScript.plan[3],
      description: "Get personalized guidance on your journey",
      route: ROUTES.UNLOCK_GENIE_AI,
      completed: transformationProgress.hasGenieAi,
    },
    {
      id: 5,
      title: "Welcome to the Supercivilization",
      description: "You've unlocked all the tools to create value",
      route: ROUTES.DASHBOARD,
      completed: transformationProgress.hasGenieAi,
    },
  ]

  const currentStep = steps.find((step) => step.id === activeStep) || steps[0]
  const completedSteps = steps.filter((step) => step.completed).length
  const progressPercentage = (completedSteps / (steps.length - 1)) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Transformation Journey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Degen</span>
            <span>Regen</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-4">
          <motion.div
            key={`step-${activeStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-muted/50 p-4 rounded-lg"
          >
            <h3 className="font-medium text-lg">{currentStep.title}</h3>
            <p className="text-muted-foreground text-sm mt-1">{currentStep.description}</p>

            {activeStep < 5 && (
              <Button asChild className="mt-4 w-full">
                <Link href={currentStep.route}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            {activeStep === 5 && (
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4 text-sm text-green-700 dark:text-green-400">
                <p className="font-medium">Congratulations, Regen!</p>
                <p>You've completed your initial transformation journey.</p>
              </div>
            )}
          </motion.div>

          <div className="pt-2">
            <h4 className="text-sm font-medium mb-3">Your Progress:</h4>
            <div className="space-y-2">
              {steps.slice(0, -1).map((step) => (
                <div key={step.id} className="flex items-center gap-2">
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300" />
                  )}
                  <span
                    className={`text-sm ${step.completed ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
