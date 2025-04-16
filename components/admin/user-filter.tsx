"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface UserFilterProps {
  roles?: {
    id: string
    name: string
  }[]
}

export function UserFilter({ roles = [] }: UserFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statuses = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Pending', value: 'pending' },
  ]

  const currentRole = searchParams?.get('role') || ''
  const currentStatus = searchParams?.get('status') || ''
  const currentSearch = searchParams?.get('search') || ''

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <input
          type="text"
          className="
            w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 pl-10 text-sm
            text-zinc-100 placeholder-zinc-400 focus:border-zinc-700 focus:outline-none
            focus:ring-1 focus:ring-zinc-700
          "
          placeholder="Search users..."
          value={currentSearch}
          onChange={(e) => updateFilters('search', e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-400">Role:</span>
        <div className="flex items-center gap-2">
          <Button
            variant={!currentRole ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateFilters('role', '')}
          >
            All
          </Button>
          {roles.map((role) => (
            <Button
              key={role.id}
              variant={currentRole === role.name ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('role', role.name)}
            >
              {role.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-400">Status:</span>
        <div className="flex items-center gap-2">
          {statuses.map((status) => (
            <Button
              key={status.value}
              variant={currentStatus === status.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('status', status.value)}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
