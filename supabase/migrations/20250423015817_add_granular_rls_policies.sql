-- ----------------------------------------------------------------------
-- Migration: Add/Refresh Granular RLS Policies for Launch
-- Created: 2025-04-22T19:58:17 UTC-6
-- Purpose: Ensure all critical user-facing tables have Row Level Security (RLS)
--          and granular, role-based policies for production launch.
--          This migration is safe, non-destructive, and fully documented.
-- ----------------------------------------------------------------------

-- Enable RLS and add policies for public.profiles
alter table public.profiles enable row level security;

-- SELECT policies
create policy "select_profiles_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "select_profiles_anon" on public.profiles
  for select using (auth.role() = 'anon');

-- INSERT/UPDATE/DELETE policies (authenticated only)
create policy "insert_profiles_authenticated" on public.profiles
  for insert to authenticated using (true);
create policy "update_profiles_authenticated" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "delete_profiles_authenticated" on public.profiles
  for delete to authenticated using (auth.uid() = id);

-- Enable RLS and add policies for public.supercivilization_feed
alter table public.supercivilization_feed enable row level security;

create policy "select_feed_all" on public.supercivilization_feed
  for select using (true); -- Publicly readable feed
create policy "insert_feed_authenticated" on public.supercivilization_feed
  for insert to authenticated using (auth.uid() = user_id);
create policy "update_feed_authenticated" on public.supercivilization_feed
  for update to authenticated using (auth.uid() = user_id);
create policy "delete_feed_authenticated" on public.supercivilization_feed
  for delete to authenticated using (auth.uid() = user_id);

-- Enable RLS and add policies for public.collective_progress
alter table public.collective_progress enable row level security;

create policy "select_progress_all" on public.collective_progress
  for select using (true); -- Publicly readable progress
create policy "insert_progress_admin" on public.collective_progress
  for insert to service_role using (auth.role() = 'service_role');
create policy "update_progress_admin" on public.collective_progress
  for update to service_role using (auth.role() = 'service_role');
create policy "delete_progress_admin" on public.collective_progress
  for delete to service_role using (auth.role() = 'service_role');

-- Enable RLS and add policies for public.user_activity_log
alter table public.user_activity_log enable row level security;

create policy "select_activity_authenticated" on public.user_activity_log
  for select to authenticated using (auth.uid() = user_id);
create policy "insert_activity_authenticated" on public.user_activity_log
  for insert to authenticated using (auth.uid() = user_id);

-- Add additional policies for new tables as needed following this pattern.
-- Always use granular, role-based, and well-commented policies.
-- Review and update policies with every schema or feature change.

-- ----------------------------------------------------------------------
-- End of migration
-- ----------------------------------------------------------------------
