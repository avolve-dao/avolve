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
  const isAdmin = user?.role === 'admin'

  // State for users
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State for roles
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  // State for selected user and their roles
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([])
  const [userRoles, setUserRoles] = useState<{ [key: string]: string[] }>({})
  const [loadingUserRoles, setLoadingUserRoles] = useState(false)

  // State for role selection
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [assigningRole, setAssigningRole] = useState(false)
  const [removingRole, setRemovingRole] = useState(false)

  // State for search
  const [searchQuery, setSearchQuery] = useState('')

  // State for error and success messages
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const roleService = RoleService.getBrowserInstance()

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true)
      setError(null)
      try {
        // Use dummy data since actual method is not available
        const rolesData = [
          { id: 'role1', name: 'Admin', description: 'Administrator with full access', is_system: true },
          { id: 'role2', name: 'Editor', description: 'Editor with content management permissions', is_system: false },
          { id: 'role3', name: 'Viewer', description: 'Viewer with read-only access', is_system: false },
        ]
        setRoles(rolesData)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch roles')
        setRoles([])
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [])

  // Fetch users and their roles
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use dummy data since actual method is not available
      const usersData = [
        { id: 'user1', email: 'user1@example.com', first_name: 'User', last_name: 'One' },
        { id: 'user2', email: 'user2@example.com', first_name: 'User', last_name: 'Two' },
        { id: 'user3', email: 'user3@example.com', first_name: 'User', last_name: 'Three' },
      ]
      setUsers(usersData)

      // Simulate user roles data
      const userRolesData = {
        user1: ['role1'],
        user2: ['role2'],
        user3: ['role1', 'role3'],
      }
      setUserRoles(userRolesData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch user roles when a user is selected
  useEffect(() => {
    if (selectedUser) {
      const fetchUserRoles = async () => {
        setLoadingUserRoles(true)
        setError(null)
        try {
          // Use dummy data since actual method is not available
          const userRolesData = userRoles[selectedUser.id] || []
          setSelectedUserRoles(userRolesData)
        } catch (err: any) {
          setError(err.message || 'Failed to fetch user roles')
          setSelectedUserRoles([])
        } finally {
          setLoadingUserRoles(false)
        }
      }
      fetchUserRoles()
    }
  }, [selectedUser, userRoles])

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle role toggle
  const handleToggleRole = async (role: Role) => {
    if (!selectedUser) {
      setError('No user selected')
      return
    }

    setLoadingUserRoles(true)
    setError(null)
    
    try {
      // Simulate role assignment since actual method is not available
      const updatedUserRoles = { ...userRoles }
      if (!updatedUserRoles[selectedUser.id].includes(role.id)) {
        updatedUserRoles[selectedUser.id].push(role.id)
      } else {
        updatedUserRoles[selectedUser.id] = updatedUserRoles[selectedUser.id].filter(id => id !== role.id)
      }
      setUserRoles(updatedUserRoles)
      setSelectedUserRoles(updatedUserRoles[selectedUser.id])
    } catch (err: any) {
      setError(err.message || 'Failed to assign role')
    } finally {
      setLoadingUserRoles(false)
    }
  }

  // Handle role assignment
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) {
      setError('User and role are required')
      return
    }

    setAssigningRole(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulate role assignment since actual method is not available
      const updatedUserRoles = { ...userRoles }
      if (!updatedUserRoles[selectedUser.id].includes(selectedRoleId)) {
        updatedUserRoles[selectedUser.id].push(selectedRoleId)
      }
      setUserRoles(updatedUserRoles)
      setSelectedUserRoles(updatedUserRoles[selectedUser.id])

      setSuccess(`Successfully assigned role to ${selectedUser.email}`)
      setSelectedRoleId('')
    } catch (err: any) {
      setError(err.message || 'Failed to assign role')
    } finally {
      setAssigningRole(false)
    }
  }

  // Handle role removal
  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUser) {
      setError('User is required')
      return
    }

    setRemovingRole(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulate role removal since actual method is not available
      const updatedUserRoles = { ...userRoles }
      updatedUserRoles[selectedUser.id] = updatedUserRoles[selectedUser.id].filter(id => id !== roleId)
      setUserRoles(updatedUserRoles)
      setSelectedUserRoles(updatedUserRoles[selectedUser.id])

      setSuccess(`Successfully removed role from ${selectedUser.email}`)
    } catch (err: any) {
      setError(err.message || 'Failed to remove role')
    } finally {
      setRemovingRole(false)
    }
  }

  if (!isAdmin) {
    return (
      <Card title="Access Denied" className="mb-6">
        <Alert variant="destructive" className="mb-4">
          You do not have permission to access this page.
        </Alert>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold">User Role Manager</h1>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="mb-4">
          {success}
        </Alert>
      )}

      {/* User Selection */}
      <Card title="Select User" className="mb-6">
        <div className="mb-4">
          <Label htmlFor="search">Search Users</Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full"
          />
        </div>
        {loading ? (
          <div className="text-center py-6">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-6">No users found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredUsers.map((user) => (
              <Button
                key={user.id}
                variant={selectedUser?.id === user.id ? 'default' : 'outline'}
                className="w-full text-left justify-start"
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate">{user.first_name} {user.last_name}</span>
                  <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Role Assignment for Selected User */}
      {selectedUser && (
        <Card title={`Manage Roles for ${selectedUser.email}`} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Label htmlFor="roleSelect">Assign New Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="roleSelect" className="w-full">
                  <SelectValue placeholder="Select a role to assign" />
                </SelectTrigger>
                <SelectContent>
                  {roles
                    .filter(role => !selectedUserRoles.includes(role.id))
                    .map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAssignRole}
                disabled={assigningRole || !selectedRoleId}
                className="w-full"
              >
                {assigningRole ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </div>
          
          {loadingUserRoles ? (
            <div className="text-center py-6">Loading roles...</div>
          ) : selectedUserRoles.length === 0 ? (
            <div className="text-center p-4 bg-muted rounded-md">
              <p className="text-muted-foreground">This user has no roles assigned</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.filter(role => selectedUserRoles.includes(role.id)).map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {role.name}
                    </TableCell>
                    <TableCell>
                      {role.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveRole(role.id)}
                        disabled={removingRole}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* All Roles */}
      <Card title="All Roles" className="mb-6">
        {loadingRoles ? (
          <div className="text-center py-6">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="text-center py-6">No roles found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || 'No description'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
