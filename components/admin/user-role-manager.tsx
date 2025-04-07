"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { RoleService, Role, Permission } from "@/lib/auth/role-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, UserPlus, UserCheck, UserX, Shield } from "lucide-react"
import { Authorized } from "@/components/auth/authorized"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedPage } from "@/components/auth/protected-page"

/**
 * User Role Manager Component
 * 
 * This component provides an interface for administrators to manage user roles.
 * It allows for assigning and removing roles from users.
 */
export function UserRoleManager() {
  const { user } = useAuth()
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [userLoading, setUserLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  const roleService = RoleService.getBrowserInstance()
  
  // Load roles
  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { data: rolesData, error: rolesError } = await roleService.getAllRoles()
        if (rolesError) {
          throw new Error(`Failed to load roles: ${rolesError.message}`)
        }
        setRoles(rolesData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error loading roles:", err)
      } finally {
        setLoading(false)
      }
    }
    
    loadRoles()
  }, [])
  
  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Use Supabase client directly to get users
        const { data: usersData, error: usersError } = await roleService.getSupabaseClient()
          .from('profiles')
          .select('id, email, display_name, avatar_url')
          .order('display_name', { ascending: true })
        
        if (usersError) {
          throw new Error(`Failed to load users: ${usersError.message}`)
        }
        
        setUsers(usersData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error loading users:", err)
      } finally {
        setLoading(false)
      }
    }
    
    loadUsers()
  }, [])
  
  // Load user roles when a user is selected
  useEffect(() => {
    const loadUserRoles = async () => {
      if (!selectedUser) return
      
      setUserLoading(true)
      setError(null)
      
      try {
        const { data: userRolesData, error: userRolesError } = await roleService.getUserRoles(selectedUser.id)
        
        if (userRolesError) {
          throw new Error(`Failed to load user roles: ${userRolesError.message}`)
        }
        
        setUserRoles(userRolesData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error loading user roles:", err)
      } finally {
        setUserLoading(false)
      }
    }
    
    if (selectedUser) {
      loadUserRoles()
    }
  }, [selectedUser])
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Handle user selection
  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId)
    setSelectedUser(user || null)
  }
  
  // Toggle role for user
  const toggleRole = async (role: Role) => {
    if (!selectedUser) return
    
    setUserLoading(true)
    setError(null)
    
    try {
      const hasRole = userRoles.some(r => r.id === role.id)
      
      if (hasRole) {
        // Remove role
        const { error } = await roleService.removeRoleFromUser(selectedUser.id, role.id)
        
        if (error) {
          throw new Error(`Failed to remove role: ${error.message}`)
        }
        
        // Update UI
        setUserRoles(prevRoles => prevRoles.filter(r => r.id !== role.id))
      } else {
        // Add role
        const { error } = await roleService.assignRoleToUser(selectedUser.id, role.id)
        
        if (error) {
          throw new Error(`Failed to assign role: ${error.message}`)
        }
        
        // Update UI
        const { data: role } = await roleService.getRoleById(role.id)
        if (role) {
          setUserRoles(prevRoles => [...prevRoles, role])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      console.error("Error toggling role:", err)
    } finally {
      setUserLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    )
  }
  
  return (
    <ProtectedPage requiredRoles="admin" title="User Role Management">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>User Role Management</CardTitle>
          </div>
          <CardDescription>
            Assign and manage roles for users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User List */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium mb-2">Users</h3>
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="p-4 text-center text-muted-foreground">No users found</p>
                  ) : (
                    <ul className="divide-y">
                      {filteredUsers.map((user) => (
                        <li 
                          key={user.id}
                          className={`p-3 cursor-pointer hover:bg-muted ${selectedUser?.id === user.id ? 'bg-muted' : ''}`}
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center overflow-hidden">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.display_name || user.email} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-medium">{(user.display_name || user.email || "").charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.display_name || "Unnamed User"}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            {/* User Roles */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-2">User Roles</h3>
              {!selectedUser ? (
                <div className="border rounded-md p-8 text-center text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Select a user to manage their roles</p>
                </div>
              ) : userLoading ? (
                <div className="flex justify-center items-center p-8 border rounded-md">
                  <Spinner size="md" />
                </div>
              ) : (
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">
                        {selectedUser.display_name || selectedUser.email}
                      </h4>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(roleId) => {
                          const role = roles.find(r => r.id === roleId);
                          if (role) toggleRole(role);
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {roles
                            .filter(role => !userRoles.some(ur => ur.id === role.id))
                            .map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {userRoles.length === 0 ? (
                    <div className="text-center p-4 bg-muted rounded-md">
                      <p className="text-muted-foreground">This user has no roles assigned</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Role</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userRoles.map((role) => (
                          <TableRow key={role.id}>
                            <TableCell className="font-medium">
                              {role.name}
                              {role.is_system && (
                                <Badge variant="outline" className="ml-2">System</Badge>
                              )}
                            </TableCell>
                            <TableCell>{role.description || "—"}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => toggleRole(role)}
                                disabled={role.is_system}
                              >
                                <UserX className="h-4 w-4" />
                                <span className="sr-only">Remove</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </ProtectedPage>
  )
}
