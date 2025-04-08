# AI Assistant Guide for Avolve Platform

This guide is designed to help AI assistants like Cascade and Grok effectively navigate, understand, and contribute to the Avolve platform codebase.

## Codebase Overview

The Avolve platform is built around three main value pillars:

1. **Superachiever** - Individual journey of transformation (SAP token)
2. **Superachievers** - Collective journey of transformation (SCQ token)
3. **Supercivilization** - Ecosystem journey of transformation (GEN token)

### Key Technologies

- **Frontend**: Next.js 15+, React, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Context API, Zustand
- **Authentication**: Supabase Auth with custom flows
- **Database**: PostgreSQL with Row Level Security (RLS)

### Directory Structure

```
/
├── app/                  # Next.js app router pages and layouts
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # User dashboard pages
│   └── ...               # Other page routes
├── components/           # React components
│   ├── avolve/           # Domain-specific components
│   ├── ui/               # UI components (shadcn)
│   └── ...               # Other component categories
├── lib/                  # Utility functions and services
│   ├── supabase/         # Supabase client and utilities
│   ├── auth/             # Authentication utilities
│   ├── rbac/             # Role-based access control
│   ├── token/            # Token-based access control
│   └── ...               # Other utilities
├── public/               # Static assets
├── styles/               # Global styles
├── types/                # TypeScript type definitions
├── supabase/             # Supabase configuration
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge functions
└── docs/                 # Documentation
```

## Core Domain Concepts

### Token System

The platform has a hierarchical token structure:
- **GEN token** (Supercivilization) - Top-level token
- **SAP token** (Superachiever) - Individual journey tokens
  - PSP (Personal Success Puzzle)
  - BSP (Business Success Puzzle)
  - SMS (Supermind Superpowers)
- **SCQ token** (Superachievers) - Collective journey tokens
  - SPD (Superpuzzle Developments)
  - SHE (Superhuman Enhancements)
  - SSA (Supersociety Advancements)
  - SGB (Supergenius Breakthroughs)

### Weekly Token Schedule

The platform follows a weekly schedule for token claims:
- **Sunday**: SPD (Superpuzzle Developments) - Red-Green-Blue gradient
- **Monday**: SHE (Superhuman Enhancements) - Rose-Red-Orange gradient
- **Tuesday**: PSP (Personal Success Puzzle) - Amber-Yellow gradient
- **Wednesday**: SSA (Supersociety Advancements) - Lime-Green-Emerald gradient
- **Thursday**: BSP (Business Success Puzzle) - Teal-Cyan gradient
- **Friday**: SGB (Supergenius Breakthroughs) - Sky-Blue-Indigo gradient
- **Saturday**: SMS (Supermind Superpowers) - Violet-Purple-Fuchsia-Pink gradient

## Database Schema

The database schema follows a hierarchical structure:
- **Pillars**: Main categories (Superachiever, Superachievers, Supercivilization)
- **Sections**: Sub-categories within pillars (e.g., Personal Success Puzzle)
- **Components**: Specific elements within sections (e.g., Health & Energy)

User progress is tracked at multiple levels:
- **User Journeys**: Track which pillars a user is on
- **User Section Progress**: Track progress through sections
- **User Component Progress**: Track progress through components

## Key Files and Components

### Critical Files

- `app/layout.tsx` - Root layout with providers
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/token/token-utils.ts` - Token utility functions
- `components/avolve/token-system/DailyClaimCard.tsx` - Daily token claim component

### Authentication Flow

1. User signs up/logs in via `/auth/login` or `/auth/sign-up`
2. Supabase Auth handles the authentication
3. User is redirected to `/dashboard` or onboarding flow
4. Token-based access control determines available features

## Common Patterns

### Data Fetching

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClient();
  const { data } = await supabase.from('table_name').select('*');
  return <Component data={data} />;
}

// Client Component
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function Component() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('table_name').select('*');
      setData(data);
    };
    fetchData();
  }, []);
  
  return <div>{/* render data */}</div>;
}
```

### Token Access Control

```typescript
import { hasTokenAccess } from '@/lib/token/token-utils';

// Check if user has access to content requiring a specific token
const hasAccess = await hasTokenAccess('GEN', userId);

// Conditionally render content based on access
{hasAccess && <ProtectedContent />}
```

## Common Issues and Solutions

### Client Components in Server Context

Issue: Using client-side hooks or components in server components.

Solution: Add the "use client" directive to components that use React hooks or browser APIs.

```typescript
"use client";

import { useState } from 'react';

export default function ClientComponent() {
  const [state, setState] = useState(null);
  // ...
}
```

### Dynamic Routes Type Errors

Issue: Type errors with dynamic route parameters in Next.js.

Solution: Add proper typing for params and force dynamic rendering.

```typescript
// Add dynamic export
export const dynamic = 'force-dynamic';

// Define proper interface for params
interface PageProps {
  params: {
    id: string;
  }
}

export default function Page({ params }: PageProps) {
  // ...
}
```

## Semantic Anchors

Use these semantic anchors to quickly locate important parts of the codebase:

- `#TOKEN_SYSTEM` - Token system implementation
- `#AUTH_FLOW` - Authentication flow
- `#DAILY_CLAIM` - Daily token claim functionality
- `#USER_PROGRESS` - User progress tracking
- `#SACRED_GEOMETRY` - Sacred geometry implementation
- `#RBAC_SYSTEM` - Role-based access control

## Recommended Approach for Changes

1. Understand the token system and how it relates to the feature
2. Check for existing patterns in similar components
3. Ensure changes respect the sacred geometry principles
4. Add proper typing and documentation
5. Test changes with different user roles and token access levels

## Conclusion

The Avolve platform is built around a sophisticated token system that implements sacred geometry principles and Tesla's 3-6-9 patterns. Understanding these core concepts is essential for effectively working with the codebase.
