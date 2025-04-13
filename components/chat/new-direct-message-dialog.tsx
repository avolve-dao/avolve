"use client"

import * as React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { clientDb } from "@/lib/db"
import { useRouter } from "next/navigation"

interface NewDirectMessageDialogProps {
  userId: string
  trigger?: React.ReactNode
}

export function NewDirectMessageDialog({ userId, trigger }: NewDirectMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [creating, setCreating] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        const data = await clientDb.getSuggestedUsers(userId, 20)
        setUsers(data)
      } catch (error) {
        console.error("Error loading users:", error)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      loadUsers()
    }
  }, [userId, open])

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStartChat = async (selectedUserId: string) => {
    try {
      setCreating(true)

      // Check if a chat already exists with this user
      const existingChats = await clientDb.getUserChats(userId)
      const existingChat = existingChats.find(
        (chat) => !chat.is_group && chat.participants.length === 1 && chat.participants[0].id === selectedUserId,
      )

      if (existingChat) {
        setOpen(false)
        router.push(`/messages/${existingChat.id}`)
        return
      }

      // Create a new chat
      const newChat = await clientDb.createChat(userId, [selectedUserId], false, null)

      setOpen(false)
      router.push(`/messages/${newChat.id}`)
    } catch (error) {
      console.error("Error creating chat:", error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>New Message</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => handleStartChat(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.full_name?.[0] || user.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.full_name || user.username}</p>
                    {user.username && user.full_name && (
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

