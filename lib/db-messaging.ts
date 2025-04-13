import { createClient as createClientBrowser } from "@/lib/supabase/client"
import { PREDEFINED_GROUPS } from "@/lib/predefined-groups"

// Messaging-specific database functions
export const messagingDb = {
  // Get the Supabase client
  getSupabaseClient() {
    return createClientBrowser()
  },

  // Send a message
  async sendMessage({ chatId, userId, content, type = "text", mediaUrl = null }) {
    const supabase = this.getSupabaseClient()
    const { data, error } = await supabase
      .from("messages")
      .insert({
        chat_id: chatId,
        user_id: userId,
        content,
        type,
        media_url: mediaUrl,
      })
      .select()

    if (error) {
      console.error("Error sending message:", error)
      throw error
    }

    // Update the chat's last_message and last_activity
    await supabase
      .from("chats")
      .update({
        last_message: content || "Sent an attachment",
        last_activity: new Date().toISOString(),
      })
      .eq("id", chatId)

    // Clear typing indicator for this user
    await this.clearTypingIndicator(chatId, userId)

    return data[0]
  },

  // Get messages for a chat
  async getMessages(chatId, limit = 50, before = null) {
    const supabase = this.getSupabaseClient()

    let query = supabase
      .from("messages")
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt("created_at", before)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error getting messages:", error)
      return []
    }

    return data.reverse()
  },

  // Mark messages as read
  async markMessagesAsRead(chatId, userId, messageIds) {
    const supabase = this.getSupabaseClient()

    // Create receipts for each message
    const receipts = messageIds.map((messageId) => ({
      message_id: messageId,
      user_id: userId,
      read_at: new Date().toISOString(),
    }))

    // Use upsert to avoid duplicate receipts
    const { error } = await supabase.from("message_receipts").upsert(receipts, { onConflict: "message_id,user_id" })

    if (error) {
      console.error("Error marking messages as read:", error)
      throw error
    }

    return true
  },

  // Get read receipts for messages
  async getReadReceipts(messageIds) {
    const supabase = this.getSupabaseClient()

    const { data, error } = await supabase
      .from("message_receipts")
      .select(`
        message_id,
        read_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .in("message_id", messageIds)

    if (error) {
      console.error("Error getting read receipts:", error)
      return {}
    }

    // Group receipts by message_id
    const receiptsByMessage = {}
    data.forEach((receipt) => {
      if (!receiptsByMessage[receipt.message_id]) {
        receiptsByMessage[receipt.message_id] = []
      }
      receiptsByMessage[receipt.message_id].push({
        user: receipt.profiles,
        readAt: receipt.read_at,
      })
    })

    return receiptsByMessage
  },

  // Set typing indicator
  async setTypingIndicator(chatId, userId) {
    const supabase = this.getSupabaseClient()

    const { error } = await supabase.from("typing_indicators").upsert(
      {
        chat_id: chatId,
        user_id: userId,
        started_at: new Date().toISOString(),
      },
      { onConflict: "chat_id,user_id" },
    )

    if (error) {
      console.error("Error setting typing indicator:", error)
      // Don't throw error for typing indicators as they're not critical
    }
  },

  // Clear typing indicator
  async clearTypingIndicator(chatId, userId) {
    const supabase = this.getSupabaseClient()

    const { error } = await supabase.from("typing_indicators").delete().eq("chat_id", chatId).eq("user_id", userId)

    if (error) {
      console.error("Error clearing typing indicator:", error)
      // Don't throw error for typing indicators as they're not critical
    }
  },

  // Get typing indicators for a chat
  async getTypingIndicators(chatId, currentUserId) {
    const supabase = this.getSupabaseClient()

    // Get indicators that are less than 10 seconds old
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString()

    const { data, error } = await supabase
      .from("typing_indicators")
      .select(`
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("chat_id", chatId)
      .neq("user_id", currentUserId)
      .gt("started_at", tenSecondsAgo)

    if (error) {
      console.error("Error getting typing indicators:", error)
      return []
    }

    return data.map((item) => item.profiles)
  },

  // Create a direct chat
  async createDirectChat(userId, recipientId) {
    const supabase = this.getSupabaseClient()

    // Check if a chat already exists
    const existingChats = await this.getUserChats(userId)
    const existingChat = existingChats.find(
      (chat) => !chat.is_group && chat.participants.length === 1 && chat.participants[0].id === recipientId,
    )

    if (existingChat) {
      return existingChat
    }

    // Create a new chat
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .insert({
        created_by: userId,
        is_group: false,
      })
      .select()

    if (chatError) {
      console.error("Error creating chat:", chatError)
      throw chatError
    }

    const chatId = chatData[0].id

    // Add participants
    const participants = [
      { chat_id: chatId, user_id: userId },
      { chat_id: chatId, user_id: recipientId },
    ]

    const { error: participantError } = await supabase.from("chat_participants").insert(participants)

    if (participantError) {
      console.error("Error adding participants:", participantError)
      await supabase.from("chats").delete().eq("id", chatId)
      throw participantError
    }

    return chatData[0]
  },

  // Join a group chat
  async joinGroup(userId, groupId) {
    const supabase = this.getSupabaseClient()

    // Get group info
    const group = PREDEFINED_GROUPS.getGroupById(groupId)
    if (!group) {
      throw new Error("Invalid group ID")
    }

    // Check if the group chat exists
    const { data: existingGroup } = await supabase.from("chats").select("id").eq("group_id", groupId).single()

    let chatId

    if (!existingGroup) {
      // Create the group chat
      const { data: newGroup, error: createError } = await supabase
        .from("chats")
        .insert({
          created_by: userId,
          is_group: true,
          name: group.name,
          group_id: groupId,
        })
        .select()

      if (createError) {
        console.error("Error creating group chat:", createError)
        throw createError
      }

      chatId = newGroup[0].id
    } else {
      chatId = existingGroup.id
    }

    // Check if the user is already a participant
    const { data: participant } = await supabase
      .from("chat_participants")
      .select("id")
      .eq("chat_id", chatId)
      .eq("user_id", userId)
      .single()

    if (!participant) {
      // Add the user as a participant
      const { error: joinError } = await supabase.from("chat_participants").insert({
        chat_id: chatId,
        user_id: userId,
      })

      if (joinError) {
        console.error("Error joining group:", joinError)
        throw joinError
      }
    }

    return chatId
  },

  // Get user's chats
  async getUserChats(userId) {
    const supabase = this.getSupabaseClient()

    const { data, error } = await supabase
      .from("chat_participants")
      .select(`
        chat_id,
        chats:chat_id (
          id,
          name,
          is_group,
          group_id,
          last_message,
          last_activity,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("chats(last_activity)", { ascending: false })

    if (error) {
      console.error("Error getting user chats:", error)
      return []
    }

    // For each chat, get the other participants
    const chats = []
    for (const item of data) {
      const chat = item.chats

      // Get participants
      const { data: participantsData } = await supabase
        .from("chat_participants")
        .select(`
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("chat_id", chat.id)
        .neq("user_id", userId)

      const otherParticipants = participantsData?.map((p) => p.profiles) || []

      // For 1-on-1 chats, use the other person's name
      if (!chat.is_group && otherParticipants.length > 0) {
        chat.display_name = otherParticipants[0].full_name || otherParticipants[0].username
        chat.avatar_url = otherParticipants[0].avatar_url
      } else if (chat.group_id) {
        // For predefined groups, use the group name from our constants
        const group = PREDEFINED_GROUPS.getGroupById(chat.group_id)
        if (group) {
          chat.display_name = group.name
          chat.category = group.category
        } else {
          chat.display_name = chat.name || "Group Chat"
        }
      } else {
        chat.display_name = chat.name || "Group Chat"
      }

      // Get unread message count
      const { count: unreadCount, error: unreadError } = await supabase.rpc("get_unread_message_count", {
        p_chat_id: chat.id,
        p_user_id: userId,
      })

      if (!unreadError) {
        chat.unread_count = unreadCount
      }

      chat.participants = otherParticipants
      chats.push(chat)
    }

    return chats
  },

  // Get chat theme preference
  async getChatTheme(userId) {
    const supabase = this.getSupabaseClient()

    const { data, error } = await supabase.from("profiles").select("chat_theme").eq("id", userId).single()

    if (error) {
      console.error("Error getting chat theme:", error)
      return "default"
    }

    return data.chat_theme || "default"
  },

  // Update chat theme preference
  async updateChatTheme(userId, theme) {
    const supabase = this.getSupabaseClient()

    const { error } = await supabase.from("profiles").update({ chat_theme: theme }).eq("id", userId)

    if (error) {
      console.error("Error updating chat theme:", error)
      throw error
    }

    return true
  },
}

