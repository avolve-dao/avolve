"use client"

import React, { useState, useEffect, ChangeEvent } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { Role } from "@/lib/auth/role-service"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
}

interface UserRoleManagerState {
  users: User[]
  loading: boolean
  roles: Role[]
  loadingRoles: boolean
  selectedUser: User | null
  selectedUserRoles: string[]
  userRoles: { [key: string]: string[] }
  loadingUserRoles: boolean
  selectedRoleId: string
  assigningRole: boolean
  removingRole: boolean
  searchQuery: string
  error: string | null
  success: string | null
}

/**
 * User Role Manager Component
 * 
 * This component provides an interface for administrators to manage user roles.
 * It allows for assigning and removing roles from users.
 */
export function UserRoleManager() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [state, setState] = useState<UserRoleManagerState>({
    users: [],
    loading: true,
    roles: [],
    loadingRoles: true,
    selectedUser: null,
    selectedUserRoles: [],
    userRoles: {},
    loadingUserRoles: false,
    selectedRoleId: '',
    assigningRole: false,
    removingRole: false,
    searchQuery: '',
    error: null,
    success: null,
  })

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setState((prevState) => ({ ...prevState, loadingRoles: true, error: null }))
      try {
        // Use dummy data since actual method is not available
        const rolesData: Role[] = [
          { id: 'role1', name: 'Admin', description: 'Administrator with full access', is_system: true },
          { id: 'role2', name: 'Editor', description: 'Editor with content management permissions', is_system: false },
          { id: 'role3', name: 'Viewer', description: 'Viewer with read-only access', is_system: false },
        ]
        setState((prevState) => ({ ...prevState, roles: rolesData }))
      } catch (error) {
        if (error instanceof Error) {
          setState((prevState) => ({ ...prevState, error: error.message }));
        } else {
          setState((prevState) => ({ ...prevState, error: 'An unknown error occurred' }));
        }
      } finally {
        setState((prevState) => ({ ...prevState, loadingRoles: false }))
      }
    }

    fetchRoles()
  }, [])

  // Fetch users and their roles
  const fetchUsers = async () => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }))
    try {
      // Use dummy data since actual method is not available
      const usersData: User[] = [
        { id: 'user1', email: 'user1@example.com', first_name: 'User', last_name: 'One' },
        { id: 'user2', email: 'user2@example.com', first_name: 'User', last_name: 'Two' },
        { id: 'user3', email: 'user3@example.com', first_name: 'User', last_name: 'Three' },
      ]
      setState((prevState) => ({ ...prevState, users: usersData }))

      // Simulate user roles data
      const userRolesData = {
        user1: ['role1'],
        user2: ['role2'],
        user3: ['role1', 'role3'],
      }
      setState((prevState) => ({ ...prevState, userRoles: userRolesData }))
    } catch (error) {
      if (error instanceof Error) {
        setState((prevState) => ({ ...prevState, error: error.message }));
      } else {
        setState((prevState) => ({ ...prevState, error: 'An unknown error occurred' }));
      }
    } finally {
      setState((prevState) => ({ ...prevState, loading: false }))
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Fetch user roles when a user is selected
  useEffect(() => {
    if (state.selectedUser && state.selectedUser.id) {
      const fetchUserRoles = async () => {
        setState((prevState) => ({ ...prevState, loadingUserRoles: true, error: null }))
        try {
          // Use dummy data since actual method is not available
          if (state.selectedUser) {
            const userRolesData = state.userRoles[state.selectedUser.id] || [];
            setState((prevState) => ({ ...prevState, selectedUserRoles: userRolesData }));
          }
        } catch (error) {
          if (error instanceof Error) {
            setState((prevState) => ({ ...prevState, error: error.message }));
          } else {
            setState((prevState) => ({ ...prevState, error: 'An unknown error occurred' }));
          }
        } finally {
          setState((prevState) => ({ ...prevState, loadingUserRoles: false }))
        }
      }
      fetchUserRoles()
    } else {
      setState((prevState) => ({ ...prevState, selectedUserRoles: [] }));
    }
  }, [state.selectedUser, state.userRoles])

  // Filter users based on search query
  const filteredUsers = state.users.filter((user: User) => 
    user.email?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(state.searchQuery.toLowerCase())
  )

  // Handle role assignment
  const handleAssignRole = async () => {
    if (!state.selectedRoleId || !state.selectedUser) {
      setState((prevState) => ({ ...prevState, error: 'Please select a user and a role.' }));
      return;
    }

    setState((prevState) => ({ ...prevState, assigningRole: true, error: null, success: null }))

    try {
      // Simulate role assignment since actual method is not available
      const userId = state.selectedUser?.id;
      if (userId) {
        const updatedUserRoles = { ...state.userRoles };
        if (!updatedUserRoles[userId]) {
          updatedUserRoles[userId] = [];
        }
        updatedUserRoles[userId].push(state.selectedRoleId);
        if (userId && userId in updatedUserRoles) {
          setState((prevState) => ({ ...prevState, userRoles: updatedUserRoles, selectedUserRoles: updatedUserRoles[userId] }));
        }
      }

      setState((prevState) => ({ ...prevState, success: `Successfully assigned role to ${state.selectedUser?.email}`, selectedRoleId: '' }))
    } catch (error) {
      if (error instanceof Error) {
        setState((prevState) => ({ ...prevState, error: error.message }));
      } else {
        setState((prevState) => ({ ...prevState, error: 'An unknown error occurred' }));
      }
    } finally {
      setState((prevState) => ({ ...prevState, assigningRole: false }))
    }
  }

  // Handle role removal
  const handleRemoveRole = async (roleId: string) => {
    if (!state.selectedUser) {
      setState((prevState) => ({ ...prevState, error: 'Please select a user.' }));
      return;
    }

    setState((prevState) => ({ ...prevState, removingRole: true, error: null, success: null }))

    try {
      // Simulate role removal since actual method is not available
      const userId = state.selectedUser?.id;
      if (userId) {
        const updatedUserRoles = { ...state.userRoles };
        if (updatedUserRoles[userId].includes(roleId)) {
          updatedUserRoles[userId] = updatedUserRoles[userId].filter(id => id !== roleId);
        }
        if (userId && userId in updatedUserRoles) {
          setState((prevState) => ({ ...prevState, userRoles: updatedUserRoles, selectedUserRoles: updatedUserRoles[userId] }));
        }
      }
      setState((prevState) => ({ ...prevState, success: `Successfully removed role from ${state.selectedUser?.email}` }));
    } catch (error) {
      if (error instanceof Error) {
        setState((prevState) => ({ ...prevState, error: error.message }));
      } else {
        setState((prevState) => ({ ...prevState, error: 'An unknown error occurred' }));
      }
    } finally {
      setState((prevState) => ({ ...prevState, removingRole: false }))
    }
  }

  const handleSearchQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({ ...prevState, searchQuery: event.target.value }))
  }

  const handleSelectChange = (value: string) => {
    setState((prevState) => ({ ...prevState, selectedRoleId: value }))
  }

  const handleUserSelect = (user: User) => {
    setState((prevState) => ({ ...prevState, selectedUser: user }))
  }

  if (!isAdmin) {
    return (
      <Card title="Access Denied" className="mb-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">You do not have permission to access this page.</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold">User Role Manager</h1>

      {/* Error/Success Messages */}
      {state.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{state.error}</span>
        </div>
      )}
      {state.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{state.success}</span>
        </div>
      )}

      {/* User Selection */}
      <Card title="Select User" className="mb-6">
        <div className="mb-4">
          <Label htmlFor="search">Search Users</Label>
          <Input
            id="search"
            value={state.searchQuery}
            onChange={handleSearchQueryChange}
            placeholder="Search by email or name..."
            className="w-full"
          />
        </div>
        {state.loading ? (
          <div className="text-center py-6">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-6">No users found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredUsers.map((user: User) => (
              <Button
                key={user.id}
                variant={state.selectedUser?.id === user.id ? 'default' : 'outline'}
                className="w-full text-left justify-start"
                onClick={() => handleUserSelect(user)}
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
      {state.selectedUser && (
        <Card title={`Manage Roles for ${state.selectedUser?.email}`} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <Label htmlFor="roleSelect">Assign New Role</Label>
              <Select value={state.selectedRoleId} onValueChange={handleSelectChange}>
                <SelectTrigger id="roleSelect" className="w-full">
                  <SelectValue placeholder="Select a role to assign" />
                </SelectTrigger>
                <SelectContent>
                  {state.roles
                    .filter((role: Role) => !state.selectedUserRoles.includes(role.id))
                    .map((role: Role) => (
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
                disabled={state.assigningRole || !state.selectedRoleId || !state.selectedUser}
                className="w-full"
              >
                {state.assigningRole ? 'Assigning...' : 'Assign Role'}
              </Button>
            </div>
          </div>
          
          {state.loadingUserRoles ? (
            <div className="text-center py-6">Loading roles...</div>
          ) : state.selectedUserRoles.length === 0 ? (
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
                {state.roles.filter((role: Role) => state.selectedUserRoles.includes(role.id)).map((role: Role) => (
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
                        disabled={state.removingRole}
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
        {state.loadingRoles ? (
          <div className="text-center py-6">Loading roles...</div>
        ) : state.roles.length === 0 ? (
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
              {state.roles.map((role: Role) => (
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
