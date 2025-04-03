"use client"

import type React from "react"
import { useState } from "react"
import { InboxSidebar } from "@/components/inbox-sidebar"
import { RealtimeChat } from "@/components/realtime-chat"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Video, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Page() {
  const [activeConversation, setActiveConversation] = useState<any>(null)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <InboxSidebar onSelectConversation={setActiveConversation} />
      <SidebarInset>
        {activeConversation ? (
          <>
            <header className="sticky top-0 flex shrink-0 items-center justify-between gap-2 border-b bg-background p-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={activeConversation.avatar} alt={activeConversation.name} />
                    <AvatarFallback>
                      {activeConversation.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-sm font-medium">{activeConversation.name}</h2>
                    {activeConversation.online && !activeConversation.isGroup ? (
                      <p className="text-xs text-green-500">Online</p>
                    ) : activeConversation.isGroup ? (
                      <p className="text-xs text-muted-foreground">{activeConversation.members} members</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Last seen recently</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <div className="flex h-[calc(100vh-64px)] flex-col">
              <RealtimeChat
                roomName={`chat-${activeConversation.id}`}
                username={activeConversation.isGroup ? "You" : "You"}
              />
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md space-y-4">
              <h2 className="text-2xl font-bold">Welcome to Chat</h2>
              <p className="text-muted-foreground">Select a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}

