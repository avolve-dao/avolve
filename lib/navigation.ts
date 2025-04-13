import {
  Home,
  Bell,
  Mail,
  User,
  Activity,
  Bot,
  Users,
  Compass,
  PlusSquare,
  Settings,
  HelpCircle,
  BookOpen,
  Brain,
  Building2,
  Puzzle,
  UserCircle,
  Users2,
  Globe2,
  Sparkles,
  Lightbulb
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  isExternal?: boolean
  badge?: string | number
  priority: "critical" | "high" | "medium" | "low" // Usage frequency
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

// Super routes for main navigation areas
export const superRoutes = [
  {
    path: "/super/personal",
    label: "Personal Growth",
    description: "Focus on your individual development journey",
    icon: UserCircle,
  },
  {
    path: "/super/business",
    label: "Business",
    description: "Enhance your professional capabilities",
    icon: Building2,
  },
  {
    path: "/super/mind",
    label: "Mind",
    description: "Unlock your cognitive potential",
    icon: Brain,
  },
  {
    path: "/super/puzzle",
    label: "Puzzle",
    description: "Solve complex challenges",
    icon: Puzzle,
  },
  {
    path: "/super/human",
    label: "Human",
    description: "Reach peak human potential",
    icon: User,
  },
  {
    path: "/super/society",
    label: "Society",
    description: "Build meaningful connections",
    icon: Users2,
  },
  {
    path: "/super/genius",
    label: "Genius",
    description: "Access collective intelligence",
    icon: Lightbulb,
  },
  {
    path: "/super/civilization",
    label: "Civilization",
    description: "Create global impact",
    icon: Globe2,
  },
] as const

// Navigation items organized by actual user needs and frequency
export const navigationItems: NavItem[] = [
  // Critical path items (used multiple times daily)
  {
    title: "Home",
    href: "/dashboard",
    icon: Home,
    priority: "critical",
  },
  {
    title: "Create",
    href: "/dashboard/create",
    icon: PlusSquare,
    priority: "critical",
  },
  {
    title: "Messages",
    href: "/messages",
    icon: Mail,
    priority: "critical",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: 3,
    priority: "critical",
  },

  // High frequency items (used daily)
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    priority: "high",
  },
  {
    title: "Discover",
    href: "/dashboard/discover",
    icon: Compass,
    priority: "high",
  },

  // Medium frequency items (used weekly)
  {
    title: "Activity",
    href: "/dashboard/activity",
    icon: Activity,
    priority: "medium",
  },
  {
    title: "Grok AI",
    href: "/dashboard/grok",
    icon: Bot,
    priority: "medium",
  },
  {
    title: "Friends",
    href: "/dashboard/friends",
    icon: Users,
    priority: "medium",
  },

  // Low frequency items (used occasionally)
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    priority: "low",
  },
  {
    title: "Help Center",
    href: "/help",
    icon: HelpCircle,
    priority: "low",
  },
  {
    title: "Documentation",
    href: "https://docs.example.com",
    icon: BookOpen,
    isExternal: true,
    priority: "low",
  },
]

// Helper functions to get navigation items by priority
export function getCriticalNavItems(): NavItem[] {
  return navigationItems.filter((item) => item.priority === "critical")
}

export function getHighPriorityNavItems(): NavItem[] {
  return navigationItems.filter((item) => item.priority === "high")
}

export function getMediumPriorityNavItems(): NavItem[] {
  return navigationItems.filter((item) => item.priority === "medium")
}

export function getLowPriorityNavItems(): NavItem[] {
  return navigationItems.filter((item) => item.priority === "low")
}

// Mobile navigation - focus on critical path only
export const mobileNavItems: NavItem[] = [
  ...getCriticalNavItems(),
  // Add profile as the 5th item since it's important for user context
  navigationItems.find((item) => item.title === "Profile")!,
]

// Function to check if a route is active
export function isRouteActive(currentPath: string, href: string): boolean {
  if (href === "/dashboard" && currentPath === "/dashboard") {
    return true
  }

  if (href !== "/dashboard" && currentPath.startsWith(href)) {
    return true
  }

  return false
}
