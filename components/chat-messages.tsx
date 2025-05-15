import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/hooks/use-realtime-chat"
import { FileIcon } from "lucide-react"

interface ChatMessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  showHeader: boolean
}

export const ChatMessageItem = ({ message, isOwnMessage, showHeader }: ChatMessageItemProps) => {
  const hasFile = !!message.file_url
  const isImage = message.file_type?.startsWith("image/")

  return (
    <div className={`flex mt-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={cn("max-w-[75%] w-fit flex flex-col gap-1", {
          "items-end": isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn("flex items-center gap-2 text-xs px-3", {
              "justify-end flex-row-reverse": isOwnMessage,
            })}
          >
            <span className={"font-medium"}>{message.user.name}</span>
            <span className="text-foreground/50 text-xs">
              {new Date(message.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        )}
        <div
          className={cn(
            "py-2 px-3 rounded-xl text-sm w-fit",
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          )}
        >
          {message.content}

          {hasFile && (
            <div className="mt-2 border-t pt-2 border-primary-foreground/20">
              {isImage ? (
                <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={message.file_url || "/placeholder.svg"}
                    alt="Attached image"
                    className="max-h-40 rounded-md object-cover"
                  />
                </a>
              ) : (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs hover:underline"
                >
                  <FileIcon size={14} />
                  <span>Attached file</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
