"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/nav-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  getCriticalNavItems,
  getHighPriorityNavItems,
  getMediumPriorityNavItems,
  getLowPriorityNavItems,
  isRouteActive,
} from "@/lib/navigation"

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
    name: "Personal Success",
    icon: "/icons/icon-personal-success-puzzle.svg",
    href: "/personal",
    category: "superachiever",
  },
  {
    id: "business",
    name: "Business Success",
    icon: "/icons/icon-business-success-puzzle.svg",
    href: "/business",
    category: "superachiever",
  },
  {
    id: "supermind",
    name: "Supermind Powers",
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

// Mock data for NavUser (replace with actual data fetching)
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}

export function AppSidebar({
  activeTeam = "superachiever",
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeTeam?: string
}) {
  const pathname = usePathname()

  // Find the active team data
  const activeTeamData = allRoutes.find((route) => route.id === activeTeam) || allRoutes[0]

  // Get sub-routes for the active team
  const subRoutes = allRoutes.filter((route) => route.category === activeTeamData.id)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher activeTeamId={activeTeam} />
        <div className="md:hidden px-2 py-1">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Team-specific navigation */}
        {subRoutes.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{activeTeamData.name} Areas</SidebarGroupLabel>
            <SidebarMenu>
              {subRoutes.map((route) => {
                const isActive = pathname.includes(route.href)

                return (
                  <SidebarMenuItem key={route.id}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={route.name}>
                      <Link href={route.href} className="flex items-center">
                        <div className="h-4 w-4 mr-2 flex items-center justify-center">
                          <Image
                            src={route.icon || "/placeholder.svg"}
                            alt={route.name}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        <span className="truncate">{route.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Main Areas Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Areas</SidebarGroupLabel>
          <SidebarMenu>
            {allRoutes
              .filter((route) => route.category === "main")
              .map((route) => {
                const isActive = pathname.includes(route.href)

                return (
                  <SidebarMenuItem key={route.id}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={route.name}>
                      <Link href={route.href} className="flex items-center">
                        <div className="h-4 w-4 mr-2 flex items-center justify-center">
                          <Image
                            src={route.icon || "/placeholder.svg"}
                            alt={route.name}
                            width={16}
                            height={16}
                            className="object-contain"
                          />
                        </div>
                        <span className="truncate">{route.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Critical Path Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            {getCriticalNavItems().map((item) => {
              const isActive = isRouteActive(pathname, item.href)
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* High & Medium Priority Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Explore</SidebarGroupLabel>
          <SidebarMenu>
            {[...getHighPriorityNavItems(), ...getMediumPriorityNavItems()].map((item) => {
              const isActive = isRouteActive(pathname, item.href)
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant="default" className="ml-auto h-5 min-w-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Low Priority Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarMenu>
            {getLowPriorityNavItems().map((item) => {
              const isActive = isRouteActive(pathname, item.href)
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                    <Link href={item.href} target={item.isExternal ? "_blank" : undefined}>
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                      {item.isExternal && <ExternalLink className="ml-auto h-3 w-3" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

