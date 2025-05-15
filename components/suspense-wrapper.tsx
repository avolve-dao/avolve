"use client"

import { Suspense, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface SuspenseWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function SuspenseWrapper({ children, fallback }: SuspenseWrapperProps) {
  const defaultFallback = (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
}
