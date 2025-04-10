import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getComponentBySlug } from '@/lib/utils/avolve-db';
import { ComponentProgress } from '@/components/avolve/component-progress';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Next.js 15 expects a simpler approach to page props
export default async function ComponentPage({
  params,
}: {
  params: {
    pillarSlug: string;
    componentSlug: string;
  };
}) {
  const cookieStore = cookies();
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to login if not authenticated
    redirect('/login');
  }
  
  // Get component details
  const component = await getComponentBySlug(params.componentSlug);
  
  if (!component) {
    // Redirect to pillar page if component not found
    redirect(`/dashboard/journey/${params.pillarSlug}`);
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <a 
          href={`/dashboard/journey/${params.pillarSlug}`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Pillar
        </a>
      </div>
      
      <div className="mt-4">
        <ComponentProgress 
          componentSlug={params.componentSlug} 
          userId={user.id} 
        />
      </div>
    </div>
  );
}
