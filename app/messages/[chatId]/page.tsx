import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ChatList } from "@/components/chat/chat-list"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { MessagingThemeProvider } from "@/contexts/theme-context"
import { MessagingProvider } from "@/contexts/messaging-context"

export default async function ChatPage({ params }: { params: { chatId: string } }) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Check if the user is a participant in this chat
  const { data: participantData, error: participantError } = await supabase
    .from("chat_participants")
    .select("*")
    .eq("chat_id", params.chatId)
    .eq("user_id", userData.user.id)
    .single()

  if (participantError || !participantData) {
    notFound()
  }

  // Get chat details
  const { data: chatData, error: chatError } = await supabase.from("chats").select("*").eq("id", params.chatId).single()

  if (chatError || !chatData) {
    notFound()
  }

  // For 1-on-1 chats, get the other participant's details
  let chatName = chatData.name
  let chatImage = null

  if (!chatData.is_group) {
    const { data: otherParticipant } = await supabase
      .from("chat_participants")
      .select(`
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("chat_id", params.chatId)
      .neq("user_id", userData.user.id)
      .single()

    if (otherParticipant?.profiles) {
      chatName = otherParticipant.profiles.full_name || otherParticipant.profiles.username
      chatImage = otherParticipant.profiles.avatar_url
    }
  }

  // Get participant count for group chats
  let memberCount = null
  if (chatData.is_group) {
    const { count } = await supabase
      .from("chat_participants")
      .select("*", { count: "exact", head: true })
      .eq("chat_id", params.chatId)

    memberCount = count
  }

  return (
    <MessagingThemeProvider>
      <MessagingProvider>
        <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl">
          <div className="grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            <div className="hidden md:block md:col-span-1">
              <ChatList userId={userData.user.id} activeChatId={params.chatId} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-full">
              <ChatHeader
                chatName={chatName || "Chat"}
                chatImage={chatImage}
                isGroup={chatData.is_group}
                memberCount={memberCount}
                onBackClick={() => {}}
                onViewInfo={() => {}}
              />
              <ChatMessages chatId={params.chatId} userId={userData.user.id} />
              <ChatInput chatId={params.chatId} userId={userData.user.id} />
            </div>
          </div>
        </div>
      </MessagingProvider>
    </MessagingThemeProvider>
  )
}

