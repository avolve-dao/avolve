"use client"

import React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Mail } from "lucide-react"

// Define the content type structure
type ConfirmationType = "signup" | "reset" | "email" | "success"

interface ConfirmationContent {
  title: string
  description: string
  message: string
  icon: React.ReactNode
  buttonText: string
  buttonLink: string
}

/**
 * Authentication Confirmation Page
 * 
 * This page is displayed after a user signs up or requests a password reset.
 * It provides information about the next steps and what to expect.
 */
export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || "your email"
  const type = (searchParams.get("type") || "signup") as ConfirmationType
  const action = searchParams.get("action")

  // Different content based on confirmation type
  const contentMap: Record<ConfirmationType, ConfirmationContent> = {
    signup: {
      title: "Check Your Email",
      description: "We've sent a confirmation link to your email",
      message: `We've sent a confirmation email to ${email}. Please check your inbox and click the link to activate your account. If you don't see the email, check your spam folder.`,
      icon: <Mail className="h-12 w-12 text-primary" />,
      buttonText: "Back to Login",
      buttonLink: "/auth/login",
    },
    reset: {
      title: "Password Reset Email Sent",
      description: "We've sent a password reset link to your email",
      message: `We've sent a password reset email to ${email}. Please check your inbox and click the link to reset your password. If you don't see the email, check your spam folder.`,
      icon: <Mail className="h-12 w-12 text-primary" />,
      buttonText: "Back to Login",
      buttonLink: "/auth/login",
    },
    email: {
      title: "Email Update Requested",
      description: "We've sent a confirmation link to your new email",
      message: `We've sent a confirmation email to your new email address. Please check your inbox and click the link to confirm your email change. Your email will not be updated until you confirm the change.`,
      icon: <Mail className="h-12 w-12 text-primary" />,
      buttonText: "Back to Profile",
      buttonLink: "/profile",
    },
    success: {
      title: "Success!",
      description: "Your action has been completed successfully",
      message: "Your request has been processed successfully. You can now proceed to use the platform.",
      icon: <CheckCircle2 className="h-12 w-12 text-primary" />,
      buttonText: "Continue",
      buttonLink: "/dashboard",
    },
  }

  // If we have an action parameter and we're on the success page, customize the message
  const content = {...contentMap[type]}
  
  if (type === "success" && action) {
    if (action === "signup") {
      content.title = "Account Activated!"
      content.description = "Your account has been successfully activated"
      content.message = "Your email has been verified and your account is now active. You can now log in and start using the platform."
    } else if (action === "reset") {
      content.title = "Password Reset Complete"
      content.description = "Your password has been successfully reset"
      content.message = "Your password has been reset successfully. You can now log in with your new password."
    } else if (action === "email") {
      content.title = "Email Updated"
      content.description = "Your email has been successfully updated"
      content.message = "Your email address has been updated successfully. You can now use your new email to log in."
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <CardTitle className="text-2xl">{content.title}</CardTitle>
          <CardDescription>
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            {content.message}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={content.buttonLink}>{content.buttonText}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
