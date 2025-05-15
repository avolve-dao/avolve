import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { CardContainer } from "@/components/card-container"
import { LoadingSpinner } from "@/components/loading-spinner"
import { GenieAI } from "@/components/genie-ai"
import { GenieAIChat } from "@/components/genie-ai-chat"

export default async function GenieAIPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile data to check unlocks and token balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_genius_id, has_gen_tokens, has_genie_ai, gen_tokens, full_name")
    .eq("id", data.user.id)
    .single()

  if (!profile) {
    redirect("/dashboard")
  }

  const hasGeniusId = profile.has_genius_id || false
  const hasGenTokens = profile.has_gen_tokens || false
  const hasGenieAi = profile.has_genie_ai || false
  const genTokens = profile.gen_tokens || 0
  const userName = profile.full_name || data.user.user_metadata?.full_name || "User"

  // Check if all components are unlocked
  const allUnlocked = hasGeniusId && hasGenTokens && hasGenieAi

  // Determine which component to unlock next
  let nextUnlockPath = ""
  let nextUnlockName = ""

  if (!hasGeniusId) {
    nextUnlockPath = "/unlock/genius-id"
    nextUnlockName = "Genius ID"
  } else if (!hasGenTokens) {
    nextUnlockPath = "/unlock/gen-token"
    nextUnlockName = "GEN Tokens"
  } else if (!hasGenieAi) {
    nextUnlockPath = "/unlock/genie-ai"
    nextUnlockName = "Genie AI"
  }

  // Check if user has enough tokens
  const hasEnoughTokens = genTokens >= 5

  if (!allUnlocked) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-2">Genie AI</h1>
        <p className="text-muted-foreground mb-6">Your guide on the journey from Degen to Regen thinking</p>

        <Card>
          <CardHeader>
            <CardTitle>Unlock Genie AI</CardTitle>
            <CardDescription>
              Complete all three steps to unlock Genie AI and begin your transformation journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {hasGeniusId ? (
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${hasGeniusId ? "text-green-600 dark:text-green-400" : ""}`}>
                    Step 1: Create Genius ID
                  </p>
                  <p className="text-sm text-muted-foreground">Your unique identifier in the Supercivilization</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {hasGenTokens ? (
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${hasGenTokens ? "text-green-600 dark:text-green-400" : ""}`}>
                    Step 2: Unlock GEN Tokens
                  </p>
                  <p className="text-sm text-muted-foreground">The currency of the Supercivilization</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {hasGenieAi ? (
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${hasGenieAi ? "text-green-600 dark:text-green-400" : ""}`}>
                    Step 3: Unlock Genie AI
                  </p>
                  <p className="text-sm text-muted-foreground">Your guide on the journey from Degen to Regen</p>
                </div>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href={nextUnlockPath}>
                {nextUnlockName ? `Unlock ${nextUnlockName} Next` : "Return to Dashboard"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Genie AI" description="Your personal AI assistant" />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <CardContainer title="About Genie AI">
            <Suspense fallback={<LoadingSpinner />}>
              <GenieAI />
            </Suspense>
          </CardContainer>
        </div>

        <div className="md:col-span-2">
          <CardContainer title="Chat with Genie AI" className="h-[600px]">
            <Suspense fallback={<LoadingSpinner />}>
              <GenieAIChat />
            </Suspense>
          </CardContainer>
        </div>
      </div>
    </div>
  )
}
