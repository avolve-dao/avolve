'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { ChatList } from "@/components/chat/chat-list";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { PREDEFINED_GROUPS } from "@/lib/predefined-groups";
import { MessagingThemeProvider } from "@/contexts/theme-context";
import { MessagingProvider } from "@/contexts/messaging-context";

// Define types for better type safety
type Group = {
  id: string;
  name: string;
};

type Chat = {
  id: string;
  name: string;
  is_group: boolean;
  group_id: string;
};

export default function GroupChatPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  
  const [userId, setUserId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [memberCount, setMemberCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  useEffect(() => {
    async function loadGroupData() {
      try {
        // Check authentication
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData?.user) {
          router.push('/auth/login');
          return;
        }
        
        setUserId(userData.user.id);
        
        // Check if this is a valid predefined group
        const predefinedGroup = PREDEFINED_GROUPS.getGroupById(groupId);
        if (!predefinedGroup) {
          router.push('/messages');
          return;
        }
        
        setGroup(predefinedGroup);
        
        // Get or create the group chat in the database
        const { data: existingGroup, error: groupError } = await supabase
          .from("chats")
          .select("*")
          .eq("group_id", groupId)
          .single();
        
        let chatIdValue: string;
        
        if (groupError || !existingGroup) {
          // Create the group chat if it doesn't exist
          const { data: newGroup, error: createError } = await supabase
            .from("chats")
            .insert({
              created_by: userData.user.id,
              is_group: true,
              name: predefinedGroup.name,
              group_id: groupId,
            })
            .select()
            .single();
          
          if (createError || !newGroup) {
            console.error("Error creating group chat:", createError);
            setError("Error creating group chat");
            setIsLoading(false);
            return;
          }
          
          chatIdValue = newGroup.id;
          
          // Add the current user as a participant
          await supabase.from("chat_participants").insert({
            chat_id: chatIdValue,
            user_id: userData.user.id,
          });
        } else {
          chatIdValue = existingGroup.id;
          
          // Check if the user is already a participant
          const { data: participant, error: participantError } = await supabase
            .from("chat_participants")
            .select("*")
            .eq("chat_id", chatIdValue)
            .eq("user_id", userData.user.id)
            .single();
          
          if (participantError || !participant) {
            // Add the user as a participant
            await supabase.from("chat_participants").insert({
              chat_id: chatIdValue,
              user_id: userData.user.id,
            });
          }
        }
        
        setChatId(chatIdValue);
        
        // Get participant count
        const { count } = await supabase
          .from("chat_participants")
          .select("*", { count: "exact", head: true })
          .eq("chat_id", chatIdValue);
        
        setMemberCount(count || 1);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading group data:", err);
        setError("An unexpected error occurred");
        setIsLoading(false);
      }
    }
    
    loadGroupData();
  }, [groupId, router, supabase]);
  
  if (isLoading) {
    return (
      <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
  
  if (!group || !chatId || !userId) {
    return (
      <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl flex justify-center items-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Group not found
        </div>
      </div>
    );
  }
  
  return (
    <MessagingThemeProvider>
      <MessagingProvider>
        <div className="container h-[calc(100vh-4rem)] p-0 max-w-6xl">
          <div className="grid h-full grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            <div className="hidden md:block md:col-span-1">
              <ChatList userId={userId} activeChatId={`group-${groupId}`} />
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col h-full">
              <ChatHeader
                chatName={group.name}
                isGroup={true}
                memberCount={memberCount}
                onBackClick={() => {}}
                onViewInfo={() => {}}
              />
              <ChatMessages chatId={chatId} userId={userId} />
              <ChatInput chatId={chatId} userId={userId} />
            </div>
          </div>
        </div>
      </MessagingProvider>
    </MessagingThemeProvider>
  );
}
