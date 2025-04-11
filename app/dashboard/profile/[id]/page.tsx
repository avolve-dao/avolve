'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { UserProfile } from "@/components/user-profile";
import { ProfileTabs } from "@/components/profile-tabs";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
        return;
      }
      
      setCurrentUserId(user.id);
      setIsLoading(false);
    }
    
    checkAuth();
  }, [router, supabase.auth]);
  
  if (isLoading) {
    return (
      <div className="container py-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const isCurrentUser = userId === currentUserId;

  return (
    <div className="container py-6">
      <UserProfile userId={userId} isCurrentUser={isCurrentUser} />
      <ProfileTabs userId={userId} isCurrentUser={isCurrentUser} />
    </div>
  );
}
