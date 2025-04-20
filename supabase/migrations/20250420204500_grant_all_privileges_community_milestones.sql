-- Migration: Grant all privileges on community_milestones to Supabase service role
-- Created: 2025-04-20 20:45:00 UTC
-- Purpose: Ensure service role key can always insert/update/delete for backend operations
-- Affected table: public.community_milestones

grant all privileges on table public.community_milestones to postgres;
