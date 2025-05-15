import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DirectMessage } from "@/components/direct-message"

export default async function DirectMessagePage({
  params,
}: {
  params: { userId: string }
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user metadata
  const { data: userData } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).single()

  const username = userData?.full_name || data.user.user_metadata?.full_name || "Anonymous"

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Direct Messages</h1>
      <div className="h-[calc(100vh-200px)]">
        <DirectMessage currentUserId={data.user.id} currentUserName={username} recipientId={params.userId} />
      </div>
    </div>
  )
}
