import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InviteForm } from "@/components/landing/invite-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome to Avolve
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your journey to becoming a Superachiever starts here
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Join the community of Superachievers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InviteForm />
            
            <div className="flex flex-col space-y-4">
              <Button asChild variant="outline">
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
