import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface GrokMessageProps {
  message: ChatMessage
  isLoading?: boolean
}

export function GrokMessage({ message, isLoading }: GrokMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex items-start gap-4 py-4", isUser ? "justify-end" : "")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/grok-avatar.png" alt="Grok" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <Card
        className={cn(
          "px-4 py-3 max-w-[80%] md:max-w-[70%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className={cn("prose prose-sm dark:prose-invert", isLoading && "animate-pulse")}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </Card>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

