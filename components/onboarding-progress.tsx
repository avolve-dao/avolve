"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface OnboardingStatus {
  hasAgreedToTerms: boolean
  hasGeniusId: boolean
  hasGenTokens: boolean
  hasGenieAi: boolean
}

interface OnboardingProgressProps {
  userId: string
  initialStatus?: OnboardingStatus
}

export function OnboardingProgress({ userId, initialStatus }: OnboardingProgressProps) {
  const [status, setStatus] = useState<OnboardingStatus>(
    initialStatus || {
      hasAgreedToTerms: false,
      hasGeniusId: false,
      hasGenTokens: false,
      hasGenieAi: false,
    },
  )
  const [loading, setLoading] = useState(!initialStatus)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!initialStatus) {
      fetchOnboardingStatus()
    }

    // Cleanup function
    return () => {
      // Any cleanup needed
    }
  }, [initialStatus, userId])

  const fetchOnboardingStatus = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("has_agreed_to_terms, has_genius_id, has_gen_tokens, has_genie_ai")
        .eq("id", userId)
        .single()

      if (error) throw error

      setStatus({
        hasAgreedToTerms: data?.has_agreed_to_terms || false,
        hasGeniusId: data?.has_genius_id || false,
        hasGenTokens: data?.has_gen_tokens || false,
        hasGenieAi: data?.has_genie_ai || false,
      })
    } catch (error) {
      console.error("Error fetching onboarding status:", error)
    } finally {
      setLoading(false)
    }
  }

  const getNextStep = () => {
    if (!status.hasAgreedToTerms) return "/agreement"
    if (!status.hasGeniusId) return "/unlock/genius-id"
    if (!status.hasGenTokens) return "/unlock/gen-token"
    if (!status.hasGenieAi) return "/unlock/genie-ai"
    return "/dashboard"
  }

  const getProgressPercentage = () => {
    let completed = 0
    if (status.hasAgreedToTerms) completed++
    if (status.hasGeniusId) completed++
    if (status.hasGenTokens) completed++
    if (status.hasGenieAi) completed++
    return (completed / 4) * 100
  }

  const handleContinue = () => {
    router.push(getNextStep())
  }

  const isComplete = status.hasAgreedToTerms && status.hasGeniusId && status.hasGenTokens && status.hasGenieAi

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Transformation Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <div className="space-y-3">
            <StepItem
              completed={status.hasAgreedToTerms}
              label="Establish Your Identity"
              description="Define who you are as a value creator"
            />

            <StepItem
              completed={status.hasGeniusId}
              label="Gain Resources for Growth"
              description="Acquire the tools you need for transformation"
            />

            <StepItem
              completed={status.hasGenTokens}
              label="Build Your Capabilities"
              description="Develop the mindset and skills of a value creator"
            />

            <StepItem
              completed={status.hasGenieAi}
              label="Access Your Personal Guide"
              description="Get personalized guidance for your journey"
            />
          </div>

          <Button onClick={handleContinue} className="w-full" disabled={loading || isComplete}>
            {isComplete ? "All Steps Completed" : "Continue Your Journey"}
            {!isComplete && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface StepItemProps {
  completed: boolean
  label: string
  description?: string
}

function StepItem({ completed, label, description }: StepItemProps) {
  return (
    <div className="flex items-start gap-3">
      {completed ? (
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
      )}
      <div>
        <span className={completed ? "text-green-600 dark:text-green-400 font-medium" : ""}>{label}</span>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}
