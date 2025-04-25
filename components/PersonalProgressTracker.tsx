'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const milestones = [
  {
    label: 'Joined Supercivilization',
    achieved: true,
    icon: '/icons/icon-supercivilization.svg',
    gradient: 'from-zinc-400 to-zinc-900',
  },
  {
    label: 'Posted First Intention',
    achieved: false,
    icon: '/icons/icon-superachievers.svg',
    gradient: 'from-slate-400 to-slate-900',
  },
  {
    label: 'Unlocked Superachiever',
    achieved: false,
    icon: '/icons/icon-superachiever.svg',
    gradient: 'from-stone-400 to-stone-900',
  },
  {
    label: 'Completed Profile',
    achieved: false,
    icon: '/icons/icon-supermind-superpowers.svg',
    gradient: 'from-violet-400 via-fuchsia-400 to-pink-400',
  },
  {
    label: 'Invited a Friend',
    achieved: false,
    icon: '/icons/icon-superpuzzle-developments.svg',
    gradient: 'from-red-400 via-green-400 to-blue-400',
  },
];

export default function PersonalProgressTracker() {
  const [userMilestones, setUserMilestones] = useState(milestones);

  // Simulate progress for MVP demo
  useEffect(() => {
    // TODO: Replace with real user data fetch
    setTimeout(() => {
      setUserMilestones(prev => prev.map((m, i) => ({ ...m, achieved: i < 2 })));
    }, 1500);
  }, []);

  return (
    <Card className="mb-8 bg-zinc-900/80 border-fuchsia-900">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <Image
          src="/icons/icon-supercivilization.svg"
          alt="Sparkles"
          width={20}
          height={20}
          className="text-fuchsia-400"
        />
        <span className="text-lg font-bold text-fuchsia-200">Your Journey</span>
        <Badge className="ml-auto bg-fuchsia-700/80 text-xs">Progress</Badge>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {userMilestones.map((m, idx) => (
            <li key={m.label} className="flex items-center gap-3">
              <span
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-full border-2 bg-gradient-to-r ',
                  m.gradient,
                  m.achieved ? 'border-fuchsia-500' : 'border-zinc-700 opacity-60'
                )}
              >
                {m.icon ? (
                  <Image
                    src={m.icon}
                    alt={m.label}
                    width={20}
                    height={20}
                    className={cn('drop-shadow', m.achieved ? '' : 'grayscale opacity-60')}
                  />
                ) : (
                  idx + 1
                )}
              </span>
              <span
                className={cn('font-medium', m.achieved ? 'text-fuchsia-100' : 'text-zinc-400')}
              >
                {m.label}
              </span>
              {m.achieved && <Badge className="ml-2 bg-fuchsia-800/70 text-xs">Achieved</Badge>}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
