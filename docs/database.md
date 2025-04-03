# Database Schema Documentation

This document provides detailed information about the database schema used in the Avolve application.

## Overview

Avolve uses Supabase PostgreSQL as its database, with a schema designed for security, performance, and scalability. The database implements Row Level Security (RLS) policies to ensure data access is properly controlled.

## Tables

### 1. profiles

Stores user profile information linked to Supabase Auth users.

#### Schema

```sql
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### Columns

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | uuid | Primary key, references auth.users | Primary Key, Foreign Key |
| username | text | Unique username for the user | Unique |
| full_name | text | User's full name | |
| avatar_url | text | URL to the user's avatar image | |
| website | text | User's website URL | |
| bio | text | User's biography or description | |
| created_at | timestamp with time zone | When the profile was created | Default: now() |
| updated_at | timestamp with time zone | When the profile was last updated | Default: now() |

#### RLS Policies

```sql
-- Policy for anon users to view profiles
create policy "Profiles are viewable by anonymous users"
  on public.profiles
  for select
  to anon
  using (true);

-- Policy for authenticated users to view profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Policy for users to update their own profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

#### Triggers

```sql
-- Trigger to update the updated_at timestamp
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
```

### 2. auth.users (Supabase System Table)

This is a Supabase system table that stores user authentication information.

#### Key Columns

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | User's email address |
| encrypted_password | text | Encrypted password |
| email_confirmed_at | timestamp with time zone | When the email was confirmed |
| last_sign_in_at | timestamp with time zone | Last sign-in timestamp |
| raw_user_meta_data | jsonb | Additional user metadata |

#### Triggers

```sql
-- Trigger to create a profile when a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## Functions

### 1. handle_new_user()

Creates a profile record when a new user is registered.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;
```

### 2. update_updated_at()

Updates the `updated_at` timestamp when a record is modified.

```sql
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- update the "updated_at" column on row modification
  new.updated_at := now();
  return new;
end;
$$;
```

## Entity Relationship Diagram

```
┌───────────────┐       ┌───────────────┐
│  auth.users   │       │   profiles    │
├───────────────┤       ├───────────────┤
│ id            │◄──────┤ id            │
│ email         │       │ username      │
│ password      │       │ full_name     │
│ metadata      │       │ avatar_url    │
│ ...           │       │ website       │
└───────────────┘       │ bio           │
                        │ created_at    │
                        │ updated_at    │
                        └───────────────┘
```

## Row Level Security (RLS)

Avolve implements Row Level Security (RLS) to ensure data access is properly controlled:

1. **Profiles Table**:
   - Anyone can view profiles (public data)
   - Users can only update their own profiles

## Database Migrations

Database changes are managed through Supabase migrations:

```
supabase/migrations/
└── 20250403191954_initial_schema.sql
```

### Running Migrations

Migrations are applied automatically during deployment through GitHub Actions. For local development:

```bash
pnpm supabase migration up
```

## Best Practices

### 1. Security

- Always use RLS policies to control data access
- Use parameterized queries to prevent SQL injection
- Never expose sensitive data in public tables

### 2. Performance

- Create indexes for frequently queried columns
- Use appropriate data types for columns
- Consider partitioning large tables

### 3. Data Integrity

- Use foreign key constraints to maintain relationships
- Implement check constraints for data validation
- Use triggers for maintaining derived data

## Future Schema Extensions

As the application grows, the following tables may be added:

### 1. posts

```sql
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.posts enable row level security;

-- RLS policies
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Users can insert their own posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);
```

### 2. follows

```sql
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (follower_id, following_id)
);

-- Enable RLS
alter table public.follows enable row level security;

-- RLS policies
create policy "Follows are viewable by everyone"
  on public.follows for select using (true);

create policy "Users can follow others"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);
```

## Database Access Patterns

### Server-Side Access

Server components access the database using the server-side Supabase client:

```typescript
// app/profiles/[id]/page.tsx
import { createClient } from "@/lib/supabase/server"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single()
  
  // Render profile data
}
```

### Client-Side Access

Client components access the database using the client-side Supabase client:

```typescript
// components/profile-form.tsx
"use client"
import { createClient } from "@/lib/supabase/client"

export function ProfileForm({ userId }: { userId: string }) {
  const handleSubmit = async (formData: FormData) => {
    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({
        username: formData.get("username"),
        full_name: formData.get("full_name"),
        bio: formData.get("bio")
      })
      .eq("id", userId)
  }
  
  // Form JSX
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**:
   - Check RLS policies
   - Verify user is authenticated
   - Ensure user has appropriate permissions

2. **Unique Constraint Violations**:
   - Check for duplicate usernames
   - Implement client-side validation

3. **Foreign Key Constraint Violations**:
   - Ensure referenced records exist
   - Handle cascading deletes appropriately
