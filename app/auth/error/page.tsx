import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Page({ searchParams }: { searchParams: { error?: string } }) {
  const errorMessage = searchParams?.error || "An unspecified error occurred"

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sorry, something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">Error: {errorMessage}</p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/auth/login">Return to Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/sign-up">Create an Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

