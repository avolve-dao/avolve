"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * Protected Route Component
 * 
 * This component ensures that only authenticated users can access the wrapped content.
 * It can also check for specific roles and redirect unauthenticated users to a specified path.
 * 
 * @example
 * ```tsx
 * // Basic protection
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 * 
 * // With role requirement
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * // With custom redirect
 * <ProtectedRoute redirectTo="/auth/login?from=settings">
 *   <SettingsPage />
 * </ProtectedRoute>
 * 
 * // With custom loading state
 * <ProtectedRoute fallback={<CustomLoadingComponent />}>
 *   <SecureContent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/auth/login",
  fallback = <div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = React.useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth to load
      if (isLoading) return

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        // Add the current path as a query parameter to redirect back after login
        const redirectPath = redirectTo.includes("?")
          ? `${redirectTo}&redirectTo=${encodeURIComponent(pathname ?? '')}`
          : `${redirectTo}?redirectTo=${encodeURIComponent(pathname ?? '')}`
        
        router.push(redirectPath)
        return
      }

      // If role is required, check if user has the role
      if (requiredRole && !(await hasRole(requiredRole))) {
        router.push("/unauthorized")
        return
      }

      // User is authorized
      setAuthorized(true)
    }

    checkAuth()
  }, [isAuthenticated, isLoading, hasRole, requiredRole, router, pathname, redirectTo])

  // Show loading state while checking auth
  if (isLoading || !authorized) {
    return fallback
  }

  // Render the protected content
  return <>{children}</>
}
