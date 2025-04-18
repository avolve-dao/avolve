"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { Logger } from "@/lib/monitoring/logger"

// Initialize logger
const logger = new Logger("ErrorBoundary")

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  // Removed unused variable router
  
  useEffect(() => {
    // Log the error to our monitoring system
    logger.error("Application error boundary caught error", error, {
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <Card className="max-w-md w-full p-6 border-zinc-800 bg-zinc-950/50">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          
          <p className="text-muted-foreground">
            We apologize for the inconvenience. An unexpected error has occurred.
          </p>
          
          {error.digest && (
            <p className="text-xs text-muted-foreground border border-zinc-800 bg-zinc-900/50 px-2 py-1 rounded">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Button 
              onClick={() => reset()}
              className="w-full flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Return home
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
