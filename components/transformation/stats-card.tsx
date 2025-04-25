'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { journeyThemes, type JourneyTheme } from '@/lib/styles/journey-themes';

interface JourneyStats {
  total_posts: number;
  total_engagement: number;
  total_tokens_spent: number;
  total_tokens_earned: number;
  average_regen_score: number;
}

interface StatsCardProps {
  stats: JourneyStats;
  theme: JourneyTheme;
  className?: string;
}

export function StatsCard({ stats, theme, className }: StatsCardProps) {
  const themeConfig = journeyThemes[theme];

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className={cn('absolute inset-0 opacity-5 bg-gradient-to-br', themeConfig.gradient)} />
      <CardHeader>
        <h3 className="font-semibold">Journey Stats</h3>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Posts</span>
            </div>
            <p className="text-2xl font-bold">{stats.total_posts}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <p className="text-2xl font-bold">{stats.total_engagement}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span className="text-sm font-medium">Tokens Spent</span>
            </div>
            <p className="text-2xl font-bold">{stats.total_tokens_spent}</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              <span className="text-sm font-medium">Tokens Earned</span>
            </div>
            <p className="text-2xl font-bold">{stats.total_tokens_earned}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Regen Score</span>
            </div>
            <span className="text-sm">{stats.average_regen_score}%</span>
          </div>
          <Progress
            value={stats.average_regen_score}
            max={100}
            className={cn('h-2', `bg-gradient-to-r ${themeConfig.gradient}`)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
