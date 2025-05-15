"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TransformationSummaryProps {
  userId: string
}

export function TransformationSummary({ userId }: TransformationSummaryProps) {
  const [status, setStatus] = useState({
    hasAgreedToTerms: false,
    hasGeniusId: false,
    hasGenTokens: false,
    hasGenieAi: false,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchStatus()
  }, [userId])

  const fetchStatus = async () => {
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
      console.error("Error fetching status:", error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = () => {
    let completed = 0
    if (status.hasAgreedToTerms) completed++
    if (status.hasGeniusId) completed++
    if (status.hasGenTokens) completed++
    if (status.hasGenieAi) completed++
    return (completed / 4) * 100
  }

  const getNextStep = () => {
    if (!status.hasAgreedToTerms) return "/agreement"
    if (!status.hasGeniusId) return "/unlock/genius-id"
    if (!status.hasGenTokens) return "/unlock/gen-token"
    if (!status.hasGenieAi) return "/unlock/genie-ai"
    return "/dashboard"
  }

  const isComplete = status.hasAgreedToTerms && status.hasGeniusId && status.hasGenTokens && status.hasGenieAi

  if (loading) {
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
          <StepItem
            completed={status.hasAgreedToTerms}
            label="Commit to the Supercivilization"
            benefit="Align with value creation principles"
          />
          <StepItem
            completed={status.hasGeniusId}
            label="Create Your Genius ID"
            benefit="Establish your unique identity"
          />
          <StepItem
            completed={status.hasGenTokens}
            label="Unlock GEN Tokens"
            benefit="Gain the currency of transformation"
          />
          <StepItem completed={status.hasGenieAi} label="Access Genie AI" benefit="Get personalized guidance" />
        </div>

        {!isComplete && (
          <Button onClick={() => router.push(getNextStep())} className="w-full flex items-center justify-center gap-2">
            Continue Your Transformation
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {isComplete && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 rounded-lg p-3 text-sm text-green-700 dark:text-green-400">
            Congratulations! You've unlocked all the tools you need to participate in the Supercivilization.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface StepItemProps {
  completed: boolean
  label: string
  benefit: string
}

function StepItem({ completed, label, benefit }: StepItemProps) {
  return (
    <div className="flex items-start gap-3">
      {completed ? (
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
      ) : (
        <Circle className="h-5 w-5 text-zinc-400 mt-0.5" />
      )}
      <div>
        <div className={completed ? "text-green-700 dark:text-green-400" : ""}>{label}</div>
        <p className="text-xs text-muted-foreground">{benefit}</p>
      </div>
    </div>
  )
}
