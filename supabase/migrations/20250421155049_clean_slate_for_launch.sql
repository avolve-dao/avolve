-- Migration: Clean Slate for Launch
-- Purpose: Drop unused tables, remove obsolete functions/triggers, clean up RLS policies, and reset sequences for a fresh production start.
-- Created: 20250421T155049Z (UTC)
-- Author: Cascade AI
--
-- This migration is destructive and should only be run when preparing for the first real users/admins.
--
-- DROPPING TABLES
-- The following tables are dropped because they are not required for MVP/launch:

-- Drop experiment/legacy/demo tables
DROP TABLE IF EXISTS public.experiments CASCADE;
DROP TABLE IF EXISTS public.experiment_results CASCADE;
DROP TABLE IF EXISTS public.learnings CASCADE;
DROP TABLE IF EXISTS public.mentor_stories CASCADE;
DROP TABLE IF EXISTS public.user_registration_errors CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.collective_actions CASCADE;
DROP TABLE IF EXISTS public.group_events CASCADE;
DROP TABLE IF EXISTS public.group_event_participants CASCADE;
DROP TABLE IF EXISTS public.proposals CASCADE;

-- REMOVING OBSOLETE FUNCTIONS/TRIGGERS
-- Replace with actual function/trigger names as needed
DO $$
BEGIN
  -- Example: Drop reward_tokens_for_role_activity trigger/function if not needed
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'reward_tokens_for_role_activity') THEN
    DROP FUNCTION IF EXISTS public.reward_tokens_for_role_activity() CASCADE;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reward_tokens_for_role_activity') THEN
    DROP TRIGGER IF EXISTS trg_reward_tokens_for_role_activity ON public.user_role_activity;
  END IF;
  -- Repeat for other obsolete functions/triggers
END $$;

-- REMOVING RLS POLICIES FOR DROPPED TABLES
-- Remove RLS policies for tables that no longer exist (these will be dropped automatically, but include for clarity)
-- Example:
-- DROP POLICY IF EXISTS "Manage own experiments" ON public.experiments;
-- DROP POLICY IF EXISTS "Select all experiment results" ON public.experiment_results;
-- DROP POLICY IF EXISTS "Manage own experiment results" ON public.experiment_results;
-- DROP POLICY IF EXISTS "Select all learnings" ON public.learnings;
-- DROP POLICY IF EXISTS "Manage own learnings" ON public.learnings;
-- DROP POLICY IF EXISTS "Admin can manage all experiment results" ON public.experiment_results;
-- DROP POLICY IF EXISTS "Admin can manage all learnings" ON public.learnings;
-- (Dropping the table will drop all policies, but document here for auditability)

-- RESET SEQUENCES FOR USERS/CONTENT TABLES
-- No serial/identity sequences to reset: All primary keys use UUIDs (no action needed).

-- END OF MIGRATION
