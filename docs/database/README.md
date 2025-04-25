# Avolve Database Documentation

_Last updated: 2025-04-23_

Welcome to the Avolve database documentation! This section is for developers, admins, and contributors who want to understand, extend, or troubleshoot the platform's data layer.

## Quick Links

- [Schema Reference](./schema.md): Table-by-table documentation, RLS, and best practices
- [ER Diagram](./er_diagram.mmd): Visual overview of the schema (view with Mermaid or compatible tool)
- [SQL Best Practices](./sql-best-practices.md): Standards for database functions and migrations
- [How to Propose Schema Changes](../dao/schema-changes.md)

## Database Architecture

Avolve uses Supabase (PostgreSQL) for all data storage, with a carefully designed schema that supports:

- **Tokenized Engagement:** Multi-token system for rewarding different activities
- **User Journeys:** Tracking progress through experience phases
- **Peer Recognition:** Real-time recognition and gratitude events
- **Community Progress:** Collective milestones and achievements
- **Feature Flags:** Dynamic feature enablement for progressive unlocking

### Security & Performance

All tables implement:

- **Row Level Security (RLS):** Granular access control for all data
- **Audit Fields:** `created_at` and `updated_at` on all tables
- **Indexes:** On foreign keys and frequently queried columns
- **Constraints:** Foreign key constraints and data validation

### SQL Function Standards

All database functions follow these best practices:

1. **SECURITY INVOKER:**

   - Functions run with the permissions of the invoking user
   - `SECURITY DEFINER` only used when explicitly required

2. **Search Path Safety:**

   - All functions set `search_path = ''`
   - All database objects use fully qualified names (e.g., `public.table_name`)

3. **Explicit Typing:**

   - Clear input and output types for all functions
   - Immutable or stable functions where possible

4. **Error Handling:**
   - Comprehensive error handling and logging
   - Clear error messages for troubleshooting

## Key Tables Overview

| Table                    | Purpose                         | Key Relationships               |
| ------------------------ | ------------------------------- | ------------------------------- |
| `profiles`               | User profiles and metadata      | `auth.users`                    |
| `tokens`                 | Token transactions and balances | `profiles`                      |
| `peer_recognition`       | Recognition between users       | `profiles`                      |
| `user_phase_transitions` | Journey progress tracking       | `profiles`, `experience_phases` |
| `community_milestones`   | Collective achievements         | `profiles`                      |
| `feature_flags`          | Progressive feature unlocking   | `profiles`                      |

## Migration Process

All schema changes are managed through Supabase migrations:

1. **Create Migration:** Use the Supabase CLI to create a new migration
2. **Follow Naming Convention:** `YYYYMMDDHHmmss_short_description.sql`
3. **Include Documentation:** Header comments explaining purpose and impact
4. **Enable RLS:** All new tables must have RLS enabled
5. **Create Policies:** Define granular policies for each role
6. **Add Indexes:** On foreign keys and frequently queried columns
7. **Test Locally:** Verify migrations work as expected
8. **Apply to Production:** Via Supabase dashboard or CLI

## Admin Tips

### Common Queries

```sql
-- Get user token balances
SELECT
  p.id,
  p.full_name,
  t.token_type,
  SUM(t.amount) as balance
FROM
  public.profiles p
JOIN
  public.tokens t ON p.id = t.user_id
GROUP BY
  p.id, p.full_name, t.token_type
ORDER BY
  p.full_name, t.token_type;

-- Check onboarding progress
SELECT
  p.full_name,
  o.completed_steps,
  o.created_at,
  o.updated_at
FROM
  public.user_onboarding o
JOIN
  public.profiles p ON o.user_id = p.id
ORDER BY
  o.updated_at DESC;
```

### Troubleshooting

- **Permission Errors:** Check RLS policies and user roles
- **Missing Data:** Verify foreign key relationships and constraints
- **Performance Issues:** Review query plans and add indexes as needed

## Getting Help

- For questions, open an issue in the repo
- For migration help, see [Schema Changes Guide](../dao/schema-changes.md)
- For emergency support, contact the database administrator

## How to View the ER Diagram

- Open `er_diagram.mmd` in a Mermaid-compatible viewer (e.g., VSCode plugin, mermaid.live)
- For a rendered image, see the project wiki or ask in the community chat

---

Ready to dive in? Start with the [Schema Reference](./schema.md).
