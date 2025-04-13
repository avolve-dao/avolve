---
# Windsurf Rules
description: Guidelines for creating RLS policies in Supabase
globs: 'supabase/migrations/**/*.sql'
---

# Database: Create RLS policies

You're a Supabase security expert specializing in Row Level Security (RLS). Generate **high-quality RLS policies** that adhere to the following best practices:

## General Guidelines

1. **Always Enable RLS on Tables:**
   - Enable RLS on every table, even if it will initially allow all access
   - Use `alter table [table_name] enable row level security;`

2. **Create Granular Policies:**
   - Create separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
   - Create separate policies for each role (anon, authenticated)
   - Name policies clearly: `[table_name]_[operation]_[role]`

3. **Use Proper Authentication Checks:**
   - For authenticated users: `auth.uid() = [user_id_column]`
   - For public data: `true` can be used but should be explicit
   - For admin-only tables: Verify admin status with appropriate function

4. **Document Policy Rationale:**
   - Add clear comments explaining each policy's purpose
   - Document security assumptions
   - Clearly comment any access patterns that might not be obvious

## Policy Templates

### Basic Ownership Policy

```sql
-- Enable RLS
alter table public.items enable row level security;

-- Users can read their own items
create policy "items_select_authenticated"
on public.items
for select
to authenticated
using (auth.uid() = user_id);

-- Users can insert their own items
create policy "items_insert_authenticated"
on public.items
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update their own items
create policy "items_update_authenticated"
on public.items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete their own items
create policy "items_delete_authenticated"
on public.items
for delete
to authenticated
using (auth.uid() = user_id);
```

### Public Read, Authenticated Write

```sql
-- Enable RLS
alter table public.posts enable row level security;

-- Anyone can read posts
create policy "posts_select_public"
on public.posts
for select
to anon, authenticated
using (true);

-- Only authenticated users can create posts
create policy "posts_insert_authenticated"
on public.posts
for insert
to authenticated
with check (auth.uid() = author_id);

-- Only the author can update posts
create policy "posts_update_authenticated"
on public.posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

-- Only the author can delete posts
create policy "posts_delete_authenticated"
on public.posts
for delete
to authenticated
using (auth.uid() = author_id);
```

### Role-Based Policies

```sql
-- Enable RLS
alter table public.organization_data enable row level security;

-- Members can read organization data
create policy "organization_data_select_members"
on public.organization_data
for select
to authenticated
using (
  auth.uid() in (
    select user_id 
    from public.organization_members
    where organization_id = organization_data.organization_id
  )
);

-- Only admins can modify organization data
create policy "organization_data_insert_admins"
on public.organization_data
for insert
to authenticated
with check (
  auth.uid() in (
    select user_id 
    from public.organization_members
    where organization_id = organization_data.organization_id
    and role = 'admin'
  )
);

-- Similar policies for update and delete
```

### Function-Based Policies

```sql
-- Enable RLS
alter table public.team_documents enable row level security;

-- Use a function to check team membership
create policy "team_documents_select_team_members"
on public.team_documents
for select
to authenticated
using (public.is_team_member(team_id, auth.uid()));

-- Use a function to check team admin status
create policy "team_documents_insert_team_admins"
on public.team_documents
for insert
to authenticated
with check (public.is_team_admin(team_id, auth.uid()));

-- Similar policies for update and delete
```

Always create RLS policies that are as restrictive as necessary while still enabling the required functionality. When in doubt, err on the side of more restrictive policies, as they can be relaxed later if needed.
