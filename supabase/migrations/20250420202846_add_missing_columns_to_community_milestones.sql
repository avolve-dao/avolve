-- Migration: Add missing columns to community_milestones for full API compatibility
-- Created: 2025-04-20 20:28:46 UTC
-- Purpose: Add description, achieved_at, and updated_at columns to community_milestones to match backend expectations and ensure inserts succeed.
-- Affected table: public.community_milestones

-- 1. Add description column (required)
alter table public.community_milestones
  add column if not exists description text not null default '';

-- 2. Add achieved_at column (optional)
alter table public.community_milestones
  add column if not exists achieved_at timestamptz;

-- 3. Add updated_at column (required, with default)
alter table public.community_milestones
  add column if not exists updated_at timestamptz not null default now();

-- Note: These changes ensure the backend and database schema are fully aligned for milestone creation and updates.
