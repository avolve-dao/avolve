"use client"

import * as React from "react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export function SignUpForm({
  className,
  csrfToken,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { csrfToken?: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [invitationCode, setInvitationCode] = useState("")
  const [invitationValid, setInvitationValid] = useState(false)
  const [invitationDetails, setInvitationDetails] = useState<any>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const codeParam = searchParams?.get("code")
  
  useEffect(() => {
    // Check for invitation code in URL or session storage
    const code = codeParam || sessionStorage.getItem('invitation_code') || ""
    setInvitationCode(code)
    
    if (code) {
      validateInvitationCode(code)
    }
  }, [codeParam])
  
  const validateInvitationCode = async (code: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('check_invitation_code', {
        p_code: code.trim().toUpperCase()
      })
      
      if (error) throw error
      
      if (data.valid) {
        setInvitationValid(true)
        setInvitationDetails(data)
      } else {
        setInvitationValid(false)
        setError(data.message || "Invalid invitation code")
      }
    } catch (error) {
      console.error("Error validating invitation code:", error)
      setInvitationValid(false)
      setError("Could not validate invitation code")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!invitationValid) {
      setError("A valid invitation code is required to sign up")
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Get the current origin with protocol, ensuring no double slashes
      const origin = window.location.origin
      // Make sure there's no trailing slash in the origin
      const cleanOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin

      // Use the full URL for the callback to ensure it works correctly
      const redirectUrl = `${cleanOrigin}/auth/callback?invitation_code=${invitationCode}`

      console.log("Using redirect URL:", redirectUrl)

      const { data, error: signInError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          captchaToken: csrfToken, // Using captchaToken field to pass CSRF token
          data: {
            full_name: email.split("@")[0],
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split("@")[0])}&background=random`,
            invitation_code: invitationCode
          },
        },
      })

      if (signInError) throw signInError

      console.log("Sign up response:", data)

      // Always redirect to sign-up-success page
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          {invitationValid ? (
            <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400">
              <AlertDescription className="flex items-center">
                <Badge variant="outline" className="mr-2 border-green-500 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                  Valid Invitation
                </Badge>
                You've been invited to join Avolve
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertDescription>
                A valid invitation code is required to sign up
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              {/* Hidden CSRF token field */}
              {csrfToken && <input type="hidden" name="csrf_token" value={csrfToken} />}

              <div className="grid gap-2">
                <Label htmlFor="invitation-code">Invitation Code</Label>
                <Input
                  id="invitation-code"
                  value={invitationCode}
                  onChange={(e) => {
                    setInvitationCode(e.target.value)
                    setInvitationValid(false)
                  }}
                  onBlur={() => invitationCode && validateInvitationCode(invitationCode)}
                  required
                  className={invitationValid ? "border-green-500" : ""}
                />
              </div>
              
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
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading || !invitationValid}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/sign-in" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
