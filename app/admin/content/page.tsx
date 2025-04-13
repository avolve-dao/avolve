import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Metadata } from 'next'

// Components
import { AdminShell } from '@/components/shells/admin-shell'
import { AdminHeader } from '@/components/admin/admin-header'
import { ContentGrid } from '@/components/admin/content-grid'
import { ContentFilter } from '@/components/admin/content-filter'
import { ContentActions } from '@/components/admin/content-actions'
import { LoadingCard } from '@/components/ui/loading-card'

export const metadata: Metadata = {
  title: 'Content Management | Avolve Admin',
  description: 'Manage platform content and resources.',
}

// Get content items with their metadata
async function getContent(searchParams: { [key: string]: string | string[] | undefined }) {
  const supabase = createServerComponentClient({ cookies })
  
  let query = supabase
    .from('content_items')
    .select(`
      *,
      author:profiles(full_name, avatar_url),
      stats:content_stats(views, likes, shares)
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.type) {
    query = query.eq('type', searchParams.type)
  }
  
  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }
  
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }

  const { data: items } = await query.limit(50)
  
  return items
}

// Get content categories
async function getCategories() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: categories } = await supabase
    .from('content_categories')
    .select('*')
    .order('name')
  
  return categories
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;

  const [content, categories] = await Promise.all([
    getContent(resolvedSearchParams),
    getCategories(),
  ])

  // Handle null values to satisfy type requirements
  const contentItems = content || [];
  const contentCategories = categories || [];

  return (
    <AdminShell>
      <AdminHeader
        title="Content Management"
        description="Create and manage platform content"
      />

      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4">
          <ContentFilter categories={contentCategories} />
          <ContentActions />
        </div>

        {/* Content Grid */}
        <Suspense fallback={<LoadingCard count={6} />}>
          <ContentGrid items={contentItems} />
        </Suspense>

        {/* Content Types */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Resources */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Learning Resources</h2>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Articles</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'article').length || 0
                  }</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Videos</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'video').length || 0
                  }</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Guides</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'guide').length || 0
                  }</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Challenges */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Challenges</h2>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Daily</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'daily_challenge').length || 0
                  }</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Weekly</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'weekly_challenge').length || 0
                  }</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Special</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'special_challenge').length || 0
                  }</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Community */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Community</h2>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Announcements</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'announcement').length || 0
                  }</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Events</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'event').length || 0
                  }</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-300">Updates</span>
                  <span className="text-zinc-400">{
                    contentItems?.filter(item => item.type === 'update').length || 0
                  }</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}
