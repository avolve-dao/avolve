import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatList } from "@/components/chat/chat-list"

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl">
      <div className="grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-1">
          <ChatList userId={userData.user.id} />
        </div>
        <div className="hidden md:block md:col-span-2 lg:col-span-3">
          <div className="h-full flex items-center justify-center text-center p-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">Choose an existing conversation or start a new one</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

