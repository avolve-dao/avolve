import { useCallback } from 'react'
import { useSupabase } from '../supabase/use-supabase'
import { useAuth } from './use-auth'

export interface Role {
  id: string
  name: string
  description: string
}

export interface Permission {
  id: string
  resource: string
  action: string
  description: string
}

export interface RBACHook {
  roles: Role[]
  permissions: Permission[]
  isLoading: boolean
  hasRole: (roleName: string) => Promise<boolean>
  hasPermission: (resource: string, action: string) => Promise<boolean>
  can: (action: string, resource: string) => Promise<boolean>
  hasAnyRole: (roleNames: string[]) => Promise<boolean>
  hasAllRoles: (roleNames: string[]) => Promise<boolean>
}

export function useRBAC(): RBACHook {
  const { supabase } = useSupabase()
  const { user } = useAuth()

  const hasRole = useCallback(async (roleName: string) => {
    if (!user) return false

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', user.id)
        .eq('roles.name', roleName)
        .single()

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error checking role:', error)
      return false
    }
  }, [supabase, user])

  const hasPermission = useCallback(async (resource: string, action: string) => {
    if (!user) return false

    try {
      const { data, error } = await supabase.rpc('check_permission', {
        p_user_id: user.id,
        p_resource: resource,
        p_action: action
      })

      if (error) throw error
      return !!data
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }, [supabase, user])

  const can = useCallback(async (action: string, resource: string) => {
    return hasPermission(resource, action)
  }, [hasPermission])

  const hasAnyRole = useCallback(async (roleNames: string[]) => {
    if (!user || !roleNames.length) return false

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', user.id)
        .in('roles.name', roleNames)

      if (error) throw error
      return data.length > 0
    } catch (error) {
      console.error('Error checking roles:', error)
      return false
    }
  }, [supabase, user])

  const hasAllRoles = useCallback(async (roleNames: string[]) => {
    if (!user || !roleNames.length) return false

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role:roles(name)')
        .eq('user_id', user.id)
        .in('roles.name', roleNames)

      if (error) throw error
      return data.length === roleNames.length
    } catch (error) {
      console.error('Error checking roles:', error)
      return false
    }
  }, [supabase, user])

  return {
    roles: [],
    permissions: [],
    isLoading: false,
    hasRole,
    hasPermission,
    can,
    hasAnyRole,
    hasAllRoles
  }
}
