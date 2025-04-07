---
# Windsurf Rules
description: PostgreSQL SQL Style Guide
globs: '**/*.sql'
---

# PostgreSQL SQL Style Guide

When writing SQL for Supabase projects, follow these style guidelines to ensure consistency, readability, and maintainability.

## Naming Conventions

1. **Use snake_case for Everything:**
   - Table names: `user_profiles` (not `UserProfiles` or `userprofiles`)
   - Column names: `first_name` (not `FirstName` or `firstname`)
   - Function names: `get_user_by_email` (not `GetUserByEmail` or `getuserbyemail`)
   - Trigger names: `before_insert_users` (not `BeforeInsertUsers` or `beforeinsertusers`)

2. **Pluralize Table Names:**
   - Use `users` not `user`
   - Use `profiles` not `profile`
   - Exception: Join tables can use singular forms with underscores: `user_profile`

3. **Be Descriptive and Concise:**
   - Use full words, not abbreviations: `organization` not `org`
   - However, common abbreviations are acceptable: `id` not `identifier`

4. **Use Prefixes and Suffixes Consistently:**
   - Foreign keys: `user_id` not just `user`
   - Boolean columns: `is_active`, `has_subscription`
   - Date/time columns: `created_at`, `updated_at`, `deleted_at`

## SQL Formatting

1. **Keywords in lowercase:**
   ```sql
   select * from users where id = 1;
   -- NOT: SELECT * FROM users WHERE id = 1;
   ```

2. **One Statement Per Line:**
   ```sql
   select
     id,
     first_name,
     last_name
   from users
   where is_active = true
   order by created_at desc
   limit 10;
   ```

3. **Commas at the End of Line:**
   ```sql
   select
     id,
     first_name,
     last_name
   from users;
   ```

4. **Indent with 2 Spaces:**
   ```sql
   select
     u.id,
     u.first_name,
     p.avatar_url
   from users u
   join profiles p
     on u.id = p.user_id;
   ```

5. **Explicit Join Types:**
   - Always use explicit join types: `inner join`, `left join`, etc.
   - Don't use the comma syntax for joins

6. **Table Aliases:**
   - Use meaningful aliases: `users as u` or `users u`
   - Single letter aliases are fine for simple queries
   - Use more descriptive aliases for complex queries

## Schema Design

1. **Primary Keys:**
   - Always define a primary key for each table
   - Prefer `id` as the primary key name
   - Use UUIDs or big integers for primary keys

2. **Foreign Keys:**
   - Always define foreign key constraints with explicit names
   - Match the referenced column name: `user_id` references `users.id`
   - Include `on delete` and `on update` behavior explicitly

3. **Timestamp Columns:**
   - Include `created_at` and `updated_at` on all tables
   - Use `timestamptz` for timestamp columns to handle time zones

4. **Soft Deletes (when applicable):**
   - Use `deleted_at timestamptz` for soft deletes
   - Create appropriate indexes and policies for filtering deleted rows

## Documentation

1. **Table Comments:**
   ```sql
   create table users (
     id uuid primary key,
     email text not null unique,
     created_at timestamptz not null default now()
   );

   comment on table users is 'Stores user account information';
   comment on column users.email is 'User email address, must be unique';
   ```

2. **Function Comments:**
   ```sql
   /*
    * Get all active users with profiles
    * Returns: Set of user records with profile information
    */
   create or replace function get_active_users()
   returns table (
     user_id uuid,
     email text,
     profile_id uuid,
     avatar_url text
   )
   as $$
     -- Function body
   $$ language sql stable;
   ```

## Indexes

1. **Name Indexes Consistently:**
   - Format: `{table_name}_{column_name(s)}_{type}_idx`
   - Example: `users_email_key_idx` or `posts_created_at_btree_idx`

2. **Index Foreign Keys:**
   - Always index foreign key columns
   - Consider adding composite indexes for common query patterns

3. **Specify Index Types When Relevant:**
   - Default to B-tree indexes unless there's a specific need:
   ```sql
   create index users_email_btree_idx on users using btree (email);
   create index products_name_gin_idx on products using gin (name gin_trgm_ops);
   ```

## Performance Considerations

1. **Use Prepared Statements:**
   - Avoid string concatenation for dynamic queries
   - Use parameterized queries with placeholders

2. **Limit Result Sets:**
   - Always include a `limit` clause for potentially large result sets
   - Use offset-limit or keyset pagination for large tables

3. **Use Explain Analyze:**
   - Verify query performance with `explain analyze`
   - Look for sequential scans on large tables
   - Ensure indexes are being used as expected

4. **Avoid N+1 Query Problems:**
   - Use joins instead of multiple queries
   - Consider using JSON aggregation functions to create nested structures

By following these guidelines, you'll create SQL that is consistent, maintainable, and performs well in Supabase projects.
