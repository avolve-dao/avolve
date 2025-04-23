# Supabase Best Practices for Avolve

This document summarizes the best practices and latest recommendations for using Supabase in production, tailored for the Avolve project.

---

## 1. Declarative Schemas & Migrations
- **Source of Truth:** All schema changes (tables, columns, RLS, triggers, functions) must be tracked in `/supabase/migrations/`.
- **Drift Prevention:** Use `supabase db diff` regularly to detect and resolve drift between your database and migration files.
- **Granular Migrations:** Timestamp and comment each migration for traceability.
- **No Dashboard-Only Changes:** Avoid making schema changes directly in the Supabase dashboard unless immediately followed by a migration export.

## 2. Edge Functions
- **Use Cases:** Secure, low-latency logic (e.g., validation, transformation, custom APIs).
- **Deployment:** Use `supabase functions deploy` or the dashboard. See [`supabase/functions/example_edge_function.ts`](../supabase/functions/example_edge_function.ts).
- **Security:** Always validate and sanitize inputs in Edge Functions.

## 3. Realtime Broadcast
- **Purpose:** Power instant updates for feeds, progress bars, notifications, etc.
- **Implementation:** Use the `@supabase/supabase-js` client and `supabase.channel(...).on('postgres_changes', ...)` pattern. See [`components/utils/supabase-realtime.ts`](../components/utils/supabase-realtime.ts).
- **Scalability:** Use channels and filters to minimize unnecessary client updates.

## 4. RLS & Security
- **Default:** Enable RLS on all tables, even public ones.
- **Granular Policies:** Write separate policies for each action and role (anon, authenticated, admin).
- **Review Regularly:** Audit RLS policies with every new feature or table.

## 5. UI/UX
- **Supabase UI Library:** Use official UI components for consistency, accessibility, and delight.
- **Custom Needs:** Extend with shadcn/ui and Tailwind as needed.

## 6. Performance & Scaling
- **Read Replicas:** Use nearest read replicas for global users as you scale.
- **Data API:** Use for serverless and edge workloads.
- **No Redis Needed:** Only add Redis if you have advanced caching or queueing needs.

## 7. Automation & Documentation
- **Scripts:** Automate setup, migration, and seeding.
- **Docs:** Keep onboarding, environment, and schema docs up-to-date.

---

## References
- [Supabase Edge Functions](https://supabase.com/blog/supabase-edge-functions-deploy-dashboard-deno-2-1)
- [Realtime Broadcast](https://supabase.com/blog/realtime-broadcast-from-database)
- [Data API & Read Replicas](https://supabase.com/blog/data-api-nearest-read-replica)
- [Supabase UI Library](https://supabase.com/blog/supabase-ui-library)
- [MCP Server](https://supabase.com/blog/mcp-server)
- [Declarative Schemas](https://supabase.com/blog/declarative-schemas)

---

*For more, see the README or contact support@avolve.io. Together, we’re building a magnetic, scalable, and delightful platform!*
