# Avolve Platform Database Schema & Live Data Flow

## Overview

All admin and user-facing features in Avolve use live, real-world data from the production Supabase database. There is no use of mock, sample, or demo data anywhere in the codebase.

---

## Core Tables

### `profiles`

- `id` (uuid, pk)
- `full_name` (text)
- `phase` (integer)
- ... (other user profile fields)

### `token_types`

- `id` (uuid, pk)
- `name` (text)
- `symbol` (text)
- `description` (text)
- `total_supply` (numeric)

### `tokens`

- `id` (uuid, pk)
- `token_type_id` (uuid, fk → token_types.id)
- `amount` (numeric)
- `created_at` (timestamptz)

### `token_ownership`

- `token_id` (uuid, fk → tokens.id)
- `user_id` (uuid, fk → profiles.id)
- `balance` (numeric)
- `updated_at` (timestamptz)
- **Primary Key:** (`token_id`, `user_id`)

---

## Security & RLS Policies

- **Row Level Security is enabled** on all tables.
- Only authenticated users can select from `token_ownership`.
- Only admins can insert/update/delete in `token_ownership`.
- All admin actions (create/mint/transfer tokens, promote phases) are RBAC enforced.

---

## Data Flow

- All admin and onboarding UI components fetch and mutate data directly via Supabase queries.
- No hardcoded or simulated data is used in any user-facing or admin feature.
- All analytics, onboarding, and admin flows are live and production-grade.

---

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Setup & Best Practices

- Always keep the database schema and codebase in sync. Use migrations for all schema changes.
- TypeScript types in the codebase should match the Supabase schema.
- Handle all errors gracefully and surface them to the user/admin.
- For new features, update this documentation and add a migration file.

---

## Migration Example

See `/supabase/migrations/20250416213258_create_token_ownership_table.sql` for the latest schema changes for live token management.

---

## Contact

For questions or schema changes, contact the platform engineering team.
