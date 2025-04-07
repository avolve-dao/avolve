import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import GrokClientPage from "./page.client"

export const dynamic = 'force-dynamic';

export default async function GrokPage() {
  const supabase = createClient();
  
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  return (
    <GrokClientPage 
      userId={userData.user.id}
      userName={profile?.full_name || userData.user.email?.split("@")[0] || "User"}
      userAvatar={profile?.avatar_url}
    />
  )
}
