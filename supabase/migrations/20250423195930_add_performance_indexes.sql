-- migration: add performance indexes
-- description: adds indexes to improve query performance for common operations

-- header information
-- created: 2025-04-23
-- author: cascade
-- purpose: optimize database performance by adding indexes for commonly queried columns

-- add indexes to user_roles table
create index if not exists idx_user_roles_user_id on public.user_roles (user_id);
create index if not exists idx_user_roles_role on public.user_roles (role);

-- add indexes to profiles table
create index if not exists idx_profiles_created_at on public.profiles (created_at);
create index if not exists idx_profiles_updated_at on public.profiles (updated_at);
create index if not exists idx_profiles_name on public.profiles (name);
create index if not exists idx_profiles_email on public.profiles (email);

-- add indexes to posts table
create index if not exists idx_posts_author_id on public.posts (author_id);
create index if not exists idx_posts_created_at on public.posts (created_at);
create index if not exists idx_posts_updated_at on public.posts (updated_at);

-- add indexes to comments table
create index if not exists idx_comments_post_id on public.comments (post_id);
create index if not exists idx_comments_author_id on public.comments (author_id);
create index if not exists idx_comments_created_at on public.comments (created_at);

-- add indexes to post_likes table
create index if not exists idx_post_likes_post_id on public.post_likes (post_id);
create index if not exists idx_post_likes_user_id on public.post_likes (user_id);
create index if not exists idx_post_likes_created_at on public.post_likes (created_at);

-- add indexes to user_features table
create index if not exists idx_user_features_user_id on public.user_features (user_id);
create index if not exists idx_user_features_feature_key on public.user_features (feature_key);
create index if not exists idx_user_features_enabled on public.user_features (enabled);

-- add indexes to user_onboarding table
create index if not exists idx_user_onboarding_user_id on public.user_onboarding (user_id);
create index if not exists idx_user_onboarding_completed on public.user_onboarding (completed);
create index if not exists idx_user_onboarding_step on public.user_onboarding (current_step);

-- add indexes to user_intentions table
create index if not exists idx_user_intentions_user_id on public.user_intentions (user_id);
create index if not exists idx_user_intentions_intention_id on public.user_intentions (intention_id);

-- add indexes to invitation_codes table
create index if not exists idx_invitation_codes_code on public.invitation_codes (code);
create index if not exists idx_invitation_codes_created_by on public.invitation_codes (created_by);
create index if not exists idx_invitation_codes_claimed_by on public.invitation_codes (claimed_by);
create index if not exists idx_invitation_codes_expires_at on public.invitation_codes (expires_at);
create index if not exists idx_invitation_codes_max_uses on public.invitation_codes (max_uses);
create index if not exists idx_invitation_codes_current_uses on public.invitation_codes (current_uses);

-- add composite indexes for common query patterns
create index if not exists idx_user_features_user_feature on public.user_features (user_id, feature_key);
create index if not exists idx_post_likes_user_post on public.post_likes (user_id, post_id);
create index if not exists idx_user_roles_user_role on public.user_roles (user_id, role);

-- add function to check database index usage
-- this helps identify which indexes are being used and which aren't
create or replace function public.check_index_usage()
returns table (
  index_name text,
  table_name text,
  index_size text,
  index_scans bigint,
  rows_in_table bigint
)
language sql
security invoker
set search_path = ''
as $$
  select
    indexrelname as index_name,
    relname as table_name,
    pg_size_pretty(pg_relation_size(quote_ident(schemaname) || '.' || quote_ident(indexrelname)::regclass)) as index_size,
    idx_scan as index_scans,
    reltuples::bigint as rows_in_table
  from pg_stat_all_indexes
  where schemaname = 'public'
  order by idx_scan desc, indexrelname;
$$;

-- add comment explaining the purpose of this migration
comment on function public.check_index_usage() is 'Function to monitor index usage and help identify unused indexes';
