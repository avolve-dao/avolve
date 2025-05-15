import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GeniusIdUnlockForm } from "@/components/genius-id-unlock-form"

export default async function GeniusIdPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user already has Genius ID
  const { data: profile } = await supabase.from("profiles").select("has_genius_id").eq("id", data.user.id).single()

  // If user already has Genius ID, redirect to next unlock step or dashboard
  if (profile?.has_genius_id) {
    const { data: nextStep } = await supabase.from("profiles").select("has_gen_tokens").eq("id", data.user.id).single()

    if (nextStep?.has_gen_tokens) {
      redirect("/unlock/genie-ai")
    } else {
      redirect("/unlock/gen-token")
    }
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Create Your Genius ID</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Your Genius ID is your unique identifier in the Supercivilization. It represents your commitment to Regen
        thinking and unlocks your journey.
      </p>
      <GeniusIdUnlockForm />
    </div>
  )
}
