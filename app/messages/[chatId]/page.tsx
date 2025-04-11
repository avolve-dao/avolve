'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ChatList } from "@/components/chat/chat-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MessagingThemeProvider } from "@/contexts/theme-context";
import { MessagingProvider } from "@/contexts/messaging-context";

// Define types for better type safety
type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
};

type ChatParticipant = {
  profiles: Profile;
};

type Chat = {
  id: string;
  name: string;
  is_group: boolean;
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;
  
  const [userId, setUserId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<Chat | null>(null);
  const [chatName, setChatName] = useState<string>('Chat');
  const [chatImage, setChatImage] = useState<string | undefined>(undefined);
  const [memberCount, setMemberCount] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  useEffect(() => {
    async function loadChatData() {
      // Check authentication
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData?.user) {
        router.push('/auth/login');
        return;
      }
      
      setUserId(userData.user.id);
      
      // Check if the user is a participant in this chat
      const { data: participantData, error: participantError } = await supabase
        .from("chat_participants")
        .select("*")
        .eq("chat_id", chatId)
        .eq("user_id", userData.user.id)
        .single();
      
      if (participantError || !participantData) {
        router.push('/messages');
        return;
      }
      
      // Get chat details
      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .single();
      
      if (chatError || !chat) {
        router.push('/messages');
        return;
      }
      
      setChatData(chat);
      
      // For 1-on-1 chats, get the other participant's details
      let name = chat.name;
      let image: string | undefined = undefined;
      
      if (!chat.is_group) {
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
          .eq("chat_id", chatId)
          .neq("user_id", userData.user.id)
          .single();
        
        if (otherParticipant && otherParticipant.profiles) {
          // Handle the profile data safely
          const profile = otherParticipant.profiles as unknown;
          // Check if it has the expected properties
          if (
            typeof profile === 'object' && 
            profile !== null && 
            'username' in profile
          ) {
            const typedProfile = profile as { 
              username: string; 
              full_name?: string; 
              avatar_url?: string 
            };
            
            name = typedProfile.full_name || typedProfile.username;
            image = typedProfile.avatar_url;
          }
        }
      }
      
      setChatName(name || 'Chat');
      setChatImage(image);
      
      // Get participant count for group chats
      if (chat.is_group) {
        const { count } = await supabase
          .from("chat_participants")
          .select("*", { count: "exact", head: true })
          .eq("chat_id", chatId);
        
        setMemberCount(count || undefined);
      }
      
      setIsLoading(false);
    }
    
    loadChatData();
  }, [chatId, router, supabase]);
  
  if (isLoading) {
    return (
      <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <MessagingThemeProvider>
      <MessagingProvider>
        <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl">
          <div className="grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            <div className="hidden md:block md:col-span-1">
              {userId && <ChatList userId={userId} activeChatId={chatId} />}
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-full">
              <ChatHeader
                chatName={chatName}
                chatImage={chatImage}
                isGroup={chatData?.is_group || false}
                memberCount={memberCount}
                onBackClick={() => {}}
                onViewInfo={() => {}}
              />
              {userId && <ChatMessages chatId={chatId} userId={userId} />}
              {userId && <ChatInput chatId={chatId} userId={userId} />}
            </div>
          </div>
        </div>
      </MessagingProvider>
    </MessagingThemeProvider>
  );
}
