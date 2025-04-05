"use client"
import { Bell, Home, PanelLeft, MessageSquare, Search } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/components/ui/sidebar"

export function AppNavbar() {
  const { toggleSidebar } = useSidebar()

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between apple-blur px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 rounded-full apple-button">
          <PanelLeft className="h-4 w-4 apple-icon" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 w-full rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 pl-8 md:w-64 shadow-none border-zinc-200/50 dark:border-zinc-700/50 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button md:hidden">
          <Search className="h-4 w-4 apple-icon" />
          <span className="sr-only">Search</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button">
          <Home className="h-4 w-4 apple-icon" />
          <span className="sr-only">Feed</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button">
          <MessageSquare className="h-4 w-4 apple-icon" />
          <span className="sr-only">Messages</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button">
          <Bell className="h-4 w-4 apple-icon" />
          <span className="sr-only">Notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button ml-1">
              <Avatar className="h-7 w-7 border border-zinc-200 dark:border-zinc-700">
                <AvatarImage src="/avatars/shadcn.jpg" alt="shadcn" />
                <AvatarFallback className="text-xs font-medium">CN</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 apple-card">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="rounded-lg apple-menu-item">Profile</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg apple-menu-item">Settings</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg apple-menu-item">Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuItem className="rounded-lg apple-menu-item">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

