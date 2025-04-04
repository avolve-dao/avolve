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
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import {
  getCriticalNavItems,
  getHighPriorityNavItems,
  getMediumPriorityNavItems,
  getLowPriorityNavItems,
  isRouteActive,
} from "@/lib/navigation"
import { useSidebar } from "@/components/ui/sidebar/use-sidebar"
import { ChevronRight, Target, Calendar, BookOpen, BarChart, Briefcase, Users, DollarSign, TrendingUp, Zap, Lightbulb, GraduationCap, Wind, Settings, HelpCircle } from "lucide-react"
import cn from "classnames"

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
  const { toggleSidebar, state } = useSidebar()
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    "critical": true,
    "high": false,
    "medium": false,
    "low": false
  })

  // Find the active team data
  const activeTeamData = allRoutes.find((route) => route.id === activeTeam) || allRoutes[0]

  // Get sub-routes for the active team
  const subRoutes = allRoutes.filter((route) => route.category === activeTeamData.id)

  // Determine the active sub-route
  const activeSubRoute = subRoutes.find((route) => pathname.includes(route.href)) || subRoutes[0]

  // Toggle a group's expanded state
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  // Get context-specific navigation items based on the current path
  const getContextualNavItems = () => {
    // For personal success context
    if (pathname.startsWith('/personal')) {
      return [
        { title: "Goals", href: "/personal/goals", icon: Target },
        { title: "Habits", href: "/personal/habits", icon: Calendar },
        { title: "Journal", href: "/personal/journal", icon: BookOpen },
        { title: "Metrics", href: "/personal/metrics", icon: BarChart }
      ]
    }
    
    // For business success context
    if (pathname.startsWith('/business')) {
      return [
        { title: "Projects", href: "/business/projects", icon: Briefcase },
        { title: "Team", href: "/business/team", icon: Users },
        { title: "Finance", href: "/business/finance", icon: DollarSign },
        { title: "Growth", href: "/business/growth", icon: TrendingUp }
      ]
    }
    
    // For supermind context
    if (pathname.startsWith('/supermind')) {
      return [
        { title: "Focus", href: "/supermind/focus", icon: Zap },
        { title: "Creativity", href: "/supermind/creativity", icon: Lightbulb },
        { title: "Learning", href: "/supermind/learning", icon: GraduationCap },
        { title: "Flow", href: "/supermind/flow", icon: Wind }
      ]
    }
    
    // Default empty array if no specific context
    return []
  }
  
  const contextualNavItems = getContextualNavItems()
  
  // Determine if we're in a specific context that should show contextual navigation
  const hasContextualNav = contextualNavItems.length > 0
  
  // Determine the accent color based on context
  const getContextAccentColor = () => {
    if (pathname.startsWith('/personal')) return "border-l-blue-500";
    if (pathname.startsWith('/business')) return "border-l-green-500";
    if (pathname.startsWith('/supermind')) return "border-l-purple-500";
    if (pathname.startsWith('/superachiever')) return "border-l-amber-500";
    if (pathname.startsWith('/superachievers')) return "border-l-red-500";
    if (pathname.startsWith('/supercivilization')) return "border-l-cyan-500";
    return "border-l-primary";
  }
  
  const contextAccentColor = getContextAccentColor()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher activeTeamId={activeTeam} />
        <div className="md:hidden px-2 py-1">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Sidebar collapse toggle button */}
        <div className="hidden md:flex px-3 mb-2 justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-8 w-8"
            title={state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}
          >
            <PanelLeft className={`h-4 w-4 transition-transform ${state === "collapsed" ? "rotate-180" : ""}`} />
            <span className="sr-only">{state === "expanded" ? "Collapse sidebar" : "Expand sidebar"}</span>
          </Button>
        </div>

        {/* Team-specific navigation */}
        {subRoutes.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{activeTeamData.name} Areas</SidebarGroupLabel>
            <SidebarMenu>
              {subRoutes.map((route) => {
                // Check if this route is active by comparing with pathname
                const isActive = pathname.includes(route.href)

                return (
                  <SidebarMenuItem key={route.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={route.name}
                      className={cn(
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4" : "",
                        isActive ? contextAccentColor : ""
                      )}
                    >
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
                        <span>{route.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Contextual navigation for specific areas */}
        {hasContextualNav && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {contextualNavItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4" : "",
                        isActive ? contextAccentColor : ""
                      )}
                    >
                      <Link href={item.href} className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Collapsible navigation groups */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <button 
              onClick={() => toggleGroup("critical")}
              className="flex items-center w-full text-left"
            >
              <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${expandedGroups.critical ? "rotate-90" : ""}`} />
              Critical
            </button>
          </SidebarGroupLabel>
          {expandedGroups.critical && (
            <SidebarMenu>
              {getCriticalNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <button 
              onClick={() => toggleGroup("high")}
              className="flex items-center w-full text-left"
            >
              <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${expandedGroups.high ? "rotate-90" : ""}`} />
              High Priority
            </button>
          </SidebarGroupLabel>
          {expandedGroups.high && (
            <SidebarMenu>
              {getHighPriorityNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <button 
              onClick={() => toggleGroup("medium")}
              className="flex items-center w-full text-left"
            >
              <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${expandedGroups.medium ? "rotate-90" : ""}`} />
              Medium Priority
            </button>
          </SidebarGroupLabel>
          {expandedGroups.medium && (
            <SidebarMenu>
              {getMediumPriorityNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          )}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <button 
              onClick={() => toggleGroup("low")}
              className="flex items-center w-full text-left"
            >
              <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${expandedGroups.low ? "rotate-90" : ""}`} />
              Low Priority
            </button>
          </SidebarGroupLabel>
          {expandedGroups.low && (
            <SidebarMenu>
              {getLowPriorityNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/help" className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>Help</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
