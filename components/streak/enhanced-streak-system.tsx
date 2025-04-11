'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity: string;
  multiplier: number;
  next_milestone: number;
}

export function EnhancedStreakSystem() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadStreakData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load streak data",
          variant: "destructive"
        });
        return;
      }

      setStreakData(data);
      setLoading(false);

      // Subscribe to streak updates
      const channel = supabase
        .channel('streak_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_streaks',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            loadStreakData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    loadStreakData();
  }, [supabase, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  if (!streakData) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">No streak data available.</p>
      </Card>
    );
  }

  const progressToNextMilestone = (streakData.current_streak / streakData.next_milestone) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Current Streak</h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold">{streakData.current_streak} days</p>
            <span className="text-sm text-gray-500">
              Best: {streakData.longest_streak} days
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <h4 className="text-sm font-medium">Next Milestone</h4>
            <span className="text-sm text-gray-500">
              {streakData.current_streak} / {streakData.next_milestone} days
            </span>
          </div>
          <Progress value={progressToNextMilestone} className="h-2" />
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Current Multiplier</p>
            <span className="text-lg font-semibold">
              {streakData.multiplier}x
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
