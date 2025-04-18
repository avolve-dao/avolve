"use client"

import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { MessageSquare, Heart, UserPlus, Send, FileEdit, Users, LogIn, Smile, PenSquare } from "lucide-react"
import type { ActivityAction } from "@/lib/activity-logger"

interface ActivityItemProps {
  activity: {
    id: string
    user_id: string
    user_name: string
    user_avatar: string | null
    action_type: ActivityAction
    entity_type: string
    entity_id: string
    metadata: {
      [key: string]: string | number | boolean | null | undefined
    }
    created_at: string
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  // Format the activity message based on action type
  const getActivityMessage = () => {
    switch (activity.action_type) {
      case "post_create":
        return "created a new post"
      case "post_like":
        return "liked a post"
      case "post_comment":
        return "commented on a post"
      case "message_send":
        return "sent a message"
      case "reaction_add":
        return `reacted with ${activity.metadata.emoji || ""}`
      case "user_follow":
        return `followed ${activity.metadata.target_name || ""}`
      case "user_join":
        return "joined the platform"
      case "group_join":
        return `joined ${activity.metadata.group_name || ""}`
      case "profile_update":
        return "updated their profile"
      default:
        return "performed an action"
    }
  }

  // Get the appropriate icon for the activity
  const getActivityIcon = () => {
    switch (activity.action_type) {
      case "post_create":
        return <PenSquare className="h-4 w-4" />
      case "post_like":
        return <Heart className="h-4 w-4" />
      case "post_comment":
        return <MessageSquare className="h-4 w-4" />
      case "message_send":
        return <Send className="h-4 w-4" />
      case "reaction_add":
        return <Smile className="h-4 w-4" />
      case "user_follow":
        return <UserPlus className="h-4 w-4" />
      case "user_join":
        return <LogIn className="h-4 w-4" />
      case "group_join":
        return <Users className="h-4 w-4" />
      case "profile_update":
        return <FileEdit className="h-4 w-4" />
      default:
        return null
    }
  }

  // Get the link to the entity
  const getEntityLink = () => {
    switch (activity.entity_type) {
      case "post":
        return `/dashboard/post/${activity.entity_id}`
      case "user":
        return `/dashboard/profile/${activity.entity_id}`
      case "message":
        return `/messages/${activity.metadata.chat_id || ""}`
      case "group":
        return `/messages/group/${activity.entity_id}`
      default:
        return "#"
    }
  }

  const timeAgo = formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })

  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={activity.user_avatar || undefined} />
          <AvatarFallback>{activity.user_name?.[0] || ""}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Link href={`/dashboard/profile/${activity.user_id}`} className="font-medium hover:underline">
              {activity.user_name}
            </Link>
            <span className="text-muted-foreground">{getActivityMessage()}</span>
            {getActivityIcon()}
          </div>

          {activity.metadata.content && (
            <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{activity.metadata.content}</div>
          )}

          <div className="mt-1 flex items-center gap-2">
            <Link href={getEntityLink()} className="text-xs text-primary hover:underline">
              View
            </Link>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
