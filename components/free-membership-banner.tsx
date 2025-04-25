'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

type FreeMembershipStatus = {
  max_free_users: number;
  current_count: number;
  remaining_slots: number;
  is_active: boolean;
};

export function FreeMembershipBanner() {
  const [status, setStatus] = useState<FreeMembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFreeMembershipStatus() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('get_free_membership_status');

        if (error) {
          console.error('Error fetching free membership status:', error);
          return;
        }

        setStatus(data as FreeMembershipStatus);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFreeMembershipStatus();
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!status || !status.is_active) {
    return null; // Don't show if program is not active
  }

  const urgencyLevel =
    status.remaining_slots <= 10 ? 'high' : status.remaining_slots <= 25 ? 'medium' : 'low';

  return (
    <Card
      className={`mb-6 border-2 ${
        urgencyLevel === 'high'
          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
          : urgencyLevel === 'medium'
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20'
            : 'border-green-500 bg-green-50 dark:bg-green-950/20'
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">Free Membership Program</h3>
          <Badge
            variant={
              urgencyLevel === 'high'
                ? 'destructive'
                : urgencyLevel === 'medium'
                  ? 'outline'
                  : 'default'
            }
          >
            {status.remaining_slots} spots left
          </Badge>
        </div>
        <p className="text-sm mb-2">
          We're offering <span className="font-bold">free lifetime membership</span> to our first
          100 members!
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
            style={{ width: `${(status.current_count / status.max_free_users) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>{status.current_count} joined</span>
          <span>{status.max_free_users} total spots</span>
        </div>
      </CardContent>
    </Card>
  );
}
