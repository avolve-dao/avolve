"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users } from "lucide-react";
import Image from "next/image";

interface LeaderboardSectionProps {
  userId: string;
}

export function LeaderboardSection({ userId }: LeaderboardSectionProps) {
  const supabase = createClient();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!userId) return;
      
      try {
        // Get leaderboard data
        const { data, error } = await supabase
          .from('event_completions')
          .select(`
            user_id,
            profiles (
              full_name,
              avatar_url
            ),
            total_points:points(sum)
          `)
          .order('total_points', { ascending: false })
          .limit(10);
        
        if (error) {
          throw error;
        }
        
        // Format the leaderboard data
        const formattedData = data.map(entry => ({
          user_id: entry.user_id,
          profiles: entry.profiles[0] || { full_name: null, avatar_url: null },
          total_points: entry.total_points[0]?.sum || 0
        }));
        
        setLeaderboard(formattedData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up real-time subscription for leaderboard updates
    const channel = supabase
      .channel('event-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_completions'
        },
        (payload) => {
          // Refresh leaderboard on new event completion
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  if (isLoading) {
    return null; // Handled by Suspense
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Rank</TableHead>
          <TableHead>Participant</TableHead>
          <TableHead className="text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((entry, index) => (
          <TableRow key={entry.user_id}>
            <TableCell className="font-medium">
              {index === 0 ? (
                <Trophy className="h-5 w-5 text-yellow-500" />
              ) : (
                <span>{index + 1}</span>
              )}
            </TableCell>
            <TableCell className="flex items-center space-x-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                {entry.profiles.avatar_url ? (
                  <Image 
                    src={entry.profiles.avatar_url} 
                    alt={entry.profiles.full_name || 'User'} 
                    width={32} 
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <Users className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-zinc-400" />
                )}
              </div>
              <span>{entry.profiles.full_name || 'Anonymous User'}</span>
              {entry.user_id === userId && (
                <Badge variant="outline" className="ml-2">You</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">{entry.total_points}</TableCell>
          </TableRow>
        ))}
        {leaderboard.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-4 text-zinc-500">
              No participants yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
