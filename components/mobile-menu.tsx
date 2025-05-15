"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/constants"
import { useUser } from "@/contexts/user-context"

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile } = useUser()

  const isAdmin = profile?.role === "admin"

  const navItems: NavItem[] = [
    { label: "Dashboard", href: ROUTES.DASHBOARD },
    { label: "Wallet", href: ROUTES.WALLET },
    { label: "Genie AI", href: ROUTES.GENIE_AI },
    { label: "Messages", href: ROUTES.MESSAGES },
    { label: "Chat", href: ROUTES.CHAT },
    { label: "Profile", href: ROUTES.PROFILE },
  ]

  if (isAdmin) {
    navItems.push({ label: "Admin", href: ROUTES.ADMIN })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <nav className="flex flex-col gap-4 mt-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md text-sm transition-colors",
                pathname === item.href ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
