-- Migration: Create gratitude_events table for admin recognition
-- Purpose: Log gratitude and recognition events for positive admin actions (e.g., onboarding support)
-- Affected: public.gratitude_events
-- Created: 2025-04-21T20:59:16Z (UTC)

-- 1. Create gratitude_events table
create table if not exists public.gratitude_events (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id), -- Admin/support receiving gratitude
  giver_id uuid not null references public.profiles(id),     -- User or admin giving gratitude
  onboarding_id uuid,  -- Related onboarding action (nullable)
  reason text not null,                                      -- Reason for gratitude (e.g., 'onboarding_support')
  details jsonb,                                             -- Optional extra context
  created_at timestamptz not null default now()
);

-- 2. Add foreign key constraint for onboarding_id if user_onboarding exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_onboarding'
  ) THEN
    ALTER TABLE public.gratitude_events
      ADD CONSTRAINT fk_gratitude_onboarding FOREIGN KEY (onboarding_id)
      REFERENCES public.user_onboarding(id);
  END IF;
END $$;

-- 3. Enable RLS (Row Level Security)
alter table public.gratitude_events enable row level security;

-- 4. RLS policies: Only recipient, giver, or admins can select/insert
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
  ) THEN
    CREATE POLICY "Recipient, giver, or admins can select gratitude_events" ON public.gratitude_events
      FOR SELECT USING (
        auth.uid() = recipient_id OR auth.uid() = giver_id OR EXISTS (
          SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
    CREATE POLICY "Anyone authenticated can insert gratitude_events" ON public.gratitude_events
      FOR INSERT WITH CHECK (
        auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 5. Indexes for performance
create index if not exists idx_gratitude_events_recipient_id on public.gratitude_events(recipient_id);
create index if not exists idx_gratitude_events_giver_id on public.gratitude_events(giver_id);
create index if not exists idx_gratitude_events_onboarding_id on public.gratitude_events(onboarding_id);

-- 6. Comments
comment on table public.gratitude_events is 'Logs gratitude and recognition events for positive admin actions, e.g., onboarding support.';
comment on column public.gratitude_events.reason is 'Reason for gratitude (e.g., onboarding_support, milestone_help, etc.)';
comment on column public.gratitude_events.details is 'Optional context for the gratitude event.';
