-- Migration: Create user_notifications table for onboarding/admin reminders and future notifications
-- Created: 2025-04-21 20:11:32 UTC
-- Purpose: Track notifications (reminders, alerts) sent to users for onboarding and admin interventions.

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- e.g. 'onboarding_reminder', 'support_assignment', etc.
  message text not null,
  status text not null default 'sent', -- e.g. 'sent', 'failed', 'pending'
  sent_by uuid references public.profiles(id), -- admin who sent the notification
  created_at timestamptz not null default now(),
  metadata jsonb default '{}'
);

-- Enable Row Level Security (RLS) for user_notifications
alter table public.user_notifications enable row level security;

-- RLS Policy: Allow users to see their own notifications
create policy "Users can view their own notifications" on public.user_notifications
  for select using (auth.uid() = user_id);

-- RLS Policy: Allow admins to insert notifications
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
  ) THEN
    CREATE POLICY "Admins can insert notifications" ON public.user_notifications
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
      );
  END IF;
END $$;

-- RLS Policy: Allow service roles full access (for automation)
create policy "Service role can manage notifications" on public.user_notifications
  for all using (auth.role() = 'service_role');

-- Index for efficient lookup
create index if not exists idx_user_notifications_user_id on public.user_notifications(user_id);

-- Notes:
-- - All destructive actions (delete/update) are restricted to service roles for auditability.
-- - For future notification types, use the 'type' and 'metadata' columns.
