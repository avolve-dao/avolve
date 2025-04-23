-- Migration: Add admin actions and support assignment to onboarding
-- Purpose: Enable admin assignment, manual completion, and intervention logging for onboarding
-- Created: 2025-04-21T14:18:38-06:00

-- 1. Add support_admin_id and marked_complete_by_admin_id to user_onboarding
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_onboarding'
  ) THEN
    ALTER TABLE public.user_onboarding
      ADD COLUMN IF NOT EXISTS support_admin_id uuid REFERENCES public.profiles(id),
      ADD COLUMN IF NOT EXISTS marked_complete_by_admin_id uuid REFERENCES public.profiles(id);
  END IF;
END $$;

-- 2. Create admin_actions table for audit logging
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  action_type text not null, -- e.g. 'assign_support', 'mark_complete', 'send_reminder'
  performed_by uuid not null references public.profiles(id),
  details jsonb,
  created_at timestamptz not null default now()
);

-- 3. Enable RLS on admin_actions (for audit, only admins can select/insert)
alter table public.admin_actions enable row level security;

-- Policy: Only admins can insert/select admin_actions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_roles'
  ) THEN
    CREATE POLICY "Admins can insert admin_actions" ON public.admin_actions
      FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated'
        AND EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role = 'admin'
        )
      );
    CREATE POLICY "Admins can select admin_actions" ON public.admin_actions
      FOR SELECT
      USING (
        auth.role() = 'authenticated'
        AND EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = auth.uid()
            AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Policy: No update/delete (audit log)
