# Avolve API Examples

This guide provides practical examples for integrating with the Avolve platform's API.

## Authentication

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Sign in
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get current session
const { data: { session } } = await supabase.auth.getSession()
```

## Journey Posts

### Creating a Post

```typescript
import { createPost } from '@/lib/api/posts'

const post = await createPost({
  content: 'Starting my Superachiever journey!',
  journeyType: 'superachiever',
  tokenFee: 5
})
```

### Fetching Posts

```typescript
import { getPosts } from '@/lib/api/posts'

// Get all posts for a journey type
const posts = await getPosts({
  journeyType: 'superachiever',
  limit: 10,
  offset: 0
})

// Get posts with engagement metrics
const postsWithMetrics = await getPosts({
  journeyType: 'superachiever',
  includeMetrics: true
})
```

## Token System

### Token Transactions

```typescript
import { createTransaction, getTransactions } from '@/lib/api/tokens'

// Create a token transaction
const transaction = await createTransaction({
  tokenType: 'GEN',
  amount: 10,
  type: 'reward'
})

// Get transaction history
const transactions = await getTransactions({
  tokenType: 'GEN',
  limit: 20,
  offset: 0
})
```

### Token Analytics

```typescript
import { getTokenAnalytics } from '@/lib/api/tokens'

// Get token velocity and distribution metrics
const analytics = await getTokenAnalytics({
  tokenType: 'GEN',
  timeWindow: 'week'
})
```

## Real-time Subscriptions

```typescript
import { supabase } from '@/lib/supabase'

// Subscribe to new posts
const postsSubscription = supabase
  .channel('public:journey_posts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'journey_posts'
  }, (payload) => {
    console.log('New post:', payload.new)
  })
  .subscribe()

// Subscribe to token transactions
const tokenSubscription = supabase
  .channel('public:token_transactions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'token_transactions',
    filter: 'user_id=eq.' + userId
  }, (payload) => {
    console.log('Token update:', payload.new)
  })
  .subscribe()
```

## Error Handling

```typescript
import { SupabaseError } from '@/types/errors'

try {
  const result = await someApiCall()
} catch (error) {
  if (error instanceof SupabaseError) {
    switch (error.code) {
      case 'PGRST301':
        console.error('Foreign key violation')
        break
      case 'PGRST402':
        console.error('Row level security violation')
        break
      default:
        console.error('Unknown error:', error.message)
    }
  }
}
```

## Using React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { getPosts, createPost } from '@/lib/api/posts'

// Fetch posts
const { data: posts, isLoading } = useQuery({
  queryKey: ['posts', journeyType],
  queryFn: () => getPosts({ journeyType })
})

// Create post mutation
const { mutate: submitPost } = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  }
})
```

## Progressive Loading

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'
import { getPosts } from '@/lib/api/posts'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['posts', journeyType],
  queryFn: ({ pageParam = 0 }) => getPosts({
    journeyType,
    offset: pageParam,
    limit: 10
  }),
  getNextPageParam: (lastPage, pages) => {
    return lastPage.length === 10 ? pages.length * 10 : undefined
  }
})
```

## Accessibility Preferences

```typescript
import { getUserAccessibilityPreferences } from '@/lib/api/preferences'

// Get user's accessibility settings
const preferences = await getUserAccessibilityPreferences(userId)

// Apply preferences to UI
if (preferences.reduceMotion) {
  document.body.classList.add('reduce-motion')
}

if (preferences.highContrast) {
  document.body.classList.add('high-contrast')
}
```

These examples demonstrate the core functionality of the Avolve platform. For more detailed information, refer to the OpenAPI specification and the full API documentation.
