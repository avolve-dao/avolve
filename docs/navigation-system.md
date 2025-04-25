# Avolve Navigation System

Copyright 2025 Avolve DAO and the Joshua Seymour Family. All rights reserved. Proprietary and confidential.

This document and its contents are proprietary and confidential.

## Overview

The Avolve navigation system provides a unified, accessible, and mobile-first approach to routing and navigation. All routes are consolidated under the `/super/` structure for consistency and clarity.

## Route Structure

### Core Routes

```
/super/
  ├── personal     # Personal growth and development
  ├── business     # Business and entrepreneurship
  ├── mind         # Mental models and cognition
  ├── puzzle       # Problem-solving challenges
  ├── human        # Human potential and psychology
  ├── society      # Social impact and community
  ├── genius       # Advanced learning and mastery
  └── civilization # Collective advancement
```

Each route includes:

- Clear label for display
- Optional description
- Associated icon from `lucide-react`
- TypeScript type safety

## Navigation Components

### 1. UnifiedNav

Primary navigation component that adapts to different screen sizes and contexts.

```typescript
import { UnifiedNav } from '@/components/navigation/unified-nav'

// Usage
<UnifiedNav routes={superRoutes} />
```

### 2. NavMain

Main navigation grid for desktop views.

```typescript
import { NavMain } from '@/components/nav-main'

// Usage
<NavMain routes={superRoutes} />
```

### 3. MobileNav

Bottom navigation for mobile devices.

```typescript
import { MobileNav } from '@/components/mobile-nav'

// Usage
<MobileNav routes={superRoutes} />
```

### 4. SwipeNavigation

Touch-based navigation between routes.

```typescript
import { SwipeNavigation } from '@/components/swipe-navigation'

// Usage
<SwipeNavigation routes={superRoutes}>
  {children}
</SwipeNavigation>
```

## TypeScript Interfaces

### Route Definition

```typescript
interface SuperRoute {
  path: string; // Route path under /super/
  label: string; // Display label
  description?: string; // Optional description
  icon: LucideIcon; // Icon component
  priority?: number; // Optional display priority
}
```

### Navigation Props

```typescript
interface NavigationProps {
  routes: SuperRoute[];
  currentPath?: string;
  onRouteChange?: (path: string) => void;
}
```

## Best Practices

1. **Route Naming**

   - Use descriptive, lowercase names
   - Avoid special characters
   - Keep paths short and meaningful

2. **Mobile-First Design**

   - Implement touch-friendly targets
   - Support gesture navigation
   - Optimize for small screens first

3. **Accessibility**

   - Include ARIA labels
   - Support keyboard navigation
   - Maintain focus management

4. **Performance**
   - Use React Server Components where possible
   - Implement proper loading states
   - Optimize bundle size

## Adding New Routes

1. Add route definition to `lib/navigation.ts`:

```typescript
export const superRoutes: SuperRoute[] = [
  {
    path: '/super/new-route',
    label: 'New Route',
    description: 'Description of the new route',
    icon: NewIcon,
    priority: 1,
  },
  // ...existing routes
];
```

2. Create the route component:

```typescript
// app/(authenticated)/super/new-route/page.tsx
export default function NewRoutePage() {
  return (
    <div>
      <h1>New Route</h1>
      {/* Route content */}
    </div>
  );
}
```

3. Update tests:

```typescript
// __tests__/navigation.test.tsx
describe('Navigation with new route', () => {
  it('should display new route', () => {
    render(<UnifiedNav routes={superRoutes} />);
    expect(screen.getByText('New Route')).toBeInTheDocument();
  });
});
```

## Security Considerations

1. **Route Protection**

   - All `/super/` routes require authentication
   - Implement proper role-based access
   - Add rate limiting for API routes

2. **Data Validation**
   - Validate route parameters
   - Sanitize user input
   - Implement proper error boundaries

## Testing

1. **Unit Tests**

   - Test navigation components in isolation
   - Verify route protection
   - Check accessibility features

2. **Integration Tests**

   - Test navigation flows
   - Verify route transitions
   - Check mobile interactions

3. **E2E Tests**
   - Test complete user journeys
   - Verify deep linking
   - Check SEO requirements

## Performance Monitoring

1. **Metrics to Track**

   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Navigation timing
   - Error rates

2. **Optimization Tips**
   - Implement proper caching
   - Use dynamic imports for routes
   - Optimize icon loading

## Future Enhancements

1. **AI-Enhanced Navigation**

   - Personalized route suggestions
   - Smart search integration
   - Usage pattern optimization

2. **Advanced Features**

   - Route-specific themes
   - Animated transitions
   - Progressive loading

3. **Analytics Integration**
   - Navigation path analysis
   - User behavior tracking
   - Performance monitoring

## Conclusion

The Avolve navigation system provides a robust, type-safe, and user-friendly way to handle routing in the application. By following these guidelines and best practices, we ensure a consistent and maintainable navigation experience across all parts of the platform.
