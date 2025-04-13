"use client";

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  roles: { role_name: string }[]
  onboarding: { stage: string }[]
  teams: { team_id: string }[]
}

interface UserTableProps {
  users?: User[]
}

export function UserTable({ users = [] }: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const supabase = createClientComponentClient()

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const toggleAllUsers = () => {
    setSelectedUsers((prev) =>
      prev.length === users.length
        ? []
        : users.map((user) => user.id)
    )
  }

  const handleAction = async (action: string) => {
    if (!selectedUsers.length) return

    switch (action) {
      case 'suspend':
        await supabase
          .from('profiles')
          .update({ status: 'suspended' })
          .in('id', selectedUsers)
        break
      case 'activate':
        await supabase
          .from('profiles')
          .update({ status: 'active' })
          .in('id', selectedUsers)
        break
      case 'delete':
        // Show confirmation dialog first
        if (!confirm('Are you sure you want to delete these users?')) return
        await supabase
          .from('profiles')
          .delete()
          .in('id', selectedUsers)
        break
    }

    // Reset selection
    setSelectedUsers([])
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      {/* Bulk actions */}
      {selectedUsers.length > 0 && (
        <div className="border-b border-zinc-800 bg-zinc-800/50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              {selectedUsers.length} user{selectedUsers.length === 1 ? '' : 's'} selected
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('activate')}
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('suspend')}
              >
                Suspend
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction('delete')}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-zinc-800">
          <thead>
            <tr>
              <th scope="col" className="relative px-4 py-3">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-600"
                  checked={selectedUsers.length === users.length}
                  onChange={toggleAllUsers}
                />
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                User
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Teams
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Onboarding
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-800/50">
                <td className="relative w-4 px-4 py-3">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-600"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0 rounded-full bg-zinc-800">
                      <span className="sr-only">{user.full_name}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-zinc-100">
                        {user.full_name}
                      </div>
                      <div className="text-sm text-zinc-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role.role_name}
                        className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/30"
                      >
                        {role.role_name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-400">
                  {user.teams.length} team{user.teams.length === 1 ? '' : 's'}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/30">
                    {user.onboarding[0]?.stage || 'Not Started'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-sm text-zinc-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
