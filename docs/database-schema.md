# Database Schema & Supabase Best Practices

## Overview

This document describes the Avolve database schema, security policies, and best practices for migrations and functions. It is always kept in sync with the latest migrations and Supabase features.

---

## 1. Entity-Relationship Diagram (ERD)

- [See `docs/diagrams.md` for visual ERDs.]

---

## 2. Key Tables & Purposes

- **pillars**: Core value pillars for journeys
- **sections**: Subdivisions of pillars
- **components**: Modular building blocks for journeys
- **tokens, user_tokens, token_transactions, token_rewards**: Regenerative token economy
- **profiles, user_settings**: User identity and preferences
- **audit_logs**: Security and compliance logging
- **admin tables**: RBAC, roles, admin actions
- **onboarding, notifications, integration_assessment_questions**: User lifecycle and engagement

---

## 3. Row Level Security (RLS)

- **RLS is enabled on all tables by default.**
- Policies are granular: one per action (select, insert, update, delete) and per role (`anon`, `authenticated`).
- All policies are documented in migration files.

---

## 4. Functions & Triggers

- All functions use `SECURITY INVOKER` and `set search_path = ''`.
- Explicit typing for inputs/outputs.
- Prefer `IMMUTABLE` or `STABLE` unless side effects are required.
- Triggers are documented with their purpose and policy.

---

## 5. Migrations

- All migration files are timestamped and well-commented.
- RLS is enforced in every new table creation.
- Policies include rationale and are never combined across roles/actions.

---

## 6. Supabase Extensions

- [See MCP Server extension list for enabled features.]
- Notable: `pgjwt`, `pg_graphql`, `pg_stat_monitor`, `pgaudit`, `timescaledb`

---

## 7. How to Contribute

- Add new tables with RLS and policies.
- Document all changes in this file and migration headers.
- See [../contributing.md](../contributing.md) for details.
