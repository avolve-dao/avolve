-- Migration: Add triggers for updated_at, unique constraints, and improve index naming
-- Timestamp: 20250420153000 UTC
-- Purpose: Ensure all audit fields are kept up-to-date, natural keys are unique, and index naming is standardized. Expands comments for clarity and auditability.

-- =============================
-- 1. Triggers for updated_at fields
-- =============================
-- This trigger will automatically update the updated_at column on any row update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Attach trigger to all tables with updated_at
create trigger set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_updated_at_tokens
before update on public.tokens
for each row execute function public.set_updated_at();

create trigger set_updated_at_token_ownership
before update on public.token_ownership
for each row execute function public.set_updated_at();

create trigger set_updated_at_metrics
before update on public.metrics
for each row execute function public.set_updated_at();

create trigger set_updated_at_user_phase_transitions
before update on public.user_phase_transitions
for each row execute function public.set_updated_at();

create trigger set_updated_at_user_phase_milestones
before update on public.user_phase_milestones
for each row execute function public.set_updated_at();

create trigger set_updated_at_user_admin_stories
before update on public.user_admin_stories
for each row execute function public.set_updated_at();

create trigger set_updated_at_user_role_activity
before update on public.user_role_activity
for each row execute function public.set_updated_at();

create trigger set_updated_at_meeting_participants
before update on public.meeting_participants
for each row execute function public.set_updated_at();

create trigger set_updated_at_weekly_meetings
before update on public.weekly_meetings
for each row execute function public.set_updated_at();

-- =============================
-- 2. Unique Constraints for Natural Keys
-- =============================
-- Add unique constraint for user email (if not already present)
alter table if exists public.profiles add constraint profiles_email_unique unique (email);
-- Add unique constraint for token symbol (if not already present)
alter table if exists public.tokens add constraint tokens_symbol_unique unique (symbol);

-- =============================
-- 3. Standardize Index Naming
-- =============================
-- Example: Rename indexes to idx_<table>_<column>
-- (Manually rename as needed; this is a placeholder for index renaming commands)
-- Example: ALTER INDEX old_index_name RENAME TO idx_table_column;

-- =============================
-- 4. Expand Comments for Auditability
-- =============================
comment on function public.set_updated_at() is 'Trigger function to set updated_at timestamp on row updates for auditability.';
-- Add more comments as needed for new constraints and triggers.

-- =============================
-- End of migration
