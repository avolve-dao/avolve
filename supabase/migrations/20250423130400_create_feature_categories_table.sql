-- Create feature_categories table to organize features into logical groups
-- This migration adds support for categorizing features for better organization and discovery

-- Create the feature_categories table
create table if not exists public.feature_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  display_order integer default 0,
  features text[] default '{}',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add helpful comments
comment on table public.feature_categories is 'Organizes features into logical categories for display in the UI';
comment on column public.feature_categories.name is 'Display name of the feature category';
comment on column public.feature_categories.description is 'Description of the feature category';
comment on column public.feature_categories.icon is 'Icon name for the feature category';
comment on column public.feature_categories.display_order is 'Order in which to display the categories (lower numbers first)';
comment on column public.feature_categories.features is 'Array of feature keys that belong to this category';

-- Create index for faster lookups
create index if not exists feature_categories_display_order_idx on public.feature_categories (display_order);

-- Enable row level security
alter table public.feature_categories enable row level security;

-- Create RLS policies
-- Anyone can view feature categories
create policy "Anyone can view feature categories"
  on public.feature_categories
  for select
  to anon, authenticated
  using (true);

-- Only admins can modify feature categories
create policy "Only admins can insert feature categories"
  on public.feature_categories
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Only admins can update feature categories"
  on public.feature_categories
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Only admins can delete feature categories"
  on public.feature_categories
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Create trigger to update the updated_at column
create or replace function public.handle_feature_categories_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for updated_at
drop trigger if exists set_feature_categories_updated_at on public.feature_categories;
create trigger set_feature_categories_updated_at
  before update on public.feature_categories
  for each row
  execute function public.handle_feature_categories_updated_at();

-- Insert default categories
insert into public.feature_categories (name, description, icon, display_order, features)
values
  ('Core Features', 'Essential platform features available to all users', 'layout', 1, 
   array['dashboard', 'profile', 'notifications']),
  ('Community', 'Connect and collaborate with other members', 'users', 2, 
   array['messaging', 'groups', 'events']),
  ('Content', 'Create and share content with the community', 'file-text', 3, 
   array['posts', 'comments', 'media_upload']),
  ('Tools', 'Productivity tools to help you achieve your goals', 'tool', 4, 
   array['task_manager', 'goal_tracker', 'calendar']),
  ('Analytics', 'Track your progress and gain insights', 'bar-chart', 5, 
   array['personal_stats', 'community_insights', 'progress_reports']);

-- Create function to add a feature to a category
create or replace function public.add_feature_to_category(
  p_feature_key text,
  p_category_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_result jsonb;
begin
  -- Get the current admin ID
  v_admin_id := auth.uid();
  
  -- Check if user is an admin
  if not exists (
    select 1 from public.users
    where id = v_admin_id and is_admin = true
  ) then
    raise exception 'Only admins can modify feature categories';
  end if;
  
  -- Update the category
  update public.feature_categories
  set
    features = array_append(features, p_feature_key),
    updated_at = now()
  where id = p_category_id
  returning jsonb_build_object(
    'id', id,
    'name', name,
    'features', features
  ) into v_result;
  
  if v_result is null then
    raise exception 'Category not found';
  end if;
  
  return v_result;
end;
$$;

-- Create function to remove a feature from a category
create or replace function public.remove_feature_from_category(
  p_feature_key text,
  p_category_id uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_result jsonb;
begin
  -- Get the current admin ID
  v_admin_id := auth.uid();
  
  -- Check if user is an admin
  if not exists (
    select 1 from public.users
    where id = v_admin_id and is_admin = true
  ) then
    raise exception 'Only admins can modify feature categories';
  end if;
  
  -- Update the category
  update public.feature_categories
  set
    features = array_remove(features, p_feature_key),
    updated_at = now()
  where id = p_category_id
  returning jsonb_build_object(
    'id', id,
    'name', name,
    'features', features
  ) into v_result;
  
  if v_result is null then
    raise exception 'Category not found';
  end if;
  
  return v_result;
end;
$$;
