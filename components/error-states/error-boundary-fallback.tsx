"use client"

import { useState } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FeedbackAnimation } from "@/components/animations/feedback-animations"
import Link from "next/link"

interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  componentStack?: string
  eventId?: string
}

export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
  componentStack,
  eventId,
}: ErrorBoundaryFallbackProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <FeedbackAnimation type="pulse" isActive={true}>
            <AlertTriangle className="h-5 w-5" />
          </FeedbackAnimation>
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center gap-4">
          <FeedbackAnimation type="error" isActive={true}>
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </FeedbackAnimation>

          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or return to the dashboard.
          </p>

          {eventId && <div className="text-sm text-muted-foreground mt-2">Error ID: {eventId}</div>}

          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide" : "Show"} Error Details
          </Button>

          {showDetails && (
            <div className="w-full mt-2 p-3 bg-muted rounded-md text-left overflow-auto max-h-40 text-xs">
              <p className="font-semibold">Error: {error.message}</p>
              {componentStack && <pre className="mt-2 whitespace-pre-wrap">{componentStack}</pre>}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button onClick={resetErrorBoundary} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>

        <Button variant="outline" asChild className="gap-2">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
