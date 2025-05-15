"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {icon || <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />}
      <h3 className="text-lg font-medium mt-4">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  )
}
