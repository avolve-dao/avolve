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

-- Refactor team_tokens table to use token_type enum
alter table public.team_tokens
  alter column token_type type public.token_type using token_type::public.token_type;

-- Refactor user_role_activity table to use user_role enum
alter table public.user_role_activity
  alter column role type public.user_role using role::public.user_role;

-- Add comments for clarity
comment on column public.metrics.metric_type is 'Type of metric, now using enum public.metric_type.';
comment on column public.tokens.token_type is 'Type of token, now using enum public.token_type.';
comment on column public.team_tokens.token_type is 'Type of token, now using enum public.token_type.';
comment on column public.user_role_activity.role is 'User role, now using enum public.user_role.';

-- End of migration
