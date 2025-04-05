import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppNavbar } from "@/components/app-navbar"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeProvider } from "@/components/theme-provider"
import { GrokWidget } from "@/components/grok/grok-widget"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProviderWrapper } from "@/components/sidebar-provider"

export default async function PersonalLayout({
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
      <SidebarProviderWrapper defaultCollapsed={false}>
        <div className="flex min-h-screen flex-col md:flex-row">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden md:block h-screen sticky top-0">
            <AppSidebar className="h-full" activeTeam="personal" />
          </div>

          <div className="flex flex-col flex-1">
            {/* Desktop Header - Only shown on desktop */}
            <div className="sticky top-0 z-50 w-full">
              <AppNavbar />
            </div>

            {/* Main Content */}
            <main className="flex-1 pb-16 md:pb-0">{children}</main>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>

          {/* Grok Widget - Available on all dashboard pages */}
          <GrokWidget userId={data.user.id} />
        </div>
      </SidebarProviderWrapper>
    </ThemeProvider>
  )
}
