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
        return "bg-gradient-to-r from-stone-500 to-stone-400";
      case "superachievers":
        return "bg-gradient-to-r from-slate-500 to-slate-400";
      case "supercivilization":
        return "bg-gradient-to-r from-zinc-500 to-zinc-400";
      default:
        return "bg-zinc-900 dark:bg-zinc-100";
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="rounded-lg transition-all duration-200 ease-out data-[state=open]:bg-zinc-100 dark:data-[state=open]:bg-zinc-800"
            >
              <div className={`flex aspect-square size-8 items-center justify-center rounded-lg ${getGradientClass()} text-zinc-100 dark:text-zinc-900 overflow-hidden`}>
                <Image
                  src={activeTeam.icon || "/placeholder.svg"}
                  alt={activeTeam.name}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeTeam.name}</span>
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">{getCategoryDisplay()}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-zinc-500 dark:text-zinc-400" />
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
                    <div className="flex size-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={16}
                        height={16}
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
                    <div className="flex size-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={16}
                        height={16}
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
                    <div className="flex size-6 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
                      <Image
                        src={route.icon || "/placeholder.svg"}
                        alt={route.name}
                        width={16}
                        height={16}
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
