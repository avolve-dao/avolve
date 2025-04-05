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
      title: "Dashboard",
      url: "/superachiever",
      icon: Target,
      category: "main",
      gradientClass: "from-stone-500 to-stone-700",
    },
    // Personal Success Puzzle (Amber-Yellow gradient)
    {
      id: "personal",
      title: "Personal Success Puzzle",
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
      title: "Business Success Puzzle",
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
      title: "Supermind Superpowers",
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
    
    // Superachievers - Collective journey (Slate gradient)
    {
      id: "superachievers",
      title: "Dashboard",
      url: "/superachievers",
      icon: Users,
      category: "main",
      gradientClass: "from-slate-500 to-slate-700",
    },
    // Superpuzzle Developments
    {
      id: "superpuzzle",
      title: "Superpuzzle Developments",
      url: "/superpuzzle",
      icon: BookOpen,
      category: "superachievers",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
      items: [
        { title: "Individuals", url: "/superpuzzle/individuals" },
        { title: "Collectives", url: "/superpuzzle/collectives" },
        { title: "Ecosystem", url: "/superpuzzle/ecosystem" },
      ]
    },
    // Superhuman Enhancements (Rose-Red-Orange gradient)
    {
      id: "superhuman",
      title: "Superhuman Enhancements",
      url: "/superhuman",
      icon: GraduationCap,
      category: "superachievers",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
      items: [
        { title: "Academy", url: "/superhuman/academy" },
        { title: "University", url: "/superhuman/university" },
        { title: "Institute", url: "/superhuman/institute" },
      ]
    },
    // Supersociety Advancements (Lime-Green-Emerald gradient)
    {
      id: "supersociety",
      title: "Supersociety Advancements",
      url: "/supersociety",
      icon: Users,
      category: "superachievers",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
      items: [
        { title: "Company", url: "/supersociety/company" },
        { title: "Community", url: "/supersociety/community" },
        { title: "Country", url: "/supersociety/country" },
      ]
    },
    // Supergenius Breakthroughs (Sky-Blue-Indigo gradient)
    {
      id: "supergenius",
      title: "Supergenius Breakthroughs",
      url: "/supergenius",
      icon: Lightbulb,
      category: "superachievers",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
      items: [
        { title: "Ventures", url: "/supergenius/ventures" },
        { title: "Enterprises", url: "/supergenius/enterprises" },
        { title: "Industries", url: "/supergenius/industries" },
      ]
    },
    
    // Supercivilization - Ecosystem journey (Zinc gradient)
    {
      id: "supercivilization",
      title: "Dashboard",
      url: "/supercivilization",
      icon: Wind,
      category: "main",
      gradientClass: "from-zinc-500 to-zinc-700",
    },
    // Avolve from Degen to Regen
    {
      id: "avolve-degen-regen",
      title: "Avolve from Degen to Regen",
      url: "/avolve",
      icon: TrendingUp,
      category: "supercivilization",
      gradientClass: "from-zinc-500 to-zinc-700",
      items: [
        { title: "Avolve", url: "/avolve/avolve" },
        { title: "Avalue", url: "/avolve/avalue" },
        { title: "Avault", url: "/avolve/avault" },
        { title: "Avoice", url: "/avolve/avoice" },
      ]
    },
    // Create Your Success Puzzle
    {
      id: "create-success-puzzle",
      title: "Create Your Success Puzzle",
      url: "/create-success",
      icon: Target,
      category: "supercivilization",
      gradientClass: "from-stone-500 to-stone-700",
      items: [
        { title: "Superachiever Playbook", url: "/create-success/playbook" },
        { title: "Personal Success Puzzle", url: "/create-success/personal" },
        { title: "Business Success Puzzle", url: "/create-success/business" },
        { title: "Supermind Superpowers", url: "/create-success/supermind" },
      ]
    },
    // Co-Create Our Superpuzzle
    {
      id: "co-create-superpuzzle",
      title: "Co-Create Our Superpuzzle",
      url: "/co-create",
      icon: Users,
      category: "supercivilization",
      gradientClass: "from-slate-500 to-slate-700",
      items: [
        { title: "Supercivilization Quests", url: "/co-create/quests" },
        { title: "Superpuzzle Developments", url: "/co-create/superpuzzle" },
        { title: "Superhuman Enhancements", url: "/co-create/superhuman" },
        { title: "Supersociety Advancements", url: "/co-create/supersociety" },
        { title: "Supergenius Breakthroughs", url: "/co-create/supergenius" },
      ]
    },
    
    // Personal Dashboard and sections
    {
      id: "personal-dashboard",
      title: "Dashboard",
      url: "/personal",
      icon: Home,
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
    },
    {
      id: "personal-health",
      title: "Health & Energy",
      url: "/personal/health",
      icon: Target,
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        { title: "Current", url: "/personal/health/current" },
        { title: "Desired", url: "/personal/health/desired" },
        { title: "Actions", url: "/personal/health/actions" },
        { title: "Results", url: "/personal/health/results" },
      ]
    },
    {
      id: "personal-wealth",
      title: "Wealth & Career",
      url: "/personal/wealth",
      icon: DollarSign,
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        { title: "Current", url: "/personal/wealth/current" },
        { title: "Desired", url: "/personal/wealth/desired" },
        { title: "Actions", url: "/personal/wealth/actions" },
        { title: "Results", url: "/personal/wealth/results" },
      ]
    },
    {
      id: "personal-peace",
      title: "Peace & People",
      url: "/personal/peace",
      icon: Users,
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        { title: "Current", url: "/personal/peace/current" },
        { title: "Desired", url: "/personal/peace/desired" },
        { title: "Actions", url: "/personal/peace/actions" },
        { title: "Results", url: "/personal/peace/results" },
      ]
    },
    
    // Business Dashboard and sections
    {
      id: "business-dashboard",
      title: "Dashboard",
      url: "/business",
      icon: Briefcase,
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
    },
    {
      id: "business-users",
      title: "Front-Stage Users",
      url: "/business/users",
      icon: Users,
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        { title: "Current", url: "/business/users/current" },
        { title: "Desired", url: "/business/users/desired" },
        { title: "Actions", url: "/business/users/actions" },
        { title: "Results", url: "/business/users/results" },
      ]
    },
    {
      id: "business-admin",
      title: "Back-Stage Admin",
      url: "/business/admin",
      icon: Settings,
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        { title: "Current", url: "/business/admin/current" },
        { title: "Desired", url: "/business/admin/desired" },
        { title: "Actions", url: "/business/admin/actions" },
        { title: "Results", url: "/business/admin/results" },
      ]
    },
    {
      id: "business-profit",
      title: "Bottom-Line Profit",
      url: "/business/profit",
      icon: DollarSign,
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        { title: "Current", url: "/business/profit/current" },
        { title: "Desired", url: "/business/profit/desired" },
        { title: "Actions", url: "/business/profit/actions" },
        { title: "Results", url: "/business/profit/results" },
      ]
    },
    
    // Supermind Dashboard and sections
    {
      id: "supermind-dashboard",
      title: "Dashboard",
      url: "/supermind",
      icon: Zap,
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    {
      id: "supermind-desired",
      title: "Current → Desired",
      url: "/supermind/desired",
      icon: Target,
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    {
      id: "supermind-actions",
      title: "Desired → Actions",
      url: "/supermind/actions",
      icon: Calendar,
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    {
      id: "supermind-results",
      title: "Actions → Results",
      url: "/supermind/results",
      icon: TrendingUp,
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    
    // Superpuzzle Dashboard and sections
    {
      id: "superpuzzle-dashboard",
      title: "Dashboard",
      url: "/superpuzzle",
      icon: BookOpen,
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
    {
      id: "superpuzzle-individuals",
      title: "Enhanced Individuals",
      url: "/superpuzzle/individuals",
      icon: Users,
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
    {
      id: "superpuzzle-collectives",
      title: "Advanced Collectives",
      url: "/superpuzzle/collectives",
      icon: Users,
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
    {
      id: "superpuzzle-ecosystem",
      title: "Balanced Ecosystems",
      url: "/superpuzzle/ecosystem",
      icon: Wind,
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
    
    // Superhuman Dashboard and sections
    {
      id: "superhuman-dashboard",
      title: "Dashboard",
      url: "/superhuman",
      icon: GraduationCap,
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
    },
    {
      id: "superhuman-academy",
      title: "Academy",
      url: "/superhuman/academy",
      icon: BookOpen,
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
    },
    {
      id: "superhuman-university",
      title: "University",
      url: "/superhuman/university",
      icon: GraduationCap,
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
    },
    {
      id: "superhuman-institute",
      title: "Institute",
      url: "/superhuman/institute",
      icon: BookOpen,
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
    },
    
    // Supersociety Dashboard and sections
    {
      id: "supersociety-dashboard",
      title: "Dashboard",
      url: "/supersociety",
      icon: Users,
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
    },
    {
      id: "supersociety-company",
      title: "Company",
      url: "/supersociety/company",
      icon: Briefcase,
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
    },
    {
      id: "supersociety-community",
      title: "Community",
      url: "/supersociety/community",
      icon: Users,
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
    },
    {
      id: "supersociety-country",
      title: "Country",
      url: "/supersociety/country",
      icon: Wind,
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
    },
    
    // Supergenius Dashboard and sections
    {
      id: "supergenius-dashboard",
      title: "Dashboard",
      url: "/supergenius",
      icon: Lightbulb,
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
    },
    {
      id: "supergenius-ventures",
      title: "Ventures",
      url: "/supergenius/ventures",
      icon: TrendingUp,
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
    },
    {
      id: "supergenius-enterprises",
      title: "Enterprises",
      url: "/supergenius/enterprises",
      icon: Briefcase,
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
    },
    {
      id: "supergenius-industries",
      title: "Industries",
      url: "/supergenius/industries",
      icon: Briefcase,
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
    },
    
    // Utility items (always shown)
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
    // For main categories
    if (activeTeamId === 'superachiever') {
      return avolveData.navMain.filter(item => 
        item.category === 'superachiever' ||
        item.category === 'utility'
      );
    } 
    else if (activeTeamId === 'superachievers') {
      return avolveData.navMain.filter(item => 
        item.category === 'superachievers' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'supercivilization') {
      return avolveData.navMain.filter(item => 
        item.category === 'supercivilization' ||
        item.category === 'utility'
      );
    }
    // For sub-categories
    else if (activeTeamId === 'personal') {
      return avolveData.navMain.filter(item => 
        item.category === 'personal' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'business') {
      return avolveData.navMain.filter(item => 
        item.category === 'business' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'supermind') {
      return avolveData.navMain.filter(item => 
        item.category === 'supermind' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'superpuzzle') {
      return avolveData.navMain.filter(item => 
        item.category === 'superpuzzle' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'superhuman') {
      return avolveData.navMain.filter(item => 
        item.category === 'superhuman' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'supersociety') {
      return avolveData.navMain.filter(item => 
        item.category === 'supersociety' ||
        item.category === 'utility'
      );
    }
    else if (activeTeamId === 'supergenius') {
      return avolveData.navMain.filter(item => 
        item.category === 'supergenius' ||
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
