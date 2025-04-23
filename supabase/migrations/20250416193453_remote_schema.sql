drop trigger if exists "trg_reward_tokens_for_group_event_fib" on "public"."group_events";

drop trigger if exists "trg_reward_team_milestone_fib" on "public"."teams";

drop policy "insert_collective_actions_authenticated" on "public"."collective_actions";

drop policy "select_collective_actions_anon" on "public"."collective_actions";

drop policy "select_collective_actions_authenticated" on "public"."collective_actions";

drop policy "update_collective_actions_authenticated" on "public"."collective_actions";

drop policy "insert_group_event_participants_authenticated" on "public"."group_event_participants";

drop policy "select_group_event_participants_anon" on "public"."group_event_participants";

drop policy "select_group_event_participants_authenticated" on "public"."group_event_participants";

drop policy "update_group_event_participants_authenticated" on "public"."group_event_participants";

drop policy "insert_group_events_authenticated" on "public"."group_events";

drop policy "select_group_events_anon" on "public"."group_events";

drop policy "select_group_events_authenticated" on "public"."group_events";

drop policy "update_group_events_authenticated" on "public"."group_events";

drop policy "insert_proposals_authenticated" on "public"."proposals";

drop policy "select_proposals_anon" on "public"."proposals";

drop policy "select_proposals_authenticated" on "public"."proposals";

drop policy "update_proposals_authenticated" on "public"."proposals";

drop policy "insert_team_memberships_authenticated" on "public"."team_memberships";

drop policy "select_team_memberships_anon" on "public"."team_memberships";

drop policy "select_team_memberships_authenticated" on "public"."team_memberships";

drop policy "update_team_memberships_authenticated" on "public"."team_memberships";

drop policy "insert_team_tokens_authenticated" on "public"."team_tokens";

drop policy "select_team_tokens_anon" on "public"."team_tokens";

drop policy "select_team_tokens_authenticated" on "public"."team_tokens";

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    DROP POLICY IF EXISTS "select_teams_anon" ON public.teams;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    DROP POLICY IF EXISTS "select_teams_authenticated" ON public.teams;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    DROP POLICY IF EXISTS "insert_teams_authenticated" ON public.teams;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    DROP POLICY IF EXISTS "update_teams_authenticated" ON public.teams;
  END IF;
END $$;

drop policy "Delete own tokens (authenticated)" on "public"."tokens";

drop policy "Insert own tokens (authenticated)" on "public"."tokens";

drop policy "Select own tokens (authenticated)" on "public"."tokens";

drop policy "Update own tokens (authenticated)" on "public"."tokens";

drop policy "Allow admin manage onboarding" on "public"."user_onboarding";

drop policy "Allow insert own onboarding" on "public"."user_onboarding";

drop policy "Allow select own onboarding" on "public"."user_onboarding";

drop policy "Allow update own onboarding" on "public"."user_onboarding";

drop policy "Admins can view errors" on "public"."user_registration_errors";

drop policy "Service role full access" on "public"."user_registration_errors";

drop policy "insert_votes_authenticated" on "public"."votes";

drop policy "select_votes_anon" on "public"."votes";

drop policy "select_votes_authenticated" on "public"."votes";

drop policy "update_votes_authenticated" on "public"."votes";

revoke delete on table "public"."business_success_puzzle" from "anon";

revoke insert on table "public"."business_success_puzzle" from "anon";

revoke references on table "public"."business_success_puzzle" from "anon";

revoke select on table "public"."business_success_puzzle" from "anon";

revoke trigger on table "public"."business_success_puzzle" from "anon";

revoke truncate on table "public"."business_success_puzzle" from "anon";

revoke update on table "public"."business_success_puzzle" from "anon";

revoke delete on table "public"."business_success_puzzle" from "authenticated";

revoke insert on table "public"."business_success_puzzle" from "authenticated";

revoke references on table "public"."business_success_puzzle" from "authenticated";

revoke select on table "public"."business_success_puzzle" from "authenticated";

revoke trigger on table "public"."business_success_puzzle" from "authenticated";

revoke truncate on table "public"."business_success_puzzle" from "authenticated";

revoke update on table "public"."business_success_puzzle" from "authenticated";

revoke delete on table "public"."business_success_puzzle" from "service_role";

revoke insert on table "public"."business_success_puzzle" from "service_role";

revoke references on table "public"."business_success_puzzle" from "service_role";

revoke select on table "public"."business_success_puzzle" from "service_role";

revoke trigger on table "public"."business_success_puzzle" from "service_role";

revoke truncate on table "public"."business_success_puzzle" from "service_role";

revoke update on table "public"."business_success_puzzle" from "service_role";

revoke delete on table "public"."collective_actions" from "anon";

revoke insert on table "public"."collective_actions" from "anon";

revoke references on table "public"."collective_actions" from "anon";

revoke select on table "public"."collective_actions" from "anon";

revoke trigger on table "public"."collective_actions" from "anon";

revoke truncate on table "public"."collective_actions" from "anon";

revoke update on table "public"."collective_actions" from "anon";

revoke delete on table "public"."collective_actions" from "authenticated";

revoke insert on table "public"."collective_actions" from "authenticated";

revoke references on table "public"."collective_actions" from "authenticated";

revoke select on table "public"."collective_actions" from "authenticated";

revoke trigger on table "public"."collective_actions" from "authenticated";

revoke truncate on table "public"."collective_actions" from "authenticated";

revoke update on table "public"."collective_actions" from "authenticated";

revoke delete on table "public"."collective_actions" from "service_role";

revoke insert on table "public"."collective_actions" from "service_role";

revoke references on table "public"."collective_actions" from "service_role";

revoke select on table "public"."collective_actions" from "service_role";

revoke trigger on table "public"."collective_actions" from "service_role";

revoke truncate on table "public"."collective_actions" from "service_role";

revoke update on table "public"."collective_actions" from "service_role";

revoke delete on table "public"."component_progress" from "anon";

revoke insert on table "public"."component_progress" from "anon";

revoke references on table "public"."component_progress" from "anon";

revoke select on table "public"."component_progress" from "anon";

revoke trigger on table "public"."component_progress" from "anon";

revoke truncate on table "public"."component_progress" from "anon";

revoke update on table "public"."component_progress" from "anon";

revoke delete on table "public"."component_progress" from "authenticated";

revoke insert on table "public"."component_progress" from "authenticated";

revoke references on table "public"."component_progress" from "authenticated";

revoke select on table "public"."component_progress" from "authenticated";

revoke trigger on table "public"."component_progress" from "authenticated";

revoke truncate on table "public"."component_progress" from "authenticated";

revoke update on table "public"."component_progress" from "authenticated";

revoke delete on table "public"."component_progress" from "service_role";

revoke insert on table "public"."component_progress" from "service_role";

revoke references on table "public"."component_progress" from "service_role";

revoke select on table "public"."component_progress" from "service_role";

revoke trigger on table "public"."component_progress" from "service_role";

revoke truncate on table "public"."component_progress" from "service_role";

revoke update on table "public"."component_progress" from "service_role";

revoke delete on table "public"."experience_phases" from "anon";

revoke insert on table "public"."experience_phases" from "anon";

revoke references on table "public"."experience_phases" from "anon";

revoke select on table "public"."experience_phases" from "anon";

revoke trigger on table "public"."experience_phases" from "anon";

revoke truncate on table "public"."experience_phases" from "anon";

revoke update on table "public"."experience_phases" from "anon";

revoke delete on table "public"."experience_phases" from "authenticated";

revoke insert on table "public"."experience_phases" from "authenticated";

revoke references on table "public"."experience_phases" from "authenticated";

revoke select on table "public"."experience_phases" from "authenticated";

revoke trigger on table "public"."experience_phases" from "authenticated";

revoke truncate on table "public"."experience_phases" from "authenticated";

revoke update on table "public"."experience_phases" from "authenticated";

revoke delete on table "public"."experience_phases" from "service_role";

revoke insert on table "public"."experience_phases" from "service_role";

revoke references on table "public"."experience_phases" from "service_role";

revoke select on table "public"."experience_phases" from "service_role";

revoke trigger on table "public"."experience_phases" from "service_role";

revoke truncate on table "public"."experience_phases" from "service_role";

revoke update on table "public"."experience_phases" from "service_role";

revoke delete on table "public"."group_event_participants" from "anon";

revoke insert on table "public"."group_event_participants" from "anon";

revoke references on table "public"."group_event_participants" from "anon";

revoke select on table "public"."group_event_participants" from "anon";

revoke trigger on table "public"."group_event_participants" from "anon";

revoke truncate on table "public"."group_event_participants" from "anon";

revoke update on table "public"."group_event_participants" from "anon";

revoke delete on table "public"."group_event_participants" from "authenticated";

revoke insert on table "public"."group_event_participants" from "authenticated";

revoke references on table "public"."group_event_participants" from "authenticated";

revoke select on table "public"."group_event_participants" from "authenticated";

revoke trigger on table "public"."group_event_participants" from "authenticated";

revoke truncate on table "public"."group_event_participants" from "authenticated";

revoke update on table "public"."group_event_participants" from "authenticated";

revoke delete on table "public"."group_event_participants" from "service_role";

revoke insert on table "public"."group_event_participants" from "service_role";

revoke references on table "public"."group_event_participants" from "service_role";

revoke select on table "public"."group_event_participants" from "service_role";

revoke trigger on table "public"."group_event_participants" from "service_role";

revoke truncate on table "public"."group_event_participants" from "service_role";

revoke update on table "public"."group_event_participants" from "service_role";

revoke delete on table "public"."group_events" from "anon";

revoke insert on table "public"."group_events" from "anon";

revoke references on table "public"."group_events" from "anon";

revoke select on table "public"."group_events" from "anon";

revoke trigger on table "public"."group_events" from "anon";

revoke truncate on table "public"."group_events" from "anon";

revoke update on table "public"."group_events" from "anon";

revoke delete on table "public"."group_events" from "authenticated";

revoke insert on table "public"."group_events" from "authenticated";

revoke references on table "public"."group_events" from "authenticated";

revoke select on table "public"."group_events" from "authenticated";

revoke trigger on table "public"."group_events" from "authenticated";

revoke truncate on table "public"."group_events" from "authenticated";

revoke update on table "public"."group_events" from "authenticated";

revoke delete on table "public"."group_events" from "service_role";

revoke insert on table "public"."group_events" from "service_role";

revoke references on table "public"."group_events" from "service_role";

revoke select on table "public"."group_events" from "service_role";

revoke trigger on table "public"."group_events" from "service_role";

revoke truncate on table "public"."group_events" from "service_role";

revoke update on table "public"."group_events" from "service_role";

revoke delete on table "public"."invitations" from "anon";

revoke insert on table "public"."invitations" from "anon";

revoke references on table "public"."invitations" from "anon";

revoke select on table "public"."invitations" from "anon";

revoke trigger on table "public"."invitations" from "anon";

revoke truncate on table "public"."invitations" from "anon";

revoke update on table "public"."invitations" from "anon";

revoke delete on table "public"."invitations" from "authenticated";

revoke insert on table "public"."invitations" from "authenticated";

revoke references on table "public"."invitations" from "authenticated";

revoke select on table "public"."invitations" from "authenticated";

revoke trigger on table "public"."invitations" from "authenticated";

revoke truncate on table "public"."invitations" from "authenticated";

revoke update on table "public"."invitations" from "authenticated";

revoke delete on table "public"."invitations" from "service_role";

revoke insert on table "public"."invitations" from "service_role";

revoke references on table "public"."invitations" from "service_role";

revoke select on table "public"."invitations" from "service_role";

revoke trigger on table "public"."invitations" from "service_role";

revoke truncate on table "public"."invitations" from "service_role";

revoke update on table "public"."invitations" from "service_role";

revoke delete on table "public"."metrics" from "anon";

revoke insert on table "public"."metrics" from "anon";

revoke references on table "public"."metrics" from "anon";

revoke select on table "public"."metrics" from "anon";

revoke trigger on table "public"."metrics" from "anon";

revoke truncate on table "public"."metrics" from "anon";

revoke update on table "public"."metrics" from "anon";

revoke delete on table "public"."metrics" from "authenticated";

revoke insert on table "public"."metrics" from "authenticated";

revoke references on table "public"."metrics" from "authenticated";

revoke select on table "public"."metrics" from "authenticated";

revoke trigger on table "public"."metrics" from "authenticated";

revoke truncate on table "public"."metrics" from "authenticated";

revoke update on table "public"."metrics" from "authenticated";

revoke delete on table "public"."metrics" from "service_role";

revoke insert on table "public"."metrics" from "service_role";

revoke references on table "public"."metrics" from "service_role";

revoke select on table "public"."metrics" from "service_role";

revoke trigger on table "public"."metrics" from "service_role";

revoke truncate on table "public"."metrics" from "service_role";

revoke update on table "public"."metrics" from "service_role";

revoke delete on table "public"."personal_success_puzzle" from "anon";

revoke insert on table "public"."personal_success_puzzle" from "anon";

revoke references on table "public"."personal_success_puzzle" from "anon";

revoke select on table "public"."personal_success_puzzle" from "anon";

revoke trigger on table "public"."personal_success_puzzle" from "anon";

revoke truncate on table "public"."personal_success_puzzle" from "anon";

revoke update on table "public"."personal_success_puzzle" from "anon";

revoke delete on table "public"."personal_success_puzzle" from "authenticated";

revoke insert on table "public"."personal_success_puzzle" from "authenticated";

revoke references on table "public"."personal_success_puzzle" from "authenticated";

revoke select on table "public"."personal_success_puzzle" from "authenticated";

revoke trigger on table "public"."personal_success_puzzle" from "authenticated";

revoke truncate on table "public"."personal_success_puzzle" from "authenticated";

revoke update on table "public"."personal_success_puzzle" from "authenticated";

revoke delete on table "public"."personal_success_puzzle" from "service_role";

revoke insert on table "public"."personal_success_puzzle" from "service_role";

revoke references on table "public"."personal_success_puzzle" from "service_role";

revoke select on table "public"."personal_success_puzzle" from "service_role";

revoke trigger on table "public"."personal_success_puzzle" from "service_role";

revoke truncate on table "public"."personal_success_puzzle" from "service_role";

revoke update on table "public"."personal_success_puzzle" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."proposals" from "anon";

revoke insert on table "public"."proposals" from "anon";

revoke references on table "public"."proposals" from "anon";

revoke select on table "public"."proposals" from "anon";

revoke trigger on table "public"."proposals" from "anon";

revoke truncate on table "public"."proposals" from "anon";

revoke update on table "public"."proposals" from "anon";

revoke delete on table "public"."proposals" from "authenticated";

revoke insert on table "public"."proposals" from "authenticated";

revoke references on table "public"."proposals" from "authenticated";

revoke select on table "public"."proposals" from "authenticated";

revoke trigger on table "public"."proposals" from "authenticated";

revoke truncate on table "public"."proposals" from "authenticated";

revoke update on table "public"."proposals" from "authenticated";

revoke delete on table "public"."proposals" from "service_role";

revoke insert on table "public"."proposals" from "service_role";

revoke references on table "public"."proposals" from "service_role";

revoke select on table "public"."proposals" from "service_role";

revoke trigger on table "public"."proposals" from "service_role";

revoke truncate on table "public"."proposals" from "service_role";

revoke update on table "public"."proposals" from "service_role";

revoke delete on table "public"."supergenius_breakthroughs" from "anon";

revoke insert on table "public"."supergenius_breakthroughs" from "anon";

revoke references on table "public"."supergenius_breakthroughs" from "anon";

revoke select on table "public"."supergenius_breakthroughs" from "anon";

revoke trigger on table "public"."supergenius_breakthroughs" from "anon";

revoke truncate on table "public"."supergenius_breakthroughs" from "anon";

revoke update on table "public"."supergenius_breakthroughs" from "anon";

revoke delete on table "public"."supergenius_breakthroughs" from "authenticated";

revoke insert on table "public"."supergenius_breakthroughs" from "authenticated";

revoke references on table "public"."supergenius_breakthroughs" from "authenticated";

revoke select on table "public"."supergenius_breakthroughs" from "authenticated";

revoke trigger on table "public"."supergenius_breakthroughs" from "authenticated";

revoke truncate on table "public"."supergenius_breakthroughs" from "authenticated";

revoke update on table "public"."supergenius_breakthroughs" from "authenticated";

revoke delete on table "public"."supergenius_breakthroughs" from "service_role";

revoke insert on table "public"."supergenius_breakthroughs" from "service_role";

revoke references on table "public"."supergenius_breakthroughs" from "service_role";

revoke select on table "public"."supergenius_breakthroughs" from "service_role";

revoke trigger on table "public"."supergenius_breakthroughs" from "service_role";

revoke truncate on table "public"."supergenius_breakthroughs" from "service_role";

revoke update on table "public"."supergenius_breakthroughs" from "service_role";

revoke delete on table "public"."superhuman_enhancements" from "anon";

revoke insert on table "public"."superhuman_enhancements" from "anon";

revoke references on table "public"."superhuman_enhancements" from "anon";

revoke select on table "public"."superhuman_enhancements" from "anon";

revoke trigger on table "public"."superhuman_enhancements" from "anon";

revoke truncate on table "public"."superhuman_enhancements" from "anon";

revoke update on table "public"."superhuman_enhancements" from "anon";

revoke delete on table "public"."superhuman_enhancements" from "authenticated";

revoke insert on table "public"."superhuman_enhancements" from "authenticated";

revoke references on table "public"."superhuman_enhancements" from "authenticated";

revoke select on table "public"."superhuman_enhancements" from "authenticated";

revoke trigger on table "public"."superhuman_enhancements" from "authenticated";

revoke truncate on table "public"."superhuman_enhancements" from "authenticated";

revoke update on table "public"."superhuman_enhancements" from "authenticated";

revoke delete on table "public"."superhuman_enhancements" from "service_role";

revoke insert on table "public"."superhuman_enhancements" from "service_role";

revoke references on table "public"."superhuman_enhancements" from "service_role";

revoke select on table "public"."superhuman_enhancements" from "service_role";

revoke trigger on table "public"."superhuman_enhancements" from "service_role";

revoke truncate on table "public"."superhuman_enhancements" from "service_role";

revoke update on table "public"."superhuman_enhancements" from "service_role";

revoke delete on table "public"."supermind_superpowers" from "anon";

revoke insert on table "public"."supermind_superpowers" from "anon";

revoke references on table "public"."supermind_superpowers" from "anon";

revoke select on table "public"."supermind_superpowers" from "anon";

revoke trigger on table "public"."supermind_superpowers" from "anon";

revoke truncate on table "public"."supermind_superpowers" from "anon";

revoke update on table "public"."supermind_superpowers" from "anon";

revoke delete on table "public"."supermind_superpowers" from "authenticated";

revoke insert on table "public"."supermind_superpowers" from "authenticated";

revoke references on table "public"."supermind_superpowers" from "authenticated";

revoke select on table "public"."supermind_superpowers" from "authenticated";

revoke trigger on table "public"."supermind_superpowers" from "authenticated";

revoke truncate on table "public"."supermind_superpowers" from "authenticated";

revoke update on table "public"."supermind_superpowers" from "authenticated";

revoke delete on table "public"."supermind_superpowers" from "service_role";

revoke insert on table "public"."supermind_superpowers" from "service_role";

revoke references on table "public"."supermind_superpowers" from "service_role";

revoke select on table "public"."supermind_superpowers" from "service_role";

revoke trigger on table "public"."supermind_superpowers" from "service_role";

revoke truncate on table "public"."supermind_superpowers" from "service_role";

revoke update on table "public"."supermind_superpowers" from "service_role";

revoke delete on table "public"."superpuzzle_developments" from "anon";

revoke insert on table "public"."superpuzzle_developments" from "anon";

revoke references on table "public"."superpuzzle_developments" from "anon";

revoke select on table "public"."superpuzzle_developments" from "anon";

revoke trigger on table "public"."superpuzzle_developments" from "anon";

revoke truncate on table "public"."superpuzzle_developments" from "anon";

revoke update on table "public"."superpuzzle_developments" from "anon";

revoke delete on table "public"."superpuzzle_developments" from "authenticated";

revoke insert on table "public"."superpuzzle_developments" from "authenticated";

revoke references on table "public"."superpuzzle_developments" from "authenticated";

revoke select on table "public"."superpuzzle_developments" from "authenticated";

revoke trigger on table "public"."superpuzzle_developments" from "authenticated";

revoke truncate on table "public"."superpuzzle_developments" from "authenticated";

revoke update on table "public"."superpuzzle_developments" from "authenticated";

revoke delete on table "public"."superpuzzle_developments" from "service_role";

revoke insert on table "public"."superpuzzle_developments" from "service_role";

revoke references on table "public"."superpuzzle_developments" from "service_role";

revoke select on table "public"."superpuzzle_developments" from "service_role";

revoke trigger on table "public"."superpuzzle_developments" from "service_role";

revoke truncate on table "public"."superpuzzle_developments" from "service_role";

revoke update on table "public"."superpuzzle_developments" from "service_role";

revoke delete on table "public"."supersociety_advancements" from "anon";

revoke insert on table "public"."supersociety_advancements" from "anon";

revoke references on table "public"."supersociety_advancements" from "anon";

revoke select on table "public"."supersociety_advancements" from "anon";

revoke trigger on table "public"."supersociety_advancements" from "anon";

revoke truncate on table "public"."supersociety_advancements" from "anon";

revoke update on table "public"."supersociety_advancements" from "anon";

revoke delete on table "public"."supersociety_advancements" from "authenticated";

revoke insert on table "public"."supersociety_advancements" from "authenticated";

revoke references on table "public"."supersociety_advancements" from "authenticated";

revoke select on table "public"."supersociety_advancements" from "authenticated";

revoke trigger on table "public"."supersociety_advancements" from "authenticated";

revoke truncate on table "public"."supersociety_advancements" from "authenticated";

revoke update on table "public"."supersociety_advancements" from "authenticated";

revoke delete on table "public"."supersociety_advancements" from "service_role";

revoke insert on table "public"."supersociety_advancements" from "service_role";

revoke references on table "public"."supersociety_advancements" from "service_role";

revoke select on table "public"."supersociety_advancements" from "service_role";

revoke trigger on table "public"."supersociety_advancements" from "service_role";

revoke truncate on table "public"."supersociety_advancements" from "service_role";

revoke update on table "public"."supersociety_advancements" from "service_role";

revoke delete on table "public"."team_memberships" from "anon";

revoke insert on table "public"."team_memberships" from "anon";

revoke references on table "public"."team_memberships" from "anon";

revoke select on table "public"."team_memberships" from "anon";

revoke trigger on table "public"."team_memberships" from "anon";

revoke truncate on table "public"."team_memberships" from "anon";

revoke update on table "public"."team_memberships" from "anon";

revoke delete on table "public"."team_memberships" from "authenticated";

revoke insert on table "public"."team_memberships" from "authenticated";

revoke references on table "public"."team_memberships" from "authenticated";

revoke select on table "public"."team_memberships" from "authenticated";

revoke trigger on table "public"."team_memberships" from "authenticated";

revoke truncate on table "public"."team_memberships" from "authenticated";

revoke update on table "public"."team_memberships" from "authenticated";

revoke delete on table "public"."team_memberships" from "service_role";

revoke insert on table "public"."team_memberships" from "service_role";

revoke references on table "public"."team_memberships" from "service_role";

revoke select on table "public"."team_memberships" from "service_role";

revoke trigger on table "public"."team_memberships" from "service_role";

revoke truncate on table "public"."team_memberships" from "service_role";

revoke update on table "public"."team_memberships" from "service_role";

revoke delete on table "public"."team_tokens" from "anon";

revoke insert on table "public"."team_tokens" from "anon";

revoke references on table "public"."team_tokens" from "anon";

revoke select on table "public"."team_tokens" from "anon";

revoke trigger on table "public"."team_tokens" from "anon";

revoke truncate on table "public"."team_tokens" from "anon";

revoke update on table "public"."team_tokens" from "anon";

revoke delete on table "public"."team_tokens" from "authenticated";

revoke insert on table "public"."team_tokens" from "authenticated";

revoke references on table "public"."team_tokens" from "authenticated";

revoke select on table "public"."team_tokens" from "authenticated";

revoke trigger on table "public"."team_tokens" from "authenticated";

revoke truncate on table "public"."team_tokens" from "authenticated";

revoke update on table "public"."team_tokens" from "authenticated";

revoke delete on table "public"."team_tokens" from "service_role";

revoke insert on table "public"."team_tokens" from "service_role";

revoke references on table "public"."team_tokens" from "service_role";

revoke select on table "public"."team_tokens" from "service_role";

revoke trigger on table "public"."team_tokens" from "service_role";

revoke truncate on table "public"."team_tokens" from "service_role";

revoke update on table "public"."team_tokens" from "service_role";

revoke delete on table "public"."teams" from "anon";

revoke insert on table "public"."teams" from "anon";

revoke references on table "public"."teams" from "anon";

revoke select on table "public"."teams" from "anon";

revoke trigger on table "public"."teams" from "anon";

revoke truncate on table "public"."teams" from "anon";

revoke update on table "public"."teams" from "anon";

revoke delete on table "public"."teams" from "authenticated";

revoke insert on table "public"."teams" from "authenticated";

revoke references on table "public"."teams" from "authenticated";

revoke select on table "public"."teams" from "authenticated";

revoke trigger on table "public"."teams" from "authenticated";

revoke truncate on table "public"."teams" from "authenticated";

revoke update on table "public"."teams" from "authenticated";

revoke delete on table "public"."teams" from "service_role";

revoke insert on table "public"."teams" from "service_role";

revoke references on table "public"."teams" from "service_role";

revoke select on table "public"."teams" from "service_role";

revoke trigger on table "public"."teams" from "service_role";

revoke truncate on table "public"."teams" from "service_role";

revoke update on table "public"."teams" from "service_role";

revoke delete on table "public"."tokens" from "anon";

revoke insert on table "public"."tokens" from "anon";

revoke references on table "public"."tokens" from "anon";

revoke select on table "public"."tokens" from "anon";

revoke trigger on table "public"."tokens" from "anon";

revoke truncate on table "public"."tokens" from "anon";

revoke update on table "public"."tokens" from "anon";

revoke delete on table "public"."tokens" from "authenticated";

revoke insert on table "public"."tokens" from "authenticated";

revoke references on table "public"."tokens" from "authenticated";

revoke select on table "public"."tokens" from "authenticated";

revoke trigger on table "public"."tokens" from "authenticated";

revoke truncate on table "public"."tokens" from "authenticated";

revoke update on table "public"."tokens" from "authenticated";

revoke delete on table "public"."tokens" from "service_role";

revoke insert on table "public"."tokens" from "service_role";

revoke references on table "public"."tokens" from "service_role";

revoke select on table "public"."tokens" from "service_role";

revoke trigger on table "public"."tokens" from "service_role";

revoke truncate on table "public"."tokens" from "service_role";

revoke update on table "public"."tokens" from "service_role";

revoke delete on table "public"."transactions" from "anon";

revoke insert on table "public"."transactions" from "anon";

revoke references on table "public"."transactions" from "anon";

revoke select on table "public"."transactions" from "anon";

revoke trigger on table "public"."transactions" from "anon";

revoke truncate on table "public"."transactions" from "anon";

revoke update on table "public"."transactions" from "anon";

revoke delete on table "public"."transactions" from "authenticated";

revoke insert on table "public"."transactions" from "authenticated";

revoke references on table "public"."transactions" from "authenticated";

revoke select on table "public"."transactions" from "authenticated";

revoke trigger on table "public"."transactions" from "authenticated";

revoke truncate on table "public"."transactions" from "authenticated";

revoke update on table "public"."transactions" from "authenticated";

revoke delete on table "public"."transactions" from "service_role";

revoke insert on table "public"."transactions" from "service_role";

revoke references on table "public"."transactions" from "service_role";

revoke select on table "public"."transactions" from "service_role";

revoke trigger on table "public"."transactions" from "service_role";

revoke truncate on table "public"."transactions" from "service_role";

revoke update on table "public"."transactions" from "service_role";

revoke delete on table "public"."user_balances" from "anon";

revoke insert on table "public"."user_balances" from "anon";

revoke references on table "public"."user_balances" from "anon";

revoke select on table "public"."user_balances" from "anon";

revoke trigger on table "public"."user_balances" from "anon";

revoke truncate on table "public"."user_balances" from "anon";

revoke update on table "public"."user_balances" from "anon";

revoke delete on table "public"."user_balances" from "authenticated";

revoke insert on table "public"."user_balances" from "authenticated";

revoke references on table "public"."user_balances" from "authenticated";

revoke select on table "public"."user_balances" from "authenticated";

revoke trigger on table "public"."user_balances" from "authenticated";

revoke truncate on table "public"."user_balances" from "authenticated";

revoke update on table "public"."user_balances" from "authenticated";

revoke delete on table "public"."user_balances" from "service_role";

revoke insert on table "public"."user_balances" from "service_role";

revoke references on table "public"."user_balances" from "service_role";

revoke select on table "public"."user_balances" from "service_role";

revoke trigger on table "public"."user_balances" from "service_role";

revoke truncate on table "public"."user_balances" from "service_role";

revoke update on table "public"."user_balances" from "service_role";

revoke delete on table "public"."user_milestones" from "anon";

revoke insert on table "public"."user_milestones" from "anon";

revoke references on table "public"."user_milestones" from "anon";

revoke select on table "public"."user_milestones" from "anon";

revoke trigger on table "public"."user_milestones" from "anon";

revoke truncate on table "public"."user_milestones" from "anon";

revoke update on table "public"."user_milestones" from "anon";

revoke delete on table "public"."user_milestones" from "authenticated";

revoke insert on table "public"."user_milestones" from "authenticated";

revoke references on table "public"."user_milestones" from "authenticated";

revoke select on table "public"."user_milestones" from "authenticated";

revoke trigger on table "public"."user_milestones" from "authenticated";

revoke truncate on table "public"."user_milestones" from "authenticated";

revoke update on table "public"."user_milestones" from "authenticated";

revoke delete on table "public"."user_milestones" from "service_role";

revoke insert on table "public"."user_milestones" from "service_role";

revoke references on table "public"."user_milestones" from "service_role";

revoke select on table "public"."user_milestones" from "service_role";

revoke trigger on table "public"."user_milestones" from "service_role";

revoke truncate on table "public"."user_milestones" from "service_role";

revoke update on table "public"."user_milestones" from "service_role";

revoke delete on table "public"."user_onboarding" from "anon";

revoke insert on table "public"."user_onboarding" from "anon";

revoke references on table "public"."user_onboarding" from "anon";

revoke select on table "public"."user_onboarding" from "anon";

revoke trigger on table "public"."user_onboarding" from "anon";

revoke truncate on table "public"."user_onboarding" from "anon";

revoke update on table "public"."user_onboarding" from "anon";

revoke delete on table "public"."user_onboarding" from "authenticated";

revoke insert on table "public"."user_onboarding" from "authenticated";

revoke references on table "public"."user_onboarding" from "authenticated";

revoke select on table "public"."user_onboarding" from "authenticated";

revoke trigger on table "public"."user_onboarding" from "authenticated";

revoke truncate on table "public"."user_onboarding" from "authenticated";

revoke update on table "public"."user_onboarding" from "authenticated";

revoke delete on table "public"."user_onboarding" from "service_role";

revoke insert on table "public"."user_onboarding" from "service_role";

revoke references on table "public"."user_onboarding" from "service_role";

revoke select on table "public"."user_onboarding" from "service_role";

revoke trigger on table "public"."user_onboarding" from "service_role";

revoke truncate on table "public"."user_onboarding" from "service_role";

revoke update on table "public"."user_onboarding" from "service_role";

revoke delete on table "public"."user_phase_milestones" from "anon";

revoke insert on table "public"."user_phase_milestones" from "anon";

revoke references on table "public"."user_phase_milestones" from "anon";

revoke select on table "public"."user_phase_milestones" from "anon";

revoke trigger on table "public"."user_phase_milestones" from "anon";

revoke truncate on table "public"."user_phase_milestones" from "anon";

revoke update on table "public"."user_phase_milestones" from "anon";

revoke delete on table "public"."user_phase_milestones" from "authenticated";

revoke insert on table "public"."user_phase_milestones" from "authenticated";

revoke references on table "public"."user_phase_milestones" from "authenticated";

revoke select on table "public"."user_phase_milestones" from "authenticated";

revoke trigger on table "public"."user_phase_milestones" from "authenticated";

revoke truncate on table "public"."user_phase_milestones" from "authenticated";

revoke update on table "public"."user_phase_milestones" from "authenticated";

revoke delete on table "public"."user_phase_milestones" from "service_role";

revoke insert on table "public"."user_phase_milestones" from "service_role";

revoke references on table "public"."user_phase_milestones" from "service_role";

revoke select on table "public"."user_phase_milestones" from "service_role";

revoke trigger on table "public"."user_phase_milestones" from "service_role";

revoke truncate on table "public"."user_phase_milestones" from "service_role";

revoke update on table "public"."user_phase_milestones" from "service_role";

revoke delete on table "public"."user_phase_transitions" from "anon";

revoke insert on table "public"."user_phase_transitions" from "anon";

revoke references on table "public"."user_phase_transitions" from "anon";

revoke select on table "public"."user_phase_transitions" from "anon";

revoke trigger on table "public"."user_phase_transitions" from "anon";

revoke truncate on table "public"."user_phase_transitions" from "anon";

revoke update on table "public"."user_phase_transitions" from "anon";

revoke delete on table "public"."user_phase_transitions" from "authenticated";

revoke insert on table "public"."user_phase_transitions" from "authenticated";

revoke references on table "public"."user_phase_transitions" from "authenticated";

revoke select on table "public"."user_phase_transitions" from "authenticated";

revoke trigger on table "public"."user_phase_transitions" from "authenticated";

revoke truncate on table "public"."user_phase_transitions" from "authenticated";

revoke update on table "public"."user_phase_transitions" from "authenticated";

revoke delete on table "public"."user_phase_transitions" from "service_role";

revoke insert on table "public"."user_phase_transitions" from "service_role";

revoke references on table "public"."user_phase_transitions" from "service_role";

revoke select on table "public"."user_phase_transitions" from "service_role";

revoke trigger on table "public"."user_phase_transitions" from "service_role";

revoke truncate on table "public"."user_phase_transitions" from "service_role";

revoke update on table "public"."user_phase_transitions" from "service_role";

revoke delete on table "public"."user_registration_errors" from "anon";

revoke insert on table "public"."user_registration_errors" from "anon";

revoke references on table "public"."user_registration_errors" from "anon";

revoke select on table "public"."user_registration_errors" from "anon";

revoke trigger on table "public"."user_registration_errors" from "anon";

revoke truncate on table "public"."user_registration_errors" from "anon";

revoke update on table "public"."user_registration_errors" from "anon";

revoke delete on table "public"."user_registration_errors" from "authenticated";

revoke insert on table "public"."user_registration_errors" from "authenticated";

revoke references on table "public"."user_registration_errors" from "authenticated";

revoke select on table "public"."user_registration_errors" from "authenticated";

revoke trigger on table "public"."user_registration_errors" from "authenticated";

revoke truncate on table "public"."user_registration_errors" from "authenticated";

revoke update on table "public"."user_registration_errors" from "authenticated";

revoke delete on table "public"."user_registration_errors" from "service_role";

revoke insert on table "public"."user_registration_errors" from "service_role";

revoke references on table "public"."user_registration_errors" from "service_role";

revoke select on table "public"."user_registration_errors" from "service_role";

revoke trigger on table "public"."user_registration_errors" from "service_role";

revoke truncate on table "public"."user_registration_errors" from "service_role";

revoke update on table "public"."user_registration_errors" from "service_role";

revoke delete on table "public"."user_role_activity" from "anon";

revoke insert on table "public"."user_role_activity" from "anon";

revoke references on table "public"."user_role_activity" from "anon";

revoke select on table "public"."user_role_activity" from "anon";

revoke trigger on table "public"."user_role_activity" from "anon";

revoke truncate on table "public"."user_role_activity" from "anon";

revoke update on table "public"."user_role_activity" from "anon";

revoke delete on table "public"."user_role_activity" from "authenticated";

revoke insert on table "public"."user_role_activity" from "authenticated";

revoke references on table "public"."user_role_activity" from "authenticated";

revoke select on table "public"."user_role_activity" from "authenticated";

revoke trigger on table "public"."user_role_activity" from "authenticated";

revoke truncate on table "public"."user_role_activity" from "authenticated";

revoke update on table "public"."user_role_activity" from "authenticated";

revoke delete on table "public"."user_role_activity" from "service_role";

revoke insert on table "public"."user_role_activity" from "service_role";

revoke references on table "public"."user_role_activity" from "service_role";

revoke select on table "public"."user_role_activity" from "service_role";

revoke trigger on table "public"."user_role_activity" from "service_role";

revoke truncate on table "public"."user_role_activity" from "service_role";

revoke update on table "public"."user_role_activity" from "service_role";

revoke delete on table "public"."votes" from "anon";

revoke insert on table "public"."votes" from "anon";

revoke references on table "public"."votes" from "anon";

revoke select on table "public"."votes" from "anon";

revoke trigger on table "public"."votes" from "anon";

revoke truncate on table "public"."votes" from "anon";

revoke update on table "public"."votes" from "anon";

revoke delete on table "public"."votes" from "authenticated";

revoke insert on table "public"."votes" from "authenticated";

revoke references on table "public"."votes" from "authenticated";

revoke select on table "public"."votes" from "authenticated";

revoke trigger on table "public"."votes" from "authenticated";

revoke truncate on table "public"."votes" from "authenticated";

revoke update on table "public"."votes" from "authenticated";

revoke delete on table "public"."votes" from "service_role";

revoke insert on table "public"."votes" from "service_role";

revoke references on table "public"."votes" from "service_role";

revoke select on table "public"."votes" from "service_role";

revoke trigger on table "public"."votes" from "service_role";

revoke truncate on table "public"."votes" from "service_role";

revoke update on table "public"."votes" from "service_role";

alter table "public"."collective_actions" drop constraint "collective_actions_team_id_fkey";

alter table "public"."group_event_participants" drop constraint "group_event_participants_event_id_fkey";

alter table "public"."group_event_participants" drop constraint "group_event_participants_user_id_fkey";

alter table "public"."proposals" drop constraint "proposals_proposer_id_fkey";

alter table "public"."proposals" drop constraint "proposals_team_id_fkey";

alter table "public"."team_memberships" drop constraint "team_memberships_team_id_fkey";

alter table "public"."team_memberships" drop constraint "team_memberships_user_id_fkey";

alter table "public"."teams" drop constraint "teams_founder_id_fkey";

alter table "public"."teams" drop constraint "teams_name_key";

alter table "public"."user_onboarding" drop constraint "user_onboarding_user_id_fkey";

alter table "public"."votes" drop constraint "votes_proposal_id_fkey";

alter table "public"."votes" drop constraint "votes_voter_id_fkey";

alter table "public"."tokens" drop constraint "tokens_user_id_fkey";

drop function if exists "public"."fibonacci"(n integer);

drop function if exists "public"."handle_new_user_registration"();

drop function if exists "public"."reward_team_milestone_fib"();

drop function if exists "public"."reward_tokens_for_group_event_fib"();

drop view if exists "public"."team_census";

alter table "public"."collective_actions" drop constraint "collective_actions_pkey";

alter table "public"."group_event_participants" drop constraint "group_event_participants_pkey";

alter table "public"."group_events" drop constraint "group_events_pkey";

alter table "public"."proposals" drop constraint "proposals_pkey";

alter table "public"."team_memberships" drop constraint "team_memberships_pkey";

alter table "public"."team_tokens" drop constraint "team_tokens_pkey";

alter table "public"."teams" drop constraint "teams_pkey";

alter table "public"."user_onboarding" drop constraint "user_onboarding_pkey";

alter table "public"."user_registration_errors" drop constraint "user_registration_errors_pkey";

alter table "public"."votes" drop constraint "votes_pkey";

drop index if exists "public"."collective_actions_pkey";

drop index if exists "public"."group_event_participants_pkey";

drop index if exists "public"."group_events_pkey";

drop index if exists "public"."proposals_pkey";

drop index if exists "public"."team_memberships_pkey";

drop index if exists "public"."team_tokens_pkey";

drop index if exists "public"."teams_name_key";

drop index if exists "public"."teams_pkey";

drop index if exists "public"."tokens_user_id_token_type_idx";

drop index if exists "public"."user_onboarding_pkey";

drop index if exists "public"."user_onboarding_user_id_idx";

drop index if exists "public"."user_registration_errors_pkey";

drop index if exists "public"."votes_pkey";

drop table "public"."collective_actions";

drop table "public"."group_event_participants";

drop table "public"."group_events";

drop table "public"."proposals";

drop table "public"."team_memberships";

drop table "public"."team_tokens";

drop table "public"."teams";

drop table "public"."user_onboarding";

drop table "public"."user_registration_errors";

drop table "public"."votes";

alter table "public"."profiles" drop column "team_id";

alter table "public"."tokens" alter column "amount" drop default;

alter table "public"."tokens" alter column "user_id" drop not null;

CREATE INDEX idx_tokens_token_type ON public.tokens USING btree (token_type);

CREATE INDEX idx_tokens_user_id ON public.tokens USING btree (user_id);

alter table "public"."tokens" add constraint "tokens_amount_check" CHECK ((amount >= (0)::numeric)) not valid;

alter table "public"."tokens" validate constraint "tokens_amount_check";

alter table "public"."user_balances" add constraint "user_balances_token_id_fkey" FOREIGN KEY (token_id) REFERENCES tokens(id) not valid;

alter table "public"."user_balances" validate constraint "user_balances_token_id_fkey";

alter table "public"."tokens" add constraint "tokens_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."tokens" validate constraint "tokens_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.reward_tokens_for_role_activity_fib()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  -- Fibonacci reward logic for user role activity
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, new.role_type, 1, 'role_activity_fib');
  return new;
end;
$function$
;

create policy "delete_tokens_admin"
on "public"."tokens"
as permissive
for delete
to service_role
using (true);


create policy "insert_tokens_authenticated"
on "public"."tokens"
as permissive
for insert
to authenticated
with check (true);


create policy "select_tokens_authenticated"
on "public"."tokens"
as permissive
for select
to authenticated
using (true);


create policy "update_tokens_admin"
on "public"."tokens"
as permissive
for update
to service_role
using (true);
