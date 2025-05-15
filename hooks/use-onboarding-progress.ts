"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/contexts/user-context"

export function useOnboardingProgress() {
  const { user, transformationProgress, refreshTransformationProgress } = useUser()
  const [isUpdating, setIsUpdating] = useState(false)
  const [lastCompletedStep, setLastCompletedStep] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (transformationProgress) {
      // Calculate the last completed step
      const { hasAgreedToTerms, hasGeniusId, hasGenTokens, hasGenieAi } = transformationProgress

      if (hasGenieAi) {
        setLastCompletedStep(4)
      } else if (hasGenTokens) {
        setLastCompletedStep(3)
      } else if (hasGeniusId) {
        setLastCompletedStep(2)
      } else if (hasAgreedToTerms) {
        setLastCompletedStep(1)
      } else {
        setLastCompletedStep(null)
      }
    }
  }, [transformationProgress])

  const completeStep = async (step: number) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setIsUpdating(true)
    try {
      let updateData = {}

      switch (step) {
        case 1:
          updateData = { has_agreed_to_terms: true }
          break
        case 2:
          updateData = { has_genius_id: true }
          break
        case 3:
          updateData = { has_gen_tokens: true }
          break
        case 4:
          updateData = { has_genie_ai: true }
          break
        default:
          throw new Error(`Invalid step: ${step}`)
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (error) throw error

      // Refresh the transformation progress
      await refreshTransformationProgress()
      setLastCompletedStep(step)

      return { success: true }
    } catch (error) {
      console.error(`Error completing step ${step}:`, error)
      return { success: false, error }
    } finally {
      setIsUpdating(false)
    }
  }

  const resetProgress = async () => {
    if (!user) return { success: false, error: "User not authenticated" }

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          has_agreed_to_terms: false,
          has_genius_id: false,
          has_gen_tokens: false,
          has_genie_ai: false,
        })
        .eq("id", user.id)

      if (error) throw error

      // Refresh the transformation progress
      await refreshTransformationProgress()
      setLastCompletedStep(null)

      return { success: true }
    } catch (error) {
      console.error("Error resetting progress:", error)
      return { success: false, error }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    lastCompletedStep,
    isUpdating,
    completeStep,
    resetProgress,
  }
}
