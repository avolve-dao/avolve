import { Metadata } from 'next'
import { ReactNode, Suspense } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Shield } from 'lucide-react'
import { VerificationLoadingSkeleton } from '@/components/verification/VerificationLoadingSkeleton'

export const metadata: Metadata = {
  title: 'Verification | Avolve',
  description: 'Complete verification steps to access all Avolve features',
}

interface VerificationLayoutProps {
  children: ReactNode
}

export default function VerificationLayout({ children }: VerificationLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">Human Verification</h1>
        <Suspense fallback={<VerificationLoadingSkeleton />}>
          {children}
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}

function VerificationLoadingSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-muted" />
            <Skeleton className="h-10 w-64" />
          </div>
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
