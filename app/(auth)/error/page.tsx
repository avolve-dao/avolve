'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const errorMessages: Record<string, string> = {
    default: "An error occurred during authentication",
    "invalid-email": "The email address is invalid",
    "user-not-found": "No user found with this email",
    "wrong-password": "Incorrect password",
    "email-not-verified": "Please verify your email address",
    "invalid-token": "Your session has expired, please sign in again",
  }

  const searchParams = useSearchParams()
  const error = searchParams.get('error') || "default"
  const message = errorMessages[error] || errorMessages.default

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button asChild variant="default">
            <Link href="/signin">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/reset-password">Reset Password</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/help">Get Help</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
