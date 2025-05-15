"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRealtimeChat } from "@/hooks/use-realtime-chat"
import { useUser } from "@/contexts/user-context"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import { LoadingSpinner } from "@/components/loading-spinner"
import { createClient } from "@/lib/supabase/client"
import { Paperclip, Send, ImageIcon, File, X } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"

interface RealtimeChatProps {
  roomName: string
  title?: string
  recipientId?: string
  showPresence?: boolean
}

export function RealtimeChat({ roomName, title = "Chat Room", recipientId, showPresence = false }: RealtimeChatProps) {
  const { user } = useUser()
  const [newMessage, setNewMessage] = useState("")
  const [isSendingFile, setIsSendingFile] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const { messages, sendMessage, isLoading, isSending } = useRealtimeChat({
    roomName,
    recipientId,
  })

  // Use the chat scroll hook
  useChatScroll({
    container: messagesEndRef,
    dependencies: [messages],
  })

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    await sendMessage(newMessage.trim())
    setNewMessage("")
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isImage = false) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]
    setIsSendingFile(true)
    setShowAttachMenu(false)

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = await supabase.storage.from("chat-attachments").getPublicUrl(filePath)

      // Send message with file attachment
      await sendMessage(isImage ? "📷 Image" : `📎 ${file.name}`, urlData.publicUrl, file.type)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsSendingFile(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  return (
    <Card className="w-full h-[calc(100vh-10rem)] md:h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4" ref={messagesEndRef}>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start the conversation by sending a message."
            className="h-full"
          />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${message.user.id === user?.id ? "justify-end" : "justify-start"}`}
              >
                {message.user.id !== user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{getInitials(message.user.name)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[85%] md:max-w-[70%] ${
                    message.user.id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.user.id !== user?.id && (
                    <div className="font-semibold text-xs mb-1">{message.user.name}</div>
                  )}
                  <div className="break-words">{message.content}</div>
                  {message.file_url && (
                    <div className="mt-2">
                      {message.file_type?.startsWith("image/") ? (
                        <img
                          src={message.file_url || "/placeholder.svg"}
                          alt="Shared image"
                          className="max-w-full rounded-md max-h-[200px] object-contain"
                        />
                      ) : (
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <File className="h-4 w-4" />
                          Download attachment
                        </a>
                      )}
                    </div>
                  )}
                  <div className="text-xs mt-1 opacity-70">{formatTimestamp(message.createdAt)}</div>
                </div>
                {message.user.id === user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>{getInitials(message.user.name)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2 relative">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending || isSendingFile || !user}
            className="pr-10"
          />

          <div className="absolute right-[4.5rem] top-1/2 -translate-y-1/2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={isSending || isSendingFile || !user}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {showAttachMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-background border rounded-lg shadow-lg p-2 flex flex-col gap-2 min-w-[150px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    imageInputRef.current?.click()
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    fileInputRef.current?.click()
                  }}
                >
                  <File className="h-4 w-4 mr-2" />
                  File
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start text-muted-foreground"
                  onClick={() => setShowAttachMenu(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, false)}
            className="hidden"
            accept="application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />

          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => handleFileUpload(e, true)}
            className="hidden"
            accept="image/*"
          />

          <Button
            type="submit"
            size="icon"
            disabled={isSending || isSendingFile || !newMessage.trim() || !user}
            className="rounded-full h-10 w-10 flex items-center justify-center"
          >
            {isSending ? <LoadingSpinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
