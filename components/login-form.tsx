"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  message?: string | null
  csrfToken?: string
  redirectTo?: string
}

export function LoginForm({ className, message, csrfToken, redirectTo, ...props }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailResent, setEmailResent] = useState(false)
  const router = useRouter()
  
  // Use the auth hook
  const { signIn, resendConfirmationEmail } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
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

      // Use the auth service to sign in
      const { data, error: signInError, message: signInMessage } = await signIn(email, password)

      if (signInError) {
        console.error("Login error:", signInError)
        throw signInError
      }

      // Refresh the page to ensure the session is properly loaded
      router.refresh()
      
      // Then redirect to dashboard or the specified redirect URL
      router.push(redirectTo || "/dashboard")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login"
      setError(errorMessage)

      // Check if it's an "Email not confirmed" error
      if (errorMessage.includes("Email not confirmed")) {
        setError(
          "Your email has not been confirmed. Please check your inbox or click 'Resend confirmation email' below.",
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmationEmail = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    setResendingEmail(true)
    setEmailResent(false)

    try {
      // Get the current origin with protocol, ensuring no double slashes
      const origin = window.location.origin
      // Make sure there's no trailing slash in the origin
      const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin
      const redirectUrl = `${cleanOrigin}/auth/callback`

      console.log("Using resend confirmation redirect URL:", redirectUrl)

      // Use the auth service to resend confirmation email
      const { error, message } = await resendConfirmationEmail(email, redirectUrl)

      if (error) throw error

      setEmailResent(true)
      setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(`Failed to resend confirmation email: ${errorMessage}`)
    } finally {
      setResendingEmail(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {emailResent && (
            <Alert className="mb-4">
              <AlertDescription>Confirmation email has been resent. Please check your inbox.</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin}>
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
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-red-500">
                  <p>{error}</p>
                  {error.includes("Email not confirmed") && (
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm text-primary"
                      onClick={handleResendConfirmationEmail}
                      disabled={resendingEmail}
                    >
                      {resendingEmail ? "Sending..." : "Resend confirmation email"}
                    </Button>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
