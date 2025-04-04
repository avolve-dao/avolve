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
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar - Hidden on mobile, collapsible on tablet and desktop */}
        <div className="hidden md:block h-screen sticky top-0 transition-all duration-300 ease-in-out">
          <SidebarProviderWrapper defaultCollapsed={false}>
            <AppSidebar className="h-full" />
          </SidebarProviderWrapper>
        </div>

        <div className="flex flex-col flex-1">
          {/* Desktop Header - Only shown on desktop */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <MainNav />
              <div className="ml-auto flex items-center space-x-4">
                <ThemeToggle />
                <UserNav user={data.user} />
              </div>
            </div>
          </header>

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

        {/* Grok Widget - Available on all dashboard pages */}
        <GrokWidget userId={data.user.id} />
      </div>
    </ThemeProvider>
  )
}
