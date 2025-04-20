-- Migration: Enable pgcrypto extension for UUID generation
-- Created: 2025-04-20 20:35:00 UTC
-- Purpose: Ensure gen_random_uuid() works for UUID primary keys

create extension if not exists pgcrypto with schema public;
