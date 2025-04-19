-- Migration: Add user_type column to profiles table
-- Author: Cascade AI
-- Timestamp: 2025-04-19T00:00:00Z
-- Purpose: Add a user_type field to public.profiles for user segmentation, analytics, and onboarding flows.

-- Add the user_type column
alter table public.profiles add column if not exists user_type text;

comment on column public.profiles.user_type is 'Categorizes the user for onboarding, gamification, and analytics (e.g., simulated, real, admin, etc.). Optional.';

-- RLS policies already exist for insert/update by owner and service_role. No new policies needed unless you want to restrict user_type changes further.

-- End of migration
