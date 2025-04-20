-- Migration: Allow insert for all roles on community_milestones
-- Created: 2025-04-20 20:36:00 UTC
-- Purpose: Allow all roles (public) to insert into community_milestones for dev, automation, and backend compatibility.
-- Affected table: public.community_milestones

create policy "Allow insert for all roles on community_milestones"
  on public.community_milestones
  for insert
  to public
  with check (true);

-- This policy is intended for development and backend automation. For production, scope down as needed.
