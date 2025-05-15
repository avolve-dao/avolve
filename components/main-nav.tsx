"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { ROUTES } from "@/constants"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  const routes = [
    {
      href: ROUTES.DASHBOARD,
      label: "Dashboard",
      active: pathname === ROUTES.DASHBOARD,
    },
    {
      href: "/challenges",
      label: "Value Challenges",
      active: pathname === "/challenges",
    },
    {
      href: ROUTES.GENIE_AI,
      label: "Genie AI",
      active: pathname === ROUTES.GENIE_AI,
    },
    {
      href: ROUTES.WALLET,
      label: "GEN Wallet",
      active: pathname === ROUTES.WALLET,
    },
    {
      href: "/pricing",
      label: "Upgrade",
      active: pathname === "/pricing",
      highlight: true,
    },
  ]

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active ? "text-primary" : "text-muted-foreground",
            route.highlight && "text-green-600 dark:text-green-400 font-semibold",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
