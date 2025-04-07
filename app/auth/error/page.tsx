"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

/**
 * Authentication Error Page
 * 
 * This page is displayed when an authentication error occurs.
 * It provides a user-friendly error message and guidance on next steps.
 */
export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams?.get("error") || "An unspecified error occurred"
  const errorCode = searchParams?.get("code") || ""
  
  // Map common error messages to more user-friendly messages
  const friendlyErrorMessage = getFriendlyErrorMessage(errorMessage, errorCode)
  
  // Determine appropriate actions based on the error
  const actions = getErrorActions(errorMessage, errorCode)

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
              <CardDescription className="text-center">
                We encountered a problem with your authentication request
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Alert variant="destructive">
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  {friendlyErrorMessage}
                  {errorCode && (
                    <div className="mt-2 text-xs opacity-70">
                      Error code: {errorCode}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
              
              {actions.helpText && (
                <p className="text-sm text-muted-foreground">{actions.helpText}</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {actions.primaryAction && (
                <Button className="w-full" asChild>
                  <Link href={actions.primaryAction.href}>{actions.primaryAction.text}</Link>
                </Button>
              )}
              {actions.secondaryAction && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={actions.secondaryAction.href}>{actions.secondaryAction.text}</Link>
                </Button>
              )}
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Maps error messages to user-friendly explanations
 */
function getFriendlyErrorMessage(errorMessage: string, errorCode: string): string {
  // Common Supabase error messages
  if (errorMessage.includes("Email link is invalid or has expired")) {
    return "The authentication link you clicked is invalid or has expired. Please request a new link."
  }
  
  if (errorMessage.includes("Email not confirmed")) {
    return "Your email address has not been confirmed. Please check your inbox for a confirmation email."
  }
  
  if (errorMessage.includes("Invalid login credentials")) {
    return "The email or password you entered is incorrect. Please try again."
  }
  
  if (errorMessage.includes("User already registered")) {
    return "An account with this email already exists. Please try logging in instead."
  }
  
  if (errorMessage.includes("Password should be at least")) {
    return "Your password doesn't meet the minimum security requirements. Please use a stronger password."
  }
  
  // If no specific mapping, return the original message with first letter capitalized
  return errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
}

/**
 * Determines appropriate actions based on the error
 */
function getErrorActions(errorMessage: string, errorCode: string): {
  helpText?: string;
  primaryAction?: { text: string; href: string };
  secondaryAction?: { text: string; href: string };
} {
  // Default actions
  const actions = {
    helpText: "You can try again or contact support if the problem persists.",
    primaryAction: { text: "Return to Login", href: "/auth/login" },
    secondaryAction: { text: "Create an Account", href: "/auth/signup" }
  }
  
  // Customize based on error type
  if (errorMessage.includes("Email link is invalid or has expired")) {
    actions.helpText = "Authentication links expire after a short period for security reasons."
    actions.primaryAction = { text: "Request New Link", href: "/auth/reset-password" }
  }
  
  if (errorMessage.includes("Email not confirmed")) {
    actions.helpText = "Please check your email inbox and spam folder for the confirmation email."
    actions.primaryAction = { text: "Resend Confirmation", href: "/auth/resend-confirmation" }
  }
  
  if (errorMessage.includes("User already registered")) {
    actions.helpText = "You already have an account with this email address."
    actions.primaryAction = { text: "Log In", href: "/auth/login" }
    actions.secondaryAction = { text: "Reset Password", href: "/auth/reset-password" }
  }
  
  return actions
}
