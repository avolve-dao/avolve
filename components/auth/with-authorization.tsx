"use client"

import React, { ComponentType, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useRBAC } from "@/lib/hooks/use-rbac"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface WithAuthorizationOptions {
  /**
   * The role(s) required to access the component
   * If multiple roles are provided, the user must have at least one of them
   */
  requiredRoles?: string | string[]
  
  /**
   * The permission(s) required to access the component
   * Each permission is in the format "resource:action"
   * If multiple permissions are provided, the user must have all of them
   */
  requiredPermissions?: string | string[]
  
  /**
   * Whether to use AND logic for multiple roles (user must have all roles)
   * Default: false (OR logic - user must have at least one role)
   */
  requireAllRoles?: boolean
  
  /**
   * Whether to redirect unauthorized users to the unauthorized page
   * Default: true
   */
  redirectUnauthorized?: boolean
  
  /**
   * The path to redirect unauthorized users to
   * Default: "/unauthorized"
   */
  unauthorizedRedirectPath?: string
  
  /**
   * Loading component to show while checking authorization
   * Default: A centered spinner
   */
  LoadingComponent?: ComponentType
  
  /**
   * Unauthorized component to show when user is not authorized and redirectUnauthorized is false
   * Default: An alert with an unauthorized message
   */
  UnauthorizedComponent?: ComponentType
}

/**
 * Higher-Order Component (HOC) for Role-Based Access Control
 * 
 * This HOC wraps a component and only renders it if the user has the required roles and permissions.
 * If the user is not authorized, they are either redirected to the unauthorized page or shown an
 * unauthorized component.
 * 
 * @example
 * ```tsx
 * // Only allow users with the "admin" role to access the component
 * const ProtectedAdminPanel = withAuthorization(AdminPanel, { requiredRoles: "admin" });
 * 
 * // Only allow users who can edit content to access the component
 * const ProtectedEditor = withAuthorization(Editor, { requiredPermissions: "content:edit" });
 * 
 * // Only allow users with admin OR moderator role to access the component
 * const ProtectedModTools = withAuthorization(ModTools, { requiredRoles: ["admin", "moderator"] });
 * 
 * // Only allow users with admin role AND who can edit settings to access the component
 * const ProtectedSettings = withAuthorization(SettingsEditor, { 
 *   requiredRoles: "admin", 
 *   requiredPermissions: "settings:edit" 
 * });
 * 
 * // Show a custom unauthorized component instead of redirecting
 * const ProtectedContent = withAuthorization(Content, { 
 *   requiredRoles: "premium",
 *   redirectUnauthorized: false,
 *   UnauthorizedComponent: PremiumUpsell
 * });
 * ```
 */
export function withAuthorization<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthorizationOptions
) {
  const {
    requiredRoles,
    requiredPermissions,
    requireAllRoles = false,
    redirectUnauthorized = true,
    unauthorizedRedirectPath = "/unauthorized",
    LoadingComponent,
    UnauthorizedComponent
  } = options
  
  // Default loading component
  const DefaultLoadingComponent = () => (
    <div className="flex justify-center items-center p-8">
      <Spinner size="lg" />
    </div>
  )
  
  // Default unauthorized component
  const DefaultUnauthorizedComponent = () => (
    <Alert variant="destructive">
      <AlertDescription>
        You don't have permission to access this content.
      </AlertDescription>
    </Alert>
  )
  
  // The wrapped component
  function WithAuthorizationWrapper(props: P) {
    const router = useRouter()
    const { hasRole, hasAllRoles, hasAnyRole, hasPermission, isLoading } = useRBAC()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    
    // Convert role and permission options to arrays
    const roles = requiredRoles 
      ? (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]) 
      : []
    
    const permissions = requiredPermissions 
      ? (Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions]) 
      : []
    
    // Check if user is authorized
    useEffect(() => {
      const checkAuthorization = async () => {
        if (isLoading) return
        
        setIsChecking(true)
        
        try {
          let roleAuthorized = true
          let permissionAuthorized = true
          
          // Check roles if specified
          if (roles.length > 0) {
            if (requireAllRoles) {
              roleAuthorized = await hasAllRoles(roles)
            } else {
              roleAuthorized = await hasAnyRole(roles)
            }
          }
          
          // Check permissions if specified and role check passed
          if (permissions.length > 0 && roleAuthorized) {
            // Check each permission (all must pass)
            for (const permission of permissions) {
              const [resource, action] = permission.split(':')
              if (!(await hasPermission(resource, action))) {
                permissionAuthorized = false
                break
              }
            }
          }
          
          // User is authorized if they pass both role and permission checks
          const authorized = roleAuthorized && permissionAuthorized
          setIsAuthorized(authorized)
          
          // Redirect if not authorized and redirectUnauthorized is true
          if (!authorized && redirectUnauthorized) {
            const url = new URL(unauthorizedRedirectPath, window.location.origin)
            
            // Add roles and permissions to query params
            if (roles.length > 0) {
              url.searchParams.set('roles', roles.join(','))
            }
            
            if (permissions.length > 0) {
              url.searchParams.set('permissions', permissions.join(','))
            }
            
            // Add the attempted resource to query params
            url.searchParams.set('resource', window.location.pathname)
            
            router.push(url.toString())
          }
        } catch (error) {
          console.error('Error checking authorization:', error)
          setIsAuthorized(false)
        } finally {
          setIsChecking(false)
        }
      }
      
      checkAuthorization()
    }, [
      isLoading, 
      hasRole, 
      hasAllRoles, 
      hasAnyRole, 
      hasPermission, 
      router
    ])
    
    // Show loading component while checking authorization
    if (isLoading || isChecking) {
      const Loading = LoadingComponent || DefaultLoadingComponent
      return <Loading />
    }
    
    // Show unauthorized component if not authorized and not redirecting
    if (!isAuthorized && !redirectUnauthorized) {
      const Unauthorized = UnauthorizedComponent || DefaultUnauthorizedComponent
      return <Unauthorized />
    }
    
    // Show the wrapped component if authorized
    return isAuthorized ? <Component {...props} /> : null
  }
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component'
  WithAuthorizationWrapper.displayName = `withAuthorization(${displayName})`
  
  return WithAuthorizationWrapper
}
