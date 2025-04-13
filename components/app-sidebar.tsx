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
import { TokenSidebarDisplay } from "@/components/token/token-sidebar-display"; // Import the TokenSidebarDisplay component
import { cn } from "@/lib/utils"; // Import the cn function

// Define the NavItem interface to match the one in nav-main.tsx
interface NavItem {
  id: string;
  title: string;
  url: string;
  icon?: React.ElementType;
  items?: NavItem[];
  category?: string;
  gradientClass?: string;
  isDashboard?: boolean;
}

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
      isDashboard: true
    },
    // Personal Success Puzzle (Amber-Yellow gradient)
    {
      id: "personal-success-puzzle",
      title: "Personal Success Puzzle",
      url: "/personal",
      icon: Home,
      category: "superachiever",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        {
          id: "personal-health-link",
          title: "Health & Energy",
          url: "/personal/health"
        },
        {
          id: "personal-wealth-link",
          title: "Wealth & Career",
          url: "/personal/wealth"
        },
        {
          id: "personal-peace-link",
          title: "Peace & People",
          url: "/personal/peace"
        }
      ]
    },
    // Business Success Puzzle (Teal-Cyan gradient)
    {
      id: "business-success-puzzle",
      title: "Business Success Puzzle",
      url: "/business",
      icon: Briefcase,
      category: "superachiever",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        {
          id: "business-users-link",
          title: "Front-Stage Users",
          url: "/business/users"
        },
        {
          id: "business-admin-link",
          title: "Back-Stage Admin",
          url: "/business/admin"
        },
        {
          id: "business-profit-link",
          title: "Bottom-Line Profit",
          url: "/business/profit"
        }
      ]
    },
    // Supermind Superpowers (Violet-Purple-Fuchsia-Pink gradient)
    {
      id: "supermind-superpowers",
      title: "Supermind Superpowers",
      url: "/supermind",
      icon: Zap,
      category: "superachiever",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
      items: [
        {
          id: "supermind-current-link",
          title: "Current → Desired",
          url: "/supermind/desired"
        },
        {
          id: "supermind-desired-link",
          title: "Desired → Actions",
          url: "/supermind/actions"
        },
        {
          id: "supermind-actions-link",
          title: "Actions → Results",
          url: "/supermind/results"
        }
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
      isDashboard: true
    },
    // Superpuzzle Developments
    {
      id: "superpuzzle-developments",
      title: "Superpuzzle Developments",
      url: "/superpuzzle",
      icon: BookOpen,
      category: "superachievers",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
      items: [
        {
          id: "superpuzzle-individuals-link",
          title: "Enhanced Individuals",
          url: "/superpuzzle/individuals"
        },
        {
          id: "superpuzzle-collectives-link",
          title: "Advanced Collectives",
          url: "/superpuzzle/collectives"
        },
        {
          id: "superpuzzle-ecosystems-link",
          title: "Balanced Ecosystems",
          url: "/superpuzzle/ecosystem"
        }
      ]
    },
    // Superhuman Enhancements (Rose-Red-Orange gradient)
    {
      id: "superhuman-enhancements",
      title: "Superhuman Enhancements",
      url: "/superhuman",
      icon: GraduationCap,
      category: "superachievers",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
      items: [
        {
          id: "superhuman-academy-link",
          title: "Academy",
          url: "/superhuman/academy"
        },
        {
          id: "superhuman-university-link",
          title: "University",
          url: "/superhuman/university"
        },
        {
          id: "superhuman-institute-link",
          title: "Institute",
          url: "/superhuman/institute"
        }
      ]
    },
    // Supersociety Advancements (Lime-Green-Emerald gradient)
    {
      id: "supersociety-advancements",
      title: "Supersociety Advancements",
      url: "/supersociety",
      icon: Users,
      category: "superachievers",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
      items: [
        {
          id: "supersociety-company-link",
          title: "Company",
          url: "/supersociety/company"
        },
        {
          id: "supersociety-community-link",
          title: "Community",
          url: "/supersociety/community"
        },
        {
          id: "supersociety-country-link",
          title: "Country",
          url: "/supersociety/country"
        }
      ]
    },
    // Supergenius Breakthroughs (Sky-Blue-Indigo gradient)
    {
      id: "supergenius-breakthroughs",
      title: "Supergenius Breakthroughs",
      url: "/supergenius",
      icon: Lightbulb,
      category: "superachievers",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
      items: [
        {
          id: "supergenius-ventures-link",
          title: "Ventures",
          url: "/supergenius/ventures"
        },
        {
          id: "supergenius-enterprises-link",
          title: "Enterprises",
          url: "/supergenius/enterprises"
        },
        {
          id: "supergenius-industries-link",
          title: "Industries",
          url: "/supergenius/industries"
        }
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
      isDashboard: true
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
        {
          id: "avolve-avolve-link",
          title: "Avolve",
          url: "/avolve/avolve"
        },
        {
          id: "avolve-avalue-link",
          title: "Avalue",
          url: "/avolve/avalue"
        },
        {
          id: "avolve-avault-link",
          title: "Avault",
          url: "/avolve/avault"
        },
        {
          id: "avolve-avoice-link",
          title: "Avoice",
          url: "/avolve/avoice"
        },
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
        {
          id: "create-success-playbook-link",
          title: "Superachiever Playbook",
          url: "/create-success/playbook"
        },
        {
          id: "create-success-personal-link",
          title: "Personal Success Puzzle",
          url: "/create-success/personal"
        },
        {
          id: "create-success-business-link",
          title: "Business Success Puzzle",
          url: "/create-success/business"
        },
        {
          id: "create-success-supermind-link",
          title: "Supermind Superpowers",
          url: "/create-success/supermind"
        },
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
        {
          id: "co-create-quests-link",
          title: "Supercivilization Quests",
          url: "/co-create/quests"
        },
        {
          id: "co-create-superpuzzle-link",
          title: "Superpuzzle Developments",
          url: "/co-create/superpuzzle"
        },
        {
          id: "co-create-superhuman-link",
          title: "Superhuman Enhancements",
          url: "/co-create/superhuman"
        },
        {
          id: "co-create-supersociety-link",
          title: "Supersociety Advancements",
          url: "/co-create/supersociety"
        },
        {
          id: "co-create-supergenius-link",
          title: "Supergenius Breakthroughs",
          url: "/co-create/supergenius"
        },
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
      isDashboard: true
    },
    {
      id: "personal-health",
      title: "Health & Energy",
      url: "/personal/health",
      icon: Target,
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        {
          id: "personal-health-current",
          title: "Current",
          url: "/personal/health/current"
        },
        {
          id: "personal-health-desired",
          title: "Desired",
          url: "/personal/health/desired"
        },
        {
          id: "personal-health-actions",
          title: "Actions",
          url: "/personal/health/actions"
        },
        {
          id: "personal-health-results",
          title: "Results",
          url: "/personal/health/results"
        }
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
        {
          id: "personal-wealth-current",
          title: "Current",
          url: "/personal/wealth/current"
        },
        {
          id: "personal-wealth-desired",
          title: "Desired",
          url: "/personal/wealth/desired"
        },
        {
          id: "personal-wealth-actions",
          title: "Actions",
          url: "/personal/wealth/actions"
        },
        {
          id: "personal-wealth-results",
          title: "Results",
          url: "/personal/wealth/results"
        }
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
        {
          id: "personal-peace-current",
          title: "Current",
          url: "/personal/peace/current"
        },
        {
          id: "personal-peace-desired",
          title: "Desired",
          url: "/personal/peace/desired"
        },
        {
          id: "personal-peace-actions",
          title: "Actions",
          url: "/personal/peace/actions"
        },
        {
          id: "personal-peace-results",
          title: "Results",
          url: "/personal/peace/results"
        }
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
      isDashboard: true
    },
    {
      id: "business-users",
      title: "Front-Stage Users",
      url: "/business/users",
      icon: Users,
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        {
          id: "business-users-current",
          title: "Current",
          url: "/business/users/current"
        },
        {
          id: "business-users-desired",
          title: "Desired",
          url: "/business/users/desired"
        },
        {
          id: "business-users-actions",
          title: "Actions",
          url: "/business/users/actions"
        },
        {
          id: "business-users-results",
          title: "Results",
          url: "/business/users/results"
        }
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
        {
          id: "business-admin-current",
          title: "Current",
          url: "/business/admin/current"
        },
        {
          id: "business-admin-desired",
          title: "Desired",
          url: "/business/admin/desired"
        },
        {
          id: "business-admin-actions",
          title: "Actions",
          url: "/business/admin/actions"
        },
        {
          id: "business-admin-results",
          title: "Results",
          url: "/business/admin/results"
        }
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
        {
          id: "business-profit-current",
          title: "Current",
          url: "/business/profit/current"
        },
        {
          id: "business-profit-desired",
          title: "Desired",
          url: "/business/profit/desired"
        },
        {
          id: "business-profit-actions",
          title: "Actions",
          url: "/business/profit/actions"
        },
        {
          id: "business-profit-results",
          title: "Results",
          url: "/business/profit/results"
        }
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
      isDashboard: true
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
      isDashboard: true
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
      isDashboard: true
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
      isDashboard: true
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
      isDashboard: true
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
  ],
}

// Helper function to determine active team based on pathname
const getActiveTeamFromPath = (path: string) => {
  // Extract the first segment of the path
  const segment = path.split('/')[1];
  
  // Check if the segment matches any of our main routes
  const mainRoutes = [
    'superachiever', 
    'superachievers', 
    'supercivilization',
    'personal',
    'business',
    'supermind',
    'superpuzzle',
    'superhuman',
    'supersociety',
    'supergenius'
  ];
  
  if (mainRoutes.includes(segment)) {
    return segment;
  }
  
  // Default to superachiever if no match
  return 'superachiever';
};

export function AppSidebar({ 
  activeFocus,
  className,
  ...props 
}: React.ComponentProps<typeof Sidebar> & { 
  activeFocus?: string 
}) {
  const pathname = usePathname();
  const [activeTeamId, setActiveTeamId] = useState(activeFocus || getActiveTeamFromPath(pathname));

  // Update active team when pathname changes
  useEffect(() => {
    if (!activeFocus) {
      const detectedTeam = getActiveTeamFromPath(pathname);
      setActiveTeamId(detectedTeam);
    }
  }, [pathname, activeFocus]);

  // Get filtered menu items based on active team
  const getFilteredMenuItems = () => {
    if (!activeTeamId) return [];
    
    // For main routes, filter by category
    if (['individual', 'collective', 'ecosystem'].includes(activeTeamId)) {
      return avolveData.navMain.filter(item => 
        item.category === 'main' || 
        item.category === activeTeamId
      );
    }
    
    // For sub-routes, filter by their specific category
    return avolveData.navMain.filter(item => item.category === activeTeamId);
  };

  return (
    <Sidebar 
      collapsible="icon" 
      variant="floating" 
      className={cn(
        "border-none shadow-none bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md z-40",
        className
      )}
      {...props}
    >
      <SidebarHeader className="py-2 px-2">
        <div className="flex h-full flex-col gap-2">
          <div className="px-3 py-2">
            <NavSwitcher
              activeTeam={activeTeamId}
              onTeamChange={(teamId) => setActiveTeamId(teamId)}
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain items={getFilteredMenuItems()} />
        <div className="mt-6 border-t pt-4">
          <TokenSidebarDisplay />
        </div>
      </SidebarContent>
      <SidebarFooter className="py-2 px-2">
        <NavUser user={avolveData.user} />
      </SidebarFooter>
      <SidebarRail className="bg-transparent border-none" />
    </Sidebar>
  )
}
