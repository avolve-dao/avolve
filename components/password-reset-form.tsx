"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Form validation schema
const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

interface PasswordResetFormProps extends React.ComponentPropsWithoutRef<"div"> {
  message?: string | null
  csrfToken?: string
}

export function PasswordResetForm({ className, message, csrfToken, ...props }: PasswordResetFormProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  
  // Use the auth hook
  const { resetPassword } = useAuth()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate email
      try {
        resetPasswordSchema.parse({ email })
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          throw new Error(validationError.errors[0].message)
        }
      }

      // Validate CSRF token first
      if (csrfToken) {
        const csrfResponse = await fetch("/api/auth/csrf/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: csrfToken }),
        })

        if (!csrfResponse.ok) {
          throw new Error("Invalid security token. Please refresh the page and try again.")
        }
      }

      // Get the current origin with protocol
      const origin = window.location.origin
      const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin
      const redirectUrl = `${cleanOrigin}/auth/reset-password/confirm`

      // Use the auth service to reset password
      const { error: resetError } = await resetPassword(email)

      if (resetError) {
        console.error("Password reset error:", resetError)
        throw resetError
      }

      // Show success message
      setIsSuccess(true)
      
      // Clear form
      setEmail("")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during password reset"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert className="mb-4">
              <AlertDescription>
                If an account exists with this email, you will receive a password reset link shortly.
                Please check your email inbox and spam folder.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-6">
              {/* Hidden CSRF token field */}
              {csrfToken && <input type="hidden" name="csrf_token" value={csrfToken} />}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSuccess}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isSuccess}
              >
                {isLoading ? "Sending reset link..." : "Send Reset Link"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Password reset confirmation form (for after clicking the reset link)
interface PasswordResetConfirmFormProps extends React.ComponentPropsWithoutRef<"div"> {
  message?: string | null
  csrfToken?: string
}

export function PasswordResetConfirmForm({ className, message, csrfToken, ...props }: PasswordResetConfirmFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  
  // Use the auth hook
  const { updatePassword } = useAuth()

  // Password validation schema
  const passwordSchema = z.object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate password
      try {
        passwordSchema.parse({ password, confirmPassword })
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          throw new Error(validationError.errors[0].message)
        }
      }

      // Validate CSRF token first
      if (csrfToken) {
        const csrfResponse = await fetch("/api/auth/csrf/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: csrfToken }),
        })

        if (!csrfResponse.ok) {
          throw new Error("Invalid security token. Please refresh the page and try again.")
        }
      }

      // Use the auth service to update password
      const { error: updateError } = await updatePassword(password)

      if (updateError) {
        console.error("Password update error:", updateError)
        throw updateError
      }

      // Show success message
      setIsSuccess(true)
      
      // Clear form
      setPassword("")
      setConfirmPassword("")
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push("/auth/login?message=Your+password+has+been+reset+successfully")
      }, 3000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during password update"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert className="mb-4">
              <AlertDescription>
                Your password has been updated successfully! You will be redirected to the login page shortly.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              {/* Hidden CSRF token field */}
              {csrfToken && <input type="hidden" name="csrf_token" value={csrfToken} />}

              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSuccess}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSuccess}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isSuccess}
              >
                {isLoading ? "Updating password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
