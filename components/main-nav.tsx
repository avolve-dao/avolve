"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getCriticalNavItems, isRouteActive } from "@/lib/navigation"
import { Badge } from "@/components/ui/badge"

export function MainNav() {
  const pathname = usePathname()
  // Only show critical navigation items in the top nav
  const navItems = getCriticalNavItems()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => {
        const isActive = isRouteActive(pathname, item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5 mr-2" />
            <span className="hidden md:inline">{item.title}</span>
            {item.badge && (
              <Badge variant="default" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

