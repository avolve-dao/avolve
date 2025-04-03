import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { ChatList } from "@/components/chat/chat-list"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatInput } from "@/components/chat/chat-input"
import { PREDEFINED_GROUPS } from "@/lib/predefined-groups"
import { MessagingThemeProvider } from "@/contexts/theme-context"
import { MessagingProvider } from "@/contexts/messaging-context"

export default async function GroupChatPage({ params }: { params: { groupId: string } }) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Check if this is a valid predefined group
  const group = PREDEFINED_GROUPS.getGroupById(params.groupId)
  if (!group) {
    notFound()
  }

  // Get or create the group chat in the database
  const { data: existingGroup, error: groupError } = await supabase
    .from("chats")
    .select("*")
    .eq("group_id", params.groupId)
    .single()

  let chatId: string

  if (groupError || !existingGroup) {
    // Create the group chat if it doesn't exist
    const { data: newGroup, error: createError } = await supabase
      .from("chats")
      .insert({
        created_by: userData.user.id,
        is_group: true,
        name: group.name,
        group_id: params.groupId,
      })
      .select()
      .single()

    if (createError || !newGroup) {
      console.error("Error creating group chat:", createError)
      return <div>Error creating group chat</div>
    }

    chatId = newGroup.id

    // Add the current user as a participant
    await supabase.from("chat_participants").insert({
      chat_id: chatId,
      user_id: userData.user.id,
    })
  } else {
    chatId = existingGroup.id

    // Check if the user is already a participant
    const { data: participant, error: participantError } = await supabase
      .from("chat_participants")
      .select("*")
      .eq("chat_id", chatId)
      .eq("user_id", userData.user.id)
      .single()

    if (participantError || !participant) {
      // Add the user as a participant
      await supabase.from("chat_participants").insert({
        chat_id: chatId,
        user_id: userData.user.id,
      })
    }
  }

  // Get participant count
  const { count } = await supabase
    .from("chat_participants")
    .select("*", { count: "exact", head: true })
    .eq("chat_id", chatId)

  return (
    <MessagingThemeProvider>
      <MessagingProvider>
        <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl">
          <div className="grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            <div className="hidden md:block md:col-span-1">
              <ChatList userId={userData.user.id} activeChatId={`group-${params.groupId}`} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-full">
              <ChatHeader
                chatName={group.name}
                isGroup={true}
                memberCount={count || 1}
                onBackClick={() => {}}
                onViewInfo={() => {}}
              />
              <ChatMessages chatId={chatId} userId={userData.user.id} />
              <ChatInput chatId={chatId} userId={userData.user.id} />
            </div>
          </div>
        </div>
      </MessagingProvider>
    </MessagingThemeProvider>
  )
}

