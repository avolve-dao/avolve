-- -------------------------------------------------------------------
-- Avolve Initial Seed Data for Launch
-- Created: 2025-04-22T19:45:28-06:00 UTC-6
-- Purpose: Populate the database with inviting, purposeful demo data
--           to magnetically attract and delight the first 100-1000 users
--           and admins. All seed data is safe for production launch.
-- -------------------------------------------------------------------

-- Seed Supercivilization Feed (example intentions and posts)
insert into public.supercivilization_feed (user_id, content, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'Welcome to Supercivilization! Share your intention for today and help us build the future.', now()),
  ('00000000-0000-0000-0000-000000000002', 'My intention: Connect with 3 new members and offer support.', now()),
  ('00000000-0000-0000-0000-000000000003', 'Today I will contribute to the collective progress by sharing a resource.', now());

-- Seed Collective Progress (example progress milestones)
insert into public.collective_progress (milestone, progress, target, created_at)
values
  ('First 100 Users', 10, 100, now()),
  ('First 10 Community Posts', 3, 10, now()),
  ('First Feedback Received', 1, 1, now());

-- Seed Feedback Widget (example feedback entries)
insert into public.feedback (user_id, feedback_text, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'Loving the onboarding experience! The progress bar is motivating.', now()),
  ('00000000-0000-0000-0000-000000000002', 'Would be great to have more micro-rewards for participation.', now());

-- Seed User Dashboard (example user token balances)
insert into public.user_token_summary (user_id, token, balance, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'GEN', 10, now()),
  ('00000000-0000-0000-0000-000000000002', 'SAP', 20, now()),
  ('00000000-0000-0000-0000-000000000003', 'SCQ', 30, now());

-- Seed User Activity Log (example activities)
insert into public.user_activity_log (user_id, activity_type, details, created_at)
values
  ('00000000-0000-0000-0000-000000000001', 'onboarding_complete', 'User completed onboarding', now()),
  ('00000000-0000-0000-0000-000000000002', 'made_post', 'User posted in Supercivilization Feed', now());

-- All IDs above are safe demo/test UUIDs. Replace with real user IDs after production launch if desired.
-- Add additional seed data for new features as needed.
