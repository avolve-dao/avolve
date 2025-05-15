"use client"

import type React from "react"

import { useEffect } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type FeedbackType = "success" | "error" | "info"

interface FeedbackToastProps {
  type: FeedbackType
  title: string
  description?: string
  duration?: number
  action?: React.ReactNode
}

export function useFeedbackToast() {
  const { toast } = useToast()

  const showFeedback = ({ type, title, description, duration = 5000, action }: FeedbackToastProps) => {
    toast({
      title,
      description,
      duration,
      action,
      className: cn(
        "border",
        type === "success" && "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20",
        type === "error" && "border-red-600 dark:border-red-500 bg-red-50 dark:bg-red-900/20",
        type === "info" && "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20",
      ),
    })
  }

  return { showFeedback }
}

export function FeedbackToast({
  type,
  title,
  description,
  onClose,
}: {
  type: FeedbackType
  title: string
  description?: string
  onClose: () => void
}) {
  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info

  const iconColor =
    type === "success"
      ? "text-green-600 dark:text-green-500"
      : type === "error"
        ? "text-red-600 dark:text-red-500"
        : "text-blue-600 dark:text-blue-500"

  return (
    <div className="flex items-start gap-3">
      <Icon className={cn("h-5 w-5 mt-0.5", iconColor)} />
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Example usage component
export function FeedbackToastExample() {
  const { showFeedback } = useFeedbackToast()

  useEffect(() => {
    // Example of showing a success toast when component mounts
    showFeedback({
      type: "success",
      title: "Challenge completed!",
      description: "You've earned 50 GEN tokens for completing this challenge.",
    })
  }, [])

  return null
}
