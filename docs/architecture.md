# Architecture Overview

This document provides an overview of the Avolve application architecture, design decisions, and technical implementation details.

> **Last Updated:** April 6, 2025  
> **Related Documents:** [Documentation Index](./index.md) | [Master Plan](./master-plan.md) | [Database Documentation](./avolve-database-documentation.md) | [Integration Assessment System](./integration-assessment-system.md)

## System Architecture

Avolve follows a modern web application architecture with the following key components:

### Frontend Architecture

```
┌─────────────────────────────────┐
│           Next.js App           │
├─────────────────────────────────┤
│                                 │
│  ┌─────────┐     ┌─────────┐   │
│  │  Pages  │     │  API    │   │
│  │         │     │ Routes  │   │
│  └─────────┘     └─────────┘   │
│                                 │
│  ┌─────────┐     ┌─────────┐   │
│  │Components│     │ Hooks   │   │
│  │         │     │         │   │
│  └─────────┘     └─────────┘   │
│                                 │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│      Service Layer              │
│  ┌─────────┐     ┌─────────┐   │
│  │  Auth   │     │  Token  │   │
│  │ Service │     │ Service │   │
│  └─────────┘     └─────────┘   │
│                                 │
│  ┌─────────┐     ┌─────────┐   │
│  │Permission│     │ Audit   │   │
│  │ Service  │     │ Service │   │
│  └─────────┘     └─────────┘   │
│                                 │
│  ┌─────────┐     ┌─────────┐   │
│  │Notification    │Integration│ │
│  │ Service  │     │ Service │   │
│  └─────────┘     └─────────┘   │
│                                 │
│  ┌─────────┐                   │
│  │Notification                 │
│  │ Service  │                   │
│  └─────────┘                   │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│        Supabase Client          │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│        Supabase Backend         │
│  ┌─────────┐     ┌─────────┐   │
│  │PostgreSQL│     │  Auth   │   │
│  │ Database │     │ Service │   │
│  └─────────┘     └─────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Key Components

1. **Next.js Application**
   - Server-side rendered React application
   - App Router for file-based routing
   - API Routes for server-side functionality

2. **Service Layer**
   - AuthService: Handles user authentication and session management
   - TokenService: Manages token operations, balances, and transfers
   - PermissionService: Handles user permissions and access control
   - NotificationService: Manages user notifications
   - AuditService: Tracks important system activities for security and compliance
   - IntegrationService: Manages integration assessment, profiles, and exercises

3. **Supabase Integration**
   - PostgreSQL database with optimized schema
   - Authentication service
   - Row-Level Security (RLS) policies
   - Real-time subscriptions
   - Database functions for complex operations

4. **Deployment Infrastructure**
   - Vercel for hosting the Next.js application
   - Supabase for database and authentication
   - GitHub Actions for CI/CD

## Design Patterns

### 1. Server Components and Client Components

The application leverages Next.js 15's server and client components:

- **Server Components**: Used for data fetching and rendering static content
- **Client Components**: Used for interactive elements and state management

Example of component separation:

```tsx
// Server Component
// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  return <DashboardClient user={user} />
}

// Client Component
// app/dashboard/dashboard-client.tsx
"use client"
import { useState } from "react"

export function DashboardClient({ user }) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Interactive functionality here
  
  return (
    // UI components
  )
}
```

### 2. Service-Repository Pattern

The application implements a service-repository pattern for data access and business logic:

- **Services**: Encapsulate business logic and provide a clean API for components
- **Repositories**: Handle data access and communication with Supabase

Example of the service pattern:

```typescript
// lib/token/token-service.ts
import { SupabaseClient } from '@supabase/supabase-js';

export class TokenService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async getAllTokens() {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return { data: null, error };
    }
  }

  async transferTokensWithFee(fromUserId, toUserId, tokenId, amount) {
    // Business logic for token transfers with fee calculation
    // ...
  }
}
```

### 3. React Hooks for Service Access

Custom React hooks provide components with access to services:

```typescript
// lib/token/use-token.ts
import { useState, useCallback } from 'react';
import { useSupabase } from '../supabase/use-supabase';
import { TokenService } from './token-service';

export function useToken() {
  const { supabase } = useSupabase();
  const [tokenService] = useState(() => new TokenService(supabase));
  
  const transferTokens = useCallback(async (toUserId, tokenId, amount) => {
    // Implementation using tokenService
    // ...
  }, [tokenService]);

  return {
    // Exposed methods and state
    transferTokens,
    // ...
  };
}
```

### 4. Context Providers for Application State

Context providers make services and state available throughout the application:

```typescript
// lib/app-context.tsx
import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './auth/use-auth';
import { useToken } from './token/use-token';
import { useNotifications } from './notifications/use-notifications';

const AppContext = createContext(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const token = useToken();
  const notifications = useNotifications();

  return (
    <AppContext.Provider value={{ auth, token, notifications }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
```

### 5. Authentication Flow

The authentication flow uses Supabase Auth with the following pattern:

1. User submits credentials via client-side form
2. Supabase client processes authentication request
3. On success, session is stored in cookies
4. Server-side components can access the authenticated session

## Data Flow

### Authentication Flow

```
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  Login   │    │ Supabase  │    │  Next.js     │
│  Form    │───▶│   Auth    │───▶│  Middleware  │
└──────────┘    └───────────┘    └──────────────┘
                      │                  │
                      ▼                  ▼
                ┌───────────┐    ┌──────────────┐
                │  Session  │    │  Protected   │
                │  Cookies  │◀───│    Routes    │
                └───────────┘    └──────────────┘
```

### Token Transfer Flow

```
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  User    │    │  Token    │    │  Token       │
│  Action  │───▶│  Service  │───▶│  Validation  │
└──────────┘    └───────────┘    └──────────────┘
                                         │
                                         ▼
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  Update  │    │ Calculate │    │  Database    │
│  UI      │◀───│ Fee       │◀───│  Transaction │
└──────────┘    └───────────┘    └──────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Audit       │
                                  │  Logging     │
                                  └──────────────┘
```

### Notification Flow

```
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  System  │    │Notification│    │  Database    │
│  Event   │───▶│  Service  │───▶│  Insert      │
└──────────┘    └───────────┘    └──────────────┘
                                         │
                                         ▼
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  UI      │    │ Real-time │    │  Notification│
│  Update  │◀───│ Update    │◀───│  Created     │
└──────────┘    └───────────┘    └──────────────┘
```

### Integration Assessment Flow

```
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  User    │    │Assessment │    │  Response    │
│  Response│───▶│  Service  │───▶│  Storage     │
└──────────┘    └───────────┘    └──────────────┘
                      │                  │
                      ▼                  ▼
                ┌───────────┐    ┌──────────────┐
                │ Calculate │    │ Integration  │
                │  Profile  │───▶│    Profile   │
                └───────────┘    └──────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Token       │
                                  │  Rewards     │
                                  └──────────────┘
```

## Security Considerations

### 1. Authentication Security

- CSRF protection for all authentication forms
- Secure HTTP-only cookies for session management
- Rate limiting on authentication endpoints
- Email verification for new accounts

### 2. Database Security

- Row-Level Security (RLS) policies for all tables
- Parameterized queries to prevent SQL injection
- Least privilege principle for database access
- Secure database functions with `security invoker` and proper `search_path`
- Audit logging for sensitive operations

### 3. API Security

- Input validation for all API endpoints
- Rate limiting for API routes
- Security headers via middleware

## Performance Optimizations

- Server components for reduced client-side JavaScript
- Static generation for non-dynamic pages
- Image optimization via Next.js Image component
- Edge middleware for fast security checks
- Database indexes for frequently queried columns
- Optimized token transfer operations with proper validation and error handling

## Future Architecture Considerations

- **Caching Strategy**: Implementing Redis for caching frequently accessed data
- **Serverless Functions**: Moving complex operations to dedicated serverless functions
- **WebSockets**: Enhancing real-time capabilities with WebSocket connections
- **Microservices**: Breaking down the application into smaller, specialized services as it grows

## Code Organization

### Directory Structure

```
avolve/
├── app/                  # Next.js App Router pages
│   ├── (route-groups)/   # Route groups for related pages
│   ├── api/              # API routes
│   └── auth/             # Authentication pages
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components
│   └── feature-specific/ # Feature-specific components
├── contexts/             # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── auth/             # Authentication services and hooks
│   ├── token/            # Token services and hooks
│   ├── notifications/    # Notification services and hooks
│   ├── audit/            # Audit services
│   ├── utils/            # Utility functions
│   └── supabase/         # Supabase client configuration
├── public/               # Static assets
├── styles/               # Global styles
└── supabase/             # Supabase configuration
    └── migrations/       # Database migrations
```

### Key Files

- `middleware.ts`: Handles authentication, security headers, and rate limiting
- `lib/supabase/client.ts`: Client-side Supabase client
- `lib/supabase/server.ts`: Server-side Supabase client with cookie management
- `lib/auth/auth-service.ts`: Authentication service
- `lib/token/token-service.ts`: Token management service
- `lib/notifications/notification-service.ts`: Notification service
- `lib/audit/audit-service.ts`: Audit logging service
- `lib/app-context.tsx`: Application-wide context provider
- `lib/utils/database-initializer.ts`: Database initialization utilities
