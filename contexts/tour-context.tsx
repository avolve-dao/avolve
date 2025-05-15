"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { usePathname, useRouter } from "next/navigation"
import { ROUTES } from "@/constants"

export interface TourStep {
  id: string
  title: string
  content: string
  target: string // CSS selector for the element to highlight
  position?: "top" | "right" | "bottom" | "left" | "center"
  spotlightPadding?: number
  disableOverlay?: boolean
  route?: string // Route to navigate to for this step
}

interface TourContextType {
  isOpen: boolean
  currentStepIndex: number
  steps: TourStep[]
  startTour: (tourSteps?: TourStep[]) => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  currentStep: TourStep | null
  totalSteps: number
  setCustomTourSteps: (steps: TourStep[]) => void
}

const defaultTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Avolve!",
    content: "Let's take a quick tour to help you get started with your transformation journey.",
    target: "body",
    position: "center",
    disableOverlay: true,
    route: ROUTES.DASHBOARD,
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    content: "This is your personal dashboard where you can track your progress and see recommended challenges.",
    target: "[data-tour='dashboard-overview']",
    position: "bottom",
    route: ROUTES.DASHBOARD,
  },
  {
    id: "navigation",
    title: "Navigation",
    content: "Use the sidebar to navigate between different sections of the platform.",
    target: "[data-tour='main-navigation']",
    position: "right",
    route: ROUTES.DASHBOARD,
  },
  {
    id: "challenges",
    title: "Value Creation Challenges",
    content: "Complete challenges to earn GEN tokens and progress on your journey from Degen to Regen.",
    target: "[data-tour='challenges-section']",
    position: "bottom",
    route: ROUTES.DASHBOARD,
  },
  {
    id: "genius-id",
    title: "Your Genius ID",
    content: "Your unique identity in the Supercivilization. It represents your value creation potential.",
    target: "[data-tour='genius-id']",
    position: "bottom",
    route: ROUTES.PROFILE,
  },
  {
    id: "gen-tokens",
    title: "GEN Tokens",
    content: "The currency of value creation. Earn tokens by completing challenges and creating value.",
    target: "[data-tour='gen-tokens']",
    position: "bottom",
    route: ROUTES.WALLET,
  },
  {
    id: "genie-ai",
    title: "Genie AI",
    content: "Your personal AI assistant that helps guide you on your transformation journey.",
    target: "[data-tour='genie-ai']",
    position: "left",
    route: ROUTES.GENIE_AI,
  },
  {
    id: "complete",
    title: "You're All Set!",
    content: "You now know the basics of Avolve. Start your journey by completing your first challenge!",
    target: "body",
    position: "center",
    disableOverlay: true,
    route: ROUTES.DASHBOARD,
  },
]

const TourContext = createContext<TourContextType>({
  isOpen: false,
  currentStepIndex: 0,
  steps: defaultTourSteps,
  startTour: () => {},
  endTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
  currentStep: null,
  totalSteps: defaultTourSteps.length,
  setCustomTourSteps: () => {},
})

export const useTour = () => useContext(TourContext)

export function TourProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [steps, setSteps] = useState<TourStep[]>(defaultTourSteps)
  const [hasCompletedTour, setHasCompletedTour] = useLocalStorage("avolve-tour-completed", false)
  const [lastTourStep, setLastTourStep] = useLocalStorage("avolve-tour-last-step", 0)
  const pathname = usePathname()
  const router = useRouter()

  // Check if this is a new user and should start the tour
  useEffect(() => {
    const checkNewUser = async () => {
      // Only auto-start tour for new users who haven't completed it
      if (pathname === ROUTES.DASHBOARD && !hasCompletedTour && lastTourStep === 0) {
        // Small delay to ensure the page is fully loaded
        setTimeout(() => {
          startTour()
        }, 1000)
      }
    }

    checkNewUser()
  }, [pathname, hasCompletedTour, lastTourStep])

  const startTour = (tourSteps?: TourStep[]) => {
    if (tourSteps) {
      setSteps(tourSteps)
    } else {
      setSteps(defaultTourSteps)
    }

    // Start from the last viewed step or from the beginning
    const startIndex = !hasCompletedTour && lastTourStep > 0 ? lastTourStep : 0
    setCurrentStepIndex(startIndex)

    // Navigate to the correct route for this step if needed
    const targetRoute = tourSteps?.[startIndex]?.route || defaultTourSteps[startIndex]?.route
    if (targetRoute && pathname !== targetRoute) {
      router.push(targetRoute)
      // Delay opening the tour until after navigation
      setTimeout(() => {
        setIsOpen(true)
      }, 500)
    } else {
      setIsOpen(true)
    }
  }

  const endTour = () => {
    setIsOpen(false)
    setHasCompletedTour(true)
    setLastTourStep(0)
  }

  const skipTour = () => {
    setIsOpen(false)
    setHasCompletedTour(true)
    setLastTourStep(0)
  }

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      setLastTourStep(nextIndex)

      // Navigate to the correct route for this step if needed
      const targetRoute = steps[nextIndex]?.route
      if (targetRoute && pathname !== targetRoute) {
        router.push(targetRoute)
      }
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      setCurrentStepIndex(prevIndex)
      setLastTourStep(prevIndex)

      // Navigate to the correct route for this step if needed
      const targetRoute = steps[prevIndex]?.route
      if (targetRoute && pathname !== targetRoute) {
        router.push(targetRoute)
      }
    }
  }

  const setCustomTourSteps = (customSteps: TourStep[]) => {
    setSteps(customSteps)
  }

  const currentStep = isOpen && steps[currentStepIndex] ? steps[currentStepIndex] : null
  const totalSteps = steps.length

  return (
    <TourContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        currentStep,
        totalSteps,
        setCustomTourSteps,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}
