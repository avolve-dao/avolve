import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export interface MobileFriendlyInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  fullWidth?: boolean
  label?: string
  helperText?: string
}

const MobileFriendlyInput = forwardRef<HTMLInputElement, MobileFriendlyInputProps>(
  ({ className, error, fullWidth, label, helperText, ...props }, ref) => {
    return (
      <div className={cn("space-y-1", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{helperText}</p>
        )}
      </div>
    )
  },
)
MobileFriendlyInput.displayName = "MobileFriendlyInput"

export { MobileFriendlyInput }
