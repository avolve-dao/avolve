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
  label: string;
  href: string;
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
      label: "Dashboard",
      href: "/superachiever",
      category: "main",
      gradientClass: "from-stone-500 to-stone-700",
      isDashboard: true
    },
    // Personal Success Puzzle (Amber-Yellow gradient)
    {
      id: "personal-success-puzzle",
      title: "Personal Success Puzzle",
      label: "Personal Success Puzzle",
      href: "/personal",
      category: "superachiever",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        {
          id: "personal-health-link",
          title: "Health & Energy",
          label: "Health & Energy",
          href: "/personal/health"
        },
        {
          id: "personal-wealth-link",
          title: "Wealth & Career",
          label: "Wealth & Career",
          href: "/personal/wealth"
        },
        {
          id: "personal-peace-link",
          title: "Peace & People",
          label: "Peace & People",
          href: "/personal/peace"
        }
      ]
    },
    // Business Success Puzzle (Teal-Cyan gradient)
    {
      id: "business-success-puzzle",
      title: "Business Success Puzzle",
      label: "Business Success Puzzle",
      href: "/business",
      category: "superachiever",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        {
          id: "business-users-link",
          title: "Front-Stage Users",
          label: "Front-Stage Users",
          href: "/business/users"
        },
        {
          id: "business-admin-link",
          title: "Back-Stage Admin",
          label: "Back-Stage Admin",
          href: "/business/admin"
        },
        {
          id: "business-profit-link",
          title: "Bottom-Line Profit",
          label: "Bottom-Line Profit",
          href: "/business/profit"
        }
      ]
    },
    // Supermind Superpowers (Violet-Purple-Fuchsia-Pink gradient)
    {
      id: "supermind-superpowers",
      title: "Supermind Superpowers",
      label: "Supermind Superpowers",
      href: "/supermind",
      category: "superachiever",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
      items: [
        {
          id: "supermind-current-link",
          title: "Current → Desired",
          label: "Current → Desired",
          href: "/supermind/desired"
        },
        {
          id: "supermind-desired-link",
          title: "Desired → Actions",
          label: "Desired → Actions",
          href: "/supermind/actions"
        },
        {
          id: "supermind-actions-link",
          title: "Actions → Results",
          label: "Actions → Results",
          href: "/supermind/results"
        }
      ]
    },
    
    // Superachievers - Collective journey (Slate gradient)
    {
      id: "superachievers",
      title: "Dashboard",
      label: "Dashboard",
      href: "/superachievers",
      category: "main",
      gradientClass: "from-slate-500 to-slate-700",
      isDashboard: true
    },
    // Superpuzzle Developments
    {
      id: "superpuzzle-developments",
      title: "Superpuzzle Developments",
      label: "Superpuzzle Developments",
      href: "/superpuzzle",
      category: "superachievers",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
      items: [
        {
          id: "superpuzzle-individuals-link",
          title: "Enhanced Individuals",
          label: "Enhanced Individuals",
          href: "/superpuzzle/individuals"
        },
        {
          id: "superpuzzle-collectives-link",
          title: "Advanced Collectives",
          label: "Advanced Collectives",
          href: "/superpuzzle/collectives"
        },
        {
          id: "superpuzzle-ecosystems-link",
          title: "Balanced Ecosystems",
          label: "Balanced Ecosystems",
          href: "/superpuzzle/ecosystem"
        }
      ]
    },
    // Superhuman Enhancements (Rose-Red-Orange gradient)
    {
      id: "superhuman-enhancements",
      title: "Superhuman Enhancements",
      label: "Superhuman Enhancements",
      href: "/superhuman",
      category: "superachievers",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
      items: [
        {
          id: "superhuman-academy-link",
          title: "Academy",
          label: "Academy",
          href: "/superhuman/academy"
        },
        {
          id: "superhuman-university-link",
          title: "University",
          label: "University",
          href: "/superhuman/university"
        },
        {
          id: "superhuman-institute-link",
          title: "Institute",
          label: "Institute",
          href: "/superhuman/institute"
        }
      ]
    },
    // Supersociety Advancements (Lime-Green-Emerald gradient)
    {
      id: "supersociety-advancements",
      title: "Supersociety Advancements",
      label: "Supersociety Advancements",
      href: "/supersociety",
      category: "superachievers",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
      items: [
        {
          id: "supersociety-company-link",
          title: "Company",
          label: "Company",
          href: "/supersociety/company"
        },
        {
          id: "supersociety-community-link",
          title: "Community",
          label: "Community",
          href: "/supersociety/community"
        },
        {
          id: "supersociety-country-link",
          title: "Country",
          label: "Country",
          href: "/supersociety/country"
        }
      ]
    },
    // Supergenius Breakthroughs (Sky-Blue-Indigo gradient)
    {
      id: "supergenius-breakthroughs",
      title: "Supergenius Breakthroughs",
      label: "Supergenius Breakthroughs",
      href: "/supergenius",
      category: "superachievers",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
      items: [
        {
          id: "supergenius-ventures-link",
          title: "Ventures",
          label: "Ventures",
          href: "/supergenius/ventures"
        },
        {
          id: "supergenius-enterprises-link",
          title: "Enterprises",
          label: "Enterprises",
          href: "/supergenius/enterprises"
        },
        {
          id: "supergenius-industries-link",
          title: "Industries",
          label: "Industries",
          href: "/supergenius/industries"
        }
      ]
    },
    
    // Supercivilization - Ecosystem journey (Zinc gradient)
    {
      id: "supercivilization",
      title: "Dashboard",
      label: "Dashboard",
      href: "/supercivilization",
      category: "main",
      gradientClass: "from-zinc-500 to-zinc-700",
      isDashboard: true
    },
    // Avolve from Degen to Regen
    {
      id: "avolve-degen-regen",
      title: "Avolve from Degen to Regen",
      label: "Avolve from Degen to Regen",
      href: "/avolve",
      category: "supercivilization",
      gradientClass: "from-zinc-500 to-zinc-700",
      items: [
        {
          id: "avolve-avolve-link",
          title: "Avolve",
          label: "Avolve",
          href: "/avolve/avolve"
        },
        {
          id: "avolve-avalue-link",
          title: "Avalue",
          label: "Avalue",
          href: "/avolve/avalue"
        },
        {
          id: "avolve-avault-link",
          title: "Avault",
          label: "Avault",
          href: "/avolve/avault"
        },
        {
          id: "avolve-avoice-link",
          title: "Avoice",
          label: "Avoice",
          href: "/avolve/avoice"
        },
      ]
    },
    // Create Your Success Puzzle
    {
      id: "create-success-puzzle",
      title: "Create Your Success Puzzle",
      label: "Create Your Success Puzzle",
      href: "/create-success",
      category: "supercivilization",
      gradientClass: "from-stone-500 to-stone-700",
      items: [
        {
          id: "create-success-playbook-link",
          title: "Superachiever Playbook",
          label: "Superachiever Playbook",
          href: "/create-success/playbook"
        },
        {
          id: "create-success-personal-link",
          title: "Personal Success Puzzle",
          label: "Personal Success Puzzle",
          href: "/create-success/personal"
        },
        {
          id: "create-success-business-link",
          title: "Business Success Puzzle",
          label: "Business Success Puzzle",
          href: "/create-success/business"
        },
        {
          id: "create-success-supermind-link",
          title: "Supermind Superpowers",
          label: "Supermind Superpowers",
          href: "/create-success/supermind"
        },
      ]
    },
    // Co-Create Our Superpuzzle
    {
      id: "co-create-superpuzzle",
      title: "Co-Create Our Superpuzzle",
      label: "Co-Create Our Superpuzzle",
      href: "/co-create",
      category: "supercivilization",
      gradientClass: "from-slate-500 to-slate-700",
      items: [
        {
          id: "co-create-quests-link",
          title: "Supercivilization Quests",
          label: "Supercivilization Quests",
          href: "/co-create/quests"
        },
        {
          id: "co-create-superpuzzle-link",
          title: "Superpuzzle Developments",
          label: "Superpuzzle Developments",
          href: "/co-create/superpuzzle"
        },
        {
          id: "co-create-superhuman-link",
          title: "Superhuman Enhancements",
          label: "Superhuman Enhancements",
          href: "/co-create/superhuman"
        },
        {
          id: "co-create-supersociety-link",
          title: "Supersociety Advancements",
          label: "Supersociety Advancements",
          href: "/co-create/supersociety"
        },
        {
          id: "co-create-supergenius-link",
          title: "Supergenius Breakthroughs",
          label: "Supergenius Breakthroughs",
          href: "/co-create/supergenius"
        },
      ]
    },
    
    // Personal Dashboard and sections
    {
      id: "personal-dashboard",
      title: "Dashboard",
      label: "Dashboard",
      href: "/personal",
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      isDashboard: true
    },
    {
      id: "personal-health",
      title: "Health & Energy",
      label: "Health & Energy",
      href: "/personal/health",
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        {
          id: "personal-health-current",
          title: "Current",
          label: "Current",
          href: "/personal/health/current"
        },
        {
          id: "personal-health-desired",
          title: "Desired",
          label: "Desired",
          href: "/personal/health/desired"
        },
        {
          id: "personal-health-actions",
          title: "Actions",
          label: "Actions",
          href: "/personal/health/actions"
        },
        {
          id: "personal-health-results",
          title: "Results",
          label: "Results",
          href: "/personal/health/results"
        }
      ]
    },
    {
      id: "personal-wealth",
      title: "Wealth & Career",
      label: "Wealth & Career",
      href: "/personal/wealth",
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        {
          id: "personal-wealth-current",
          title: "Current",
          label: "Current",
          href: "/personal/wealth/current"
        },
        {
          id: "personal-wealth-desired",
          title: "Desired",
          label: "Desired",
          href: "/personal/wealth/desired"
        },
        {
          id: "personal-wealth-actions",
          title: "Actions",
          label: "Actions",
          href: "/personal/wealth/actions"
        },
        {
          id: "personal-wealth-results",
          title: "Results",
          label: "Results",
          href: "/personal/wealth/results"
        }
      ]
    },
    {
      id: "personal-peace",
      title: "Peace & People",
      label: "Peace & People",
      href: "/personal/peace",
      category: "personal",
      gradientClass: "from-amber-500 to-yellow-500",
      items: [
        {
          id: "personal-peace-current",
          title: "Current",
          label: "Current",
          href: "/personal/peace/current"
        },
        {
          id: "personal-peace-desired",
          title: "Desired",
          label: "Desired",
          href: "/personal/peace/desired"
        },
        {
          id: "personal-peace-actions",
          title: "Actions",
          label: "Actions",
          href: "/personal/peace/actions"
        },
        {
          id: "personal-peace-results",
          title: "Results",
          label: "Results",
          href: "/personal/peace/results"
        }
      ]
    },
    
    // Business Dashboard and sections
    {
      id: "business-dashboard",
      title: "Dashboard",
      label: "Dashboard",
      href: "/business",
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      isDashboard: true
    },
    {
      id: "business-users",
      title: "Front-Stage Users",
      label: "Front-Stage Users",
      href: "/business/users",
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        {
          id: "business-users-current",
          title: "Current",
          label: "Current",
          href: "/business/users/current"
        },
        {
          id: "business-users-desired",
          title: "Desired",
          label: "Desired",
          href: "/business/users/desired"
        },
        {
          id: "business-users-actions",
          title: "Actions",
          label: "Actions",
          href: "/business/users/actions"
        },
        {
          id: "business-users-results",
          title: "Results",
          label: "Results",
          href: "/business/users/results"
        }
      ]
    },
    {
      id: "business-admin",
      title: "Back-Stage Admin",
      label: "Back-Stage Admin",
      href: "/business/admin",
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        {
          id: "business-admin-current",
          title: "Current",
          label: "Current",
          href: "/business/admin/current"
        },
        {
          id: "business-admin-desired",
          title: "Desired",
          label: "Desired",
          href: "/business/admin/desired"
        },
        {
          id: "business-admin-actions",
          title: "Actions",
          label: "Actions",
          href: "/business/admin/actions"
        },
        {
          id: "business-admin-results",
          title: "Results",
          label: "Results",
          href: "/business/admin/results"
        }
      ]
    },
    {
      id: "business-profit",
      title: "Bottom-Line Profit",
      label: "Bottom-Line Profit",
      href: "/business/profit",
      category: "business",
      gradientClass: "from-teal-500 to-cyan-500",
      items: [
        {
          id: "business-profit-current",
          title: "Current",
          label: "Current",
          href: "/business/profit/current"
        },
        {
          id: "business-profit-desired",
          title: "Desired",
          label: "Desired",
          href: "/business/profit/desired"
        },
        {
          id: "business-profit-actions",
          title: "Actions",
          label: "Actions",
          href: "/business/profit/actions"
        },
        {
          id: "business-profit-results",
          title: "Results",
          label: "Results",
          href: "/business/profit/results"
        }
      ]
    },
    
    // Supermind Dashboard and sections
    {
      id: "supermind-dashboard",
      title: "Dashboard",
      label: "Dashboard",
      href: "/supermind",
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
      isDashboard: true
    },
    {
      id: "supermind-desired",
      title: "Current → Desired",
      label: "Current → Desired",
      href: "/supermind/desired",
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    {
      id: "supermind-actions",
      title: "Desired → Actions",
      label: "Desired → Actions",
      href: "/supermind/actions",
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    {
      id: "supermind-results",
      title: "Actions → Results",
      label: "Actions → Results",
      href: "/supermind/results",
      category: "supermind",
      gradientClass: "from-violet-500 via-purple-500 to-fuchsia-500",
    },
    
    // Superpuzzle Dashboard and sections
    {
      id: "superpuzzle-dashboard",
      title: "Dashboard",
      label: "Dashboard",
      href: "/superpuzzle",
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
      isDashboard: true
    },
    {
      id: "superpuzzle-individuals",
      title: "Enhanced Individuals",
      label: "Enhanced Individuals",
      href: "/superpuzzle/individuals",
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
    {
      id: "superpuzzle-collectives",
      title: "Advanced Collectives",
      label: "Advanced Collectives",
      href: "/superpuzzle/collectives",
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
    {
      id: "superpuzzle-ecosystem",
      title: "Balanced Ecosystems",
      label: "Balanced Ecosystems",
      href: "/superpuzzle/ecosystem",
      category: "superpuzzle",
      gradientClass: "from-red-500 via-green-500 to-blue-500",
    },
    
    // Superhuman Dashboard and sections
    {
      id: "superhuman-dashboard",
      title: "Dashboard",
      label: "Dashboard",
      href: "/superhuman",
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
      isDashboard: true
    },
    {
      id: "superhuman-academy",
      title: "Academy",
      label: "Academy",
      href: "/superhuman/academy",
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
    },
    {
      id: "superhuman-university",
      title: "University",
      label: "University",
      href: "/superhuman/university",
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
    },
    {
      id: "superhuman-institute",
      title: "Institute",
      label: "Institute",
      href: "/superhuman/institute",
      category: "superhuman",
      gradientClass: "from-rose-500 via-red-500 to-orange-500",
    },
    
    // Supersociety Dashboard and sections
    {
      id: "supersociety-dashboard",
      title: "Dashboard",
      label: "Dashboard",
      href: "/supersociety",
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
      isDashboard: true
    },
    {
      id: "supersociety-company",
      title: "Company",
      label: "Company",
      href: "/supersociety/company",
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
    },
    {
      id: "supersociety-community",
      title: "Community",
      label: "Community",
      href: "/supersociety/community",
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
    },
    {
      id: "supersociety-country",
      title: "Country",
      label: "Country",
      href: "/supersociety/country",
      category: "supersociety",
      gradientClass: "from-lime-500 via-green-500 to-emerald-500",
    },
    
    // Supergenius Dashboard and sections
    {
      id: "supergenius-dashboard",
      title: "Dashboard",
      label: "Dashboard",
      href: "/supergenius",
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
      isDashboard: true
    },
    {
      id: "supergenius-ventures",
      title: "Ventures",
      label: "Ventures",
      href: "/supergenius/ventures",
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
    },
    {
      id: "supergenius-enterprises",
      title: "Enterprises",
      label: "Enterprises",
      href: "/supergenius/enterprises",
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
    },
    {
      id: "supergenius-industries",
      title: "Industries",
      label: "Industries",
      href: "/supergenius/industries",
      category: "supergenius",
      gradientClass: "from-sky-500 via-blue-500 to-indigo-500",
    },
  ]
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
