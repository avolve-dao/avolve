"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useTour } from "@/contexts/tour-context"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

interface TourButtonProps {
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
}

export function TourButton({ className, variant = "outline", size = "icon", showText = false }: TourButtonProps) {
  const { startTour } = useTour()
  const [hasCompletedTour] = useLocalStorage("avolve-tour-completed", false)

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => startTour()}
      className={cn(
        "relative",
        !hasCompletedTour &&
          "after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:bg-primary after:rounded-full",
        className,
      )}
      aria-label="Start interactive tour"
    >
      <HelpCircle className="h-4 w-4" />
      {showText && <span className="ml-2">Tour</span>}
    </Button>
  )
}
