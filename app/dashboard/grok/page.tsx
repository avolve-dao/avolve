import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ImmersiveGrok } from "@/components/grok/immersive-grok"

export default async function GrokPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Grok AI Experience</h1>
          <p className="text-muted-foreground">Your personalized AI companion that understands your social context</p>
        </div>

        <ImmersiveGrok
          userId={userData.user.id}
          userName={profile?.full_name || userData.user.email?.split("@")[0] || "User"}
          userAvatar={profile?.avatar_url}
        />
      </div>
    </div>
  )
}

