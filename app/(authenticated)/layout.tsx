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
import { Suspense } from "react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import type { User } from "@supabase/supabase-js"

// Define the navigation routes with modern structure
const navigationRoutes = [
  {
    path: "/super/personal",
    label: "Personal Growth",
    description: "Focus on your individual development journey",
  },
  {
    path: "/super/business",
    label: "Business",
    description: "Enhance your professional capabilities",
  },
  {
    path: "/super/mind",
    label: "Mind",
    description: "Unlock your cognitive potential",
  },
  {
    path: "/super/puzzle",
    label: "Puzzle",
    description: "Solve complex challenges",
  },
  {
    path: "/super/human",
    label: "Human",
    description: "Reach peak human potential",
  },
  {
    path: "/super/society",
    label: "Society",
    description: "Build meaningful connections",
  },
  {
    path: "/super/genius",
    label: "Genius",
    description: "Access collective intelligence",
  },
  {
    path: "/super/civilization",
    label: "Civilization",
    description: "Create global impact",
  },
]

// Loading component for route transitions
function RouteLoadingSpinner() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

interface AppNavbarProps {
  user: User;
}

interface MobileNavProps {
  routes: typeof navigationRoutes;
}

interface SwipeNavigationProps {
  routes: typeof navigationRoutes;
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/signin?error=invalid-token")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>

          {/* Main Content Area */}
          <SidebarInset className="flex flex-1 flex-col bg-zinc-50/80 dark:bg-zinc-900/80">
            {/* Top Navigation */}
            <AppNavbar user={user as User} />
            
            {/* Main Content with Suspense Boundary */}
            <main className="flex-1">
              <div className="container mx-auto px-4 py-8">
                {/* Mobile Swipe Navigation */}
                <div className="md:hidden">
                  <SwipeNavigation routes={navigationRoutes}>
                    <Suspense fallback={<RouteLoadingSpinner />}>
                      {children}
                    </Suspense>
                  </SwipeNavigation>
                </div>
                
                {/* Desktop Content */}
                <div className="hidden md:block">
                  <Suspense fallback={<RouteLoadingSpinner />}>
                    {children}
                  </Suspense>
                </div>
              </div>
            </main>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <MobileNav routes={navigationRoutes} />
            </div>

            {/* Grok Widget - Available globally */}
            <GrokWidget userId={user.id} />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
