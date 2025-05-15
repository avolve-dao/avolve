import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  fullWidthOnMobile?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg"
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
}

const paddingClasses = {
  none: "px-0",
  sm: "px-3 sm:px-4",
  md: "px-4 sm:px-6",
  lg: "px-4 sm:px-8",
}

export function ResponsiveContainer({
  children,
  className,
  fullWidthOnMobile = false,
  maxWidth = "lg",
  padding = "md",
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        fullWidthOnMobile ? "sm:px-0 px-0" : paddingClasses[padding],
        maxWidthClasses[maxWidth],
        className,
      )}
    >
      {children}
    </div>
  )
}
