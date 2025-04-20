-- Migration: Add insert policy for service_role on community_milestones
-- Created: 2025-04-20 20:33:30 UTC
-- Purpose: Allow service_role to insert community milestones for API and backend operations.
-- Affected table: public.community_milestones

-- Insert policy for service_role
create policy "Allow insert for service_role on community_milestones"
  on public.community_milestones
  for insert
  to service_role
  with check (true);

-- This ensures that backend/API operations using the service role key can always create milestones.
