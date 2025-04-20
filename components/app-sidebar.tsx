"use client"

import type * as React from "react"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { TokenSidebarDisplay } from "@/components/token/token-sidebar-display"; // Import the TokenSidebarDisplay component
import { cn } from "@/lib/utils"; // Import the cn function
import Link from "next/link"
import {
  ChevronDown,
  ChevronRight,
  Home,
  Award,
  Puzzle,
  Layers,
  Brain,
  Users,
  Rocket,
  Globe,
  Star,
  Key
} from "lucide-react"

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

// Type definitions for navigation items
interface NavItem {
  id: string;
  title: string;
  label: string;
  href: string;
  category?: string;
  gradientClass?: string;
  isDashboard?: boolean;
  items?: NavItem[];
  icon?: React.ReactNode;
}

// Icon mapping for main routes
const mainRouteIcons: Record<string, React.ReactNode> = {
  superachiever: <Home className="w-5 h-5 mr-1" />, // Dashboard
  "personal-success-puzzle": <Award className="w-5 h-5 mr-1" />, // Personal
  "business-success-puzzle": <Layers className="w-5 h-5 mr-1" />, // Business
  "supermind-superpowers": <Brain className="w-5 h-5 mr-1" />, // Supermind
  superachievers: <Users className="w-5 h-5 mr-1" />, // Collective
  "superpuzzle-developments": <Puzzle className="w-5 h-5 mr-1" />,
  "superhuman-enhancements": <Rocket className="w-5 h-5 mr-1" />,
  "supersociety-advancements": <Globe className="w-5 h-5 mr-1" />,
  "supergenius-breakthroughs": <Star className="w-5 h-5 mr-1" />,
  supercivilization: <Key className="w-5 h-5 mr-1" />
}

interface SidebarNavItemProps {
  route: NavItem;
  active: boolean;
  expanded: boolean;
  onExpand: () => void;
  depth?: number;
}

function SidebarNavItem({ route, active, expanded, onExpand, depth = 0 }: SidebarNavItemProps) {
  const hasChildren = Array.isArray(route.items) && route.items.length > 0;
  // Pick icon for main routes
  const icon = depth === 0 && mainRouteIcons[route.id] ? mainRouteIcons[route.id] : null;
  // Keyboard expand/collapse
  function handleKeyDown(e: React.KeyboardEvent) {
    if (hasChildren && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onExpand();
    }
  }
  return (
    <div
      className={cn("flex flex-col group/sidebar-item", depth > 0 && "ml-6 border-l border-muted/30 pl-3")}
      aria-label={route.label}
      aria-current={active ? "page" : undefined}
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      tabIndex={-1}
    >
      <div className="flex items-center group">
        <Link
          href={route.href}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold transition-all w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
            "hover:bg-gradient-to-r hover:from-primary/70 hover:to-primary/90 hover:text-white",
            active ? `bg-gradient-to-r ${route.gradientClass} text-white shadow-lg scale-[1.03]` : "text-zinc-700 dark:text-zinc-200",
            depth === 0 && "transition-transform duration-200 group-hover/sidebar-item:scale-[1.04] group-focus-within/sidebar-item:scale-[1.04]"
          )}
          aria-current={active ? "page" : undefined}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {icon && (
            <span className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover/sidebar-item:scale-110 group-focus-visible/sidebar-item:scale-110")}>{icon}</span>
          )}
          <span className="block w-2 h-8 rounded-full mr-2" style={{ background: `linear-gradient(to bottom, var(--tw-gradient-stops))` }} />
          {route.label}
        </Link>
        {hasChildren && (
          <button
            aria-label={expanded ? `Collapse ${route.label}` : `Expand ${route.label}`}
            className={cn("ml-2 p-1 rounded focus-visible:ring-2 focus-visible:ring-primary/60 transition-colors",
              expanded ? "bg-muted/50" : "hover:bg-muted/40"
            )}
            onClick={onExpand}
            tabIndex={0}
            type="button"
            aria-expanded={expanded}
            aria-controls={`submenu-${route.id}`}
          >
            {expanded ? <ChevronDown className="w-4 h-4 transition-transform duration-150" /> : <ChevronRight className="w-4 h-4 transition-transform duration-150" />}
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mt-1 animate-fade-in" id={`submenu-${route.id}`} role="group">
          {route.items!.map((sub) => (
            <SidebarNavItem
              key={sub.id}
              route={sub}
              active={active && sub.href === route.href}
              expanded={false}
              onExpand={() => {}}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeFocus?: string;
  className?: string;
}

function SidebarOnboarding() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("avolve_sidebar_onboarded")) {
      setShow(true)
    }
  }, [])
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-8 max-w-sm w-full relative animate-fade-in">
        <button
          className="absolute top-2 right-2 p-1 rounded hover:bg-muted/30"
          aria-label="Dismiss onboarding"
          onClick={() => {
            setShow(false)
            localStorage.setItem("avolve_sidebar_onboarded", "1")
          }}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-2">Welcome to Avolve!</h2>
        <p className="mb-4 text-zinc-600 dark:text-zinc-300">Explore the sidebar to navigate through all the main journeys. Tap the menu button on mobile to open the sidebar. Click any route to see its puzzle pieces. Enjoy your journey! 🚀</p>
        <button
          className="w-full mt-2 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90"
          onClick={() => {
            setShow(false)
            localStorage.setItem("avolve_sidebar_onboarded", "1")
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

export function AppSidebar({ 
  activeFocus,
  className,
  ...props 
}: AppSidebarProps) {
  const pathname = usePathname() ?? "";
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Responsive sidebar context
  const sidebar = useSidebar ? useSidebar() : undefined;
  const isMobile = sidebar?.isMobile;

  // Helper: find top-level route for current path
  const findActiveMainRoute = (): NavItem => {
    const seg = pathname.split("/")[1];
    return avolveData.navMain.find((r: NavItem) => r.id === seg || r.href.replace("/","") === seg) || avolveData.navMain[0];
  };
  const activeRoute = findActiveMainRoute();

  // Helper: recursively render nav
  const renderNav = (routes: NavItem[], depth = 0) => (
    routes.map((route) => {
      const isActive = pathname.startsWith(route.href);
      const isExpanded = expanded[route.id] || isActive;
      return (
        <SidebarNavItem
          key={route.id}
          route={route}
          active={isActive}
          expanded={isExpanded}
          onExpand={() => setExpanded(e => ({ ...e, [route.id]: !e[route.id] }))}
          depth={depth}
        />
      );
    })
  );

  // Only show top-level (category main) and their children if active
  const mainRoutes = avolveData.navMain.filter((r: NavItem) => r.category === "main");
  const subRoutes = avolveData.navMain.filter((r: NavItem) => r.category === activeRoute.id);

  return (
    <SidebarProvider>
      <SidebarOnboarding />
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <SidebarTrigger />
        </div>
      )}
      <Sidebar
        collapsible="icon"
        variant="floating"
        className={cn(
          "border-none shadow-none bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md z-40",
          className,
          isMobile ? "fixed top-0 left-0 h-full w-[18rem] transition-transform duration-300 ease-in-out" : ""
        )}
        {...props}
      >
        <SidebarHeader className="py-2 px-2">
          <div className="flex h-full flex-col gap-2">
            <nav className="flex flex-col gap-1">
              {renderNav(mainRoutes)}
              {subRoutes.length > 0 && (
                <div className="mt-2 border-l-2 border-primary/20 pl-3">
                  {renderNav(subRoutes, 1)}
                </div>
              )}
            </nav>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <div className="mt-6 border-t pt-4">
            <TokenSidebarDisplay />
          </div>
        </SidebarContent>
        <SidebarFooter className="py-2 px-2">
          <NavUser user={avolveData.user} />
        </SidebarFooter>
        <SidebarRail className="bg-transparent border-none" />
      </Sidebar>
    </SidebarProvider>
  );
}
