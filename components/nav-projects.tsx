"use client"

import { Folder, Forward, MoreHorizontal, Trash2, type LucideIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-2">
      <SidebarGroupLabel className="text-xs font-medium text-zinc-500 dark:text-zinc-400 px-3 py-1.5">
        Projects
      </SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              className="rounded-lg transition-all duration-200 ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <a href={item.url}>
                <item.icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-sm font-medium">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700">
                  <MoreHorizontal className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-xl p-1 apple-card"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem className="rounded-lg apple-menu-item">
                  <Folder className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-sm">View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg apple-menu-item">
                  <Forward className="mr-2 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-sm">Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
                <DropdownMenuItem className="rounded-lg apple-menu-item text-red-500 dark:text-red-400">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="text-sm">Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="rounded-lg text-zinc-500 dark:text-zinc-400 transition-all duration-200 ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <MoreHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

