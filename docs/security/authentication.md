# Enhanced Authentication System

## Overview

The Avolve platform implements a robust authentication system built on Supabase Auth with additional security features and integrations with the platform's business logic. This document outlines the architecture, features, and usage patterns of the enhanced authentication system.

## Architecture

The authentication system consists of several key components:

1. **AuthService**: A centralized service that handles all authentication-related functionality.
2. **useAuth Hook**: A React hook that provides authentication state and methods to components.
3. **Middleware**: Server-side middleware that handles session management and route protection.
4. **Database Functions**: PostgreSQL functions that integrate authentication with database operations.
5. **Security Policies**: Row-Level Security (RLS) policies that enforce access control at the database level.

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  React UI   │────▶│  AuthService │────▶│  Supabase   │
│  Components │◀────│     API      │◀────│    Auth     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Database   │     │  JWT Token  │
                    │  Functions  │     │  Validation │
                    └─────────────┘     └─────────────┘
```

## Project Configuration

### Supabase Project Details

```typescript
// Project Information
Project ID: hevrachacwtqdcktblsd
Organization ID: vercel_icfg_D0rjqr9um8t994YH9IDUTQnu
Region: us-west-1
Database Version: 15.8.1.044
Status: ACTIVE_HEALTHY

// API Configuration
Project URL: https://hevrachacwtqdcktblsd.supabase.co
Database Host: db.hevrachacwtqdcktblsd.supabase.co
```

### Environment Variables

```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=https://hevrachacwtqdcktblsd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional environment variables
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_JWT_SECRET=your_jwt_secret
```

## Features

### User Authentication

- **Email/Password Authentication**: Traditional email and password sign-in.
- **Magic Link Authentication**: Passwordless authentication via email links.

### Session Management

- **Secure Cookie-based Sessions**: HTTP-only cookies for secure session storage.
- **CSRF Protection**: Cross-Site Request Forgery protection for all authenticated requests.
- **Automatic Session Refresh**: Background refreshing of sessions to maintain user state.

### Authorization

- **Role-based Access Control**: User roles and permissions management.
- **Row-Level Security**: Database-level access control for all resources.
- **Resource Ownership**: Automatic verification of resource ownership.

### User Management

- **User Profiles**: Automatic creation and management of user profiles.
- **Account Recovery**: Password reset and account recovery flows.
- **Email Verification**: Verification of user email addresses.
- **Account Deletion**: Secure account deletion with data archiving.

### Security Features

- **Rate Limiting**: Protection against brute force attacks.
- **Audit Logging**: Comprehensive logging of authentication events.
- **Secure Headers**: HTTP security headers for all responses.
- **Data Encryption**: Encryption of sensitive user data.

## Implementation

### Client-Side Setup

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server-Side Setup

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie error
          }
        },
      },
    }
  )
}
```

### Protected API Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  if (!session && req.nextUrl.pathname.startsWith('/app')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/app/:path*',
    '/api/:path*',
    '/auth/callback',
  ],
}
```

### Authentication Hooks

```typescript
// hooks/useAuth.ts
import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const supabase = createClient()

  const signIn = useCallback(async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
    })
  }, [supabase])

  const signUp = useCallback(async (email: string, password: string) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
  }, [supabase])

  const signOut = useCallback(async () => {
    return supabase.auth.signOut()
  }, [supabase])

  const resetPassword = useCallback(async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    })
  }, [supabase])

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
```

### Database Functions

```sql
-- Get current user ID
create or replace function public.get_auth_user_id()
returns uuid
language sql
security invoker
set search_path = ''
stable
as $$
  select auth.uid();
$$;

-- Check if user is authenticated
create or replace function public.is_authenticated()
returns boolean
language sql
security invoker
set search_path = ''
stable
as $$
  select auth.role() = 'authenticated';
$$;

-- Check if user has role
create or replace function public.has_role(required_role text)
returns boolean
language plpgsql
security invoker
set search_path = ''
stable
as $$
begin
  return exists (
    select 1
    from public.users
    where id = auth.uid()
    and role = required_role::public.user_role
  );
end;
$$;
```

### Row Level Security

```sql
-- Enable RLS on users table
alter table public.users enable row level security;

-- Users can read their own data
create policy "Users can read own data"
on public.users
for select
using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own data"
on public.users
for update
using (auth.uid() = id);

-- Only authenticated users can insert
create policy "Only authenticated can insert"
on public.users
for insert
with check (auth.role() = 'authenticated');
```

## Security Best Practices

1. **Session Management**
   - Use HTTP-only cookies
   - Implement CSRF protection
   - Regular session rotation

2. **Password Security**
   - Enforce strong password policy
   - Implement rate limiting
   - Prevent password reuse

3. **Error Handling**
   - Generic error messages
   - Detailed server logs
   - Proper status codes

4. **Access Control**
   - Row Level Security (RLS)
   - Role-based permissions
   - Resource ownership

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Support

For authentication issues:
- Email: auth-support@avolve.io
- Discord: [Avolve Auth Channel](https://discord.gg/avolve-auth)
- GitHub Issues: [Auth Issues](https://github.com/avolve/platform/issues)
