import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface FormLayoutProps {
  children: ReactNode
  className?: string
  columns?: 1 | 2 | 3
}

export function FormLayout({ children, className, columns = 1 }: FormLayoutProps) {
  return (
    <div
      className={cn(
        "w-full",
        columns === 1 && "space-y-4",
        columns === 2 && "grid grid-cols-1 md:grid-cols-2 gap-4",
        columns === 3 && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  )
}

interface FormSectionProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  fullWidth?: boolean
}

export function FormSection({ children, className, title, description, fullWidth = false }: FormSectionProps) {
  return (
    <div className={cn("space-y-2", fullWidth && "md:col-span-2 lg:col-span-3", className)}>
      {title && <h3 className="text-base font-medium">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  )
}
