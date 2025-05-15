import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GenTokenUnlockForm } from "@/components/gen-token-unlock-form"

export default async function GenTokenPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user has Genius ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_genius_id, has_gen_tokens")
    .eq("id", data.user.id)
    .single()

  // If user doesn't have Genius ID, redirect to that step
  if (!profile?.has_genius_id) {
    redirect("/unlock/genius-id")
  }

  // If user already has GEN tokens, redirect to next unlock step or dashboard
  if (profile?.has_gen_tokens) {
    redirect("/unlock/genie-ai")
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Unlock GEN Tokens</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        GEN Tokens are the currency of the Supercivilization, representing your regenerative potential. Demonstrate your
        understanding of Regen principles to earn your first tokens.
      </p>
      <GenTokenUnlockForm />
    </div>
  )
}
