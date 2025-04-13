/**
 * User Hook
 * 
 * This hook provides access to the current authenticated user
 * and related functionality.
 */

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
  journey_type: string;
  created_at: string;
  updated_at: string;
}

interface UseUserReturn {
  user: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive"
        });
        return;
      }

      setUser(profile);
      setLoading(false);

      // Subscribe to profile updates
      const channel = supabase
        .channel('profile_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${authUser.id}`
          }, 
          () => {
            loadUser();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadUser();
  }, [supabase, toast]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
      
    if (!authUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully!"
    });
  };

  return {
    user,
    loading,
    updateProfile
  };
}
