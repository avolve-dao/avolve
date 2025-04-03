"use client"

import * as React from "react"
import { Users, Command, MessageCircle, UserRound, Settings, Phone } from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Chats",
      url: "#",
      icon: MessageCircle,
      isActive: true,
    },
    {
      title: "Groups",
      url: "#",
      icon: Users,
      isActive: false,
    },
    {
      title: "Contacts",
      url: "#",
      icon: UserRound,
      isActive: false,
    },
    {
      title: "Calls",
      url: "#",
      icon: Phone,
      isActive: false,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      isActive: false,
    },
  ],
  conversations: [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Are we still meeting tomorrow at the coffee shop?",
      timestamp: "09:34 AM",
      unread: 2,
      online: true,
    },
    {
      id: "2",
      name: "Design Team",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Alice: I've uploaded the new mockups to Figma",
      timestamp: "Yesterday",
      unread: 0,
      isGroup: true,
      members: 8,
    },
    {
      id: "3",
      name: "David Lee",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thanks for the help with the project!",
      timestamp: "2 days ago",
      unread: 0,
      online: false,
    },
    {
      id: "4",
      name: "Marketing",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "John: When is the next campaign starting?",
      timestamp: "2 days ago",
      unread: 5,
      isGroup: true,
      members: 12,
    },
    {
      id: "5",
      name: "Emily Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Can you send me the files we discussed?",
      timestamp: "1 week ago",
      unread: 0,
      online: true,
    },
    {
      id: "6",
      name: "Project Alpha",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Michael: The deadline has been extended to next Friday",
      timestamp: "1 week ago",
      unread: 0,
      isGroup: true,
      members: 5,
    },
    {
      id: "7",
      name: "James Martin",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "I'll be in the office tomorrow if you want to meet",
      timestamp: "1 week ago",
      unread: 0,
      online: false,
    },
    {
      id: "8",
      name: "Support Team",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Lisa: New ticket #1234 has been assigned to you",
      timestamp: "1 week ago",
      unread: 0,
      isGroup: true,
      members: 15,
    },
  ],
}

export function InboxSidebar({
  onSelectConversation,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onSelectConversation?: (conversation: any) => void
}) {
  // Note: I'm using state to show active item.
  // IRL you should use the url/router.
  const [activeItem, setActiveItem] = React.useState(data.navMain[0])
  const [conversations, setConversations] = React.useState(data.conversations)
  const [activeConversation, setActiveConversation] = React.useState<string | null>(null)
  const { setOpen } = useSidebar()

  const handleSelectConversation = (conversation: any) => {
    setActiveConversation(conversation.id)
    if (onSelectConversation) {
      onSelectConversation(conversation)
    }
  }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row" {...props}>
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar collapsible="none" className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Chat App</span>
                    <span className="truncate text-xs">Connected</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">{activeItem?.title}</div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unread only</span>
              <Switch className="shadow-none" />
            </Label>
          </div>
          <SidebarInput placeholder="Search conversations..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`flex w-full items-start gap-3 border-b p-4 text-left text-sm last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    activeConversation === conversation.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback>
                        {conversation.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && !conversation.isGroup && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                    )}
                    {conversation.isGroup && (
                      <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground ring-2 ring-white">
                        {conversation.members}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{conversation.name}</span>
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge variant="default" className="ml-auto rounded-full px-2 py-0.5">
                      {conversation.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}

