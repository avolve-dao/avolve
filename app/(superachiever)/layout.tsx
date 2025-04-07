import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeProvider } from "@/components/theme-provider"
import { GrokWidget } from "@/components/grok/grok-widget"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { SwipeNavigation } from "@/components/swipe-navigation"
import { headers } from "next/headers"

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
  
  // Get the current path to determine the active team
  const headersList = headers()
  const url = headersList.get("x-url") || ""
  
  // Determine active team based on the URL path
  let activeTeam = "superachiever"
  if (url.includes("/personal")) {
    activeTeam = "personal"
  } else if (url.includes("/business")) {
    activeTeam = "business"
  } else if (url.includes("/supermind")) {
    activeTeam = "supermind"
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppSidebar activeTeam={activeTeam} />
        <SidebarInset className="bg-zinc-50/80 dark:bg-zinc-900/80">
          <AppNavbar />
          
          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Responsive layout wrapper */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
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
              <div className="hidden md:block py-6">
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
    </ThemeProvider>
  )
}
