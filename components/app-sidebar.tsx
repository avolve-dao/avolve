"use client"

import * as React from "react"
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
  useSidebar
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
import { ChevronRight, Target, Calendar, BookOpen, BarChart, Briefcase, Users, DollarSign, TrendingUp, Zap, Lightbulb, GraduationCap, Wind, Settings, HelpCircle } from "lucide-react"
import cn from "classnames"

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
    if (pathname.startsWith('/personal')) {
      return [
        { title: "Goals", href: "/personal/goals", icon: Target, badge: "3" },
        { title: "Habits", href: "/personal/habits", icon: Calendar },
        { title: "Journal", href: "/personal/journal", icon: BookOpen },
        { title: "Progress", href: "/personal/progress", icon: BarChart },
      ]
    } else if (pathname.startsWith('/business')) {
      return [
        { title: "Projects", href: "/business/projects", icon: Briefcase, badge: "5" },
        { title: "Team", href: "/business/team", icon: Users },
        { title: "Finance", href: "/business/finance", icon: DollarSign },
        { title: "Growth", href: "/business/growth", icon: TrendingUp },
      ]
    } else if (pathname.startsWith('/supermind')) {
      return [
        { title: "Focus", href: "/supermind/focus", icon: Zap, badge: "New" },
        { title: "Creativity", href: "/supermind/creativity", icon: Lightbulb },
        { title: "Learning", href: "/supermind/learning", icon: GraduationCap },
        { title: "Flow", href: "/supermind/flow", icon: Wind },
      ]
    }
    
    // Default items
    return [
      { title: "Dashboard", href: "/dashboard", icon: BarChart },
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Help", href: "/help", icon: HelpCircle },
    ]
  }
  
  // Determine the accent color based on context
  const getContextAccentColor = () => {
    if (pathname.startsWith('/personal')) {
      return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    } else if (pathname.startsWith('/business')) {
      return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
    } else if (pathname.startsWith('/supermind')) {
      return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
    }
    
    return "bg-primary/10 text-primary hover:bg-primary/20"
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 pt-4">
          <TeamSwitcher />
          <SidebarTrigger />
        </div>
        <div className="px-6 pt-2">
          <NavUser user={data.user} />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        {/* Contextual navigation based on current route */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center text-sm font-medium">
            <span className={cn("h-1.5 w-1.5 rounded-full mr-2", {
              "bg-blue-500": pathname.startsWith('/personal'),
              "bg-emerald-500": pathname.startsWith('/business'),
              "bg-purple-500": pathname.startsWith('/supermind'),
              "bg-primary": !pathname.startsWith('/personal') && !pathname.startsWith('/business') && !pathname.startsWith('/supermind')
            })}></span>
            {pathname.startsWith('/personal') ? "Personal Success" : 
             pathname.startsWith('/business') ? "Business Success" :
             pathname.startsWith('/supermind') ? "Supermind Powers" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarMenu className="animate-fade-in stagger-list">
            {getContextualNavItems().map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <SidebarMenuItem key={item.href} className="hover-lift">
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive} 
                    className={cn("press-effect", isActive && getContextAccentColor())}
                  >
                    <Link href={item.href} className="flex items-center">
                      <Icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge className={cn("ml-auto", isActive && "bg-white/20")}>
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

        {/* Collapsible groups */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <button 
              onClick={() => toggleGroup("critical")}
              className="flex items-center w-full text-left"
            >
              <ChevronRight className={`h-3 w-3 mr-1 transition-transform ${expandedGroups.critical ? "rotate-90" : ""}`} />
              Critical Priority
            </button>
          </SidebarGroupLabel>
          {expandedGroups.critical && (
            <SidebarMenu className="animate-fade-in">
              {getCriticalNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href} className="hover-lift">
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="press-effect">
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
            <SidebarMenu className="animate-fade-in">
              {getHighPriorityNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href} className="hover-lift">
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="press-effect">
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
            <SidebarMenu className="animate-fade-in">
              {getMediumPriorityNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href} className="hover-lift">
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="press-effect">
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
            <SidebarMenu className="animate-fade-in">
              {getLowPriorityNavItems().map((item) => {
                const isActive = isRouteActive(pathname, item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href} className="hover-lift">
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className="press-effect">
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
            <SidebarMenuItem className="hover-lift">
              <SidebarMenuButton asChild className="press-effect">
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="hover-lift">
              <SidebarMenuButton asChild className="press-effect">
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
