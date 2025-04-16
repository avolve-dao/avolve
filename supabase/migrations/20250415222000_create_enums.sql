-- Migration: Create enums for tokens, metrics, and roles
-- Author: Cascade AI
-- Timestamp: 2025-04-15T22:18:20Z
-- Purpose: Define enums for token_type, metric_type, and user_role to ensure data integrity, type safety, and clarity across the schema.

-- Token types reflect the Avolve value pillars and token hierarchy
create type public.token_type as enum (
  'GEN', -- Supercivilization (Zinc gradient)
  'SAP', -- Superachiever (Stone gradient)
  'SCQ', -- Superachievers (Slate gradient)
  'PSP', -- Personal Success Puzzle (Amber-Yellow gradient)
  'BSP', -- Business Success Puzzle (Teal-Cyan gradient)
  'SMS', -- Supermind Superpowers (Violet-Purple-Fuchsia-Pink gradient)
  'SPD', -- Superpuzzle Developments (Red-Green-Blue gradient)
  'SHE', -- Superhuman Enhancements (Rose-Red-Orange gradient)
  'SSA', -- Supersociety Advancements (Lime-Green-Emerald gradient)
  'SBG'  -- Supergenius Breakthroughs (Sky-Blue-Indigo gradient)
);

comment on type public.token_type is 'Token types for Avolve: GEN, SAP, SCQ, PSP, BSP, SMS, SPD, SHE, SSA, SBG.';

-- Metric types for analytics and engagement
create type public.metric_type as enum (
  'engagement',
  'retention',
  'arpu',
  'activation',
  'conversion',
  'growth',
  'custom' -- Extend as needed
);

comment on type public.metric_type is 'Metric types: engagement, retention, arpu, activation, conversion, growth, custom.';

-- User roles for RBAC and governance
create type public.user_role as enum (
  'admin',
  'user',
  'superachiever',
  'superachievers',
  'supercivilization',
  'guest',
  'service_role'
);

comment on type public.user_role is 'User roles for RBAC: admin, user, superachiever, superachievers, supercivilization, guest, service_role.';

-- End of migration
