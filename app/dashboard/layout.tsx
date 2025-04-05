import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { GrokWidget } from "@/components/grok/grok-widget"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"
import { SidebarProviderWrapper } from "@/components/sidebar-provider"
import { SwipeNavigation } from "@/components/swipe-navigation"

export default async function DashboardLayout({
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
          {/* Sidebar - Hidden on mobile, collapsible on tablet and desktop */}
          <div className="hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out">
            <AppSidebar className="h-full" />
          </div>

          <div className="flex flex-col flex-1">
            {/* Desktop Header - Only shown on desktop */}
            <div className="sticky top-0 z-50 w-full">
              <AppNavbar />
            </div>

            {/* Main Content with adaptive padding based on screen size */}
            <main className="flex-1 pb-16 md:pb-0 px-4 sm:px-6 lg:px-8 transition-all duration-300">
            {/* Responsive layout wrapper */}
            <div className="max-w-7xl mx-auto">
              {/* Swipe gesture area for mobile */}
              <div className="md:hidden">
                <SwipeNavigation
                  routes={[
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/personal", label: "Personal Success" },
                    { path: "/business", label: "Business Success" },
                    { path: "/supermind", label: "Supermind Powers" },
                    { path: "/superachiever", label: "Superachiever" },
                    { path: "/superachievers", label: "Superachievers" }
                  ]}
                >
                  {children}
                </SwipeNavigation>
              </div>
              
              {/* Regular content for desktop */}
              <div className="hidden md:block">
                {children}
              </div>
            </div>
          </main>

          {/* Mobile Navigation - Only shown on mobile */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>

      {/* Grok Widget - Available on all dashboard pages */}
      <GrokWidget userId={data.user.id} />
    </SidebarProviderWrapper>
  </ThemeProvider>
  )
}
