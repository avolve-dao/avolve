import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Metadata } from 'next'

// Components
import { AdminShell } from '@/components/shells/admin-shell'
import { AdminHeader } from '@/components/admin/admin-header'
import { UserTable } from '@/components/admin/user-table'
import { UserFilter } from '@/components/admin/user-filter'
import { UserActions } from '@/components/admin/user-actions'
import { LoadingCard } from '@/components/ui/loading-card'

export const metadata: Metadata = {
  title: 'User Management | Avolve Admin',
  description: 'Manage users and their roles.',
}

// Get users with their roles and status
async function getUsers(searchParams: { [key: string]: string | string[] | undefined }) {
  const supabase = createServerComponentClient({ cookies })
  
  let query = supabase
    .from('profiles')
    .select(`
      *,
      roles:user_roles(role_name),
      onboarding:user_onboarding(stage),
      teams:team_members(team_id)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.role) {
    query = query.contains('roles.role_name', [searchParams.role])
  }
  
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }
  
  if (searchParams.search) {
    query = query.or(`email.ilike.%${searchParams.search}%,full_name.ilike.%${searchParams.search}%`)
  }

  const { data: users } = await query.limit(50)
  
  return users
}

// Get available roles
async function getRoles() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('name')
  
  return roles
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;

  const [users, roles] = await Promise.all([
    getUsers(resolvedSearchParams),
    getRoles(),
  ])

  // Handle null values to satisfy type requirements
  const userList = users || [];
  const roleList = roles || [];

  return (
    <AdminShell>
      <AdminHeader
        title="User Management"
        description="View and manage user accounts"
      />

      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4">
          <UserFilter roles={roleList} />
          <UserActions />
        </div>

        {/* User Table */}
        <Suspense fallback={<LoadingCard />}>
          <UserTable users={userList} />
        </Suspense>
      </div>
    </AdminShell>
  )
}
