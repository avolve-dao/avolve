# Avolve Platform Implementation Guide

This guide provides step-by-step instructions for implementing the UX/UI improvements and gamification framework in the Avolve platform.

## Database Implementation

### 1. Apply Database Migration

The migration file `temp_migrations/20250410110100_create_experience_phases.sql` needs to be moved to the Supabase migrations directory and applied:

```bash
# Copy the migration file to the Supabase migrations directory
cp temp_migrations/20250410110100_create_experience_phases.sql supabase/migrations/

# Apply the migration
supabase db push
```

### 2. Verify Database Schema

After applying the migration, verify that the following tables have been created:

- `user_pillar_progress`: Tracks user progression through experience phases
- `user_phase_transitions`: Records history of phase transitions
- `phase_milestones`: Defines milestones for each phase
- `user_milestone_progress`: Tracks user progress on milestones
- `phase_requirements`: Defines requirements for phase advancement

## Component Integration

### 1. Add Provider to Layout

Update your root layout to include the Supabase provider:

```tsx
// app/layout.tsx
import { SupabaseProvider } from '@/components/supabase/provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
```

### 2. Integrate Unified Navigation

Replace your existing navigation with the enhanced unified navigation:

```tsx
// app/(main)/layout.tsx
import { UnifiedNav } from '@/components/navigation/unified-nav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <UnifiedNav />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
```

### 3. Create Pillar Route Structure

Implement the route structure for each pillar with experience phases:

```
/app/(superachiever)/
  discover/page.tsx
  onboard/page.tsx
  scaffold/page.tsx
  endgame/page.tsx
  layout.tsx

/app/(superachievers)/
  discover/page.tsx
  onboard/page.tsx
  scaffold/page.tsx
  endgame/page.tsx
  layout.tsx

/app/(supercivilization)/
  discover/page.tsx
  onboard/page.tsx
  scaffold/page.tsx
  endgame/page.tsx
  layout.tsx
```

## Component Usage

### 1. Dashboard Implementation

Enhance your dashboard to include the journey map and focus mode components:

```tsx
// app/dashboard/page.tsx
import { JourneyMap } from '@/components/dashboard/journey-map';
import { FocusMode } from '@/components/dashboard/focus-mode';
import { FeaturePreview } from '@/components/dashboard/feature-preview';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { useTokens } from '@/hooks/use-tokens';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  const { tokens } = useTokens();

  if (!userId) {
    return <div>Please sign in to view your dashboard</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <FocusMode userId={userId} />
        </div>
        <div>
          <FeaturePreview userId={userId} />
        </div>
      </div>

      <div>
        <JourneyMap userId={userId} />
      </div>
    </div>
  );
}
```

### 2. Pillar Phase Pages

Create template pages for each experience phase within each pillar:

```tsx
// app/(superachiever)/discover/page.tsx (example)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function SuperachieverDiscover() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Fetch discovery phase content for Superachiever pillar
  const { data: phaseContent } = await supabase
    .from('phase_content')
    .select('*')
    .eq('pillar', 'superachiever')
    .eq('phase', 'discover')
    .single();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Discover Your Superachiever Journey</h1>
      <p className="text-xl text-muted-foreground">
        Begin your personal transformation journey and unlock your full potential.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Success Puzzle</CardTitle>
            <CardDescription>Enhance your health, wealth, and peace in life</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Discover how the Personal Success Puzzle can help you achieve greater personal
              successes faster.
            </p>
            <Link href="/superachiever/onboard?focus=personal">
              <Button>
                Explore Personal Success
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Success Puzzle</CardTitle>
            <CardDescription>Enhance your network and advance your net worth</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Discover how the Business Success Puzzle can help you achieve greater business
              successes faster.
            </p>
            <Link href="/superachiever/onboard?focus=business">
              <Button>
                Explore Business Success
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## Hooks Usage

### 1. Using Progress Hooks

Implement the user progress hooks in your components:

```tsx
'use client';

import { useUserProgress } from '@/hooks/use-user-progress';
import { useTokens } from '@/hooks/use-tokens';

export function UserProgressDisplay() {
  const { userProgress, isLoading, error } = useUserProgress();
  const { tokens } = useTokens();

  if (isLoading) return <div>Loading progress...</div>;
  if (error) return <div>Error loading progress</div>;

  return (
    <div>
      <h2>Your Progress</h2>

      <div className="space-y-4">
        {Object.entries(userProgress || {}).map(([pillar, progress]) => (
          <div key={pillar} className="border p-4 rounded-md">
            <h3 className="capitalize">{pillar}</h3>
            <p>Current Phase: {progress.current_phase}</p>
            <p>Phase Progress: {progress.phase_progress}%</p>
            <p>Completed Milestones: {progress.completed_milestones.length}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-6">Your Tokens</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tokens?.map(token => (
          <div key={token.id} className="border p-4 rounded-md">
            <h3>{token.symbol}</h3>
            <p>{token.name}</p>
            <p className="text-xl font-bold">{token.balance}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Advancing User Phases

Implement functions to advance users through experience phases:

```tsx
'use client';

import { useState } from 'react';
import { useUserProgress } from '@/hooks/use-user-progress';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function PhaseAdvancement() {
  const { userProgress, advanceToNextPhase, isLoading } = useUserProgress();
  const [advancing, setAdvancing] = useState(false);

  const handleAdvance = async (pillar: string) => {
    if (!userProgress) return;

    setAdvancing(true);
    try {
      const result = await advanceToNextPhase(pillar as any);
      if (result) {
        toast({
          title: 'Phase Advanced!',
          description: `You've advanced to the ${result.current_phase} phase in ${pillar}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not advance phase',
        variant: 'destructive',
      });
    } finally {
      setAdvancing(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {Object.entries(userProgress || {}).map(([pillar, progress]) => (
        <div key={pillar} className="border p-4 rounded-md">
          <h3 className="capitalize">{pillar}</h3>
          <p>Current Phase: {progress.current_phase}</p>
          <Button
            onClick={() => handleAdvance(pillar)}
            disabled={advancing || progress.current_phase === 'endgame'}
          >
            Advance to Next Phase
          </Button>
        </div>
      ))}
    </div>
  );
}
```

## Testing Implementation

### 1. Test Phase Progression

Test the phase progression system with the following steps:

1. Create test users in different phases
2. Verify that the navigation adapts based on user phase
3. Complete milestones and verify phase advancement
4. Test token rewards and feature unlocking

### 2. Test Token Integration

Verify token integration with these steps:

1. Earn tokens through milestone completion
2. Check token balances update in real-time
3. Verify token-gated features are properly restricted
4. Test token exchange functionality if implemented

## Performance Considerations

### 1. Optimize Data Fetching

Implement efficient data fetching patterns:

```tsx
// Fetch only what's needed for the current view
const { data } = await supabase
  .from('user_pillar_progress')
  .select('pillar, current_phase, phase_progress')
  .eq('user_id', userId);
```

### 2. Implement Caching

Use SWR or React Query for client-side data fetching with caching:

```tsx
import useSWR from 'swr';

function useUserData(userId: string) {
  return useSWR(userId ? `/api/user-data?userId=${userId}` : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });
}
```

## Deployment Checklist

Before deploying to production:

1. ✅ Verify all database migrations are applied
2. ✅ Test all components with real user data
3. ✅ Ensure proper error handling throughout the application
4. ✅ Optimize bundle size and performance
5. ✅ Test on mobile devices and different browsers
6. ✅ Verify accessibility compliance
7. ✅ Set up monitoring for key user journeys

## Conclusion

By following this implementation guide, you'll create a comprehensive gamified experience that guides users through Yu-kai Chou's four experience phases across all three pillars of the Avolve platform. This approach will enhance user engagement, retention, and satisfaction by providing clear progression paths and meaningful rewards throughout their journey.
