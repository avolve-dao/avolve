-- Gamification functions
-- This file contains functions for gamification features

-- Function to complete content and potentially earn tokens
create or replace function public.complete_content(p_content_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_component record;
  v_token_id uuid;
  v_token_reward numeric := 1;
  v_already_completed boolean;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;
  
  -- Get component details
  select * into v_component
  from public.components
  where id = p_content_id;
  
  if v_component is null then
    raise exception 'Content not found';
  end if;
  
  -- Check if user has already completed this content
  select is_completed into v_already_completed
  from public.user_progress
  where user_id = v_user_id and component_id = p_content_id;
  
  if v_already_completed then
    return false; -- Already completed, no reward
  end if;
  
  -- Insert or update progress
  insert into public.user_progress (
    user_id,
    component_id,
    progress_percentage,
    is_completed,
    completed_at,
    last_accessed_at
  )
  values (
    v_user_id,
    p_content_id,
    100,
    true,
    now(),
    now()
  )
  on conflict (user_id, component_id)
  do update set
    progress_percentage = 100,
    is_completed = true,
    completed_at = now(),
    last_accessed_at = now(),
    updated_at = now();
  
  -- Track activity
  insert into public.user_activity_logs (
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_user_id,
    'content_completed',
    'component',
    p_content_id::text,
    jsonb_build_object(
      'component_title', v_component.title,
      'section_id', v_component.section_id
    )
  );
  
  -- If component has a token reward, grant it
  if v_component.token_symbol is not null then
    -- Get token ID
    select id into v_token_id
    from public.tokens
    where symbol = v_component.token_symbol;
    
    if v_token_id is not null then
      -- Grant token to user
      insert into public.user_tokens (
        user_id,
        token_id,
        balance
      )
      values (
        v_user_id,
        v_token_id,
        v_token_reward
      )
      on conflict (user_id, token_id)
      do update set
        balance = public.user_tokens.balance + v_token_reward,
        updated_at = now();
      
      -- Record transaction
      insert into public.token_transactions (
        token_id,
        to_user_id,
        amount,
        transaction_type,
        reason
      )
      values (
        v_token_id,
        v_user_id,
        v_token_reward,
        'reward',
        'Content completion reward'
      );
    end if;
  end if;
  
  -- Check for achievements
  perform public.check_achievements(v_user_id);
  
  return true;
exception
  when others then
    return false;
end;
$$;

-- Function to get user achievements
create or replace function public.get_user_achievements(p_user_id uuid)
returns table (
  achievement_id uuid,
  title text,
  description text,
  category text,
  reward_type text,
  reward_amount numeric,
  reward_token_symbol text,
  earned_at timestamptz,
  claimed_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Check if user exists
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User not found';
  end if;
  
  -- Return user achievements with details
  return query
  select
    ua.achievement_id,
    a.title,
    a.description,
    a.category,
    a.reward_type,
    a.reward_amount,
    t.symbol as reward_token_symbol,
    ua.earned_at,
    ua.claimed_at
  from
    public.user_achievements ua
    join public.achievements a on ua.achievement_id = a.id
    left join public.tokens t on a.reward_token_id = t.id
  where
    ua.user_id = p_user_id
  order by
    ua.earned_at desc nulls last,
    a.category,
    a.title;
end;
$$;

-- Function to claim achievement reward
create or replace function public.claim_achievement_reward(p_achievement_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_achievement record;
  v_user_achievement record;
  v_token_id uuid;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;
  
  -- Get achievement details
  select * into v_achievement
  from public.achievements
  where id = p_achievement_id;
  
  if v_achievement is null then
    raise exception 'Achievement not found';
  end if;
  
  -- Check if user has earned but not claimed this achievement
  select * into v_user_achievement
  from public.user_achievements
  where user_id = v_user_id and achievement_id = p_achievement_id;
  
  if v_user_achievement is null or v_user_achievement.earned_at is null then
    raise exception 'Achievement not earned';
  end if;
  
  if v_user_achievement.claimed_at is not null then
    raise exception 'Achievement reward already claimed';
  end if;
  
  -- Mark achievement as claimed
  update public.user_achievements
  set claimed_at = now()
  where user_id = v_user_id and achievement_id = p_achievement_id;
  
  -- If achievement has a token reward, grant it
  if v_achievement.reward_type = 'token' and v_achievement.reward_token_id is not null then
    -- Grant token to user
    insert into public.user_tokens (
      user_id,
      token_id,
      balance
    )
    values (
      v_user_id,
      v_achievement.reward_token_id,
      v_achievement.reward_amount
    )
    on conflict (user_id, token_id)
    do update set
      balance = public.user_tokens.balance + v_achievement.reward_amount,
      updated_at = now();
    
    -- Record transaction
    insert into public.token_transactions (
      token_id,
      to_user_id,
      amount,
      transaction_type,
      reason
    )
    values (
      v_achievement.reward_token_id,
      v_user_id,
      v_achievement.reward_amount,
      'achievement',
      'Achievement reward: ' || v_achievement.title
    );
  end if;
  
  -- Track activity
  insert into public.user_activity_logs (
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    v_user_id,
    'achievement_claimed',
    'achievement',
    p_achievement_id::text,
    jsonb_build_object(
      'achievement_title', v_achievement.title,
      'reward_type', v_achievement.reward_type,
      'reward_amount', v_achievement.reward_amount
    )
  );
  
  return true;
exception
  when others then
    return false;
end;
$$;

-- Function to check for achievements
create or replace function public.check_achievements(p_user_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_achievement record;
  v_completed_count int;
  v_token_count int;
  v_pillar_progress record;
begin
  -- Check content completion achievements
  select count(*) into v_completed_count
  from public.user_progress
  where user_id = p_user_id and is_completed = true;
  
  -- Content completion milestones
  for v_achievement in
    select * from public.achievements
    where category = 'content_completion'
    and requirement_count <= v_completed_count
  loop
    -- Award achievement if not already earned
    insert into public.user_achievements (
      user_id,
      achievement_id,
      earned_at
    )
    values (
      p_user_id,
      v_achievement.id,
      now()
    )
    on conflict (user_id, achievement_id)
    do nothing;
  end loop;
  
  -- Check token collection achievements
  select count(*) into v_token_count
  from public.user_tokens
  where user_id = p_user_id and balance > 0;
  
  -- Token collection milestones
  for v_achievement in
    select * from public.achievements
    where category = 'token_collection'
    and requirement_count <= v_token_count
  loop
    -- Award achievement if not already earned
    insert into public.user_achievements (
      user_id,
      achievement_id,
      earned_at
    )
    values (
      p_user_id,
      v_achievement.id,
      now()
    )
    on conflict (user_id, achievement_id)
    do nothing;
  end loop;
  
  -- Check pillar completion achievements
  for v_pillar_progress in
    select
      p.id as pillar_id,
      p.title as pillar_title,
      count(c.*) as total_components,
      count(up.*) as completed_components
    from
      public.pillars p
      join public.sections s on p.id = s.pillar_id
      join public.components c on s.id = c.section_id
      left join public.user_progress up on c.id = up.component_id and up.user_id = p_user_id and up.is_completed = true
    group by
      p.id, p.title
    having
      count(c.*) > 0 and count(c.*) = count(up.*)
  loop
    -- Find achievement for this pillar
    for v_achievement in
      select * from public.achievements
      where category = 'pillar_completion'
      and metadata->>'pillar_id' = v_pillar_progress.pillar_id::text
    loop
      -- Award achievement if not already earned
      insert into public.user_achievements (
        user_id,
        achievement_id,
        earned_at
      )
      values (
        p_user_id,
        v_achievement.id,
        now()
      )
      on conflict (user_id, achievement_id)
      do nothing;
    end loop;
  end loop;
end;
$$;

-- Function to get all pillars progress
create or replace function public.get_all_pillars_progress(p_user_id uuid)
returns table (
  pillar_id uuid,
  pillar_title text,
  pillar_slug text,
  gradient_class text,
  total_sections int,
  completed_sections int,
  total_components int,
  completed_components int,
  progress_percentage numeric
)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Check if user exists
  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'User not found';
  end if;
  
  -- Return progress for all pillars
  return query
  select
    p.id as pillar_id,
    p.title as pillar_title,
    p.slug as pillar_slug,
    p.gradient_class,
    count(distinct s.id) as total_sections,
    count(distinct case when section_completed.is_completed then s.id else null end) as completed_sections,
    count(c.*) as total_components,
    count(up.*) as completed_components,
    case
      when count(c.*) = 0 then 0
      else round((count(up.*)::numeric / count(c.*)) * 100, 2)
    end as progress_percentage
  from
    public.pillars p
    left join public.sections s on p.id = s.pillar_id
    left join (
      select
        s.id as section_id,
        case when count(c.*) > 0 and count(c.*) = count(up.*) then true else false end as is_completed
      from
        public.sections s
        join public.components c on s.id = c.section_id
        left join public.user_progress up on c.id = up.component_id and up.user_id = p_user_id and up.is_completed = true
      group by
        s.id
    ) section_completed on s.id = section_completed.section_id
    left join public.components c on s.id = c.section_id
    left join public.user_progress up on c.id = up.component_id and up.user_id = p_user_id and up.is_completed = true
  where
    p.is_active = true
  group by
    p.id, p.title, p.slug, p.gradient_class
  order by
    p.display_order;
end;
$$;

-- Function to track user activity
create or replace function public.track_user_activity(
  p_activity_type text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_metadata jsonb default null
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Check if user is authenticated
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;
  
  -- Insert activity log
  insert into public.user_activity_logs (
    user_id,
    activity_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    p_activity_type,
    p_entity_type,
    p_entity_id,
    p_metadata
  );
  
  return true;
exception
  when others then
    return false;
end;
$$;

-- Function to get user experience phase
create or replace function public.get_user_experience_phase()
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_token_count int;
  v_achievement_count int;
  v_completed_pillar boolean;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    return 'discovery';
  end if;
  
  -- Get user token count
  select count(*) into v_token_count
  from public.user_tokens
  where user_id = v_user_id and balance > 0;
  
  -- Get user achievement count
  select count(*) into v_achievement_count
  from public.user_achievements
  where user_id = v_user_id and earned_at is not null;
  
  -- Check if user has completed any pillar
  select exists (
    select 1
    from public.get_all_pillars_progress(v_user_id)
    where progress_percentage = 100
  ) into v_completed_pillar;
  
  -- Determine phase
  if v_token_count >= 7 and v_completed_pillar and v_achievement_count >= 10 then
    return 'endgame';
  elsif v_token_count >= 3 and v_achievement_count >= 5 then
    return 'scaffolding';
  elsif v_token_count >= 1 then
    return 'onboarding';
  else
    return 'discovery';
  end if;
end;
$$;

-- Function to get next recommended actions
create or replace function public.get_next_recommended_actions()
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_phase text;
  v_recommendations jsonb := '[]'::jsonb;
  v_completed_sections int;
  v_has_sap_token boolean;
begin
  -- Check if user is authenticated
  if v_user_id is null then
    return v_recommendations;
  end if;
  
  -- Get user experience phase
  v_user_phase := public.get_user_experience_phase();
  
  -- Generate recommendations based on phase
  if v_user_phase = 'discovery' then
    -- Discovery phase recommendations
    v_recommendations := jsonb_build_array(
      jsonb_build_object(
        'title', 'Explore the Platform',
        'description', 'Discover the three main pillars of the Avolve platform',
        'action', 'View Pillars',
        'url', '/'
      ),
      jsonb_build_object(
        'title', 'Start Your Journey',
        'description', 'Begin with the Superachiever pillar to earn your first tokens',
        'action', 'Explore Superachiever',
        'url', '/superachiever'
      )
    );
  elsif v_user_phase = 'onboarding' then
    -- Check if user has completed any sections
    select count(*) into v_completed_sections
    from public.user_progress up
    join public.components c on up.component_id = c.id
    join public.sections s on c.section_id = s.id
    where up.user_id = v_user_id and up.is_completed = true;
    
    if v_completed_sections = 0 then
      v_recommendations := jsonb_append(v_recommendations, '$', jsonb_build_object(
        'title', 'Complete Your First Section',
        'description', 'Finish a section to earn tokens and achievements',
        'action', 'View Sections',
        'url', '/superachiever'
      ));
    end if;
    
    -- Check if user has SAP token
    select exists (
      select 1
      from public.user_tokens ut
      join public.tokens t on ut.token_id = t.id
      where ut.user_id = v_user_id and t.symbol = 'SAP' and ut.balance > 0
    ) into v_has_sap_token;
    
    if v_has_sap_token then
      v_recommendations := jsonb_append(v_recommendations, '$', jsonb_build_object(
        'title', 'Explore Personal Success',
        'description', 'Dive into the Personal Success Puzzle',
        'action', 'View PSP',
        'url', '/superachiever/personal-success'
      ));
    end if;
  elsif v_user_phase = 'scaffolding' then
    -- Find incomplete pillars
    v_recommendations := jsonb_append(v_recommendations, '$', jsonb_build_object(
      'title', 'Continue Your Journey',
      'description', 'Complete more sections to earn additional tokens',
      'action', 'View Progress',
      'url', '/dashboard/journey'
    ));
  else
    -- Endgame phase recommendations
    v_recommendations := jsonb_append(v_recommendations, '$', jsonb_build_object(
      'title', 'Contribute to the Community',
      'description', 'Share your knowledge and help other users',
      'action', 'View Community',
      'url', '/community'
    ));
  end if;
  
  -- Always add journey dashboard recommendation
  v_recommendations := jsonb_append(v_recommendations, '$', jsonb_build_object(
    'title', 'Check Your Progress',
    'description', 'View your journey dashboard to see your achievements',
    'action', 'View Journey',
    'url', '/dashboard/journey'
  ));
  
  return v_recommendations;
end;
$$;
