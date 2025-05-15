import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardContainerProps {
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  fullWidthOnMobile?: boolean
  compact?: boolean
  noPadding?: boolean
}

export function CardContainer({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  fullWidthOnMobile = false,
  compact = false,
  noPadding = false,
}: CardContainerProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden",
        fullWidthOnMobile && "sm:rounded-md rounded-none sm:border border-0 border-b",
        compact && "sm:p-4 p-2",
        className,
      )}
    >
      {(title || description) && (
        <CardHeader className={cn(compact && "p-3 sm:p-4")}>
          {title && <CardTitle className={cn(compact && "text-lg")}>{title}</CardTitle>}
          {description && <CardDescription className={cn(compact && "text-sm")}>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(noPadding ? "p-0" : "p-6", compact && !noPadding && "p-3 sm:p-4", contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter className={cn(compact && "p-3 sm:p-4")}>{footer}</CardFooter>}
    </Card>
  )
}
