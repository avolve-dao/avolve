-- Migration: Add missing foreign key constraints for referential integrity
-- Generated: 2025-04-23 17:13:26 UTC
-- Purpose: Ensure all relevant columns in the schema have proper FK constraints, following Supabase/Postgres best practices.
-- This migration is critical for data integrity and a robust onboarding experience for the first 100-1000 users.

-- NOTE: Review each FK constraint for appropriateness. Adjust referenced tables/columns if your schema differs.

-- Example: ALTER TABLE public.achievements ADD CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

alter table public.achievements add constraint achievements_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.milestone_contributions add constraint milestone_contributions_milestone_id_fkey foreign key (milestone_id) references public.community_milestones (id) on delete cascade;
alter table public.milestone_contributions add constraint milestone_contributions_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.teams add constraint teams_created_by_fkey foreign key (created_by) references public.users (id) on delete set null;
alter table public.team_members add constraint team_members_team_id_fkey foreign key (team_id) references public.teams (id) on delete cascade;
alter table public.team_members add constraint team_members_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.assists add constraint assists_helper_id_fkey foreign key (helper_id) references public.users (id) on delete cascade;
alter table public.assists add constraint assists_recipient_id_fkey foreign key (recipient_id) references public.users (id) on delete cascade;
alter table public.user_activity_log add constraint user_activity_log_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.user_onboarding add constraint user_onboarding_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.supercivilization_feed add constraint supercivilization_feed_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.peer_recognition add constraint peer_recognition_sender_id_fkey foreign key (sender_id) references public.users (id) on delete cascade;
alter table public.peer_recognition add constraint peer_recognition_recipient_id_fkey foreign key (recipient_id) references public.users (id) on delete cascade;
alter table public.user_role_activity add constraint user_role_activity_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.journey_posts add constraint journey_posts_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.token_flows add constraint token_flows_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.personal_success_puzzle add constraint personal_success_puzzle_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.business_success_puzzle add constraint business_success_puzzle_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.supermind_superpowers add constraint supermind_superpowers_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.superpuzzle_developments add constraint superpuzzle_developments_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.superhuman_enhancements add constraint superhuman_enhancements_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.supersociety_advancements add constraint supersociety_advancements_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.supergenius_breakthroughs add constraint supergenius_breakthroughs_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.user_milestones add constraint user_milestones_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.component_progress add constraint component_progress_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.invitations add constraint invitations_invited_by_fkey foreign key (invited_by) references public.users (id) on delete set null;
alter table public.metrics add constraint metrics_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.user_balances add constraint user_balances_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.user_phase_transitions add constraint user_phase_transitions_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.user_phase_milestones add constraint user_phase_milestones_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.transactions add constraint transactions_token_id_fkey foreign key (token_id) references public.tokens (id) on delete cascade;
alter table public.transactions add constraint transactions_from_user_id_fkey foreign key (from_user_id) references public.users (id) on delete set null;
alter table public.transactions add constraint transactions_to_user_id_fkey foreign key (to_user_id) references public.users (id) on delete set null;
alter table public.user_balances add constraint user_balances_token_id_fkey foreign key (token_id) references public.tokens (id) on delete cascade;
alter table public.tokens add constraint tokens_user_id_fkey foreign key (user_id) references public.users (id) on delete set null;
alter table public.token_ownership add constraint token_ownership_token_id_fkey foreign key (token_id) references public.tokens (id) on delete cascade;
alter table public.token_ownership add constraint token_ownership_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.quest_progress add constraint quest_progress_quest_id_fkey foreign key (quest_id) references public.quests (id) on delete cascade;
alter table public.quest_progress add constraint quest_progress_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.user_feedback add constraint user_feedback_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.experiment_participation add constraint experiment_participation_user_id_fkey foreign key (user_id) references public.users (id) on delete cascade;
alter table public.canvas_entries add constraint canvas_entries_created_by_fkey foreign key (created_by) references public.users (id) on delete set null;
alter table public.user_admin_stories add constraint user_admin_stories_author_id_fkey foreign key (author_id) references public.users (id) on delete set null;
