"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Wallet, MessageSquare, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/constants"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: ROUTES.DASHBOARD,
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: "Wallet",
      href: ROUTES.WALLET,
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      label: "Genie",
      href: ROUTES.GENIE_AI,
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      label: "Messages",
      href: ROUTES.MESSAGES,
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      label: "Profile",
      href: ROUTES.PROFILE,
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className={cn("flex items-center justify-center", isActive && "animate-pulse")}>{item.icon}</div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
