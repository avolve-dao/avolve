"use client"

import type * as React from "react"
import {
  BookOpen,
  Home,
  BarChart,
  Briefcase,
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Lightbulb,
  GraduationCap,
  Wind,
  Settings,
  HelpCircle,
  Target,
  Calendar
} from "lucide-react"

import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { NavSwitcher } from "./nav-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { useState } from "react"

// Avolve platform structure data
const avolveData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  // Navigation structure based on Avolve platform's 3 pillars
  navMain: [
    // Superachiever - Individual journey (Stone gradient)
    {
      title: "Superachiever",
      url: "/superachiever",
      icon: Target,
      gradientClass: "from-stone-500 to-stone-700",
      items: [
        // Personal Success Puzzle (Amber-Yellow gradient)
        {
          title: "Personal Success",
          url: "/personal",
          icon: Home,
          gradientClass: "from-amber-500 to-yellow-500",
          items: [
            { title: "Health & Energy", url: "/personal/health" },
            { title: "Wealth & Career", url: "/personal/wealth" },
            { title: "Peace & People", url: "/personal/peace" },
          ]
        },
        // Business Success Puzzle (Teal-Cyan gradient)
        {
          title: "Business Success",
          url: "/business",
          icon: Briefcase,
          gradientClass: "from-teal-500 to-cyan-500",
          items: [
            { title: "Front-Stage Users", url: "/business/users" },
            { title: "Back-Stage Admin", url: "/business/admin" },
            { title: "Bottom-Line Profit", url: "/business/profit" },
          ]
        },
        // Supermind Superpowers (Violet-Purple-Fuchsia-Pink gradient)
        {
          title: "Supermind Powers",
          url: "/supermind",
          icon: Zap,
          gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
          items: [
            { title: "Current → Desired", url: "/supermind/desired" },
            { title: "Desired → Actions", url: "/supermind/actions" },
            { title: "Actions → Results", url: "/supermind/results" },
          ]
        },
      ],
    },
    // Superachievers - Collective journey (Slate gradient)
    {
      title: "Superachievers",
      url: "/superachievers",
      icon: Users,
      gradientClass: "from-slate-500 to-slate-700",
      items: [
        // Superhuman Enhancements (Rose-Red-Orange gradient)
        {
          title: "Superhuman",
          url: "/superhuman",
          icon: GraduationCap,
          gradientClass: "from-rose-500 via-red-500 to-orange-500",
          items: [
            { title: "Superhuman Academy", url: "/superhuman/academy" },
            { title: "Superhuman University", url: "/superhuman/university" },
            { title: "Superhuman Institute", url: "/superhuman/institute" },
          ]
        },
        // Supersociety Advancements (Lime-Green-Emerald gradient)
        {
          title: "Supersociety",
          url: "/supersociety",
          icon: Users,
          gradientClass: "from-lime-500 via-green-500 to-emerald-500",
          items: [
            { title: "Supersociety Company", url: "/supersociety/company" },
            { title: "Supersociety Community", url: "/supersociety/community" },
            { title: "Supersociety Country", url: "/supersociety/country" },
          ]
        },
        // Supergenius Breakthroughs (Sky-Blue-Indigo gradient)
        {
          title: "Supergenius",
          url: "/supergenius",
          icon: Lightbulb,
          gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
          items: [
            { title: "Supergenius Ventures", url: "/supergenius/ventures" },
            { title: "Supergenius Enterprises", url: "/supergenius/enterprises" },
            { title: "Supergenius Industries", url: "/supergenius/industries" },
          ]
        },
      ],
    },
    // Supercivilization - Ecosystem journey (Zinc gradient)
    {
      title: "Supercivilization",
      url: "/supercivilization",
      icon: Wind,
      gradientClass: "from-zinc-500 to-zinc-700",
      items: [
        { title: "Genius ID", url: "/supercivilization/genius-id" },
        { title: "GEN coin/token", url: "/supercivilization/gen-token" },
        { title: "Genie AI", url: "/supercivilization/genie-ai" },
      ],
    },
    // Dashboard and settings
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart,
      gradientClass: "from-blue-500 to-blue-700",
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      gradientClass: "from-gray-500 to-gray-700",
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
      gradientClass: "from-gray-500 to-gray-700",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeTeamId, setActiveTeamId] = useState("superachiever");

  return (
    <Sidebar 
      collapsible="icon" 
      variant="floating" 
      className="border-r border-zinc-200/50 dark:border-zinc-700/50 shadow-none" 
      {...props}
    >
      <SidebarHeader className="py-2">
        <NavSwitcher 
          activeTeamId={activeTeamId} 
          onTeamChange={(teamId) => setActiveTeamId(teamId)}
        />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain items={avolveData.navMain} />
      </SidebarContent>
      <SidebarFooter className="py-2">
        <NavUser user={avolveData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
