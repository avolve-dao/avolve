

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "postgres";


CREATE TYPE "public"."metric_type" AS ENUM (
    'engagement',
    'retention',
    'arpu',
    'activation',
    'conversion',
    'growth',
    'custom'
);


ALTER TYPE "public"."metric_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."metric_type" IS 'Metric types: engagement, retention, arpu, activation, conversion, growth, custom.';



CREATE TYPE "public"."token_type" AS ENUM (
    'GEN',
    'SAP',
    'SCQ',
    'PSP',
    'BSP',
    'SMS',
    'SPD',
    'SHE',
    'SSA',
    'SBG'
);


ALTER TYPE "public"."token_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."token_type" IS 'Token types for Avolve: GEN, SAP, SCQ, PSP, BSP, SMS, SPD, SHE, SSA, SBG.';



CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'user',
    'superachiever',
    'superachievers',
    'supercivilization',
    'guest',
    'service_role'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."user_role" IS 'User roles for RBAC: admin, user, superachiever, superachievers, supercivilization, guest, service_role.';



CREATE OR REPLACE FUNCTION "public"."assign_role"("p_user_id" "uuid", "p_role_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- TODO: Implement actual role assignment logic
  -- This is a stub for onboarding/testing
  return;
end;
$$;


ALTER FUNCTION "public"."assign_role"("p_user_id" "uuid", "p_role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."complete_content"("p_content_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- TODO: Implement actual completion logic
  -- This is a stub for onboarding/testing
  return true;
end;
$$;


ALTER FUNCTION "public"."complete_content"("p_content_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_all_pillars_progress"() RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- TODO: Implement actual progress logic
  -- This is a stub for onboarding/testing
  return '{}'::jsonb;
end;
$$;


ALTER FUNCTION "public"."get_all_pillars_progress"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_experience_phase"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- TODO: Implement actual experience phase logic
  -- This is a stub for onboarding/testing
  return 'onboarding';
end;
$$;


ALTER FUNCTION "public"."get_user_experience_phase"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_progress"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  v_current_phase uuid;
  v_result jsonb;
begin
  -- Find the most recent phase transition for the user
  select to_phase into v_current_phase
  from public.user_phase_transitions
  where user_id = p_user_id
  order by transitioned_at desc
  limit 1;

  v_result := jsonb_build_object(
    'current_phase', v_current_phase
  );

  return v_result;
end;
$$;


ALTER FUNCTION "public"."get_user_progress"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("p_role_name" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- TODO: Implement actual role check logic
  -- This is a stub for onboarding/testing
  return true;
end;
$$;


ALTER FUNCTION "public"."has_role"("p_role_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_token_access"("content_token_symbol" "text", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- TODO: Implement actual token access logic
  -- This is a stub for onboarding/testing
  return true;
end;
$$;


ALTER FUNCTION "public"."has_token_access"("content_token_symbol" "text", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- TODO: Implement actual admin check logic
  -- This is a stub for onboarding/testing
  return false;
end;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reward_tokens_for_collaboration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  collaborator record;
begin
  for collaborator in select user_id from public.collaboration_contributors where collaboration_id = new.collaboration_id loop
    insert into public.tokens (user_id, token_type, amount, source)
    values (collaborator.user_id, 'SSA', 3, 'collaboration');
  end loop;
  return new;
end;
$$;


ALTER FUNCTION "public"."reward_tokens_for_collaboration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reward_tokens_for_group_quest"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
declare
  participant record;
begin
  for participant in select user_id from public.group_quest_participants where quest_id = new.quest_id loop
    insert into public.tokens (user_id, token_type, amount, source)
    values (participant.user_id, 'SPD', 5, 'group_quest');
  end loop;
  return new;
end;
$$;


ALTER FUNCTION "public"."reward_tokens_for_group_quest"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reward_tokens_for_mentorship"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.mentor_id, 'SHE', 2, 'mentorship'),
         (new.mentee_id, 'SHE', 2, 'mentorship');
  return new;
end;
$$;


ALTER FUNCTION "public"."reward_tokens_for_mentorship"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reward_tokens_for_role_activity_fib"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  -- Fibonacci reward logic for user role activity
  insert into public.tokens (user_id, token_type, amount, source)
  values (new.user_id, new.role_type, 1, 'role_activity_fib');
  return new;
end;
$$;


ALTER FUNCTION "public"."reward_tokens_for_role_activity_fib"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_feature_flags_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_feature_flags_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_journey_post_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_journey_post_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."achievements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category" "text" NOT NULL,
    "type" "text" NOT NULL,
    "awarded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "data" "jsonb"
);


ALTER TABLE "public"."achievements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."assists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "helper_id" "uuid",
    "recipient_id" "uuid",
    "description" "text",
    "assisted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."assists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."business_success_puzzle" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "front_stage_score" numeric,
    "back_stage_score" numeric,
    "bottom_line_score" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."business_success_puzzle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."canvas_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid",
    "pillar" "text" NOT NULL,
    "canvas_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."canvas_entries" OWNER TO "postgres";


COMMENT ON TABLE "public"."canvas_entries" IS 'Canvas entries for Strategyzer-style Canvas, Design, Attest, Evolve process.';



CREATE TABLE IF NOT EXISTS "public"."collective_progress" (
    "id" integer NOT NULL,
    "week_start" "date" NOT NULL,
    "actions_completed" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."collective_progress" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."collective_progress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."collective_progress_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."collective_progress_id_seq" OWNED BY "public"."collective_progress"."id";



CREATE TABLE IF NOT EXISTS "public"."community_milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "target" bigint NOT NULL,
    "current" bigint DEFAULT 0 NOT NULL,
    "reward" "text",
    "achieved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."component_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "component_name" "text" NOT NULL,
    "component_description" "text",
    "status" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."component_progress" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."components" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."components" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."experience_phases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "sequence" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "requirements" "jsonb"
);


ALTER TABLE "public"."experience_phases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."experiment_participation" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "experiment_name" "text",
    "participated_at" timestamp with time zone DEFAULT "now"(),
    "result" "text"
);


ALTER TABLE "public"."experiment_participation" OWNER TO "postgres";


COMMENT ON TABLE "public"."experiment_participation" IS 'Tracks user participation in experiments.';



CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "regeneration_status" "text" DEFAULT 'degen'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."group_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text",
    "invite_code" "text",
    "used" boolean DEFAULT false NOT NULL,
    "used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "invited_by" "uuid"
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."journey_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "journey_type" "text" NOT NULL,
    "journey_focus" "text" NOT NULL,
    "engagement_score" integer DEFAULT 0 NOT NULL,
    "regen_score" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."journey_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "metric_type" "public"."metric_type" NOT NULL,
    "metric_value" numeric NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."metrics" OWNER TO "postgres";


COMMENT ON TABLE "public"."metrics" IS 'Tracks all user and system metrics for analytics, engagement, and gamification.';



COMMENT ON COLUMN "public"."metrics"."metric_type" IS 'Type of metric, now using enum public.metric_type.';



CREATE TABLE IF NOT EXISTS "public"."milestone_contributions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "milestone_id" "uuid",
    "user_id" "uuid",
    "amount" bigint NOT NULL,
    "contributed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."milestone_contributions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."peer_recognition" (
    "id" bigint NOT NULL,
    "sender_id" "uuid",
    "recipient_id" "uuid",
    "message" "text" NOT NULL,
    "badge" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "sender_recipient_not_same" CHECK (("sender_id" <> "recipient_id"))
);


ALTER TABLE "public"."peer_recognition" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."peer_recognition_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."peer_recognition_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."peer_recognition_id_seq" OWNED BY "public"."peer_recognition"."id";



CREATE TABLE IF NOT EXISTS "public"."personal_success_puzzle" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "health_score" numeric,
    "wealth_score" numeric,
    "peace_score" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."personal_success_puzzle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_email" "text" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "regeneration_status" "text" DEFAULT 'degen'::"text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'Stores core user profile information for all registered users.';



COMMENT ON COLUMN "public"."profiles"."regeneration_status" IS 'Tracks user''s current Degen → Regen state: degen, transitional, regen';



CREATE TABLE IF NOT EXISTS "public"."quest_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quest_id" "uuid",
    "user_id" "uuid",
    "status" "text" DEFAULT 'not_started'::"text",
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."quest_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."quest_progress" IS 'Tracks user progress on quests.';



CREATE TABLE IF NOT EXISTS "public"."quests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pillar" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "token_type" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quests" OWNER TO "postgres";


COMMENT ON TABLE "public"."quests" IS 'Quests for each pillar (personal, collective, ecosystem) and token type.';



CREATE TABLE IF NOT EXISTS "public"."supercivilization_feed" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reactions" integer DEFAULT 0 NOT NULL,
    "badge" "text",
    "is_seeded" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."supercivilization_feed" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supergenius_breakthroughs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "venture_progress" numeric,
    "enterprise_progress" numeric,
    "industry_progress" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."supergenius_breakthroughs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."superhuman_enhancements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "academy_progress" numeric,
    "university_progress" numeric,
    "institute_progress" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."superhuman_enhancements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supermind_superpowers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "current_state" "text",
    "desired_state" "text",
    "action_plan" "text",
    "results" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."supermind_superpowers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."superpuzzle_developments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "academy_score" numeric,
    "company_score" numeric,
    "ecosystem_score" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."superpuzzle_developments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."supersociety_advancements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "company_progress" numeric,
    "community_progress" numeric,
    "country_progress" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."supersociety_advancements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid",
    "user_id" "uuid",
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_flows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "source" "text" NOT NULL,
    "target" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "token_type" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."token_flows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."token_ownership" (
    "token_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "balance" numeric DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."token_ownership" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "token_type" "public"."token_type" NOT NULL,
    "amount" numeric NOT NULL,
    "source" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "symbol" "text" DEFAULT ''::"text" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "transferable" boolean DEFAULT true,
    CONSTRAINT "tokens_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."tokens" OWNER TO "postgres";


COMMENT ON COLUMN "public"."tokens"."transferable" IS 'Indicates if the token can be transferred between users';



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "token_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "transaction_type" "text" NOT NULL,
    "from_user_id" "uuid",
    "to_user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['earn'::"text", 'spend'::"text", 'transfer'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "activity_type" "text" NOT NULL,
    "activity_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_admin_stories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "author_id" "uuid",
    "author_name" "text" NOT NULL,
    "avatar_url" "text",
    "story" "text" NOT NULL,
    "context" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_admin_stories_type_check" CHECK (("type" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."user_admin_stories" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_admin_stories" IS 'Stories shared by users and admins, surfaced by context for transparency and learning.';



COMMENT ON COLUMN "public"."user_admin_stories"."type" IS 'Type of story: user or admin.';



COMMENT ON COLUMN "public"."user_admin_stories"."context" IS 'Context for surfacing the story (e.g., pillar, canvas, experiment).';



CREATE TABLE IF NOT EXISTS "public"."user_balances" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token_id" "uuid" NOT NULL,
    "balance" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_balances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "context" "text",
    "feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_feedback" IS 'User feedback on actions, quests, onboarding, etc.';



CREATE TABLE IF NOT EXISTS "public"."user_milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "milestone_name" "text" NOT NULL,
    "milestone_description" "text",
    "achieved_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_onboarding" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "step" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "is_completed" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."user_onboarding" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_onboarding" IS 'Tracks onboarding step, status, and lifecycle for each user.';



COMMENT ON COLUMN "public"."user_onboarding"."user_id" IS 'FK to profiles.id; each user has at most one onboarding row.';



COMMENT ON COLUMN "public"."user_onboarding"."step" IS 'Current onboarding step for the user.';



COMMENT ON COLUMN "public"."user_onboarding"."started_at" IS 'Timestamp when onboarding started.';



COMMENT ON COLUMN "public"."user_onboarding"."updated_at" IS 'Timestamp of last onboarding update.';



COMMENT ON COLUMN "public"."user_onboarding"."completed_at" IS 'Timestamp when onboarding completed (nullable).';



COMMENT ON COLUMN "public"."user_onboarding"."is_completed" IS 'True if onboarding is completed.';



CREATE TABLE IF NOT EXISTS "public"."user_phase_milestones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "milestone_id" "uuid" NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_phase_milestones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_phase_transitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "from_phase" "text" NOT NULL,
    "to_phase" "text" NOT NULL,
    "transitioned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_phase_transitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_role_activity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "context" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "points" numeric DEFAULT 1 NOT NULL,
    "role_type" "public"."user_role"
);


ALTER TABLE "public"."user_role_activity" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_role_activity" IS 'Tracks every meaningful user action, mapped to a role type for dynamic role assignment and gamification.';



COMMENT ON COLUMN "public"."user_role_activity"."points" IS 'Points earned by the user for gamification.';



COMMENT ON COLUMN "public"."user_role_activity"."role_type" IS 'User role, now using enum public.user_role.';



CREATE OR REPLACE VIEW "public"."user_role_points" AS
 SELECT "user_role_activity"."user_id",
    "user_role_activity"."role_type",
    "sum"("user_role_activity"."points") AS "total_points"
   FROM "public"."user_role_activity"
  GROUP BY "user_role_activity"."user_id", "user_role_activity"."role_type";


ALTER TABLE "public"."user_role_points" OWNER TO "postgres";


COMMENT ON VIEW "public"."user_role_points" IS 'Aggregates user actions by role type to assign dynamic roles and track progression.';



ALTER TABLE ONLY "public"."collective_progress" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."collective_progress_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."peer_recognition" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."peer_recognition_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."assists"
    ADD CONSTRAINT "assists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."business_success_puzzle"
    ADD CONSTRAINT "business_success_puzzle_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."canvas_entries"
    ADD CONSTRAINT "canvas_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collective_progress"
    ADD CONSTRAINT "collective_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_milestones"
    ADD CONSTRAINT "community_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."component_progress"
    ADD CONSTRAINT "component_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."components"
    ADD CONSTRAINT "components_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."experience_phases"
    ADD CONSTRAINT "experience_phases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."experiment_participation"
    ADD CONSTRAINT "experiment_participation_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_profiles"
    ADD CONSTRAINT "group_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invite_code_key" UNIQUE ("invite_code");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."journey_posts"
    ADD CONSTRAINT "journey_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."metrics"
    ADD CONSTRAINT "metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."milestone_contributions"
    ADD CONSTRAINT "milestone_contributions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."peer_recognition"
    ADD CONSTRAINT "peer_recognition_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."personal_success_puzzle"
    ADD CONSTRAINT "personal_success_puzzle_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_user_email_key" UNIQUE ("user_email");



ALTER TABLE ONLY "public"."quest_progress"
    ADD CONSTRAINT "quest_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quests"
    ADD CONSTRAINT "quests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supercivilization_feed"
    ADD CONSTRAINT "supercivilization_feed_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supergenius_breakthroughs"
    ADD CONSTRAINT "supergenius_breakthroughs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."superhuman_enhancements"
    ADD CONSTRAINT "superhuman_enhancements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supermind_superpowers"
    ADD CONSTRAINT "supermind_superpowers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."superpuzzle_developments"
    ADD CONSTRAINT "superpuzzle_developments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supersociety_advancements"
    ADD CONSTRAINT "supersociety_advancements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."token_flows"
    ADD CONSTRAINT "token_flows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."token_ownership"
    ADD CONSTRAINT "token_ownership_pkey" PRIMARY KEY ("token_id", "user_id");



ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "unique_user_onboarding" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."collective_progress"
    ADD CONSTRAINT "unique_week" UNIQUE ("week_start");



ALTER TABLE ONLY "public"."user_activity_log"
    ADD CONSTRAINT "user_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_admin_stories"
    ADD CONSTRAINT "user_admin_stories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_balances"
    ADD CONSTRAINT "user_balances_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_feedback"
    ADD CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "user_onboarding_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_phase_milestones"
    ADD CONSTRAINT "user_phase_milestones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_phase_transitions"
    ADD CONSTRAINT "user_phase_transitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_role_activity"
    ADD CONSTRAINT "user_role_activity_pkey" PRIMARY KEY ("id");



CREATE INDEX "experience_phases_sequence_idx" ON "public"."experience_phases" USING "btree" ("sequence");



CREATE INDEX "idx_canvas_entries_created_by" ON "public"."canvas_entries" USING "btree" ("created_by");



CREATE INDEX "idx_collective_progress_week_start" ON "public"."collective_progress" USING "btree" ("week_start");



CREATE INDEX "idx_experiment_participation_user_id" ON "public"."experiment_participation" USING "btree" ("user_id");



CREATE INDEX "idx_journey_posts_created_at" ON "public"."journey_posts" USING "btree" ("created_at");



CREATE INDEX "idx_journey_posts_journey_type" ON "public"."journey_posts" USING "btree" ("journey_type");



CREATE INDEX "idx_journey_posts_user_id" ON "public"."journey_posts" USING "btree" ("user_id");



CREATE INDEX "idx_metrics_metric_type" ON "public"."metrics" USING "btree" ("metric_type");



CREATE INDEX "idx_metrics_recorded_at" ON "public"."metrics" USING "btree" ("recorded_at");



CREATE INDEX "idx_metrics_type_recorded_at" ON "public"."metrics" USING "btree" ("metric_type", "recorded_at");



CREATE INDEX "idx_quest_progress_user_id" ON "public"."quest_progress" USING "btree" ("user_id");



CREATE INDEX "idx_supercivilization_feed_created_at" ON "public"."supercivilization_feed" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_token_flows_timestamp" ON "public"."token_flows" USING "btree" ("timestamp");



CREATE INDEX "idx_token_flows_token_type" ON "public"."token_flows" USING "btree" ("token_type");



CREATE INDEX "idx_token_flows_user_id" ON "public"."token_flows" USING "btree" ("user_id");



CREATE INDEX "idx_token_ownership_token_id" ON "public"."token_ownership" USING "btree" ("token_id");



CREATE INDEX "idx_token_ownership_user_id" ON "public"."token_ownership" USING "btree" ("user_id");



CREATE INDEX "idx_tokens_token_type" ON "public"."tokens" USING "btree" ("token_type");



CREATE INDEX "idx_tokens_user_id" ON "public"."tokens" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_user" ON "public"."transactions" USING "btree" ("from_user_id", "to_user_id", "created_at");



CREATE INDEX "idx_user_activity_log_created_at" ON "public"."user_activity_log" USING "btree" ("created_at");



CREATE INDEX "idx_user_activity_log_user_id" ON "public"."user_activity_log" USING "btree" ("user_id");



CREATE INDEX "idx_user_admin_stories_context" ON "public"."user_admin_stories" USING "btree" ("context");



CREATE INDEX "idx_user_feedback_user_id" ON "public"."user_feedback" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_user_onboarding_user_id" ON "public"."user_onboarding" USING "btree" ("user_id");



CREATE INDEX "user_balances_user_id_token_id_idx" ON "public"."user_balances" USING "btree" ("user_id", "token_id");



CREATE INDEX "user_phase_milestones_user_id_milestone_id_idx" ON "public"."user_phase_milestones" USING "btree" ("user_id", "milestone_id");



CREATE INDEX "user_phase_transitions_user_id_transitioned_at_idx" ON "public"."user_phase_transitions" USING "btree" ("user_id", "transitioned_at");



CREATE OR REPLACE TRIGGER "set_journey_post_updated_at" BEFORE UPDATE ON "public"."journey_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_journey_post_updated_at"();



CREATE OR REPLACE TRIGGER "trg_reward_tokens_for_role_activity_fib" AFTER INSERT ON "public"."user_role_activity" FOR EACH ROW EXECUTE FUNCTION "public"."reward_tokens_for_role_activity_fib"();



CREATE OR REPLACE TRIGGER "update_feature_flags_updated_at_trigger" BEFORE UPDATE ON "public"."feature_flags" FOR EACH ROW EXECUTE FUNCTION "public"."update_feature_flags_updated_at"();



ALTER TABLE ONLY "public"."achievements"
    ADD CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."assists"
    ADD CONSTRAINT "assists_helper_id_fkey" FOREIGN KEY ("helper_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."assists"
    ADD CONSTRAINT "assists_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."business_success_puzzle"
    ADD CONSTRAINT "business_success_puzzle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."canvas_entries"
    ADD CONSTRAINT "canvas_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."component_progress"
    ADD CONSTRAINT "component_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."experiment_participation"
    ADD CONSTRAINT "experiment_participation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."journey_posts"
    ADD CONSTRAINT "journey_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."metrics"
    ADD CONSTRAINT "metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestone_contributions"
    ADD CONSTRAINT "milestone_contributions_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."community_milestones"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."milestone_contributions"
    ADD CONSTRAINT "milestone_contributions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."peer_recognition"
    ADD CONSTRAINT "peer_recognition_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."peer_recognition"
    ADD CONSTRAINT "peer_recognition_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."personal_success_puzzle"
    ADD CONSTRAINT "personal_success_puzzle_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quest_progress"
    ADD CONSTRAINT "quest_progress_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "public"."quests"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quest_progress"
    ADD CONSTRAINT "quest_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supercivilization_feed"
    ADD CONSTRAINT "supercivilization_feed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supergenius_breakthroughs"
    ADD CONSTRAINT "supergenius_breakthroughs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."superhuman_enhancements"
    ADD CONSTRAINT "superhuman_enhancements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supermind_superpowers"
    ADD CONSTRAINT "supermind_superpowers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."superpuzzle_developments"
    ADD CONSTRAINT "superpuzzle_developments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supersociety_advancements"
    ADD CONSTRAINT "supersociety_advancements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."token_flows"
    ADD CONSTRAINT "token_flows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."token_ownership"
    ADD CONSTRAINT "token_ownership_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."token_ownership"
    ADD CONSTRAINT "token_ownership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tokens"
    ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity_log"
    ADD CONSTRAINT "user_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_admin_stories"
    ADD CONSTRAINT "user_admin_stories_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_balances"
    ADD CONSTRAINT "user_balances_token_id_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."tokens"("id");



ALTER TABLE ONLY "public"."user_balances"
    ADD CONSTRAINT "user_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_feedback"
    ADD CONSTRAINT "user_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_milestones"
    ADD CONSTRAINT "user_milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "user_onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_phase_milestones"
    ADD CONSTRAINT "user_phase_milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_phase_transitions"
    ADD CONSTRAINT "user_phase_transitions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_role_activity"
    ADD CONSTRAINT "user_role_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Admin can manage all canvas entries" ON "public"."canvas_entries" USING ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admin can manage all experiment_participation" ON "public"."experiment_participation" USING ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admin can manage all feedback" ON "public"."user_feedback" USING ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admin can manage all quest_progress" ON "public"."quest_progress" USING ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Admin can manage all quests" ON "public"."quests" USING ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Allow admin delete on token_ownership" ON "public"."token_ownership" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Allow admin full access" ON "public"."invitations" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Allow admin insert on token_ownership" ON "public"."token_ownership" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Allow admin update on token_ownership" ON "public"."token_ownership" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "auth"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND (("u"."role")::"text" = 'admin'::"text")))));



CREATE POLICY "Allow authenticated select on token_ownership" ON "public"."token_ownership" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow delete for authenticated" ON "public"."feature_flags" FOR DELETE TO "authenticated" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow delete for author" ON "public"."user_admin_stories" FOR DELETE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Allow insert for all roles on community_milestones" ON "public"."community_milestones" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow insert for anon user stories" ON "public"."user_admin_stories" FOR INSERT TO "anon" WITH CHECK (("type" = 'user'::"text"));



CREATE POLICY "Allow insert for authenticated" ON "public"."feature_flags" FOR INSERT TO "authenticated" WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow insert for authenticated" ON "public"."user_admin_stories" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Allow insert for authenticated on assists" ON "public"."assists" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert for authenticated on community_milestones" ON "public"."community_milestones" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert for authenticated on milestone_contributions" ON "public"."milestone_contributions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert for authenticated on team_members" ON "public"."team_members" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert for authenticated on teams" ON "public"."teams" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert for service_role on community_milestones" ON "public"."community_milestones" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Allow insert own activity" ON "public"."user_role_activity" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow select for all" ON "public"."user_admin_stories" FOR SELECT USING (true);



CREATE POLICY "Allow select for all roles on assists" ON "public"."assists" FOR SELECT USING (true);



CREATE POLICY "Allow select for all roles on community_milestones" ON "public"."community_milestones" FOR SELECT USING (true);



CREATE POLICY "Allow select for all roles on community_milestones (test/dev)" ON "public"."community_milestones" FOR SELECT USING (true);



CREATE POLICY "Allow select for all roles on milestone_contributions" ON "public"."milestone_contributions" FOR SELECT USING (true);



CREATE POLICY "Allow select for all roles on team_members" ON "public"."team_members" FOR SELECT USING (true);



CREATE POLICY "Allow select for all roles on teams" ON "public"."teams" FOR SELECT USING (true);



CREATE POLICY "Allow select for anon" ON "public"."feature_flags" FOR SELECT USING (true);



CREATE POLICY "Allow select for authenticated" ON "public"."feature_flags" FOR SELECT USING (true);



CREATE POLICY "Allow select for authenticated users" ON "public"."components" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow select for registration" ON "public"."invitations" FOR SELECT USING (true);



CREATE POLICY "Allow select own activity" ON "public"."user_role_activity" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow update for authenticated" ON "public"."feature_flags" FOR UPDATE TO "authenticated" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow update for authenticated on community_milestones" ON "public"."community_milestones" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow update for author" ON "public"."user_admin_stories" FOR UPDATE USING (("auth"."uid"() = "author_id"));



CREATE POLICY "Anon users can select journey posts" ON "public"."journey_posts" FOR SELECT TO "anon" USING (true);



CREATE POLICY "Anon users cannot select token flows" ON "public"."token_flows" FOR SELECT TO "anon" USING (false);



CREATE POLICY "Anyone can select quests" ON "public"."quests" FOR SELECT USING (true);



CREATE POLICY "Authenticated manage phases" ON "public"."experience_phases" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can delete own posts" ON "public"."supercivilization_feed" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert their own journey posts" ON "public"."journey_posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert their own posts" ON "public"."supercivilization_feed" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can insert their own token flows" ON "public"."token_flows" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can select collective progress" ON "public"."collective_progress" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can select feed posts" ON "public"."supercivilization_feed" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can select journey posts" ON "public"."journey_posts" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select their own token flows" ON "public"."token_flows" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Authenticated users can update own posts" ON "public"."supercivilization_feed" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Delete own balances (authenticated)" ON "public"."user_balances" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Delete own milestones (authenticated)" ON "public"."user_phase_milestones" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Delete own onboarding row (authenticated)" ON "public"."user_onboarding" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Delete own transitions (authenticated)" ON "public"."user_phase_transitions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Flow owners can delete their token flows" ON "public"."token_flows" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Flow owners can update their token flows" ON "public"."token_flows" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own balances (authenticated)" ON "public"."user_balances" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own business_success_puzzle" ON "public"."business_success_puzzle" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own component_progress" ON "public"."component_progress" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own milestones (authenticated)" ON "public"."user_phase_milestones" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own onboarding row (authenticated)" ON "public"."user_onboarding" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own personal_success_puzzle" ON "public"."personal_success_puzzle" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own supergenius_breakthroughs" ON "public"."supergenius_breakthroughs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own superhuman_enhancements" ON "public"."superhuman_enhancements" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own supermind_superpowers" ON "public"."supermind_superpowers" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own superpuzzle_developments" ON "public"."superpuzzle_developments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own supersociety_advancements" ON "public"."supersociety_advancements" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own transitions (authenticated)" ON "public"."user_phase_transitions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert own user_milestones" ON "public"."user_milestones" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Manage own canvas entries" ON "public"."canvas_entries" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Peer recognition: authenticated can insert" ON "public"."peer_recognition" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "Peer recognition: recipient can select" ON "public"."peer_recognition" FOR SELECT USING (("auth"."uid"() = "recipient_id"));



CREATE POLICY "Peer recognition: sender can delete" ON "public"."peer_recognition" FOR DELETE USING (("auth"."uid"() = "sender_id"));



CREATE POLICY "Peer recognition: sender can select" ON "public"."peer_recognition" FOR SELECT USING (("auth"."uid"() = "sender_id"));



CREATE POLICY "Peer recognition: sender can update" ON "public"."peer_recognition" FOR UPDATE USING (("auth"."uid"() = "sender_id"));



CREATE POLICY "Post owners can delete their journey posts" ON "public"."journey_posts" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Post owners can update their journey posts" ON "public"."journey_posts" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select all canvas entries" ON "public"."canvas_entries" FOR SELECT USING (true);



CREATE POLICY "Select all phases (anon)" ON "public"."experience_phases" FOR SELECT USING (true);



CREATE POLICY "Select all phases (authenticated)" ON "public"."experience_phases" FOR SELECT USING (true);



CREATE POLICY "Select own balances (authenticated)" ON "public"."user_balances" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own business_success_puzzle" ON "public"."business_success_puzzle" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own component_progress" ON "public"."component_progress" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own milestones (authenticated)" ON "public"."user_phase_milestones" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own onboarding status (authenticated)" ON "public"."user_onboarding" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own personal_success_puzzle" ON "public"."personal_success_puzzle" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own supergenius_breakthroughs" ON "public"."supergenius_breakthroughs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own superhuman_enhancements" ON "public"."superhuman_enhancements" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own supermind_superpowers" ON "public"."supermind_superpowers" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own superpuzzle_developments" ON "public"."superpuzzle_developments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own supersociety_advancements" ON "public"."supersociety_advancements" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own transitions (authenticated)" ON "public"."user_phase_transitions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Select own user_milestones" ON "public"."user_milestones" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Service role can modify collective progress" ON "public"."collective_progress" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Update own balances (authenticated)" ON "public"."user_balances" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own business_success_puzzle" ON "public"."business_success_puzzle" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own component_progress" ON "public"."component_progress" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own milestones (authenticated)" ON "public"."user_phase_milestones" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own onboarding row (authenticated)" ON "public"."user_onboarding" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own personal_success_puzzle" ON "public"."personal_success_puzzle" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own supergenius_breakthroughs" ON "public"."supergenius_breakthroughs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own superhuman_enhancements" ON "public"."superhuman_enhancements" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own supermind_superpowers" ON "public"."supermind_superpowers" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own superpuzzle_developments" ON "public"."superpuzzle_developments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own supersociety_advancements" ON "public"."supersociety_advancements" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own transitions (authenticated)" ON "public"."user_phase_transitions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own user_milestones" ON "public"."user_milestones" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "User can manage own experiment_participation" ON "public"."experiment_participation" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "User can manage own feedback" ON "public"."user_feedback" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "User can manage own quest_progress" ON "public"."quest_progress" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own transactions" ON "public"."transactions" FOR DELETE USING ((("auth"."uid"() = "from_user_id") OR ("auth"."uid"() = "to_user_id")));



CREATE POLICY "Users can insert their own transactions" ON "public"."transactions" FOR INSERT WITH CHECK ((("auth"."uid"() = "from_user_id") OR ("auth"."uid"() = "to_user_id")));



CREATE POLICY "Users can update their own transactions" ON "public"."transactions" FOR UPDATE USING ((("auth"."uid"() = "from_user_id") OR ("auth"."uid"() = "to_user_id")));



CREATE POLICY "Users can view their own transactions" ON "public"."transactions" FOR SELECT USING ((("auth"."uid"() = "from_user_id") OR ("auth"."uid"() = "to_user_id")));



CREATE POLICY "admin_full_access" ON "public"."profiles" TO "service_role" USING (true);



ALTER TABLE "public"."assists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."business_success_puzzle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."canvas_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collective_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."component_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."components" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_metrics_admin" ON "public"."metrics" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "delete_tokens_admin" ON "public"."tokens" FOR DELETE TO "service_role" USING (true);



ALTER TABLE "public"."experience_phases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."experiment_participation" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feature_flags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_metrics_authenticated" ON "public"."metrics" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "insert_own_profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "insert_tokens_authenticated" ON "public"."tokens" FOR INSERT TO "authenticated" WITH CHECK (true);



ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."journey_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."milestone_contributions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."peer_recognition" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."personal_success_puzzle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quest_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select_metrics_authenticated" ON "public"."metrics" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "select_own_profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "select_tokens_authenticated" ON "public"."tokens" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."supercivilization_feed" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supergenius_breakthroughs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."superhuman_enhancements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supermind_superpowers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."superpuzzle_developments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supersociety_advancements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_flows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."token_ownership" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_metrics_admin" ON "public"."metrics" FOR UPDATE TO "service_role" USING (true);



CREATE POLICY "update_own_profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "update_tokens_admin" ON "public"."tokens" FOR UPDATE TO "service_role" USING (true);



ALTER TABLE "public"."user_admin_stories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_balances" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_onboarding" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_phase_milestones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_phase_transitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_role_activity" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "anon";



RESET ALL;
