-- Migration: Add 'transferable' column to tokens table
-- Purpose: Allow tokens to be marked as transferable or non-transferable for robust token management and user experience.
-- Affects: public.tokens
-- Created: 2025-04-22 18:34:29 UTC

-- Add the 'transferable' column
alter table public.tokens
  add column if not exists transferable boolean not null default true;

-- Add comment for documentation
comment on column public.tokens.transferable is 'If true, this token can be transferred between users.';

-- RLS Policy: No changes needed as this is a non-sensitive attribute, but ensure RLS is enabled for tokens table.
-- (RLS should already be enabled from previous migrations)

-- Index for efficient querying (optional, only if you expect to filter/search by transferable often)
create index if not exists tokens_transferable_idx on public.tokens(transferable);
