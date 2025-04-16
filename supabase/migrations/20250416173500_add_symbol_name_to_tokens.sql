-- Migration: Add symbol and name columns to tokens table
-- Purpose: Enable type-safe queries for token metadata (symbol, name)
-- Created: 2025-04-16 17:35:00 UTC

-- Add symbol column (not null, default '')
alter table public.tokens add column symbol text not null default '';

-- Add name column (not null, default '')
alter table public.tokens add column name text not null default '';

-- End of migration
