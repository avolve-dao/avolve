import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPillarBySlug, startUserJourney } from '@/lib/utils/avolve-db';
import { SectionProgress } from '@/components/avolve/section-progress';
import { Skeleton } from '@/components/ui/skeleton';

export default async function JourneyPage({ 
  params 
}: { 
  params: { pillarSlug: string } 
}) {
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to login if not authenticated
    redirect('/login');
  }
  
  // Get pillar details
  const pillar = await getPillarBySlug(params.pillarSlug);
  
  if (!pillar) {
    // Redirect to dashboard if pillar not found
    redirect('/dashboard');
  }
  
  // Start or ensure user journey exists
  await startUserJourney(user.id, params.pillarSlug);
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{pillar.title}</h1>
        {pillar.subtitle && <p className="text-xl text-gray-600">{pillar.subtitle}</p>}
        {pillar.description && <p className="mt-4 text-gray-700">{pillar.description}</p>}
      </div>
      
      <div className="mt-8">
        <Suspense fallback={<SectionProgressSkeleton />}>
          <SectionProgress pillarId={pillar.id} userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}

function SectionProgressSkeleton() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Sections</h2>
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
}
