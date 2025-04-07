import { Metadata } from 'next'
import { Suspense, ReactNode } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Tokens | Avolve',
  description: 'Manage your Avolve tokens and rewards',
}

interface TokensLayoutProps {
  children: ReactNode
}

export default function TokensLayout({ children }: TokensLayoutProps) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<TokensLoadingSkeleton />}>
        <div className="container mx-auto py-8">
          <h1 className="mb-8 text-3xl font-bold">Tokens & Rewards</h1>
          {children}
        </div>
      </Suspense>
    </ProtectedRoute>
  )
}

function TokensLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        
        <Skeleton className="h-px w-full" />
        
        <Skeleton className="h-10 w-48" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
