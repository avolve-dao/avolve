"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useTour, type TourStep } from "@/contexts/tour-context"

interface FeatureTourProps {
  steps: TourStep[]
  buttonText?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  icon?: boolean
}

export function FeatureTour({
  steps,
  buttonText = "Learn how this works",
  className,
  variant = "ghost",
  size = "sm",
  icon = true,
}: FeatureTourProps) {
  const { startTour } = useTour()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => startTour(steps)}
      className={className}
      aria-label={buttonText}
    >
      {icon && <HelpCircle className="h-4 w-4 mr-2" />}
      {buttonText}
    </Button>
  )
}
