"use client"
import { Bell, Home, PanelLeft, MessageSquare, Search, Command } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

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

// Helper function to get gradient class based on pathname
const getGradientClass = (pathname: string) => {
  if (pathname.includes('/personal')) return 'from-amber-500 to-yellow-500';
  if (pathname.includes('/business')) return 'from-teal-500 to-cyan-500';
  if (pathname.includes('/supermind')) return 'from-violet-500 via-purple-500 to-fuchsia-500';
  if (pathname.includes('/superhuman')) return 'from-rose-500 via-red-500 to-orange-500';
  if (pathname.includes('/supersociety')) return 'from-lime-500 via-green-500 to-emerald-500';
  if (pathname.includes('/supergenius')) return 'from-sky-500 via-blue-500 to-indigo-500';
  if (pathname.includes('/superachiever')) return 'from-stone-500 to-stone-700';
  if (pathname.includes('/superachievers')) return 'from-slate-500 to-slate-700';
  if (pathname.includes('/supercivilization')) return 'from-zinc-500 to-zinc-700';
  return 'from-blue-500 to-blue-700'; // Default for dashboard
};

// Helper function to get section title based on pathname
const getSectionTitle = (pathname: string) => {
  if (pathname.includes('/personal')) return 'Personal Success';
  if (pathname.includes('/business')) return 'Business Success';
  if (pathname.includes('/supermind')) return 'Supermind Powers';
  if (pathname.includes('/superhuman')) return 'Superhuman';
  if (pathname.includes('/supersociety')) return 'Supersociety';
  if (pathname.includes('/supergenius')) return 'Supergenius';
  if (pathname.includes('/superachiever')) return 'Superachiever';
  if (pathname.includes('/superachievers')) return 'Superachievers';
  if (pathname.includes('/supercivilization')) return 'Supercivilization';
  return 'Dashboard'; // Default
};

export function AppNavbar() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const [gradientClass, setGradientClass] = useState(getGradientClass(pathname))
  const [sectionTitle, setSectionTitle] = useState(getSectionTitle(pathname))

  // Update gradient class and section title when pathname changes
  useEffect(() => {
    setGradientClass(getGradientClass(pathname))
    setSectionTitle(getSectionTitle(pathname))
  }, [pathname])

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between w-full apple-blur px-4 border-b border-zinc-200/50 dark:border-zinc-700/50">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 rounded-full apple-button">
          <PanelLeft className="h-4 w-4 apple-icon" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Section title with gradient */}
        <div className="hidden md:flex items-center">
          <h2 className={`text-sm font-medium bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>
            {sectionTitle}
          </h2>
        </div>

        <div className="relative hidden md:block ml-4">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 w-full rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 pl-8 md:w-64 shadow-none border-zinc-200/50 dark:border-zinc-700/50 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
          />
          <kbd className="pointer-events-none absolute right-2 top-2 h-5 select-none rounded border border-zinc-200 bg-zinc-100 px-1.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            <span className="text-xs">⌘</span>K
          </kbd>
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

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button relative">
          <Bell className="h-4 w-4 apple-icon" />
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
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
