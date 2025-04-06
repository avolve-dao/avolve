"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronsUpDown, Plus } from "lucide-react"
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
    name: "Superachiever",
    icon: "/icons/icon-superachiever.svg",
    href: "/superachiever",
    category: "main",
  },
  {
    id: "personal",
    name: "Personal",
    icon: "/icons/icon-personal-success-puzzle.svg",
    href: "/personal",
    category: "superachiever",
  },
  {
    id: "business",
    name: "Business",
    icon: "/icons/icon-business-success-puzzle.svg",
    href: "/business",
    category: "superachiever",
  },
  {
    id: "supermind",
    name: "Supermind",
    icon: "/icons/icon-supermind-superpowers.svg",
    href: "/supermind",
    category: "superachiever",
  },
  {
    id: "superachievers",
    name: "Superachievers",
    icon: "/icons/icon-superachievers.svg",
    href: "/superachievers",
    category: "main",
  },
  {
    id: "superpuzzle",
    name: "Superpuzzle",
    icon: "/icons/icon-superpuzzle-developments.svg",
    href: "/superpuzzle",
    category: "superachievers",
  },
  {
    id: "superhuman",
    name: "Superhuman",
    icon: "/icons/icon-superhuman-enhancements.svg",
    href: "/superhuman",
    category: "superachievers",
  },
  {
    id: "supersociety",
    name: "Supersociety",
    icon: "/icons/icon-supersociety-advancements.svg",
    href: "/supersociety",
    category: "superachievers",
  },
  {
    id: "supergenius",
    name: "Supergenius",
    icon: "/icons/icon-supergenius-breakthroughs.svg",
    href: "/supergenius",
    category: "superachievers",
  },
  {
    id: "supercivilization",
    name: "Supercivilization",
    icon: "/icons/icon-supercivilization.svg",
    href: "/supercivilization",
    category: "main",
  },
]

export function NavSwitcher({
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

  // Get sidebar context to check if sidebar is collapsed
  const { isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Use useEffect for team updates
  React.useEffect(() => {
    // Update active team when activeTeamId changes
    const team = allRoutes.find((route) => route.id === activeTeamId)
    if (team) {
      setActiveTeam(team)
    }
  }, [activeTeamId]) // Run when activeTeamId changes

  if (!activeTeam) {
    return null
  }

  const handleTeamChange = (team: (typeof allRoutes)[0]) => {
    setActiveTeam(team)
    // First call onTeamChange to update the sidebar state
    if (onTeamChange) {
      onTeamChange(team.id)
    }
    // Then navigate to the new route
    setTimeout(() => {
      router.push(team.href)
    }, 10)
  }

  // Get gradient color class based on team id
  const getGradientClass = () => {
    switch (activeTeam.id) {
      case "personal":
        return "bg-gradient-to-r from-amber-500 to-yellow-500";
      case "business":
        return "bg-gradient-to-r from-teal-500 to-cyan-500";
      case "supermind":
        return "bg-gradient-to-r from-violet-500 to-fuchsia-500";
      case "superachiever":
        return "bg-gradient-to-r from-stone-500 to-stone-700";
      case "superachievers":
        return "bg-gradient-to-r from-slate-500 to-slate-700";
      case "superhuman":
        return "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500";
      case "supersociety":
        return "bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500";
      case "supergenius":
        return "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500";
      case "supercivilization":
        return "bg-gradient-to-r from-zinc-500 to-zinc-700";
      default:
        return "bg-gradient-to-r from-blue-500 to-blue-700";
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="rounded-lg transition-all duration-200 ease-out data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800"
            >
              <div className="flex size-8 items-center justify-center">
                <Image
                  src={activeTeam.icon || "/placeholder.svg"}
                  alt={activeTeam.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left">
                    <span className="truncate font-medium text-sm">{activeTeam.name}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1 apple-card"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Avolve from Degen to Regen
            </DropdownMenuLabel>
            {allRoutes
              .filter((route) => route.category === "main")
              .map((route, index) => {
                const isActive = route.id === activeTeam.id;
                return (
                  <DropdownMenuItem 
                    key={route.id} 
                    onClick={() => handleTeamChange(route)} 
                    className="gap-2 p-2 rounded-lg apple-menu-item"
                  >
                    <div className="flex size-6 items-center justify-center">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm">{route.name}</span>
                    {isActive ? (
                      <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">Active</span>
                    ) : (
                      <DropdownMenuShortcut className="text-xs text-zinc-500 dark:text-zinc-400">
                        ⌘{index + 1}
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                );
              })}

            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Create Your Success Puzzle
            </DropdownMenuLabel>
            {allRoutes
              .filter((route) => route.category === "superachiever")
              .map((route) => {
                const isActive = route.id === activeTeam.id;
                return (
                  <DropdownMenuItem 
                    key={route.id} 
                    onClick={() => handleTeamChange(route)} 
                    className="gap-2 p-2 rounded-lg apple-menu-item"
                  >
                    <div className="flex size-6 items-center justify-center">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm">{route.name}</span>
                    {isActive && (
                      <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">Active</span>
                    )}
                  </DropdownMenuItem>
                );
              })}

            <DropdownMenuSeparator className="my-1 bg-zinc-200/70 dark:bg-zinc-700/70" />
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Co-Create Our Superpuzzle
            </DropdownMenuLabel>
            {allRoutes
              .filter((route) => route.category === "superachievers")
              .map((route) => {
                const isActive = route.id === activeTeam.id;
                return (
                  <DropdownMenuItem 
                    key={route.id} 
                    onClick={() => handleTeamChange(route)} 
                    className="gap-2 p-2 rounded-lg apple-menu-item"
                  >
                    <div className="flex size-6 items-center justify-center">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm">{route.name}</span>
                    {isActive && (
                      <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">Active</span>
                    )}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
