"use client"

import React from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Settings as SettingsIcon, 
  UserCircle,
  Key,
  ArrowRight
} from "lucide-react"

/**
 * Settings Dashboard
 * 
 * Provides an overview of account settings with quick links to specific settings pages.
 */
export default function SettingsDashboard() {
  const { user } = useAuth()
  
  // Settings categories with their respective icons and routes
  const settingsCategories = [
    {
      title: "Profile",
      description: "Manage your personal information and public profile",
      icon: <UserCircle className="h-8 w-8 text-primary" />,
      href: "/settings/profile",
    },
    {
      title: "Security",
      description: "Protect your account with security features",
      icon: <Shield className="h-8 w-8 text-primary" />,
      href: "/settings/security",
      highlight: !user?.hasMfa, // Highlight if MFA is not enabled
    },
    {
      title: "API Keys",
      description: "Manage API keys for programmatic access",
      icon: <Key className="h-8 w-8 text-primary" />,
      href: "/settings/api-keys",
    },
    {
      title: "Notifications",
      description: "Configure how and when you receive notifications",
      icon: <Bell className="h-8 w-8 text-primary" />,
      href: "/settings/notifications",
    },
    {
      title: "Billing",
      description: "Manage your subscription and payment methods",
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      href: "/settings/billing",
    },
    {
      title: "Preferences",
      description: "Customize your experience on the platform",
      icon: <SettingsIcon className="h-8 w-8 text-primary" />,
      href: "/settings/preferences",
    },
  ]
  
  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
          <CardDescription>
            Quick summary of your account status and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-base">{user?.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Account Status</h3>
              <p className="text-base">{user?.isVerified ? "Verified" : "Unverified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Two-Factor Authentication</h3>
              <p className="text-base">{user?.hasMfa ? "Enabled" : "Disabled"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Last Sign In</h3>
              <p className="text-base">{user?.lastSignIn ? new Date(user.lastSignIn).toLocaleString() : "Never"}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {!user?.isVerified && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/account">
                Verify Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          {user?.isVerified && !user?.hasMfa && (
            <Button asChild variant="outline" className="w-full">
              <Link href="/settings/security">
                Enable Two-Factor Authentication
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsCategories.map((category) => (
          <Card 
            key={category.title} 
            className={category.highlight ? "border-primary" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                {category.icon}
                {category.highlight && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <CardTitle className="mt-4">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="ghost" className="w-full">
                <Link href={category.href}>
                  Manage {category.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
