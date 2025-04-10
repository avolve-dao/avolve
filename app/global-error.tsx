"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Logger } from "@/lib/monitoring/logger"

// Initialize logger
const logger = new Logger("GlobalErrorBoundary")

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to our monitoring system
    logger.error("Global error boundary caught error", error, {
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
          <div className="max-w-md w-full p-6 border border-zinc-800 bg-zinc-950/50 rounded-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-white">Critical Error</h2>
              
              <p className="text-zinc-400">
                We apologize for the inconvenience. The application has encountered a critical error and cannot continue.
              </p>
              
              {error.digest && (
                <p className="text-xs text-zinc-500 border border-zinc-800 bg-zinc-900/50 px-2 py-1 rounded">
                  Error ID: {error.digest}
                </p>
              )}
              
              <Button 
                onClick={() => reset()}
                className="mt-4 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
