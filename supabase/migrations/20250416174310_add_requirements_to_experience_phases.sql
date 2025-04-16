-- Migration: Add requirements column to experience_phases table
-- Purpose: Store structured requirements (e.g., milestones) for each phase in a flexible JSON format
-- Created: 2025-04-16 17:43:10 UTC

alter table public.experience_phases add column requirements jsonb;

-- End of migration
