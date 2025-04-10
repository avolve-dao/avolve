"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/page-container"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatList } from "@/components/chat/chat-list"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function PersonalChatPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <PageContainer title="Personal Chat" subtitle="Connect with other Superachievers">
        <div className="flex h-[600px]">
          <Card className="w-1/3 h-full animate-pulse bg-muted"></Card>
          <Card className="w-2/3 h-full ml-4 animate-pulse bg-muted"></Card>
        </div>
      </PageContainer>
    )
  }

  if (!userId) {
    return (
      <PageContainer title="Personal Chat" subtitle="Connect with other Superachievers">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
          <p className="text-muted-foreground">Please sign in to access the chat feature.</p>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Personal Chat" subtitle="Connect with other Superachievers">
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="direct">Direct Messages</TabsTrigger>
          <TabsTrigger value="groups">Group Chats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="direct" className="w-full">
          <div className="flex h-[600px] gap-4">
            <div className="w-1/3 h-full overflow-hidden rounded-lg border">
              {userId && <ChatList userId={userId} activeChatId={activeChatId || undefined} />}
            </div>
            <div className="w-2/3 h-full">
              <ChatInterface chatId={activeChatId || undefined} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="groups" className="w-full">
          <div className="flex h-[600px] gap-4">
            <div className="w-1/3 h-full overflow-hidden rounded-lg border">
              {userId && <ChatList userId={userId} activeChatId={activeChatId || undefined} />}
            </div>
            <div className="w-2/3 h-full">
              <ChatInterface chatId={activeChatId || undefined} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
