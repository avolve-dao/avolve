import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "@/components/mobile-nav"
import { GrokWidget } from "@/components/grok/grok-widget"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
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
    <SidebarProvider>
      <AppSidebar activeTeam="dashboard" />
      <SidebarInset className="bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <AppNavbar />
        
        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Responsive layout wrapper */}
          <div className="w-full">
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
        </div>
        
        {/* Mobile Navigation - Only shown on mobile */}
        <div className="md:hidden">
          <MobileNav />
        </div>
        
        {/* Grok Widget - Available on all dashboard pages */}
        <GrokWidget userId={data.user.id} />
      </SidebarInset>
    </SidebarProvider>
  )
}
