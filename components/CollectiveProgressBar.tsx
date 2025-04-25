'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Simulate collective progress for MVP
const TOTAL_GOAL = 100;
const INITIAL_PROGRESS = 37;

export default function CollectiveProgressBar() {
  const [progress, setProgress] = useState(INITIAL_PROGRESS);

  // Simulate real-time growth
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev < TOTAL_GOAL ? prev + Math.floor(Math.random() * 2) : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const percent = Math.min(100, Math.round((progress / TOTAL_GOAL) * 100));

  return (
    <Card className="mb-8 bg-gradient-to-r from-fuchsia-900/80 to-zinc-900/80 border-fuchsia-900">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Image
          src="/icons/icon-superachievers.svg"
          alt="Collective Progress"
          width={20}
          height={20}
          className="text-fuchsia-400"
        />
        <span className="text-lg font-bold text-fuchsia-200">Collective Progress</span>
        <Badge className="ml-auto bg-fuchsia-700/80 text-xs">
          {progress} / {TOTAL_GOAL}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="w-full rounded-full h-4 overflow-hidden relative bg-gradient-to-r from-slate-800 via-fuchsia-900 to-zinc-900">
          <div
            className={cn(
              'h-4 rounded-full transition-all duration-700',
              percent === 100
                ? 'bg-gradient-to-r from-fuchsia-400 to-yellow-300'
                : 'bg-gradient-to-r from-slate-400 via-fuchsia-500 to-zinc-400'
            )}
            style={{ width: `${percent}%` }}
          />
          {percent === 100 && (
            <Image
              src="/icons/icon-supercivilization.svg"
              alt="Supercivilization"
              width={28}
              height={28}
              className="absolute right-2 top-1/2 -translate-y-1/2 animate-bounce"
            />
          )}
        </div>
        <div className="mt-2 text-xs text-zinc-400">
          Together, we've completed <span className="text-fuchsia-300 font-bold">{progress}</span>{' '}
          actions on our journey from Degen to Regen—unlocking the Supercivilization!
        </div>
      </CardContent>
    </Card>
  );
}
