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
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

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
      id: "superachiever",
      title: "Superachiever",
      url: "/superachiever",
      icon: Target,
      category: "main",
      gradientClass: "from-stone-500 to-stone-700",
      items: [
        // Personal Success Puzzle (Amber-Yellow gradient)
        {
          id: "personal",
          title: "Personal Success",
          url: "/personal",
          icon: Home,
          category: "superachiever",
          gradientClass: "from-amber-500 to-yellow-500",
          items: [
            { title: "Health & Energy", url: "/personal/health" },
            { title: "Wealth & Career", url: "/personal/wealth" },
            { title: "Peace & People", url: "/personal/peace" },
          ]
        },
        // Business Success Puzzle (Teal-Cyan gradient)
        {
          id: "business",
          title: "Business Success",
          url: "/business",
          icon: Briefcase,
          category: "superachiever",
          gradientClass: "from-teal-500 to-cyan-500",
          items: [
            { title: "Front-Stage Users", url: "/business/users" },
            { title: "Back-Stage Admin", url: "/business/admin" },
            { title: "Bottom-Line Profit", url: "/business/profit" },
          ]
        },
        // Supermind Superpowers (Violet-Purple-Fuchsia-Pink gradient)
        {
          id: "supermind",
          title: "Supermind Powers",
          url: "/supermind",
          icon: Zap,
          category: "superachiever",
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
      id: "superachievers",
      title: "Superachievers",
      url: "/superachievers",
      icon: Users,
      category: "main",
      gradientClass: "from-slate-500 to-slate-700",
      items: [
        // Superhuman Enhancements (Rose-Red-Orange gradient)
        {
          id: "superhuman",
          title: "Superhuman",
          url: "/superhuman",
          icon: GraduationCap,
          category: "superachievers",
          gradientClass: "from-rose-500 via-red-500 to-orange-500",
          items: [
            { title: "Superhuman Academy", url: "/superhuman/academy" },
            { title: "Superhuman University", url: "/superhuman/university" },
            { title: "Superhuman Institute", url: "/superhuman/institute" },
          ]
        },
        // Supersociety Advancements (Lime-Green-Emerald gradient)
        {
          id: "supersociety",
          title: "Supersociety",
          url: "/supersociety",
          icon: Users,
          category: "superachievers",
          gradientClass: "from-lime-500 via-green-500 to-emerald-500",
          items: [
            { title: "Supersociety Company", url: "/supersociety/company" },
            { title: "Supersociety Community", url: "/supersociety/community" },
            { title: "Supersociety Country", url: "/supersociety/country" },
          ]
        },
        // Supergenius Breakthroughs (Sky-Blue-Indigo gradient)
        {
          id: "supergenius",
          title: "Supergenius",
          url: "/supergenius",
          icon: Lightbulb,
          category: "superachievers",
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
      id: "supercivilization",
      title: "Supercivilization",
      url: "/supercivilization",
      icon: Wind,
      category: "main",
      gradientClass: "from-zinc-500 to-zinc-700",
      items: [
        { title: "Genius ID", url: "/supercivilization/genius-id" },
        { title: "GEN coin/token", url: "/supercivilization/gen-token" },
        { title: "Genie AI", url: "/supercivilization/genie-ai" },
      ],
    },
    // Dashboard and settings
    {
      id: "dashboard",
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart,
      category: "utility",
      gradientClass: "from-blue-500 to-blue-700",
    },
    {
      id: "settings",
      title: "Settings",
      url: "/settings",
      icon: Settings,
      category: "utility",
      gradientClass: "from-gray-500 to-gray-700",
    },
    {
      id: "help",
      title: "Help",
      url: "/help",
      icon: HelpCircle,
      category: "utility",
      gradientClass: "from-gray-500 to-gray-700",
    },
  ],
}

// Helper function to determine active team based on pathname
const getActiveTeamFromPath = (pathname: string) => {
  if (pathname.includes('/personal')) return 'personal';
  if (pathname.includes('/business')) return 'business';
  if (pathname.includes('/supermind')) return 'supermind';
  if (pathname.includes('/superhuman')) return 'superhuman';
  if (pathname.includes('/supersociety')) return 'supersociety';
  if (pathname.includes('/supergenius')) return 'supergenius';
  if (pathname.includes('/superachiever')) return 'superachiever';
  if (pathname.includes('/superachievers')) return 'superachievers';
  if (pathname.includes('/supercivilization')) return 'supercivilization';
  if (pathname.includes('/dashboard')) return 'dashboard';
  return 'superachiever'; // Default
};

export function AppSidebar({ 
  activeTeam: propActiveTeam,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  activeTeam?: string 
}) {
  const pathname = usePathname();
  const [activeTeamId, setActiveTeamId] = useState(propActiveTeam || getActiveTeamFromPath(pathname));

  // Update active team when pathname changes
  useEffect(() => {
    if (!propActiveTeam) {
      setActiveTeamId(getActiveTeamFromPath(pathname));
    }
  }, [pathname, propActiveTeam]);

  // Filter menu items based on active team
  const getFilteredMenuItems = () => {
    // For main categories, show only their specific items
    if (activeTeamId === 'superachiever') {
      return avolveData.navMain.filter(item => 
        item.id === 'superachiever' || 
        item.category === 'superachiever' ||
        item.category === 'utility'
      );
    } 
    else if (activeTeamId === 'superachievers') {
      return avolveData.navMain.filter(item => 
        item.id === 'superachievers' || 
        item.category === 'superachievers' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'supercivilization') {
      return avolveData.navMain.filter(item => 
        item.id === 'supercivilization' || 
        item.category === 'supercivilization' ||
        item.category === 'utility'
      );
    }
    // For sub-categories, show their parent and siblings
    else if (['personal', 'business', 'supermind'].includes(activeTeamId)) {
      return avolveData.navMain.filter(item => 
        item.id === 'superachiever' || 
        item.category === 'superachiever' ||
        item.category === 'utility'
      );
    }
    else if (['superhuman', 'supersociety', 'supergenius'].includes(activeTeamId)) {
      return avolveData.navMain.filter(item => 
        item.id === 'superachievers' || 
        item.category === 'superachievers' ||
        item.category === 'utility'
      );
    }
    
    // Default: show all items
    return avolveData.navMain;
  };

  return (
    <Sidebar 
      collapsible="icon" 
      variant="floating" 
      className="border-none shadow-none bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md z-40" 
      {...props}
    >
      <SidebarHeader className="py-2 px-2">
        <NavSwitcher 
          activeTeamId={activeTeamId} 
          onTeamChange={(teamId) => setActiveTeamId(teamId)}
        />
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain items={getFilteredMenuItems()} />
      </SidebarContent>
      <SidebarFooter className="py-2 px-2">
        <NavUser user={avolveData.user} />
      </SidebarFooter>
      <SidebarRail className="bg-transparent border-none" />
    </Sidebar>
  )
}
