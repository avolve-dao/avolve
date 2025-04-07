#!/bin/bash

# Define all layout files to update
LAYOUTS=(
  "app/dashboard/layout.tsx"
  "app/(superachiever)/layout.tsx"
  "app/(superachiever)/(personal)/layout.tsx"
  "app/(superachiever)/(business)/layout.tsx"
  "app/(superachiever)/(supermind)/layout.tsx"
  "app/(superachievers)/layout.tsx"
  "app/(superachievers)/(superhuman)/layout.tsx"
  "app/(superachievers)/(supersociety)/layout.tsx"
  "app/(superachievers)/(supergenius)/layout.tsx"
  "app/(supercivilization)/layout.tsx"
)

# Update each layout file
for layout in "${LAYOUTS[@]}"; do
  echo "Updating $layout..."
  
  # Replace SidebarProviderWrapper with SidebarProvider
  sed -i '' -e 's/import { SidebarProviderWrapper } from "@\/components\/sidebar-provider"/import { SidebarProvider, SidebarInset } from "@\/components\/ui\/sidebar"/' "$layout"
  
  # Replace ThemeProvider attributes
  sed -i '' -e 's/<ThemeProvider>/<ThemeProvider attribute="class" defaultTheme="system" enableSystem>/' "$layout"
  
  # Replace the entire layout structure
  cat > "$layout.tmp" << 'EOL'
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

export default async function LAYOUT_NAME({
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppSidebar activeTeam="ACTIVE_TEAM" />
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
EOL

  # Extract the layout name from the file path
  if [[ "$layout" == *"(personal)"* ]]; then
    layout_name="PersonalLayout"
    active_team="personal"
  elif [[ "$layout" == *"(business)"* ]]; then
    layout_name="BusinessLayout"
    active_team="business"
  elif [[ "$layout" == *"(supermind)"* ]]; then
    layout_name="SupermindLayout"
    active_team="supermind"
  elif [[ "$layout" == *"(superhuman)"* ]]; then
    layout_name="SuperhumanLayout"
    active_team="superhuman"
  elif [[ "$layout" == *"(supersociety)"* ]]; then
    layout_name="SupersocietyLayout"
    active_team="supersociety"
  elif [[ "$layout" == *"(supergenius)"* ]]; then
    layout_name="SupergeniusLayout"
    active_team="supergenius"
  elif [[ "$layout" == *"(superachiever)"* && ! "$layout" == *"/(personal)"* && ! "$layout" == *"/(business)"* && ! "$layout" == *"/(supermind)"* ]]; then
    layout_name="SuperachieverLayout"
    active_team="superachiever"
  elif [[ "$layout" == *"(superachievers)"* && ! "$layout" == *"/(superhuman)"* && ! "$layout" == *"/(supersociety)"* && ! "$layout" == *"/(supergenius)"* ]]; then
    layout_name="SuperachieversLayout"
    active_team="superachievers"
  elif [[ "$layout" == *"(supercivilization)"* ]]; then
    layout_name="SupercivilizationLayout"
    active_team="supercivilization"
  elif [[ "$layout" == *"dashboard"* ]]; then
    layout_name="DashboardLayout"
    active_team="dashboard"
  fi
  
  # Replace placeholders with actual values
  sed -i '' -e "s/LAYOUT_NAME/$layout_name/g" "$layout.tmp"
  sed -i '' -e "s/ACTIVE_TEAM/$active_team/g" "$layout.tmp"
  
  # Replace the original file with the temporary file
  mv "$layout.tmp" "$layout"
done

echo "All layouts updated successfully!"
