# 📊 Avolve Database Schema Reference

_Last updated: 2025-04-15_

This document provides a comprehensive, human-readable reference to the current Avolve database schema, including tables, columns, relationships, and Row Level Security (RLS) policies. All schema changes are managed by the Avolve DAO and tracked via migrations in the codebase.

## How to Use This Document
- New to Avolve? Start with the [Database README](./README.md) for navigation and quick links.
- Each section below documents a table, its columns, relationships, and RLS policies.
- For visual learners, see the [ER Diagram](./er_diagram_sacred_geometry.mmd).
- For migration or extension, see [How to Propose Schema Changes](../dao/schema-changes.md).

## Visual Schema (ER Diagram)
- View `er_diagram_sacred_geometry.mmd` in a Mermaid-compatible viewer (e.g., VSCode plugin, mermaid.live).
- For a rendered version, see the project wiki or ask in the community chat.

## Extending the Schema
- Propose changes via PR and follow [Schema Changes Guide](../dao/schema-changes.md).
- Always enable RLS and write clear migration comments.
- Update this doc after any schema change.

## Admin Tips & Troubleshooting
- Use metrics tables for analytics and engagement insights.
- Check RLS policies if users report data access issues.
- For schema drift or migration errors, review migration history and ensure all migrations follow naming conventions.
- For help, email admin@avolve.io or join the community chat.

## Overview
- **DAO Ownership:** The schema is governed by the Avolve DAO. All changes are proposed via PR and subject to DAO governance.
- **Best Practices:** Every table uses RLS, explicit policies, and is fully documented.
- **How to Propose Changes:** See [../dao/schema-changes.md](../dao/schema-changes.md).

---

## Table of Contents
- [Metrics](#metrics)
- [Profiles](#profiles)
- [Tokens](#tokens)
- [User Registration Errors](#user_registration_errors)
- [Invitations](#invitations)
- [User Role Activity](#user_role_activity)
- [...and more](#more)

---

## Metrics
Tracks all user and system metrics for analytics, engagement, and gamification.

| Column        | Type      | Description                                        |
|--------------|-----------|----------------------------------------------------|
| id           | uuid      | Primary key                                        |
| user_id      | uuid      | References `profiles(id)`                          |
| metric_type  | text      | e.g. 'engagement', 'retention', 'arpu', etc.       |
| metric_value | numeric   | Value of the metric                                |
| recorded_at  | timestamptz | When the metric was recorded                     |
| notes        | text      | Optional notes                                     |
| created_at   | timestamptz | Creation timestamp                              |
| updated_at   | timestamptz | Last update timestamp                           |

**RLS Policies:**
- SELECT: authenticated users
- INSERT: authenticated users
- UPDATE/DELETE: service_role (admin)

---

## Profiles
Basic user profile information.

| Column      | Type      | Description                  |
|-------------|-----------|------------------------------|
| id          | uuid      | Primary key                  |
| ...         | ...       | ...                          |

**RLS Policies:**
- SELECT/INSERT/UPDATE: user can access/update their own profile

---

## Tokens
Tracks all token balances and transactions for users.

| Column      | Type      | Description                  |
|-------------|-----------|------------------------------|
| id          | uuid      | Primary key                  |
| user_id     | uuid      | References `profiles(id)`    |
| token_type  | text      | Token type (GEN, SAP, etc.)  |
| amount      | numeric   | Amount of tokens             |
| ...         | ...       | ...                          |

**RLS Policies:**
- SELECT/INSERT/UPDATE: user can access/update their own tokens

---

## User Registration Errors
Logs all errors during user registration for debugging and audit.

| Column        | Type      | Description                    |
|--------------|-----------|--------------------------------|
| id           | uuid      | Primary key                    |
| created_at   | timestamptz | Error timestamp              |
| user_email   | text      | Email attempted                |
| user_id      | uuid      | User id (if available)         |
| error_message| text      | Main error message             |
| error_detail | text      | Detailed error info            |
| payload      | jsonb     | Registration payload           |

**RLS Policies:**
- SELECT: admins/service_role
- INSERT: onboarding function

---

## Invitations
Invitation-only registration workflow.

| Column      | Type      | Description                  |
|-------------|-----------|------------------------------|
| id          | uuid      | Primary key                  |
| email       | text      | Invited email (unique)       |
| invite_code | text      | Unique invite code           |
| used        | boolean   | If invitation was used       |
| used_at     | timestamptz | When used                   |
| invited_by  | uuid      | References `auth.users(id)`  |
| created_at  | timestamptz | Creation timestamp          |

**RLS Policies:**
- SELECT: registration flow
- INSERT/UPDATE/DELETE: admin/service_role

---

## User Role Activity
Tracks every meaningful user action, mapped to a role type for dynamic role assignment and gamification.

| Column      | Type      | Description                  |
|-------------|-----------|------------------------------|
| id          | uuid      | Primary key                  |
| user_id     | uuid      | References `profiles(id)`    |
| role_type   | text      | subscriber, participant, etc.|
| action_type | text      | Action performed             |
| context     | jsonb     | Additional context           |
| created_at  | timestamptz | When action occurred        |

**RLS Policies:**
- SELECT/INSERT: user can access/insert their own actions
- UPDATE/DELETE: admin/service_role

---

## Sacred Geometry-Inspired ER Diagram

![Sacred Geometry ER Diagram](./er_diagram_sacred_geometry.svg)

> The above ER diagram is designed using sacred geometry principles. Entities are color-coded and symmetrically arranged to reflect the Avolve token hierarchy and value pillars:
> - GEN (Supercivilization): Zinc/Gray
> - SAP (Superachiever): Stone
> - SCQ (Superachievers): Slate
> - PSP: Amber-Yellow
> - BSP: Teal-Cyan
> - SMS: Violet-Purple-Fuchsia-Pink
> - SPD: Red-Green-Blue
> - SHE: Rose-Red-Orange
> - SSA: Lime-Green-Emerald
> - SBG: Sky-Blue-Indigo

---

## Enum Reference

### token_type
```
GEN, SAP, SCQ, PSP, BSP, SMS, SPD, SHE, SSA, SBG
```
- See [20250415222000_create_enums.sql](../../supabase/migrations/20250415222000_create_enums.sql) for details and color associations.

### metric_type
```
engagement, retention, arpu, activation, conversion, growth, custom
```

### user_role
```
admin, user, superachiever, superachievers, supercivilization, guest, service_role
```

---

## ...and More
See the codebase migrations and Supabase Studio for a complete, up-to-date list of all tables, columns, relationships, triggers, and functions.

---

## Governance & Proposing Schema Changes

All schema changes must be proposed via Pull Request and approved by the Avolve DAO. See [../dao/governance.md](../dao/governance.md) and [../dao/schema-changes.md](../dao/schema-changes.md) for process details.

---

For questions or support, contact admin@avolve.io or participate in the Avolve DAO community.
