'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  score: number;
  rank: number;
  avatar_url?: string;
}

export function RealTimeSSALeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadLeaderboard() {
      const { data, error } = await supabase
        .from('ssa_leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard',
          variant: 'destructive',
        });
        return;
      }

      setEntries(data);
      setLoading(false);
    }

    loadLeaderboard();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('ssa_leaderboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ssa_leaderboard',
        },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">SSA Leaderboard</h2>
      <div className="space-y-4">
        {entries.map(entry => (
          <div
            key={entry.user_id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {entry.rank <= 3 ? (
                  <span className="text-2xl">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-gray-500">#{entry.rank}</span>
                )}
              </div>
              <div>
                <p className="font-medium">{entry.username}</p>
                <p className="text-sm text-gray-500">Score: {entry.score}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
