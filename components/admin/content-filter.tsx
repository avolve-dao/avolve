"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ContentFilterProps {
  categories?: {
    id: string
    name: string
  }[]
}

export function ContentFilter({ categories = [] }: ContentFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const types = [
    { label: 'All', value: '' },
    { label: 'Articles', value: 'article' },
    { label: 'Videos', value: 'video' },
    { label: 'Guides', value: 'guide' },
    { label: 'Announcements', value: 'announcement' },
  ]

  const statuses = [
    { label: 'All', value: '' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ]

  const currentType = searchParams?.get('type') || ''
  const currentStatus = searchParams?.get('status') || ''
  const currentCategory = searchParams?.get('category') || ''
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
          placeholder="Search content..."
          value={currentSearch}
          onChange={(e) => updateFilters('search', e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-400">Type:</span>
        <div className="flex items-center gap-2">
          {types.map((type) => (
            <Button
              key={type.value}
              variant={currentType === type.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('type', type.value)}
            >
              {type.label}
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

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">Category:</span>
          <div className="flex items-center gap-2">
            <Button
              variant={!currentCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateFilters('category', '')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilters('category', category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <Button
        variant="outline"
        size="sm"
        className="ml-auto flex items-center"
        onClick={() => {
          const sort = searchParams?.get('sort') || 'newest'
          updateFilters('sort', sort === 'newest' ? 'oldest' : 'newest')
        }}
      >
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
        </svg>
        {searchParams?.get('sort') === 'oldest' ? 'Newest First' : 'Oldest First'}
      </Button>
    </div>
  )
}
