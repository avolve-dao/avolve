"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown } from "lucide-react"
import Image from "next/image"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

// Define all routes with their icons
const allRoutes = [
  {
    id: "superachiever",
    name: "superachiever",
    icon: "/icons/icon-superachiever.svg",
    href: "/superachiever",
    category: "main",
  },
  {
    id: "personal",
    name: "personal",
    icon: "/icons/icon-personal-success-puzzle.svg",
    href: "/personal",
    category: "superachiever",
  },
  {
    id: "business",
    name: "business",
    icon: "/icons/icon-business-success-puzzle.svg",
    href: "/business",
    category: "superachiever",
  },
  {
    id: "supermind",
    name: "supermind",
    icon: "/icons/icon-supermind-superpowers.svg",
    href: "/supermind",
    category: "superachiever",
  },
  {
    id: "superachievers",
    name: "superachievers",
    icon: "/icons/icon-superachievers.svg",
    href: "/superachievers",
    category: "main",
  },
  {
    id: "superpuzzle",
    name: "superpuzzle",
    icon: "/icons/icon-superpuzzle-developments.svg",
    href: "/superpuzzle",
    category: "superachievers",
  },
  {
    id: "superhuman",
    name: "superhuman",
    icon: "/icons/icon-superhuman-enhancements.svg",
    href: "/superhuman",
    category: "superachievers",
  },
  {
    id: "supersociety",
    name: "supersociety",
    icon: "/icons/icon-supersociety-advancements.svg",
    href: "/supersociety",
    category: "superachievers",
  },
  {
    id: "supergenius",
    name: "supergenius",
    icon: "/icons/icon-supergenius-breakthroughs.svg",
    href: "/supergenius",
    category: "superachievers",
  },
  {
    id: "supercivilization",
    name: "supercivilization",
    icon: "/icons/icon-supercivilization.svg",
    href: "/supercivilization",
    category: "main",
  },
]

export function TeamSwitcher({
  activeTeamId = "superachiever",
  onTeamChange,
}: {
  activeTeamId?: string
  onTeamChange?: (teamId: string) => void
}) {
  const router = useRouter()
  const [activeTeam, setActiveTeam] = React.useState<(typeof allRoutes)[0] | undefined>(
    allRoutes.find((route) => route.id === activeTeamId) || allRoutes[0],
  )

  // Initialize isMobile with a default value
  const sidebarContext = useSidebar()
  const [isMobile, setIsMobile] = React.useState(sidebarContext.isMobile)

  // Update isMobile state after the first render to avoid SSR issues
  React.useEffect(() => {
    setIsMobile(sidebarContext.isMobile)
  }, [sidebarContext.isMobile])

  React.useEffect(() => {
    // Update active team when activeTeamId changes
    const team = allRoutes.find((route) => route.id === activeTeamId)
    if (team) {
      setActiveTeam(team)
    }
  }, [activeTeamId])

  if (!activeTeam) {
    return null
  }

  const handleTeamChange = (team: (typeof allRoutes)[0]) => {
    setActiveTeam(team)
    router.push(team.href)
    if (onTeamChange) {
      onTeamChange(team.id)
    }
  }

  // Get the category display name
  const getCategoryDisplay = () => {
    if (activeTeam.category === "main") return "Main"
    if (activeTeam.category === "superachiever") return "Superachiever"
    if (activeTeam.category === "superachievers") return "Superachievers"
    return activeTeam.category.charAt(0).toUpperCase() + activeTeam.category.slice(1)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center overflow-hidden">
                <Image
                  src={activeTeam.icon || "/placeholder.svg"}
                  alt={activeTeam.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTeam.name}</span>
                {activeTeam.category !== "main" && (
                  <span className="truncate text-xs">{getCategoryDisplay()} Area</span>
                )}
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">Avolve from Degen to Regen</DropdownMenuLabel>
            {allRoutes
              .filter((route) => route.category === "main")
              .map((route, index) => {
                const isActive = route.id === activeTeam.id;
                return (
                  <DropdownMenuItem 
                    key={route.id} 
                    onClick={() => handleTeamChange(route)} 
                    className={`gap-2 p-2 ${isActive ? "bg-accent text-accent-foreground" : ""}`}
                  >
                    <div className="h-6 w-6 rounded-sm border flex items-center justify-center overflow-hidden">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    {route.name}
                    {isActive && <span className="ml-auto text-xs">Active</span>}
                    {!isActive && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
                  </DropdownMenuItem>
                );
              })}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Create Your Success Puzzle</DropdownMenuLabel>
            {allRoutes
              .filter((route) => route.category === "superachiever")
              .map((route) => {
                const isActive = route.id === activeTeam.id;
                return (
                  <DropdownMenuItem 
                    key={route.id} 
                    onClick={() => handleTeamChange(route)} 
                    className={`gap-2 p-2 ${isActive ? "bg-accent text-accent-foreground" : ""}`}
                  >
                    <div className="h-6 w-6 rounded-sm border flex items-center justify-center overflow-hidden">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    {route.name}
                    {isActive && <span className="ml-auto text-xs">Active</span>}
                  </DropdownMenuItem>
                );
              })}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Co-Create Our Superpuzzle</DropdownMenuLabel>
            {allRoutes
              .filter((route) => route.category === "superachievers")
              .map((route) => {
                const isActive = route.id === activeTeam.id;
                return (
                  <DropdownMenuItem 
                    key={route.id} 
                    onClick={() => handleTeamChange(route)} 
                    className={`gap-2 p-2 ${isActive ? "bg-accent text-accent-foreground" : ""}`}
                  >
                    <div className="h-6 w-6 rounded-sm border flex items-center justify-center overflow-hidden">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    {route.name}
                    {isActive && <span className="ml-auto text-xs">Active</span>}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
