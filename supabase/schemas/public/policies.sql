-- Row Level Security policies for the Avolve platform
-- This file defines all RLS policies for the public schema tables

-- [LEGACY CLEANUP 2025-04-14]
-- Removed all RLS policies for dropped legacy tables (user_achievements, genius_achievements, weekly_meetings, etc.)
-- All policies below are for active tables only.

-- Enable RLS on all tables
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.tokens enable row level security;
alter table public.user_tokens enable row level security;
alter table public.token_transactions enable row level security;
alter table public.pillars enable row level security;
alter table public.sections enable row level security;
alter table public.components enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_activity_logs enable row level security;

-- Roles table policies
-- Anyone can view roles
create policy "Roles are viewable by all users"
  on public.roles
  for select
  to authenticated, anon
  using (true);

-- Only admin users can modify roles
create policy "Only admin users can modify roles"
  on public.roles
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- User roles table policies
-- Users can view their own role assignments
create policy "Users can view their own role assignments"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin users can view all role assignments
create policy "Admin users can view all role assignments"
  on public.user_roles
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Only admin users can modify role assignments
create policy "Only admin users can modify role assignments"
  on public.user_roles
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Tokens table policies
-- Anyone can view tokens
create policy "Tokens are viewable by all users"
  on public.tokens
  for select
  to authenticated, anon
  using (true);

-- Only admin users can modify tokens
create policy "Only admin users can modify tokens"
  on public.tokens
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- User tokens table policies
-- Users can view their own tokens
create policy "Users can view their own tokens"
  on public.user_tokens
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin users can view all user tokens
create policy "Admin users can view all user tokens"
  on public.user_tokens
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Only system functions can modify user tokens
create policy "Only system functions can modify user tokens"
  on public.user_tokens
  for all
  to authenticated
  using (false)
  with check (false);

-- Token transactions table policies
-- Users can view their own transactions
create policy "Users can view their own transactions"
  on public.token_transactions
  for select
  to authenticated
  using (
    auth.uid() = from_user_id or 
    auth.uid() = to_user_id
  );

-- Admin users can view all transactions
create policy "Admin users can view all transactions"
  on public.token_transactions
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Only system functions can create transactions
create policy "Only system functions can create transactions"
  on public.token_transactions
  for insert
  to authenticated
  with check (false);

-- Pillars table policies
-- Anyone can view active pillars
create policy "Anyone can view active pillars"
  on public.pillars
  for select
  to authenticated, anon
  using (is_active = true);

-- Admin users can view all pillars
create policy "Admin users can view all pillars"
  on public.pillars
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Only admin users can modify pillars
create policy "Only admin users can modify pillars"
  on public.pillars
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Sections table policies
-- Anyone can view active sections in active pillars
create policy "Anyone can view active sections in active pillars"
  on public.sections
  for select
  to authenticated, anon
  using (
    is_active = true and
    exists (
      select 1 from public.pillars
      where id = pillar_id
      and is_active = true
    )
  );

-- Admin users can view all sections
create policy "Admin users can view all sections"
  on public.sections
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Only admin users can modify sections
create policy "Only admin users can modify sections"
  on public.sections
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Components table policies
-- Anyone can view active components in active sections
create policy "Anyone can view active components in active sections"
  on public.components
  for select
  to authenticated, anon
  using (
    is_active = true and
    exists (
      select 1 from public.sections
      where id = section_id
      and is_active = true
    )
  );

-- Admin users can view all components
create policy "Admin users can view all components"
  on public.components
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Only admin users can modify components
create policy "Only admin users can modify components"
  on public.components
  for all
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- User progress table policies
-- Users can view their own progress
create policy "Users can view their own progress"
  on public.user_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can update their own progress
create policy "Users can update their own progress"
  on public.user_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can insert their own progress
create policy "Users can insert their own progress"
  on public.user_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admin users can view all user progress
create policy "Admin users can view all user progress"
  on public.user_progress
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- User achievements table policies [REMOVED: Table dropped]
-- create policy "Users can view their own achievements" ... [REMOVED]
-- create policy "Admin users can view all user achievements" ... [REMOVED]
-- create policy "Only system functions can modify user achievements" ... [REMOVED]

-- User activity logs table policies
-- Users can view their own activity logs
create policy "Users can view their own activity logs"
  on public.user_activity_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can insert their own activity logs
create policy "Users can insert their own activity logs"
  on public.user_activity_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Admin users can view all activity logs
create policy "Admin users can view all activity logs"
  on public.user_activity_logs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      join public.roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.is_admin = true
      and (ur.expires_at is null or ur.expires_at > now())
    )
  );

-- Anonymous users cannot access activity logs
create policy "Anon users have no access to activity logs"
  on public.user_activity_logs
  for all
  to anon
  using (false);

-- [END LEGACY CLEANUP]
