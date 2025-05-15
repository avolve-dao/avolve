"use client"

import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedbackAnimation } from "@/components/animations/feedback-animations"

interface NetworkErrorProps {
  title?: string
  description?: string
  retryCount?: number
  maxRetries?: number
  isRetrying?: boolean
  onRetry?: () => void
}

export function NetworkError({
  title = "Connection Error",
  description = "We're having trouble connecting to the server. Please check your internet connection and try again.",
  retryCount = 0,
  maxRetries = 3,
  isRetrying = false,
  onRetry,
}: NetworkErrorProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <FeedbackAnimation type="pulse" isActive={true}>
            <WifiOff className="h-5 w-5" />
          </FeedbackAnimation>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center gap-4">
          <FeedbackAnimation type="error" isActive={!isRetrying}>
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </FeedbackAnimation>

          <FeedbackAnimation type="loading" isActive={isRetrying}>
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </FeedbackAnimation>

          <p className="text-muted-foreground">
            {isRetrying ? `Retrying connection (${retryCount}/${maxRetries})...` : description}
          </p>

          {retryCount > 0 && !isRetrying && (
            <div className="text-sm text-muted-foreground mt-2">
              We tried connecting {retryCount} {retryCount === 1 ? "time" : "times"} without success.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onRetry} disabled={isRetrying} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {isRetrying ? "Retrying..." : "Try Again"}
        </Button>
      </CardFooter>
    </Card>
  )
}
