import { toast } from "@/hooks/use-toast"

/**
 * Error types for consistent error handling
 */
export enum ErrorType {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  DATABASE = "database",
  NETWORK = "network",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

/**
 * Error context interface
 */
export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  additionalData?: Record<string, any>
}

/**
 * Structured error interface
 */
export interface StructuredError {
  type: ErrorType
  message: string
  severity: ErrorSeverity
  originalError?: any
  context?: ErrorContext
  timestamp: string
}

/**
 * Handles errors in a consistent way across the application
 * @param error - The error to handle
 * @param type - The type of error
 * @param context - Additional context about the error
 * @param severity - The severity of the error
 * @param showToast - Whether to show a toast notification
 * @returns Structured error object
 */
export function handleError(
  error: any,
  type: ErrorType = ErrorType.UNKNOWN,
  context: ErrorContext = {},
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  showToast = true,
): StructuredError {
  // Extract error message
  const message = error instanceof Error ? error.message : String(error)

  // Create structured error
  const structuredError: StructuredError = {
    type,
    message,
    severity,
    originalError: error,
    context,
    timestamp: new Date().toISOString(),
  }

  // Log error to console
  console.error("Error:", structuredError)

  // Show toast notification if requested
  if (showToast) {
    toast({
      title: getErrorTitle(type),
      description: message,
      variant: getToastVariant(severity),
    })
  }

  // Log error to monitoring service in production
  if (process.env.NODE_ENV === "production") {
    logErrorToMonitoringService(structuredError)
  }

  return structuredError
}

/**
 * Gets a user-friendly error title based on error type
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.AUTHENTICATION:
      return "Authentication Error"
    case ErrorType.AUTHORIZATION:
      return "Authorization Error"
    case ErrorType.VALIDATION:
      return "Validation Error"
    case ErrorType.DATABASE:
      return "Database Error"
    case ErrorType.NETWORK:
      return "Network Error"
    case ErrorType.SERVER:
      return "Server Error"
    case ErrorType.CLIENT:
      return "Application Error"
    case ErrorType.UNKNOWN:
    default:
      return "Error"
  }
}

/**
 * Maps error severity to toast variant
 */
function getToastVariant(severity: ErrorSeverity): "default" | "destructive" {
  switch (severity) {
    case ErrorSeverity.INFO:
    case ErrorSeverity.WARNING:
      return "default"
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      return "destructive"
    default:
      return "destructive"
  }
}

/**
 * Logs error to a monitoring service (placeholder)
 */
function logErrorToMonitoringService(error: StructuredError): void {
  // This would be implemented with your monitoring service of choice
  // For example, Sentry, LogRocket, etc.
  console.log("Logging to monitoring service:", error)
}

/**
 * Creates a custom error with additional context
 */
export class AppError extends Error {
  type: ErrorType
  severity: ErrorSeverity
  context?: ErrorContext

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    context?: ErrorContext,
  ) {
    super(message)
    this.name = "AppError"
    this.type = type
    this.severity = severity
    this.context = context
  }
}

/**
 * Handles Supabase errors specifically
 */
export function handleSupabaseError(error: any, context: ErrorContext = {}, showToast = true): StructuredError {
  // Determine error type based on Supabase error code
  let errorType = ErrorType.DATABASE
  let severity = ErrorSeverity.ERROR

  // Supabase error codes: https://supabase.com/docs/guides/database/postgres-errors
  if (error?.code) {
    if (error.code === "PGRST116" || error.code === "42501") {
      errorType = ErrorType.AUTHORIZATION
    } else if (error.code === "23505") {
      errorType = ErrorType.VALIDATION
      severity = ErrorSeverity.WARNING
    } else if (error.code === "23503") {
      errorType = ErrorType.VALIDATION
    } else if (error.code.startsWith("28")) {
      errorType = ErrorType.AUTHENTICATION
    }
  }

  return handleError(error, errorType, context, severity, showToast)
}
