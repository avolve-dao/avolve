import { CompactUserAgreement } from "@/components/compact-user-agreement"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AgreementPage() {
  // Check if user is authenticated
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to login if not authenticated
    redirect("/auth/login?callbackUrl=/agreement")
  }

  // Check if user has already agreed to terms
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_agreed_to_terms, has_genius_id")
    .eq("id", session.user.id)
    .single()

  // If user has already agreed to terms and has a Genius ID, redirect to dashboard
  if (profile?.has_agreed_to_terms && profile?.has_genius_id) {
    redirect("/dashboard")
  }

  // If user has agreed to terms but doesn't have a Genius ID, redirect to Genius ID creation
  if (profile?.has_agreed_to_terms) {
    redirect("/unlock/genius-id")
  }

  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-3xl font-bold text-center mb-2">The Supercivilization Compact</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Review and accept the principles that guide our journey from Degen to Regen thinking
      </p>

      <CompactUserAgreement />
    </div>
  )
}
