"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { cn } from "@/lib/utils"
import { getCriticalNavItems, isRouteActive } from "@/lib/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { 
  PlusCircle, 
  CheckSquare, 
  FileText, 
  FolderPlus, 
  UserPlus, 
  BarChart, 
  Timer, 
  Lightbulb, 
  BookOpen, 
  Search 
} from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showSearch, setShowSearch] = React.useState(false)
  
  // Only show critical navigation items in the top nav
  const navItems = getCriticalNavItems()

  // Extract the current context from the pathname
  const getContextFromPathname = () => {
    if (pathname.startsWith('/personal')) return { name: 'Personal Success', color: 'text-blue-500' };
    if (pathname.startsWith('/business')) return { name: 'Business Success', color: 'text-green-500' };
    if (pathname.startsWith('/supermind')) return { name: 'Supermind Powers', color: 'text-purple-500' };
    if (pathname.startsWith('/superachiever')) return { name: 'Superachiever', color: 'text-amber-500' };
    if (pathname.startsWith('/superachievers')) return { name: 'Superachievers', color: 'text-red-500' };
    if (pathname.startsWith('/supercivilization')) return { name: 'Supercivilization', color: 'text-cyan-500' };
    return { name: 'Dashboard', color: 'text-primary' };
  }

  const currentContext = getContextFromPathname();
  
  // Get context-specific actions based on the current path
  const getContextActions = () => {
    if (pathname.startsWith('/personal')) {
      return [
        { label: "New Goal", icon: PlusCircle, href: "/personal/goals/new" },
        { label: "Track Habit", icon: CheckSquare, href: "/personal/habits/track" },
        { label: "Journal Entry", icon: FileText, href: "/personal/journal/new" }
      ];
    }
    
    if (pathname.startsWith('/business')) {
      return [
        { label: "New Project", icon: FolderPlus, href: "/business/projects/new" },
        { label: "Add Team Member", icon: UserPlus, href: "/business/team/add" },
        { label: "Financial Report", icon: BarChart, href: "/business/finance/reports" }
      ];
    }
    
    if (pathname.startsWith('/supermind')) {
      return [
        { label: "Focus Session", icon: Timer, href: "/supermind/focus/new" },
        { label: "Idea Capture", icon: Lightbulb, href: "/supermind/creativity/capture" },
        { label: "Learning Note", icon: BookOpen, href: "/supermind/learning/note" }
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
    setShowSearch(false);
  };
  
  // Toggle search visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      // Focus the search input when it becomes visible
      setTimeout(() => {
        const searchInput = document.getElementById("global-search");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };
  
  // Handle keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // "/" key to focus search
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        toggleSearch();
      }
      
      // Escape key to close search
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  return (
    <div className="flex items-center w-full">
      <div className={`mr-4 text-sm font-semibold ${currentContext.color} hidden md:block`}>
        {currentContext.name}
      </div>
      
      <nav className="flex items-center space-x-4 lg:space-x-6">
        {navItems.map((item) => {
          const isActive = isRouteActive(pathname, item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">{item.title}</span>
              {item.badge && (
                <Badge className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>
      
      <div className="ml-auto flex items-center space-x-2">
        {/* Context-specific actions dropdown */}
        {hasContextActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Quick Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {contextActions.map((action) => (
                <DropdownMenuItem key={action.href} asChild>
                  <Link href={action.href} className="flex w-full cursor-pointer items-center">
                    <action.icon className="mr-2 h-4 w-4" />
                    <span>{action.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Global search */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSearch}
            className="relative"
            title="Search (Press / to focus)"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          
          {showSearch && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-md border bg-popover p-2 shadow-md">
              <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                <Input
                  id="global-search"
                  type="search"
                  placeholder={`Search in ${currentContext.name}...`}
                  className="h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="sm" variant="secondary">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </form>
              <div className="mt-2 text-xs text-muted-foreground">
                Press <kbd className="rounded border px-1 py-0.5 bg-muted">ESC</kbd> to close
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
