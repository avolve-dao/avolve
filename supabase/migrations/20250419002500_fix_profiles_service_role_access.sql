-- Migration: Ensure service_role can insert/update/delete/select on public.profiles
-- Author: Cascade AI
-- Timestamp: 2025-04-19T00:25:00Z
-- Purpose: Guarantee that the Supabase service_role has full access to the profiles table for onboarding, simulation, and admin operations.

-- Grant all privileges on public.profiles to service_role
grant select, insert, update, delete on table public.profiles to service_role;

-- RLS Policy: Service role full access (defensive, in case of policy drift)
create policy "service_role_full_access_profiles" on public.profiles
  for all to service_role
  using (true) with check (true);

-- Rationale: This ensures onboarding and admin flows never fail due to RLS or privilege drift.
-- Review all RLS policies regularly for least-privilege and security best practices.

-- End of migration
