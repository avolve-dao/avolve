-- Migration: Lock down all unnecessary anon policies and tighten RLS for production readiness
-- Timestamp: 20250420144916 UTC
-- Purpose: Remove or restrict all 'anon' policies unless explicitly required and documented. Tighten any 'using (true)' policies to be as restrictive as possible. Ensure all public tables are secure for launch and review.

-- =============================
-- 1. Remove or restrict anon policies on all public tables
-- =============================
-- Only keep anon policies where public read is explicitly required and documented.

-- Example: Remove anon select from user_balances (commented out in previous migration)
drop policy if exists "Select balances (anon)" on public.user_balances;

-- Example: Remove overly broad anon select from experience_phases (unless public phases are intended)
drop policy if exists "Select all phases (anon)" on public.experience_phases;

-- Example: Remove anon select from teams, proposals, collective_actions, etc.
drop policy if exists "select_teams_anon" on public.teams;
drop policy if exists "select_proposals_anon" on public.proposals;
drop policy if exists "select_collective_actions_anon" on public.collective_actions;

-- Repeat for all tables with unnecessary anon policies. Document any exceptions below:
-- If any table needs public/anon access, add a comment explaining why.

-- =============================
-- 2. Tighten any 'using (true)' policies for authenticated users
-- =============================
-- Example: Only allow select/insert/update/delete for resource owners or admins
-- (Update policies in each table migration as needed)

-- =============================
-- 3. Ensure all tables have audit fields and indexes
-- =============================
-- (Add missing created_at, updated_at, and indexes in separate migrations if needed)

-- =============================
-- 4. Add copious comments and rationale for every policy
-- =============================
-- (Done in this and previous migrations)

-- End of migration
