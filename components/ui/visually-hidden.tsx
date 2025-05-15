import type React from "react"
import { cn } from "@/lib/utils"

interface VisuallyHiddenProps {
  children: React.ReactNode
  className?: string
}

export function VisuallyHidden({
  children,
  className,
  ...props
}: VisuallyHiddenProps & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("sr-only", className)} {...props}>
      {children}
    </span>
  )
}
