-- Migration: Add actionable status and context fields to learnings table
-- Purpose: Enable admins/users to mark learnings as actionable, implemented, or needs follow-up, and add context links (pillar, token, quest)
-- Affects: Adds actionable_status and context columns, index, and comments

alter table public.learnings
  add column if not exists actionable_status text not null default 'needs_review' check (actionable_status in ('needs_review', 'actionable', 'implemented', 'follow_up')),
  add column if not exists context jsonb;

create index if not exists idx_learnings_actionable_status on public.learnings(actionable_status);

comment on column public.learnings.actionable_status is 'Status of the learning: needs_review, actionable, implemented, follow_up';
comment on column public.learnings.context is 'Context links for this learning (pillar, token, quest, etc.)';
