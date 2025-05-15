"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size], className)} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}
