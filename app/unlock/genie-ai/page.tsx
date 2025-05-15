import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GenieAiUnlockForm } from "@/components/genie-ai-unlock-form"

export default async function GenieAiPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user has Genius ID and GEN tokens
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_genius_id, has_gen_tokens, has_genie_ai")
    .eq("id", data.user.id)
    .single()

  // If user doesn't have Genius ID, redirect to that step
  if (!profile?.has_genius_id) {
    redirect("/unlock/genius-id")
  }

  // If user doesn't have GEN tokens, redirect to that step
  if (!profile?.has_gen_tokens) {
    redirect("/unlock/gen-token")
  }

  // If user already has Genie AI, redirect to dashboard
  if (profile?.has_genie_ai) {
    redirect("/dashboard")
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Unlock Genie AI</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Genie AI is your guide on the journey from Degen to Regen, powered by advanced AI to help you transform. Make
        your commitment to Regen principles and spend GEN tokens to unlock this powerful tool.
      </p>
      <GenieAiUnlockForm />
    </div>
  )
}
