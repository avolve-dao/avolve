"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OnboardingHero } from "@/components/onboarding/onboarding-hero"
import { StepExplainer } from "@/components/onboarding/step-explainer"
import { CelebrationModal } from "@/components/onboarding/celebration-modal"
import { PersonalizationForm } from "@/components/onboarding/personalization-form"
import { TransformationJourney } from "@/components/onboarding/transformation-journey"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useOnboardingProgress } from "@/hooks/use-onboarding-progress"
import { ROUTES } from "@/constants"
import { FadeIn, SlideIn } from "@/components/animations/micro-animations"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, transformationProgress, isLoading } = useUser()
  const { lastCompletedStep } = useOnboardingProgress()
  const [currentStep, setCurrentStep] = useState(1)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebratedStep, setCelebratedStep] = useState<number | null>(null)
  const [showPersonalization, setShowPersonalization] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push(ROUTES.LOGIN)
        return
      }

      // Determine the current step based on progress
      const { hasAgreedToTerms, hasGeniusId, hasGenTokens, hasGenieAi } = transformationProgress

      if (hasGenieAi) {
        setCurrentStep(5) // All steps completed
      } else if (hasGenTokens) {
        setCurrentStep(4) // Need to complete Genie AI
      } else if (hasGeniusId) {
        setCurrentStep(3) // Need to complete GEN Tokens
      } else if (hasAgreedToTerms) {
        setCurrentStep(2) // Need to complete Genius ID
      } else {
        setCurrentStep(1) // Need to complete Agreement
        setShowPersonalization(true) // Show personalization form for new users
      }
    }
  }, [user, transformationProgress, isLoading, router])

  // Check if we need to show a celebration
  useEffect(() => {
    if (lastCompletedStep && lastCompletedStep !== celebratedStep) {
      setShowCelebration(true)
      setCelebratedStep(lastCompletedStep)
    }
  }, [lastCompletedStep, celebratedStep])

  const handlePersonalizationComplete = () => {
    setShowPersonalization(false)
  }

  const getNextStepRoute = () => {
    switch (currentStep) {
      case 1:
        return ROUTES.AGREEMENT
      case 2:
        return ROUTES.UNLOCK_GENIUS_ID
      case 3:
        return ROUTES.UNLOCK_GEN_TOKEN
      case 4:
        return ROUTES.UNLOCK_GENIE_AI
      case 5:
        return ROUTES.DASHBOARD
      default:
        return ROUTES.DASHBOARD
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-12">
        <div className="animate-pulse h-40 bg-zinc-100 dark:bg-zinc-800 rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-12">
      <FadeIn>
        <OnboardingHero step={currentStep} />
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <SlideIn>
            {showPersonalization ? (
              <PersonalizationForm onComplete={handlePersonalizationComplete} />
            ) : (
              <StepExplainer step={currentStep as 1 | 2 | 3 | 4 | 5} />
            )}
          </SlideIn>

          <div className="mt-6 flex justify-center">
            <Button size="lg" asChild>
              <a href={getNextStepRoute()}>
                Continue Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        <div>
          <SlideIn direction="right" delay={0.2}>
            <TransformationJourney />
          </SlideIn>
        </div>
      </div>

      <CelebrationModal isOpen={showCelebration} onClose={() => setShowCelebration(false)} step={celebratedStep} />
    </div>
  )
}
