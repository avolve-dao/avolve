"use client"

import type React from "react"

import { useState } from "react"
import { RealtimeChat } from "@/components/realtime-chat"
import { RealtimeAvatarStack } from "@/components/realtime-avatar-stack"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search } from "lucide-react"
import { UserSearch } from "@/components/user-search"

interface ChatRoomProps {
  username: string
  userId: string
}

export function ChatRoom({ username, userId }: ChatRoomProps) {
  const [roomName, setRoomName] = useState("general")
  const [customRoom, setCustomRoom] = useState("")

  const handleJoinCustomRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (customRoom.trim()) {
      setRoomName(customRoom.trim())
    }
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-64 flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Chat Rooms</CardTitle>
            <CardDescription>Select a room or create a new one</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Tabs defaultValue="public" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="public">Public</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value="public" className="space-y-2 pt-2">
                <Button
                  variant={roomName === "general" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setRoomName("general")}
                >
                  # General
                </Button>
                <Button
                  variant={roomName === "random" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setRoomName("random")}
                >
                  # Random
                </Button>
                <Button
                  variant={roomName === "support" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setRoomName("support")}
                >
                  # Support
                </Button>
              </TabsContent>
              <TabsContent value="custom" className="space-y-2 pt-2">
                <form onSubmit={handleJoinCustomRoom} className="flex gap-2">
                  <Input
                    placeholder="Enter room name"
                    value={customRoom}
                    onChange={(e) => setCustomRoom(e.target.value)}
                  />
                  <Button type="submit">Join</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Online Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RealtimeAvatarStack roomName={roomName} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-4 w-4" />
              Find Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserSearch currentUserId={userId} />
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col h-full">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-lg">#{roomName}</CardTitle>
          <CardDescription>Chat with other users in real-time</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <RealtimeChat roomName={roomName} username={username} userId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}
