# Architecture Overview

This document provides an overview of the Avolve application architecture, design decisions, and technical implementation details.

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

2. **Supabase Integration**
   - PostgreSQL database
   - Authentication service
   - Row-Level Security (RLS) policies
   - Real-time subscriptions

3. **Deployment Infrastructure**
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

### 2. Authentication Flow

The authentication flow uses Supabase Auth with the following pattern:

1. User submits credentials via client-side form
2. Supabase client processes authentication request
3. On success, session is stored in cookies
4. Server-side components can access the authenticated session

### 3. Database Access Pattern

Database access follows these patterns:

- **Server-side data fetching**: Using server components with direct Supabase queries
- **Client-side data mutations**: Using Supabase client for user-initiated actions
- **Row-Level Security**: All database access is controlled by RLS policies

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
- `app/auth/callback/route.ts`: Handles authentication callbacks

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

### Data Mutation Flow

```
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  User    │    │ Supabase  │    │  Database    │
│  Action  │───▶│  Client   │───▶│  Operation   │
└──────────┘    └───────────┘    └──────────────┘
                                         │
                                         ▼
┌──────────┐    ┌───────────┐    ┌──────────────┐
│  UI      │    │ React     │    │  Updated     │
│  Update  │◀───│ State     │◀───│  Data        │
└──────────┘    └───────────┘    └──────────────┘
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

### 3. API Security

- Input validation for all API endpoints
- Rate limiting for API routes
- Security headers via middleware

## Performance Optimizations

- Server components for reduced client-side JavaScript
- Static generation for non-dynamic pages
- Image optimization via Next.js Image component
- Edge middleware for fast security checks

## Future Architecture Considerations

- **Caching Strategy**: Implementing Redis for caching frequently accessed data
- **Serverless Functions**: Moving complex operations to dedicated serverless functions
- **WebSockets**: Enhancing real-time capabilities with WebSocket connections
- **Microservices**: Breaking down the application into smaller, specialized services as it grows
