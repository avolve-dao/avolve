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
import { Checkbox } from "@/components/ui/checkbox"

// Form validation schema
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

interface SignupFormProps extends React.ComponentPropsWithoutRef<"div"> {
  message?: string | null
  csrfToken?: string
  redirectTo?: string
}

export function SignupForm({ className, message, csrfToken, redirectTo, ...props }: SignupFormProps) {
  const [formValues, setFormValues] = useState<Partial<SignupFormValues>>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    username: "",
    termsAccepted: false,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormValues, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  
  // Use the auth hook
  const { signUp } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    
    // Clear error for this field when user changes it
    if (errors[name as keyof SignupFormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formValues)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignupFormValues, string>> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof SignupFormValues
          newErrors[field] = err.message
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setGeneralError(null)
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

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

      // Get the current origin with protocol
      const origin = window.location.origin
      const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin
      const redirectUrl = `${cleanOrigin}/auth/callback`

      // Use the auth service to sign up
      const { data, error, message } = await signUp(
        formValues.email!,
        formValues.password!,
        {
          full_name: formValues.fullName,
          username: formValues.username,
          terms_accepted: formValues.termsAccepted,
          terms_accepted_at: new Date().toISOString(),
        },
        redirectUrl
      )

      if (error) {
        console.error("Signup error:", error)
        throw error
      }

      // Show success message
      setIsSuccess(true)
      
      // Clear form
      setFormValues({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        username: "",
        termsAccepted: false,
      })
      
      // Redirect to confirmation page after a delay
      setTimeout(() => {
        router.push("/auth/confirmation?email=" + encodeURIComponent(formValues.email!))
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during signup"
      setGeneralError(errorMessage)
      
      // Check for specific error types
      if (errorMessage.includes("already registered")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered. Please login instead.",
        }))
      } else if (errorMessage.includes("username")) {
        setErrors((prev) => ({
          ...prev,
          username: "This username is already taken. Please choose another one.",
        }))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create your account to join the Avolve platform</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {generalError && (
            <Alert className="mb-4" variant="destructive">
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert className="mb-4">
              <AlertDescription>
                Your account has been created! Please check your email to confirm your account.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              {/* Hidden CSRF token field */}
              {csrfToken && <input type="hidden" name="csrf_token" value={csrfToken} />}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formValues.email || ""}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formValues.fullName || ""}
                  onChange={handleChange}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  required
                  value={formValues.username || ""}
                  onChange={handleChange}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formValues.password || ""}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formValues.confirmPassword || ""}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formValues.termsAccepted || false}
                  onCheckedChange={(checked) => {
                    setFormValues((prev) => ({
                      ...prev,
                      termsAccepted: checked === true,
                    }))
                    if (errors.termsAccepted) {
                      setErrors((prev) => ({
                        ...prev,
                        termsAccepted: undefined,
                      }))
                    }
                  }}
                />
                <label
                  htmlFor="termsAccepted"
                  className={cn(
                    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    errors.termsAccepted ? "text-red-500" : ""
                  )}
                >
                  I agree to the{" "}
                  <Link href="/terms" className="underline underline-offset-4">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-4">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted}</p>}
              
              <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
