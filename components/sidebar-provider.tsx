"use client"

import * as React from "react"
import { SidebarProvider as OriginalSidebarProvider } from "@/components/ui/sidebar"

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProviderWrapper({ children, defaultCollapsed = false }: SidebarProviderProps) {
  return (
    <OriginalSidebarProvider
      defaultOpen={!defaultCollapsed}
      // Add any additional configuration here
      style={
        {
          "--sidebar-background": "var(--sidebar-background)",
          "--sidebar-foreground": "var(--sidebar-foreground)",
          "--sidebar-border": "var(--sidebar-border)",
          "--sidebar-primary": "var(--sidebar-primary)",
          "--sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
          "--sidebar-accent": "var(--sidebar-accent)",
          "--sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
          "--sidebar-ring": "var(--sidebar-ring)",
        } as React.CSSProperties
      }
    >
      {children}
    </OriginalSidebarProvider>
  )
}
