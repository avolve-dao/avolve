'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { Sparkles } from 'lucide-react';

interface ValueCardProps {
  userId: string;
}

export function ValueCard({ userId }: ValueCardProps) {
  const [userValue, setUserValue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserValue = async () => {
      try {
        const supabase = createClient();

        // Call the get_user_value_summary function
        const { data, error } = await supabase.rpc('get_user_value_summary', {
          p_user_id: userId,
        });

        if (error) throw error;

        setUserValue(data);
      } catch (error) {
        console.error('Error fetching user value summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserValue();
  }, [userId]);

  // Calculate regen score based on immersion level and time value score
  const regenScore = userValue
    ? Math.round(userValue.immersion_level * 0.6 + userValue.time_value_score * 40)
    : 0;

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium">Your Regen Score</CardTitle>
        <Sparkles className="h-5 w-5 text-yellow-400" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 w-24 animate-pulse bg-zinc-800 rounded-md mx-auto"></div>
            <div className="h-4 w-full animate-pulse bg-zinc-800 rounded-md"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(regenScore)}`}>
                {regenScore}
              </span>
            </div>

            <Progress value={regenScore} max={100} className="h-2" />

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <p className="text-zinc-400">Immersion Level</p>
                <p className="font-medium">{userValue?.immersion_level || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-400">Time Value</p>
                <p className="font-medium">{userValue?.time_value_score?.toFixed(2) || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-400">Active Days</p>
                <p className="font-medium">{userValue?.active_days || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-400">Completions</p>
                <p className="font-medium">{userValue?.completions || 0}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
