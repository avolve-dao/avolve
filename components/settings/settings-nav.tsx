"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Settings, 
  UserCircle,
  Key
} from "lucide-react"

interface SettingsNavProps extends React.HTMLAttributes<HTMLElement> {}

/**
 * Settings Navigation Component
 * 
 * Provides navigation links for the settings section of the application.
 * Highlights the current active section based on the URL path.
 */
export function SettingsNav({ className, ...props }: SettingsNavProps) {
  const pathname = usePathname()
  
  const navItems = [
    {
      title: "Profile",
      href: "/settings/profile",
      icon: <UserCircle className="mr-2 h-4 w-4" />,
    },
    {
      title: "Account",
      href: "/settings/account",
      icon: <User className="mr-2 h-4 w-4" />,
    },
    {
      title: "Security",
      href: "/settings/security",
      icon: <Shield className="mr-2 h-4 w-4" />,
    },
    {
      title: "API Keys",
      href: "/settings/api-keys",
      icon: <Key className="mr-2 h-4 w-4" />,
    },
    {
      title: "Notifications",
      href: "/settings/notifications",
      icon: <Bell className="mr-2 h-4 w-4" />,
    },
    {
      title: "Billing",
      href: "/settings/billing",
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Preferences",
      href: "/settings/preferences",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]
  
  return (
    <nav className={cn("flex flex-col space-y-1", className)} {...props}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.icon}
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
