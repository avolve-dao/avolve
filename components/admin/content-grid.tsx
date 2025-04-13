import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ContentItem {
  id: string
  title: string
  description: string
  type: string
  status: string
  created_at: string
  author: {
    full_name: string
    avatar_url: string
  }
  stats: {
    views: number
    likes: number
    shares: number
  }
}

interface ContentGridProps {
  items?: ContentItem[]
}

export function ContentGrid({ items = [] }: ContentGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="relative flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50"
        >
          {/* Status badge */}
          <div className="absolute right-4 top-4">
            <span
              className={`
                inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
                ${getStatusStyles(item.status)}
              `}
            >
              {item.status}
            </span>
          </div>

          {/* Content type */}
          <div className="p-4">
            <div className="flex items-center gap-x-2 text-xs">
              <span
                className={`
                  inline-flex items-center rounded-md px-2 py-1 font-medium
                  ${getTypeStyles(item.type)}
                `}
              >
                {item.type}
              </span>
              <time
                dateTime={item.created_at}
                className="text-zinc-400"
              >
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </time>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
                <Link href={`/admin/content/${item.id}`}>
                  <span className="absolute inset-0" />
                  {item.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                {item.description}
              </p>
            </div>
          </div>

          {/* Author and stats */}
          <div className="mt-auto flex items-center gap-x-4 border-t border-zinc-800 bg-zinc-900/50 p-4">
            <div className="flex items-center gap-x-2">
              <div className="h-8 w-8 rounded-full bg-zinc-800">
                {item.author.avatar_url && (
                  <img
                    src={item.author.avatar_url}
                    alt={item.author.full_name}
                    className="h-8 w-8 rounded-full"
                  />
                )}
              </div>
              <div className="text-sm leading-6">
                <p className="font-semibold text-zinc-100">
                  {item.author.full_name}
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-x-4 text-xs text-zinc-400">
              <div className="flex items-center gap-x-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.stats.views}
              </div>
              <div className="flex items-center gap-x-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {item.stats.likes}
              </div>
              <div className="flex items-center gap-x-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
                {item.stats.shares}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function getStatusStyles(status: string): string {
  switch (status.toLowerCase()) {
    case 'published':
      return 'bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-400/30'
    case 'draft':
      return 'bg-yellow-400/10 text-yellow-400 ring-1 ring-inset ring-yellow-400/30'
    case 'archived':
      return 'bg-zinc-400/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/30'
    default:
      return 'bg-zinc-400/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/30'
  }
}

function getTypeStyles(type: string): string {
  switch (type.toLowerCase()) {
    case 'article':
      return 'bg-blue-400/10 text-blue-400 ring-1 ring-inset ring-blue-400/30'
    case 'video':
      return 'bg-purple-400/10 text-purple-400 ring-1 ring-inset ring-purple-400/30'
    case 'guide':
      return 'bg-orange-400/10 text-orange-400 ring-1 ring-inset ring-orange-400/30'
    case 'announcement':
      return 'bg-red-400/10 text-red-400 ring-1 ring-inset ring-red-400/30'
    default:
      return 'bg-zinc-400/10 text-zinc-400 ring-1 ring-inset ring-zinc-400/30'
  }
}
