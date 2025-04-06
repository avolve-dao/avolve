-- Migration: Add fee to token transactions
-- Description: Adds fee column to token_transactions table
-- Author: Cascade AI
-- Date: 2025-04-07

-- Add fee column to token_transactions
alter table public.token_transactions add column if not exists fee numeric default 0;

-- Add comment to the fee column
comment on column public.token_transactions.fee is 'Fee amount applied to this transaction';
