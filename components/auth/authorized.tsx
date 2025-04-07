"use client"

import React, { useState, useEffect } from "react"
import { useRBAC } from "@/lib/hooks/use-rbac"
import { Spinner } from "@/components/ui/spinner"

interface AuthorizedProps {
  /**
   * The children to render if the user is authorized
   */
  children: React.ReactNode
  
  /**
   * The fallback component to render if the user is not authorized
   * If not provided, null will be rendered
   */
  fallback?: React.ReactNode
  
  /**
   * The role(s) required to access the content
   * If multiple roles are provided, the user must have at least one of them
   */
  requiredRoles?: string | string[]
  
  /**
   * The permission(s) required to access the content
   * Each permission is in the format "resource:action"
   * If multiple permissions are provided, the user must have all of them
   */
  requiredPermissions?: string | string[]
  
  /**
   * Whether to show a loading spinner while checking authorization
   * Default: true
   */
  showLoading?: boolean
  
  /**
   * Whether to use AND logic for multiple roles (user must have all roles)
   * Default: false (OR logic - user must have at least one role)
   */
  requireAllRoles?: boolean
}

/**
 * Authorized Component
 * 
 * A component that conditionally renders its children based on the user's roles and permissions.
 * This provides a declarative way to implement role-based access control in the UI.
 * 
 * @example
 * ```tsx
 * // Only show to users with the "admin" role
 * <Authorized requiredRoles="admin">
 *   <AdminPanel />
 * </Authorized>
 * 
 * // Only show to users who can edit content
 * <Authorized requiredPermissions="content:edit">
 *   <EditButton />
 * </Authorized>
 * 
 * // Only show to users with admin OR moderator role
 * <Authorized requiredRoles={["admin", "moderator"]}>
 *   <ModeratorTools />
 * </Authorized>
 * 
 * // Only show to users with admin role AND who can edit settings
 * <Authorized requiredRoles="admin" requiredPermissions="settings:edit">
 *   <SettingsEditor />
 * </Authorized>
 * 
 * // Show a fallback for unauthorized users
 * <Authorized 
 *   requiredRoles="admin" 
 *   fallback={<p>You need admin access to view this content</p>}
 * >
 *   <AdminDashboard />
 * </Authorized>
 * ```
 */
export function Authorized({
  children,
  fallback = null,
  requiredRoles,
  requiredPermissions,
  showLoading = true,
  requireAllRoles = false
}: AuthorizedProps) {
  const { hasRole, hasAllRoles, hasAnyRole, hasPermission, isLoading } = useRBAC()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    const checkAuthorization = async () => {
      setIsChecking(true)
      
      try {
        let roleAuthorized = true
        let permissionAuthorized = true
        
        // Check roles if specified
        if (requiredRoles) {
          const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
          
          if (requireAllRoles) {
            roleAuthorized = await hasAllRoles(roles)
          } else {
            roleAuthorized = await hasAnyRole(roles)
          }
        }
        
        // Check permissions if specified
        if (requiredPermissions && roleAuthorized) {
          const permissions = Array.isArray(requiredPermissions) 
            ? requiredPermissions 
            : [requiredPermissions]
          
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
        setIsAuthorized(roleAuthorized && permissionAuthorized)
      } catch (error) {
        console.error('Error checking authorization:', error)
        setIsAuthorized(false)
      } finally {
        setIsChecking(false)
      }
    }
    
    if (!isLoading) {
      checkAuthorization()
    }
  }, [
    isLoading, 
    requiredRoles, 
    requiredPermissions, 
    hasRole, 
    hasAllRoles, 
    hasAnyRole, 
    hasPermission, 
    requireAllRoles
  ])
  
  // Show loading state
  if ((isLoading || isChecking) && showLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner size="md" />
      </div>
    )
  }
  
  // Show children if authorized, otherwise show fallback
  return isAuthorized ? <>{children}</> : <>{fallback}</>
}
