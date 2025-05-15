import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatRoom } from "@/components/chat-room"
import { ResponsiveContainer } from "@/components/layout/responsive-container"
import { PageHeader } from "@/components/page-header"

export const dynamic = "force-dynamic"

export default async function ChatPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user metadata
  const { data: userData } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", data.user.id)
    .single()

  const username = userData?.full_name || data.user.user_metadata?.full_name || "Anonymous"

  return (
    <ResponsiveContainer className="py-6">
      <PageHeader
        title="Chat Rooms"
        description="Connect with other members of the Supercivilization"
        className="mb-6"
      />

      <div className="h-[calc(100vh-200px)] border rounded-lg overflow-hidden">
        <ChatRoom username={username} userId={data.user.id} />
      </div>
    </ResponsiveContainer>
  )
}
