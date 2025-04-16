-- Migration: Refactor core tables to use enums for token_type, metric_type, and user_role
-- Author: Cascade AI
-- Timestamp: 2025-04-15T22:18:20Z
-- Purpose: Update columns in tokens, metrics, and user role tables to use enums for type safety and data integrity.

-- Refactor metrics table to use metric_type enum
alter table public.metrics
  alter column metric_type type public.metric_type using metric_type::public.metric_type;

-- Refactor tokens table to use token_type enum
alter table public.tokens
  alter column token_type type public.token_type using token_type::public.token_type;

-- The following lines are commented out because team_tokens does not exist in the schema
-- alter table public.team_tokens
--   alter column token_type type public.token_type using token_type::public.token_type;

-- Add points column for gamification (if not already present)
ALTER TABLE public.user_role_activity ADD COLUMN IF NOT EXISTS points numeric NOT NULL DEFAULT 1;

-- Pre-migration: ensure all values in role_type are valid enum members
UPDATE public.user_role_activity
  SET role_type = 'subscriber'
  WHERE role_type NOT IN ('subscriber', 'participant', 'contributor');

-- Drop dependent view before altering column type
DROP VIEW IF EXISTS public.user_role_points;

-- Robust enum migration: create new column, copy values, drop old, rename new
ALTER TABLE public.user_role_activity ADD COLUMN role_type_new public.user_role;
UPDATE public.user_role_activity SET role_type_new = role_type::public.user_role;
ALTER TABLE public.user_role_activity DROP COLUMN role_type;
ALTER TABLE public.user_role_activity RENAME COLUMN role_type_new TO role_type;

-- Add comments for clarity
COMMENT ON COLUMN public.metrics.metric_type IS 'Type of metric, now using enum public.metric_type.';
COMMENT ON COLUMN public.tokens.token_type IS 'Type of token, now using enum public.token_type.';
-- comment on column public.team_tokens.token_type is 'Type of token, now using enum public.token_type.';
COMMENT ON COLUMN public.user_role_activity.role_type IS 'User role, now using enum public.user_role.';
COMMENT ON COLUMN public.user_role_activity.points IS 'Points earned by the user for gamification.';

-- Recreate user_role_points view with updated column type
CREATE OR REPLACE VIEW public.user_role_points AS
SELECT
  user_id,
  role_type,
  SUM(points) AS total_points
FROM public.user_role_activity
GROUP BY user_id, role_type;

COMMENT ON VIEW public.user_role_points IS 'Aggregates user actions by role type to assign dynamic roles and track progression.';

-- End of migration
