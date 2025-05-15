import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormValidationMessageProps {
  message: string
  type: "error" | "success" | "info"
  className?: string
}

export function FormValidationMessage({ message, type, className }: FormValidationMessageProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm mt-1.5",
        type === "error" && "text-destructive",
        type === "success" && "text-green-600 dark:text-green-400",
        type === "info" && "text-blue-600 dark:text-blue-400",
        className,
      )}
    >
      {type === "error" && <AlertCircle className="h-4 w-4" />}
      {type === "success" && <CheckCircle className="h-4 w-4" />}
      <span>{message}</span>
    </div>
  )
}
