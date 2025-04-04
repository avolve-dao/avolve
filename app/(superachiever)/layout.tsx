import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { GrokWidget } from "@/components/grok/grok-widget"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProviderWrapper } from "@/components/sidebar-provider"

export default async function SuperachieverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block h-screen sticky top-0">
          <SidebarProviderWrapper defaultCollapsed={false}>
            <AppSidebar className="h-full" activeTeam="superachiever" />
          </SidebarProviderWrapper>
        </div>

        <div className="flex flex-col flex-1">
          {/* Desktop Header - Only shown on desktop */}
          <header className="hidden md:flex sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <MainNav />
              <div className="ml-auto flex items-center space-x-4">
                <ThemeToggle />
                <UserNav user={data.user} />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-16 md:pb-0">{children}</main>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>

        {/* Grok Widget - Available on all dashboard pages */}
        <GrokWidget userId={data.user.id} />
      </div>
    </ThemeProvider>
  )
}

