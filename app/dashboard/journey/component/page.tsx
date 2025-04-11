'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ComponentProgress } from '@/components/avolve/component-progress';

export default function ComponentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pillarSlug = searchParams.get('pillarSlug');
  const componentSlug = searchParams.get('componentSlug');
  
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      setIsLoading(false);
    }
    
    checkAuth();
  }, [router, supabase.auth]);
  
  useEffect(() => {
    if (!pillarSlug || !componentSlug) {
      // Redirect to journey page if parameters are missing
      router.push('/dashboard/journey');
    }
  }, [pillarSlug, componentSlug, router]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <a 
          href={`/dashboard/journey?pillarSlug=${pillarSlug}`}
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
      
      {userId && componentSlug && (
        <div className="mt-4">
          <ComponentProgress 
            componentSlug={componentSlug} 
            userId={userId} 
          />
        </div>
      )}
    </div>
  );
}
