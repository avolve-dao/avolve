import * as React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Suspense } from "react"
import LoadingSpinner from "@/components/ui/loading-spinner"

function RouteLoadingSpinner() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
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
        <Sidebar>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<RouteLoadingSpinner />}>
                {children}
              </Suspense>
            </main>
          </div>
        </Sidebar>
      </SidebarProvider>
    </ThemeProvider>
  )
}
