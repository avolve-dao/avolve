# Avolve Platform Developer Guide 2025

Copyright © 2025 Avolve DAO. All rights reserved.

## Introduction

This guide provides comprehensive documentation for developers working on the Avolve platform. It covers best practices, architecture patterns, and implementation details for the token system and experience phases framework.

## Architecture Overview

The Avolve platform follows a modern architecture pattern combining:

1. **Next.js App Router**: For server-side rendering and client-side interactivity
2. **React Server Components**: For improved performance and data fetching
3. **Supabase**: For database, authentication, and real-time updates
4. **PostgreSQL Functions**: For secure business logic implementation

### Key Directories

- `/app`: Next.js application routes
- `/components`: React components organized by feature
- `/hooks`: Custom React hooks for state management and data fetching
- `/lib`: Utility functions and services
- `/supabase`: Database migrations and type definitions
- `/docs`: Technical documentation

## Database Best Practices

### PostgreSQL Functions

When creating PostgreSQL functions, follow these guidelines:

```sql
create or replace function public.function_name(
  p_param1 type,
  p_param2 type
)
returns return_type
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_variable type;
begin
  -- Function body
  return result;
end;
$$;
```

Key points:
- Always use `security invoker` unless there's a specific reason for `security definer`
- Always set `search_path = ''` to prevent SQL injection
- Use fully qualified names (e.g., `public.table_name`)
- Add parameter validation at the beginning of the function
- Use transactions for multi-step operations
- Add comprehensive error handling
- Document the function with comments

### Row Level Security

Always implement Row Level Security (RLS) for all tables:

```sql
-- Enable RLS
alter table public.table_name enable row level security;

-- Create policies
create policy "Users can view their own data"
  on public.table_name for select
  using (auth.uid() = user_id);

create policy "Users can update their own data"
  on public.table_name for update
  using (auth.uid() = user_id);
```

### Database Migrations

When creating migrations:
- Use the naming convention `YYYYMMDDHHmmss_short_description.sql`
- Include a header comment explaining the purpose
- Add comments for complex operations
- Test migrations in a development environment before applying to production
- Include rollback instructions when possible

## React Component Patterns

### Server Components vs. Client Components

Use React Server Components for:
- Data fetching
- Static content rendering
- SEO-critical content

Use Client Components for:
- Interactive UI elements
- State management
- Event handling

Example pattern:

```tsx
// ServerComponent.tsx
import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import ClientComponent from './ClientComponent';
import LoadingSkeleton from './LoadingSkeleton';

// Server component for data fetching
async function DataFetcher({ userId }: { userId: string }) {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.from('table').select().eq('user_id', userId);
  return <ClientComponent data={data} />;
}

// Export with Suspense
export function ServerComponent(props: { userId: string }) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DataFetcher {...props} />
    </Suspense>
  );
}
```

```tsx
// ClientComponent.tsx
'use client';

import { useState } from 'react';

export default function ClientComponent({ data }: { data: any[] }) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  
  // Interactive UI logic
  
  return (
    // JSX with event handlers
  );
}
```

### Component Organization

Organize components by feature rather than type:

```
/components
  /dashboard
    /journey-map
      index.tsx
      journey-map-item.tsx
      phase-indicator.tsx
    /focus-mode
      index.tsx
      recommendation-card.tsx
  /tokens
    /token-balance
      index.tsx
      balance-card.tsx
    /token-transfer
      index.tsx
      transfer-form.tsx
```

## Custom Hooks

### Hook Best Practices

1. **Use TypeScript**: Always define proper types for parameters and return values
2. **Implement Error Handling**: Provide clear error states and messages
3. **Optimize Re-renders**: Use `useCallback` and `useMemo` for performance
4. **Handle Loading States**: Provide loading indicators for async operations
5. **Support SSR**: Ensure hooks work with server-side rendering

Example pattern:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/components/supabase/provider';

interface UseEntityResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useEntity<T>(
  tableName: string,
  options?: {
    filter?: Record<string, any>;
    orderBy?: string;
    limit?: number;
  }
): UseEntityResult<T> {
  const { supabase } = useSupabase();
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!supabase) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase.from(tableName).select();
      
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options?.orderBy) {
        query = query.order(options.orderBy);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error: apiError } = await query;
      
      if (apiError) throw apiError;
      
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, tableName, options]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    isLoading,
    error,
    refresh: fetchData
  };
}
```

## Working with the Token System

### Token Service

The `tokensService` provides methods for interacting with the token system:

```typescript
import { tokensService } from '@/lib/tokens';

// Get all tokens
const { data: tokens } = await tokensService.getAllTokens();

// Get user balances
const { data: balances } = await tokensService.getUserBalances(userId);

// Transfer tokens
const result = await tokensService.transferTokens(
  fromUserId,
  toUserId,
  tokenId,
  amount,
  reason
);
```

### Token Hook

The `useTokens` hook provides a React interface to the token system:

```typescript
import { useTokens } from '@/hooks/use-tokens';

function TokenBalanceDisplay() {
  const { 
    tokens, 
    userBalances, 
    isLoading, 
    error, 
    getTokenBalance 
  } = useTokens();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  const genBalance = getTokenBalance('GEN');
  
  return (
    <div>
      <h2>GEN Balance: {genBalance}</h2>
      {/* Other UI */}
    </div>
  );
}
```

## Working with Experience Phases

### Experience Phases Hook

The `useExperiencePhases` hook provides methods for working with the experience phases system:

```typescript
import { useExperiencePhases } from '@/hooks/use-experience-phases';

function PhaseDisplay() {
  const { 
    userProgress, 
    isLoading, 
    getCurrentPhase, 
    getPhaseProgress 
  } = useExperiencePhases();
  
  if (isLoading) return <LoadingSpinner />;
  
  const currentPhase = getCurrentPhase('superachiever');
  const progress = getPhaseProgress('superachiever');
  
  return (
    <div>
      <h2>Current Phase: {currentPhase}</h2>
      <ProgressBar value={progress} />
      {/* Other UI */}
    </div>
  );
}
```

### Completing Milestones

To mark a milestone as completed:

```typescript
import { useExperiencePhases } from '@/hooks/use-experience-phases';

function MilestoneComponent({ milestoneId }: { milestoneId: string }) {
  const { completeMilestone, isLoading } = useExperiencePhases();
  
  const handleComplete = async () => {
    try {
      const result = await completeMilestone(milestoneId);
      if (result.success) {
        // Show success message
      }
    } catch (error) {
      // Handle error
    }
  };
  
  return (
    <button 
      onClick={handleComplete} 
      disabled={isLoading}
    >
      Complete Milestone
    </button>
  );
}
```

## Performance Optimization

### React Server Components

Use React Server Components for data-heavy components:

```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { JourneyMap } from '@/components/dashboard/journey-map';
import { FocusMode } from '@/components/dashboard/focus-mode';
import { FeaturePreview } from '@/components/dashboard/feature-preview';
import { DashboardSkeleton } from '@/components/skeletons';

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  
  if (!userId) {
    redirect('/login');
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Suspense fallback={<DashboardSkeleton type="focus" />}>
            <FocusMode userId={userId} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<DashboardSkeleton type="features" />}>
            <FeaturePreview userId={userId} />
          </Suspense>
        </div>
      </div>
      
      <Suspense fallback={<DashboardSkeleton type="journey" />}>
        <JourneyMap userId={userId} />
      </Suspense>
    </div>
  );
}
```

### Optimizing Database Queries

1. **Use RPC Functions**: Prefer RPC functions over direct queries for complex operations
2. **Select Only Needed Fields**: Specify only required columns in select statements
3. **Use Pagination**: Implement pagination for large datasets
4. **Implement Caching**: Use materialized views for frequently accessed data

Example:

```typescript
// Bad: Fetching all fields
const { data } = await supabase.from('user_tokens').select('*');

// Good: Fetching only needed fields
const { data } = await supabase.from('user_tokens').select(`
  token_id,
  balance,
  tokens (
    symbol,
    name
  )
`);

// Better: Using an RPC function
const { data } = await supabase.rpc('get_user_token_balances', {
  p_user_id: userId
});
```

### Optimizing React Components

1. **Memoization**: Use `useMemo` and `useCallback` for expensive calculations
2. **Code Splitting**: Use dynamic imports for large components
3. **Virtualization**: Implement virtualization for long lists
4. **Lazy Loading**: Implement lazy loading for off-screen content

Example:

```tsx
import { useState, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

function OptimizedList({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('');
  
  // Memoize filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);
  
  // Virtualize the list
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  // Memoize handler
  const handleItemClick = useCallback((id: string) => {
    // Handle click
  }, []);
  
  return (
    <div>
      <input 
        type="text" 
        value={filter} 
        onChange={e => setFilter(e.target.value)} 
        placeholder="Filter items..." 
      />
      
      <div 
        ref={parentRef} 
        className="h-[500px] overflow-auto"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map(virtualRow => (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              onClick={() => handleItemClick(filteredItems[virtualRow.index].id)}
            >
              {filteredItems[virtualRow.index].name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Testing

### Unit Testing

Use Vitest for unit testing:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useTokens } from '@/hooks/use-tokens';

// Mock Supabase
vi.mock('@/components/supabase/provider', () => ({
  useSupabase: () => ({
    supabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: [{ id: '1', symbol: 'GEN', balance: 100 }],
        error: null
      }),
      channel: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    },
    session: { user: { id: 'user-123' } }
  })
}));

describe('useTokens', () => {
  it('should fetch token balances', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTokens());
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.getTokenBalance('GEN')).toBe(100);
  });
});
```

### Integration Testing

Use Playwright for integration testing:

```typescript
import { test, expect } from '@playwright/test';

test('user can view token balances', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to tokens page
  await page.goto('/tokens');
  
  // Check if token balances are displayed
  await expect(page.locator('[data-testid="token-balance-GEN"]')).toBeVisible();
  
  // Check if the balance is displayed correctly
  const balance = await page.locator('[data-testid="token-balance-GEN"]').textContent();
  expect(balance).toContain('100');
});
```

## Deployment

### Supabase Migrations

To apply database migrations:

```bash
# Copy migration file to Supabase migrations directory
cp temp_migrations/YYYYMMDDHHmmss_description.sql supabase/migrations/

# Apply migration
supabase db push
```

### Next.js Deployment

To deploy the Next.js application:

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel deploy --prod
```

## Conclusion

This developer guide provides a comprehensive overview of the Avolve platform architecture, best practices, and implementation details. By following these guidelines, you'll ensure that your code is maintainable, performant, and aligned with the platform's design principles.

For more detailed information, refer to the specific documentation for each system:

- [Token System Documentation](./TOKEN-SYSTEM.md)
- [Experience Phases Documentation](./EXPERIENCE-PHASES.md)
- [Implementation Guide](../IMPLEMENTATION-GUIDE.md)
- [UX Improvements](../README-UX-IMPROVEMENTS.md)
