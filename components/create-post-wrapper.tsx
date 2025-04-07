'use client';

import { useState, useEffect } from 'react';
import { CreatePostForm } from '@/components/create-post-form';
import type { User } from '@supabase/supabase-js';
import { Skeleton } from '@/components/ui/skeleton';

interface CreatePostWrapperProps {
  serverUser: User;
}

export function CreatePostWrapper({ serverUser }: CreatePostWrapperProps) {
  const [mounted, setMounted] = useState(false);

  // This ensures the component only renders on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <CreatePostForm user={serverUser} />;
}
