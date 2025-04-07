-- Migration: Enhance Security and Gamification for Member Onboarding
-- This migration adds security measures and gamification elements to the membership system
-- Date: 2025-04-07

-- Add verification challenge types table
create table if not exists public.verification_challenge_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  points integer not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Add verification challenges table
create table if not exists public.verification_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_type_id uuid not null references public.verification_challenge_types(id),
  status text not null check (status in ('pending', 'completed', 'failed')) default 'pending',
  data jsonb not null default '{}'::jsonb,
  response jsonb,
  points_earned integer,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, challenge_type_id)
);

-- Add trust score table
create table if not exists public.trust_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  score numeric not null default 0 check (score >= 0),
  level integer not null default 1,
  last_updated timestamptz not null default now()
);

-- Add suspicious activity log
create table if not exists public.security_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  ip_address text,
  event_type text not null,
  severity text not null check (severity in ('info', 'warning', 'critical')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Add human verification table
create table if not exists public.human_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  verification_method text not null,
  verification_data jsonb not null default '{}'::jsonb,
  is_verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

-- Add member badges table
create table if not exists public.member_badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  image_url text,
  requirements jsonb not null,
  points integer not null default 10,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Add user badges table
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.member_badges(id),
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

-- Add default verification challenge types
insert into public.verification_challenge_types (name, description, difficulty, points)
values 
('email_verification', 'Verify your email address', 'easy', 5),
('phone_verification', 'Verify your phone number', 'easy', 10),
('identity_question', 'Answer personal questions that only a human would know', 'medium', 15),
('community_puzzle', 'Solve a community-created puzzle', 'medium', 20),
('contribution_task', 'Complete a small contribution task', 'hard', 30),
('social_verification', 'Verify through existing social accounts', 'medium', 15),
('video_introduction', 'Record a brief video introduction', 'hard', 25),
('knowledge_quiz', 'Complete a quiz about our community values', 'medium', 20);

-- Add default member badges
insert into public.member_badges (name, description, image_url, requirements, points)
values
('Verified Human', 'Successfully completed human verification', '/badges/verified-human.svg', '{"verification_challenges": 1}', 10),
('Community Explorer', 'Explored key areas of the platform', '/badges/community-explorer.svg', '{"pages_visited": 5}', 15),
('Puzzle Solver', 'Solved community puzzles', '/badges/puzzle-solver.svg', '{"puzzles_solved": 1}', 20),
('Social Butterfly', 'Connected with multiple members', '/badges/social-butterfly.svg', '{"connections": 3}', 25),
('Knowledge Seeker', 'Completed the community knowledge quiz', '/badges/knowledge-seeker.svg', '{"quiz_completed": true}', 20),
('Identity Verified', 'Completed advanced identity verification', '/badges/identity-verified.svg', '{"identity_verified": true}', 30),
('Trusted Member', 'Achieved a high trust score', '/badges/trusted-member.svg', '{"trust_score": 50}', 40),
('Community Contributor', 'Made valuable contributions', '/badges/community-contributor.svg', '{"contributions": 3}', 35);

-- Enable Row Level Security
alter table public.verification_challenge_types enable row level security;
alter table public.verification_challenges enable row level security;
alter table public.trust_scores enable row level security;
alter table public.security_logs enable row level security;
alter table public.human_verifications enable row level security;
alter table public.member_badges enable row level security;
alter table public.user_badges enable row level security;

-- Create RLS policies
-- Verification challenge types
create policy "Anyone can view active verification challenge types"
on public.verification_challenge_types for select
using (is_active = true);

-- Verification challenges
create policy "Users can view their own verification challenges"
on public.verification_challenges for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own verification challenges"
on public.verification_challenges for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own verification challenges"
on public.verification_challenges for update
to authenticated
using (auth.uid() = user_id);

-- Trust scores
create policy "Users can view their own trust score"
on public.trust_scores for select
to authenticated
using (auth.uid() = user_id);

-- Security logs - admin only

-- Human verifications
create policy "Users can view their own human verification"
on public.human_verifications for select
to authenticated
using (auth.uid() = user_id);

-- Member badges
create policy "Anyone can view member badges"
on public.member_badges for select
using (is_active = true);

-- User badges
create policy "Users can view their own badges"
on public.user_badges for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can view other users' badges"
on public.user_badges for select
to authenticated
using (true);

-- Function to initialize trust score for a new user
create or replace function public.initialize_trust_score()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.trust_scores (user_id, score, level)
  values (new.id, 0, 1);
  return new;
end;
$$;

-- Trigger to initialize trust score on user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.initialize_trust_score();

-- Function to assign verification challenges to a new user
create or replace function public.assign_verification_challenges(p_user_id uuid)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_challenge_types record;
  v_assigned_count integer := 0;
begin
  -- Assign basic verification challenges
  for v_challenge_types in 
    select id, name from public.verification_challenge_types 
    where name in ('email_verification', 'identity_question', 'knowledge_quiz')
    and is_active = true
  loop
    insert into public.verification_challenges (user_id, challenge_type_id, data)
    values (p_user_id, v_challenge_types.id, '{}')
    on conflict (user_id, challenge_type_id) do nothing;
    
    v_assigned_count := v_assigned_count + 1;
  end loop;
  
  -- Create human verification record
  insert into public.human_verifications (user_id, verification_method, verification_data)
  values (p_user_id, 'multi_factor', '{"methods": ["email", "challenge"]}')
  on conflict (user_id) do nothing;
  
  return json_build_object(
    'success', true,
    'message', format('Assigned %s verification challenges', v_assigned_count)
  );
end;
$$;

-- Function to update trust score based on verification challenges
create or replace function public.update_trust_score(p_user_id uuid)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_total_points integer := 0;
  v_challenge_points integer := 0;
  v_badge_points integer := 0;
  v_vouch_points integer := 0;
  v_contribution_points integer := 0;
  v_new_level integer;
  v_current_level integer;
begin
  -- Calculate points from completed challenges
  select coalesce(sum(vc.points_earned), 0) into v_challenge_points
  from public.verification_challenges vc
  where vc.user_id = p_user_id
  and vc.status = 'completed';
  
  -- Calculate points from earned badges
  select coalesce(sum(mb.points), 0) into v_badge_points
  from public.user_badges ub
  join public.member_badges mb on ub.badge_id = mb.id
  where ub.user_id = p_user_id;
  
  -- Calculate points from vouches (5 points per vouch)
  select coalesce(count(*) * 5, 0) into v_vouch_points
  from public.vouches
  where vouched_user_id = p_user_id;
  
  -- Calculate points from contributions (10 points per contribution)
  select coalesce(count(*) * 10, 0) into v_contribution_points
  from public.contributions
  where user_id = p_user_id;
  
  -- Calculate total trust score
  v_total_points := v_challenge_points + v_badge_points + v_vouch_points + v_contribution_points;
  
  -- Determine trust level
  if v_total_points < 20 then
    v_new_level := 1;
  elsif v_total_points < 50 then
    v_new_level := 2;
  elsif v_total_points < 100 then
    v_new_level := 3;
  elsif v_total_points < 200 then
    v_new_level := 4;
  else
    v_new_level := 5;
  end if;
  
  -- Get current level
  select level into v_current_level
  from public.trust_scores
  where user_id = p_user_id;
  
  -- Update trust score
  update public.trust_scores
  set score = v_total_points,
      level = v_new_level,
      last_updated = now()
  where user_id = p_user_id;
  
  -- If level increased, record achievement
  if v_new_level > v_current_level then
    insert into public.achievements (user_id, type, data)
    values (p_user_id, 'trust_level_increased', json_build_object(
      'previous_level', v_current_level,
      'new_level', v_new_level
    ));
  end if;
  
  return json_build_object(
    'success', true,
    'message', 'Trust score updated',
    'new_score', v_total_points,
    'new_level', v_new_level,
    'level_increased', v_new_level > v_current_level
  );
end;
$$;

-- Function to complete a verification challenge
create or replace function public.complete_verification_challenge(
  p_challenge_id uuid,
  p_response jsonb,
  p_success boolean
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_challenge record;
  v_points integer;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists
  if v_user_id is null then
    return json_build_object(
      'success', false,
      'message', 'Authentication required'
    );
  end if;
  
  -- Get challenge details
  select vc.*, vct.points
  into v_challenge
  from public.verification_challenges vc
  join public.verification_challenge_types vct on vc.challenge_type_id = vct.id
  where vc.id = p_challenge_id;
  
  -- Check if challenge exists and belongs to the user
  if v_challenge is null then
    return json_build_object(
      'success', false,
      'message', 'Challenge not found'
    );
  end if;
  
  if v_challenge.user_id != v_user_id then
    return json_build_object(
      'success', false,
      'message', 'You can only complete your own challenges'
    );
  end if;
  
  -- Check if challenge is already completed
  if v_challenge.status = 'completed' then
    return json_build_object(
      'success', false,
      'message', 'Challenge already completed'
    );
  end if;
  
  -- Update challenge status
  if p_success then
    v_points := v_challenge.points;
    
    update public.verification_challenges
    set status = 'completed',
        response = p_response,
        points_earned = v_points,
        completed_at = now()
    where id = p_challenge_id;
    
    -- Record achievement
    insert into public.achievements (user_id, type, data)
    values (v_user_id, 'challenge_completed', json_build_object(
      'challenge_id', p_challenge_id,
      'points_earned', v_points
    ));
    
    -- Check if user qualifies for any badges
    perform public.check_and_award_badges(v_user_id);
    
    -- Update trust score
    perform public.update_trust_score(v_user_id);
  else
    update public.verification_challenges
    set status = 'failed',
        response = p_response,
        points_earned = 0,
        completed_at = now()
    where id = p_challenge_id;
    
    v_points := 0;
  end if;
  
  return json_build_object(
    'success', true,
    'message', p_success ? 'Challenge completed successfully' : 'Challenge failed',
    'points_earned', v_points,
    'status', p_success ? 'completed' : 'failed'
  );
end;
$$;

-- Function to check and award badges
create or replace function public.check_and_award_badges(p_user_id uuid)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_badge record;
  v_awarded_count integer := 0;
  v_requirements jsonb;
  v_qualifies boolean;
  v_challenge_count integer;
  v_pages_visited integer;
  v_puzzles_solved integer;
  v_connections integer;
  v_quiz_completed boolean;
  v_identity_verified boolean;
  v_trust_score numeric;
  v_contribution_count integer;
begin
  -- Get user metrics
  -- Challenge count
  select count(*) into v_challenge_count
  from public.verification_challenges
  where user_id = p_user_id and status = 'completed';
  
  -- Pages visited (from user activity log, if exists)
  select count(distinct page) into v_pages_visited
  from public.user_activity_log
  where user_id = p_user_id
  and activity_type = 'page_visit';
  
  -- Puzzles solved
  select count(*) into v_puzzles_solved
  from public.verification_challenges vc
  join public.verification_challenge_types vct on vc.challenge_type_id = vct.id
  where vc.user_id = p_user_id
  and vc.status = 'completed'
  and vct.name = 'community_puzzle';
  
  -- Connections (from vouches)
  select count(*) into v_connections
  from public.vouches
  where voucher_id = p_user_id or vouched_user_id = p_user_id;
  
  -- Quiz completed
  select exists(
    select 1
    from public.verification_challenges vc
    join public.verification_challenge_types vct on vc.challenge_type_id = vct.id
    where vc.user_id = p_user_id
    and vc.status = 'completed'
    and vct.name = 'knowledge_quiz'
  ) into v_quiz_completed;
  
  -- Identity verified
  select is_verified into v_identity_verified
  from public.human_verifications
  where user_id = p_user_id;
  
  -- Trust score
  select score into v_trust_score
  from public.trust_scores
  where user_id = p_user_id;
  
  -- Contribution count
  select count(*) into v_contribution_count
  from public.contributions
  where user_id = p_user_id;
  
  -- Check each badge
  for v_badge in
    select * from public.member_badges
    where is_active = true
  loop
    v_requirements := v_badge.requirements;
    v_qualifies := true;
    
    -- Check if user already has this badge
    if exists(select 1 from public.user_badges where user_id = p_user_id and badge_id = v_badge.id) then
      continue;
    end if;
    
    -- Check each requirement
    if v_requirements ? 'verification_challenges' and v_challenge_count < (v_requirements->>'verification_challenges')::integer then
      v_qualifies := false;
    end if;
    
    if v_requirements ? 'pages_visited' and v_pages_visited < (v_requirements->>'pages_visited')::integer then
      v_qualifies := false;
    end if;
    
    if v_requirements ? 'puzzles_solved' and v_puzzles_solved < (v_requirements->>'puzzles_solved')::integer then
      v_qualifies := false;
    end if;
    
    if v_requirements ? 'connections' and v_connections < (v_requirements->>'connections')::integer then
      v_qualifies := false;
    end if;
    
    if v_requirements ? 'quiz_completed' and v_quiz_completed = false then
      v_qualifies := false;
    end if;
    
    if v_requirements ? 'identity_verified' and v_identity_verified = false then
      v_qualifies := false;
    end if;
    
    if v_requirements ? 'trust_score' and v_trust_score < (v_requirements->>'trust_score')::numeric then
      v_qualifies := false;
    end if;
    
    if v_requirements ? 'contributions' and v_contribution_count < (v_requirements->>'contributions')::integer then
      v_qualifies := false;
    end if;
    
    -- Award badge if qualified
    if v_qualifies then
      insert into public.user_badges (user_id, badge_id)
      values (p_user_id, v_badge.id);
      
      -- Record achievement
      insert into public.achievements (user_id, type, data)
      values (p_user_id, 'badge_earned', json_build_object(
        'badge_id', v_badge.id,
        'badge_name', v_badge.name
      ));
      
      v_awarded_count := v_awarded_count + 1;
    end if;
  end loop;
  
  return json_build_object(
    'success', true,
    'message', format('Awarded %s new badges', v_awarded_count),
    'badges_awarded', v_awarded_count
  );
end;
$$;

-- Function to log suspicious activity
create or replace function public.log_security_event(
  p_user_id uuid,
  p_ip_address text,
  p_event_type text,
  p_severity text,
  p_details jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.security_logs (user_id, ip_address, event_type, severity, details)
  values (p_user_id, p_ip_address, p_event_type, p_severity, p_details);
end;
$$;

-- Modify the accept_invitation function to include verification challenges
create or replace function public.accept_invitation(p_code text)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_invitation_id uuid;
  v_invitation_valid boolean;
  v_invitation_message text;
  v_created_by uuid;
  v_check_result json;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists
  if v_user_id is null then
    return json_build_object(
      'success', false,
      'message', 'You must be logged in to accept an invitation'
    );
  end if;
  
  -- Check if the user already has a journey record
  if exists (select 1 from public.member_journey where user_id = v_user_id) then
    return json_build_object(
      'success', false,
      'message', 'You have already started your member journey'
    );
  end if;
  
  -- Check if the invitation code is valid
  v_check_result := public.check_invitation_code(p_code);
  v_invitation_valid := (v_check_result->>'valid')::boolean;
  v_invitation_message := v_check_result->>'message';
  
  if not v_invitation_valid then
    return json_build_object(
      'success', false,
      'message', v_invitation_message
    );
  end if;
  
  -- Get the invitation ID and creator
  v_invitation_id := (v_check_result->>'invitation_id')::uuid;
  v_created_by := (v_check_result->>'created_by')::uuid;
  
  -- Update the invitation status
  update public.invitations
  set status = 'accepted', accepted_at = now()
  where id = v_invitation_id;
  
  -- Create a member journey record for the user
  insert into public.member_journey (user_id, current_level, invitation_id)
  values (v_user_id, 'invited', v_invitation_id);
  
  -- Assign verification challenges
  perform public.assign_verification_challenges(v_user_id);
  
  -- Record achievement for accepting an invitation
  insert into public.achievements (user_id, type, data)
  values (v_user_id, 'joined_platform', json_build_object('invitation_id', v_invitation_id));
  
  -- Record achievement for the inviter
  insert into public.achievements (user_id, type, data)
  values (v_created_by, 'invitation_accepted', json_build_object(
    'invitation_id', v_invitation_id,
    'invited_user_id', v_user_id
  ));
  
  return json_build_object(
    'success', true,
    'message', 'Invitation accepted successfully',
    'journey_started', true,
    'verification_required', true
  );
end;
$$;

-- Create user activity log table for tracking engagement
create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  page text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.user_activity_log enable row level security;

-- Create RLS policies for user activity log
create policy "Users can view their own activity log"
on public.user_activity_log for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own activity log"
on public.user_activity_log for insert
to authenticated
with check (auth.uid() = user_id);

-- Function to log user activity
create or replace function public.log_user_activity(
  p_activity_type text,
  p_page text default null,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user exists
  if v_user_id is null then
    return;
  end if;
  
  -- Log the activity
  insert into public.user_activity_log (user_id, activity_type, page, data)
  values (v_user_id, p_activity_type, p_page, p_data);
end;
$$;
