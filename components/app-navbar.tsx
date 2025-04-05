"use client"
import { Bell, Home, PanelLeft, MessageSquare, Search, PlusCircle } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"
import Link from "next/link"

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
import { getCriticalNavItems, isRouteActive } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function AppNavbar() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearch, setShowSearch] = React.useState(false)
  
  // Only show critical navigation items in the top nav
  const navItems = getCriticalNavItems()
  
  // Extract the current context from the pathname
  const getContextFromPathname = () => {
    if (pathname.startsWith('/personal')) return { name: 'Personal Success', color: 'text-amber-500' };
    if (pathname.startsWith('/business')) return { name: 'Business Success', color: 'text-teal-500' };
    if (pathname.startsWith('/supermind')) return { name: 'Supermind Powers', color: 'text-violet-500' };
    if (pathname.startsWith('/superachiever')) return { name: 'Superachiever', color: 'text-stone-500' };
    if (pathname.startsWith('/superachievers')) return { name: 'Superachievers', color: 'text-slate-500' };
    if (pathname.startsWith('/supercivilization')) return { name: 'Supercivilization', color: 'text-zinc-500' };
    return { name: 'Dashboard', color: 'text-primary' };
  }

  const currentContext = getContextFromPathname();
  
  // Get context-specific actions based on the current path
  const getContextActions = () => {
    if (pathname.startsWith('/personal')) {
      return [
        { label: "New Goal", icon: PlusCircle, href: "/personal/goals/new" },
        { label: "Track Habit", icon: Bell, href: "/personal/habits/track" },
        { label: "Journal Entry", icon: MessageSquare, href: "/personal/journal/new" }
      ];
    }
    
    if (pathname.startsWith('/business')) {
      return [
        { label: "New Project", icon: PlusCircle, href: "/business/projects/new" },
        { label: "Add Team Member", icon: Bell, href: "/business/team/add" },
        { label: "Financial Report", icon: MessageSquare, href: "/business/finance/reports" }
      ];
    }
    
    if (pathname.startsWith('/supermind')) {
      return [
        { label: "Focus Session", icon: PlusCircle, href: "/supermind/focus/new" },
        { label: "Idea Capture", icon: Bell, href: "/supermind/creativity/capture" },
        { label: "Learning Note", icon: MessageSquare, href: "/supermind/learning/note" }
      ];
    }
    
    return [];
  };
  
  const contextActions = getContextActions();
  const hasContextActions = contextActions.length > 0;
  
  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", searchQuery);
    
    // Clear search after submission
    setSearchQuery("");
  };
  
  // Handle keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command+K to focus search
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey) && !e.altKey) {
        e.preventDefault();
        const searchInput = document.getElementById("global-search");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between apple-blur px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 rounded-full apple-button">
          <PanelLeft className="h-4 w-4 apple-icon" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
          <form onSubmit={handleSearchSubmit}>
            <Input
              id="global-search"
              type="search"
              placeholder="Search..."
              className="h-8 w-full rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 pl-8 md:w-64 shadow-none border-zinc-200/50 dark:border-zinc-700/50 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button md:hidden">
          <Search className="h-4 w-4 apple-icon" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Navigation icons from critical nav items */}
        {navItems.map((item) => {
          const isActive = isRouteActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Button 
              key={item.href} 
              variant="ghost" 
              size="icon" 
              asChild
              className={cn(
                "h-8 w-8 rounded-full apple-button",
                isActive ? "bg-zinc-200/80 dark:bg-zinc-800/80" : ""
              )}
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4 apple-icon" />
                <span className="sr-only">{item.title}</span>
              </Link>
            </Button>
          )
        })}

        {/* Context-specific actions dropdown */}
        {hasContextActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full apple-button">
                <PlusCircle className="h-4 w-4 apple-icon" />
                <span className="sr-only">Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 apple-card">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {currentContext.name} Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
              <DropdownMenuGroup>
                {contextActions.map((action) => (
                  <DropdownMenuItem key={action.href} asChild className="rounded-lg apple-menu-item">
                    <Link href={action.href} className="flex w-full cursor-pointer items-center">
                      <action.icon className="mr-2 h-4 w-4" />
                      <span>{action.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

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
              <DropdownMenuItem className="rounded-lg apple-menu-item" asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg apple-menu-item" asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg apple-menu-item" asChild>
                <Link href="/billing">Billing</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuItem className="rounded-lg apple-menu-item" asChild>
              <Link href="/auth/logout">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
