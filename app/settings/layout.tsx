"use client"

import React from "react"
import { SettingsNav } from "@/components/settings/settings-nav"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/protected-route"

interface SettingsLayoutProps {
  children: React.ReactNode
}

/**
 * Settings Layout
 * 
 * Provides a consistent layout for all settings pages with navigation sidebar.
 * This layout is protected and requires authentication to access.
 */
export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="container max-w-6xl py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/5">
              <SettingsNav />
            </aside>
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
