'use client';

/**
 * Real-Time SSA Leaderboard Component
 * 
 * Displays a real-time leaderboard for SSA events with Supabase subscriptions
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Medal, Award, Crown, ArrowUp, ArrowDown, Minus } from 'lucide-react';

// UI components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Types
import type { Database } from '@/types/supabase';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  points: number;
  rank: number;
  previous_rank: number | null;
  event_completions: number;
  scq_earned: number;
}

interface RealTimeSSALeaderboardProps {
  userId: string;
  initialData?: LeaderboardEntry[];
}

export function RealTimeSSALeaderboard({ userId, initialData }: RealTimeSSALeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [highlightedEntry, setHighlightedEntry] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  
  // Fetch leaderboard data
  useEffect(() => {
    if (!initialData) {
      const fetchLeaderboard = async () => {
        setLoading(true);
        
        // Determine the appropriate RPC function based on timeframe
        const rpcFunction = 
          timeframe === 'weekly' ? 'get_ssa_weekly_leaderboard' :
          timeframe === 'monthly' ? 'get_ssa_monthly_leaderboard' :
          'get_ssa_alltime_leaderboard';
        
        const { data, error } = await supabase.rpc(rpcFunction);
        
        if (error) {
          console.error(`Error fetching ${timeframe} leaderboard:`, error);
        } else {
          setLeaderboardData(data || []);
        }
        
        setLoading(false);
      };
      
      fetchLeaderboard();
    }
  }, [timeframe, initialData, supabase]);
  
  // Set up real-time subscription for leaderboard updates
  useEffect(() => {
    // Determine the appropriate channel based on timeframe
    const channelName = 
      timeframe === 'weekly' ? 'ssa-weekly-leaderboard' :
      timeframe === 'monthly' ? 'ssa-monthly-leaderboard' :
      'ssa-alltime-leaderboard';
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ssa_leaderboard',
          filter: timeframe === 'weekly' ? 'timeframe=eq.weekly' : 
                 timeframe === 'monthly' ? 'timeframe=eq.monthly' : 
                 'timeframe=eq.alltime'
        },
        (payload) => {
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as LeaderboardEntry;
            setLeaderboardData(prev => {
              const updated = [...prev, newEntry].sort((a, b) => b.points - a.points);
              // Recalculate ranks
              return updated.map((entry, index) => ({
                ...entry,
                rank: index + 1
              }));
            });
            setHighlightedEntry(newEntry.id);
          } else if (payload.eventType === 'UPDATE') {
            const updatedEntry = payload.new as LeaderboardEntry;
            setLeaderboardData(prev => {
              const updated = prev.map(entry => 
                entry.id === updatedEntry.id ? updatedEntry : entry
              ).sort((a, b) => b.points - a.points);
              // Recalculate ranks
              return updated.map((entry, index) => ({
                ...entry,
                rank: index + 1
              }));
            });
            setHighlightedEntry(updatedEntry.id);
          } else if (payload.eventType === 'DELETE') {
            const deletedEntry = payload.old as LeaderboardEntry;
            setLeaderboardData(prev => {
              const updated = prev.filter(entry => entry.id !== deletedEntry.id)
                .sort((a, b) => b.points - a.points);
              // Recalculate ranks
              return updated.map((entry, index) => ({
                ...entry,
                rank: index + 1
              }));
            });
          }
          
          // Clear highlight after 3 seconds
          setTimeout(() => {
            setHighlightedEntry(null);
          }, 3000);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeframe, supabase]);
  
  // Get user's position in the leaderboard
  const userPosition = leaderboardData.findIndex(entry => entry.user_id === userId);
  const userEntry = userPosition !== -1 ? leaderboardData[userPosition] : null;
  
  // Render rank change indicator
  const renderRankChange = (current: number, previous: number | null) => {
    if (previous === null) return <Badge variant="outline">New</Badge>;
    if (current < previous) {
      return (
        <div className="flex items-center text-green-500">
          <ArrowUp className="w-3 h-3 mr-1" />
          <span className="text-xs">{previous - current}</span>
        </div>
      );
    } else if (current > previous) {
      return (
        <div className="flex items-center text-red-500">
          <ArrowDown className="w-3 h-3 mr-1" />
          <span className="text-xs">{current - previous}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-muted-foreground">
          <Minus className="w-3 h-3 mr-1" />
          <span className="text-xs">0</span>
        </div>
      );
    }
  };
  
  // Get the appropriate icon for the rank
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center font-medium">{rank}</span>;
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-slate-500" />
            SSA Leaderboard
          </CardTitle>
          <CardDescription>Loading leaderboard data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-slate-500" />
            SSA Leaderboard
          </CardTitle>
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
              <TabsTrigger value="alltime" className="text-xs">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardDescription>
          {timeframe === 'weekly' 
            ? 'Wednesday SSA events - Updated in real-time' 
            : timeframe === 'monthly'
            ? 'Monthly SSA participation rankings'
            : 'All-time Superachievers rankings'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {leaderboardData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No leaderboard data available</p>
            <p className="text-sm">Be the first to participate in SSA events!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Top 10 entries */}
            {leaderboardData.slice(0, 10).map((entry) => (
              <motion.div
                key={entry.id}
                initial={entry.id === highlightedEntry ? { backgroundColor: 'rgba(99, 102, 241, 0.1)' } : {}}
                animate={entry.id === highlightedEntry 
                  ? { backgroundColor: ['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0)'] } 
                  : {}
                }
                transition={{ duration: 2 }}
                className={`flex items-center justify-between py-2 px-2 rounded-md ${
                  entry.user_id === userId ? 'bg-slate-100 dark:bg-slate-800' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatar_url || ''} alt={entry.display_name} />
                    <AvatarFallback className="bg-slate-200 text-slate-800">
                      {entry.display_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {entry.display_name}
                      {entry.user_id === userId && (
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.event_completions} events · {entry.scq_earned} SCQ
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{entry.points}</p>
                    <div className="flex justify-end">
                      {renderRankChange(entry.rank, entry.previous_rank)}
                    </div>
                  </div>
                  {entry.rank <= 3 && (
                    <div className={`w-1 h-8 rounded-full ${
                      entry.rank === 1 ? 'bg-yellow-500' :
                      entry.rank === 2 ? 'bg-slate-400' :
                      'bg-amber-700'
                    }`} />
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* User's position if not in top 10 */}
            {userPosition >= 10 && userEntry && (
              <>
                <div className="flex items-center justify-center py-1">
                  <div className="w-1/3 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="px-2 text-xs text-muted-foreground">Your Position</span>
                  <div className="w-1/3 h-px bg-slate-200 dark:bg-slate-700" />
                </div>
                
                <motion.div
                  initial={userEntry.id === highlightedEntry ? { backgroundColor: 'rgba(99, 102, 241, 0.1)' } : {}}
                  animate={userEntry.id === highlightedEntry 
                    ? { backgroundColor: ['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0)'] } 
                    : {}
                  }
                  transition={{ duration: 2 }}
                  className="flex items-center justify-between py-2 px-2 rounded-md bg-slate-100 dark:bg-slate-800"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 flex justify-center">
                      <span className="text-sm font-medium">{userEntry.rank}</span>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userEntry.avatar_url || ''} alt={userEntry.display_name} />
                      <AvatarFallback className="bg-slate-200 text-slate-800">
                        {userEntry.display_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {userEntry.display_name}
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {userEntry.event_completions} events · {userEntry.scq_earned} SCQ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{userEntry.points}</p>
                      <div className="flex justify-end">
                        {renderRankChange(userEntry.rank, userEntry.previous_rank)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
