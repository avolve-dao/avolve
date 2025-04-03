import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Video, MoreHorizontal } from "lucide-react"

interface ChatHeaderProps {
  conversation: {
    id: string
    name: string
    avatar: string
    online?: boolean
    isGroup?: boolean
    members?: number
  }
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
          <AvatarFallback>
            {conversation.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-sm font-medium">{conversation.name}</h2>
          {conversation.online && !conversation.isGroup ? (
            <p className="text-xs text-green-500">Online</p>
          ) : conversation.isGroup ? (
            <p className="text-xs text-muted-foreground">{conversation.members} members</p>
          ) : (
            <p className="text-xs text-muted-foreground">Last seen recently</p>
          )}
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
    </div>
  )
}

