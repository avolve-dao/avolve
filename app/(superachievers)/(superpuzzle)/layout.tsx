import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "@/components/mobile-nav"
import { GrokWidget } from "@/components/grok/grok-widget"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProviderWrapper } from "@/components/sidebar-provider"

export default async function SuperpuzzleLayout({
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
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block h-screen sticky top-0">
        <SidebarProviderWrapper defaultCollapsed={false}>
          <AppSidebar className="h-full" activeTeam="superpuzzle" />
        </SidebarProviderWrapper>
      </div>

      <div className="flex flex-col flex-1">
        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>

      {/* Grok Widget - Available on all pages */}
      <GrokWidget userId={data.user.id} />
    </div>
  )
}

