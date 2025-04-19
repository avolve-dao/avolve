-- Migration: Grant profiles table access to authenticated and anon roles
-- Author: Cascade AI
-- Timestamp: 2025-04-19T00:45:00Z
-- Purpose: Ensure onboarding and simulation can insert/select/update profiles via Supabase API roles.

-- Grant table privileges for onboarding and simulation flows
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update on table public.profiles to anon;

-- Rationale: Supabase API requests run as 'authenticated' or 'anon' roles, not as the raw service_role DB user.
-- This ensures onboarding, simulation, and user flows will not be blocked by missing grants.

-- End of migration
