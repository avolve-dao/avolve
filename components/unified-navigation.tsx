"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Wallet, MessageSquare, User, Trophy, Sparkles, Menu, X, Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { TourButton } from "@/components/tour/tour-button"
import { cn } from "@/lib/utils"
import { useUser } from "@/contexts/user-context"
import { ROUTES } from "@/constants"
import { LogoutButton } from "@/components/logout-button"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number | null
  highlight?: boolean
  dataTour?: string
}

export function UnifiedNavigation() {
  const pathname = usePathname()
  const { user, profile } = useUser()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock notification count - in a real app, this would come from a database query
  useEffect(() => {
    if (user) {
      setNotificationCount(3)
    }
  }, [user])

  // Update the useEffect hook to close the menu when pathname changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }, [pathname])

  if (!mounted) return null

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: ROUTES.DASHBOARD,
      icon: <Home className="h-5 w-5" />,
    },
    {
      label: "Challenges",
      href: "/challenges",
      icon: <Trophy className="h-5 w-5" />,
      dataTour: "challenges-nav",
    },
    {
      label: "Wallet",
      href: ROUTES.WALLET,
      icon: <Wallet className="h-5 w-5" />,
      badge: profile?.gen_tokens || null,
      dataTour: "gen-tokens",
    },
    {
      label: "Messages",
      href: ROUTES.MESSAGES,
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 2, // Mock unread message count
    },
    {
      label: "Genie AI",
      href: ROUTES.GENIE_AI,
      icon: <Sparkles className="h-5 w-5" />,
      highlight: true,
      dataTour: "genie-ai",
    },
    {
      label: "Profile",
      href: ROUTES.PROFILE,
      icon: <User className="h-5 w-5" />,
      dataTour: "genius-id",
    },
  ]

  // Filter out admin routes for non-admin users
  const filteredNavItems = navItems.filter((item) => {
    if (item.href === ROUTES.ADMIN && profile?.role !== "admin") {
      return false
    }
    return true
  })

  return (
    <>
      {/* Desktop Navigation */}
      <div
        className="hidden md:flex h-screen flex-col fixed left-0 top-0 w-64 bg-background border-r p-4"
        data-tour="main-navigation"
      >
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Avolve</span>
        </div>

        <nav className="flex-1 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.dataTour}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground",
                item.highlight && "text-primary",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== null && (
                <Badge variant="outline" className="ml-auto bg-primary/10 text-primary">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-4 border-t mt-4">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
            <TourButton />
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                {notificationCount && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </Link>
            </Button>
          </div>

          {user && (
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{user.email?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile?.full_name || user.email}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.username || user.email}</p>
              </div>
              <LogoutButton variant="ghost" size="icon">
                <LogOut className="h-4 w-4" />
              </LogoutButton>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-bold">Avolve</span>
        </div>

        <div className="flex items-center gap-2">
          <TourButton />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              {notificationCount && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </Link>
          </Button>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl">Avolve</span>
                  </div>

                  {user && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>{user.email?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{profile?.full_name || user.email}</p>
                        <p className="text-sm text-muted-foreground truncate">{profile?.username || user.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto" data-tour="main-navigation-mobile">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-tour={item.dataTour}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors",
                        pathname === item.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground",
                        item.highlight && "text-primary",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge !== null && (
                        <Badge variant="outline" className="ml-auto bg-primary/10 text-primary">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>

                <div className="p-4 border-t mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <ThemeToggle />
                    <LogoutButton>Sign Out</LogoutButton>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Content padding for mobile */}
      <div className="md:hidden h-14"></div>

      {/* Content padding for desktop */}
      <div className="hidden md:block ml-64"></div>
    </>
  )
}
