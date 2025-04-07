-- Gamification functions for the Avolve platform
-- These functions handle user achievements, progress tracking, and gamification features

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
  v_completed_sections int;
  v_user_phase text;
begin
  -- Get user token count
  select count(*) into v_token_count
  from public.user_tokens
  where user_id = v_user_id and balance > 0;
  
  -- Get user achievement count
  select count(*) into v_achievement_count
  from public.user_achievements
  where user_id = v_user_id and earned_at is not null;
  
  -- Get completed sections count
  select count(*) into v_completed_sections
  from public.user_progress
  where user_id = v_user_id and is_completed = true;
  
  -- Determine user phase
  if v_token_count >= 7 and v_achievement_count >= 10 then
    v_user_phase := 'endgame';
  elsif v_token_count >= 3 and v_achievement_count >= 5 then
    v_user_phase := 'scaffolding';
  elsif v_token_count >= 1 then
    v_user_phase := 'onboarding';
  else
    v_user_phase := 'discovery';
  end if;
  
  return v_user_phase;
exception
  when others then
    return 'discovery';
end;
$$;

-- Function to get user experience phase for admin users
create or replace function public.get_user_experience_phase_admin(p_user_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_count int;
  v_achievement_count int;
  v_completed_sections int;
  v_user_phase text;
  v_is_admin boolean;
begin
  -- Check if current user is admin
  select exists(
    select 1 from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = auth.uid() and r.is_admin = true
  ) into v_is_admin;
  
  if not v_is_admin then
    raise exception 'Only admin users can access this function';
  end if;
  
  -- Get user token count
  select count(*) into v_token_count
  from public.user_tokens
  where user_id = p_user_id and balance > 0;
  
  -- Get user achievement count
  select count(*) into v_achievement_count
  from public.user_achievements
  where user_id = p_user_id and earned_at is not null;
  
  -- Get completed sections count
  select count(*) into v_completed_sections
  from public.user_progress
  where user_id = p_user_id and is_completed = true;
  
  -- Determine user phase
  if v_token_count >= 7 and v_achievement_count >= 10 then
    v_user_phase := 'endgame';
  elsif v_token_count >= 3 and v_achievement_count >= 5 then
    v_user_phase := 'scaffolding';
  elsif v_token_count >= 1 then
    v_user_phase := 'onboarding';
  else
    v_user_phase := 'discovery';
  end if;
  
  return v_user_phase;
exception
  when others then
    return 'discovery';
end;
$$;

-- Function to complete content and track progress
create or replace function public.complete_content(p_content_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_content_exists boolean;
  v_already_completed boolean;
  v_token_reward record;
  v_achievement_id uuid;
begin
  -- Check if content exists
  select exists(
    select 1 from public.components where id = p_content_id
  ) into v_content_exists;
  
  if not v_content_exists then
    return false;
  end if;
  
  -- Check if already completed
  select exists(
    select 1 from public.user_progress
    where user_id = v_user_id and content_id = p_content_id and is_completed = true
  ) into v_already_completed;
  
  if v_already_completed then
    return true; -- Already completed, return success
  end if;
  
  -- Record progress
  insert into public.user_progress (
    user_id,
    content_id,
    is_completed,
    completed_at
  ) values (
    v_user_id,
    p_content_id,
    true,
    now()
  ) on conflict (user_id, content_id) 
  do update set 
    is_completed = true,
    completed_at = now();
  
  -- Check for token rewards
  select c.reward_token_id, c.reward_token_amount, t.symbol
  into v_token_reward
  from public.components c
  left join public.tokens t on c.reward_token_id = t.id
  where c.id = p_content_id and c.reward_token_id is not null and c.reward_token_amount > 0;
  
  -- Grant token reward if applicable
  if v_token_reward.reward_token_id is not null and v_token_reward.reward_token_amount > 0 then
    -- Add tokens to user balance
    insert into public.user_tokens (
      user_id,
      token_id,
      balance,
      staked_balance
    ) values (
      v_user_id,
      v_token_reward.reward_token_id,
      v_token_reward.reward_token_amount,
      0
    ) on conflict (user_id, token_id)
    do update set
      balance = public.user_tokens.balance + v_token_reward.reward_token_amount;
    
    -- Record token transaction
    insert into public.token_transactions (
      user_id,
      token_id,
      amount,
      transaction_type,
      reference_type,
      reference_id
    ) values (
      v_user_id,
      v_token_reward.reward_token_id,
      v_token_reward.reward_token_amount,
      'reward',
      'content_completion',
      p_content_id
    );
    
    -- Track activity
    perform public.track_user_activity(
      'content_completion_reward',
      'component',
      p_content_id::text,
      jsonb_build_object(
        'token_symbol', v_token_reward.symbol,
        'amount', v_token_reward.reward_token_amount
      )
    );
  end if;
  
  -- Check for achievement unlocks
  -- First content completion achievement
  if not exists (
    select 1 from public.user_achievements
    where user_id = v_user_id and achievement_type = 'first_completion'
  ) then
    -- Create achievement record
    insert into public.user_achievements (
      user_id,
      achievement_id,
      achievement_type,
      title,
      description,
      reward_token_id,
      reward_amount,
      earned_at
    ) values (
      v_user_id,
      gen_random_uuid(),
      'first_completion',
      'First Steps',
      'Completed your first content item',
      (select id from public.tokens where symbol = 'GEN' limit 1),
      1,
      now()
    ) returning achievement_id into v_achievement_id;
    
    -- Track activity
    perform public.track_user_activity(
      'achievement_earned',
      'achievement',
      v_achievement_id::text,
      jsonb_build_object(
        'achievement_type', 'first_completion',
        'content_id', p_content_id
      )
    );
  end if;
  
  -- Track activity
  perform public.track_user_activity(
    'content_completion',
    'component',
    p_content_id::text,
    null
  );
  
  return true;
exception
  when others then
    return false;
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
begin
  -- Get achievement details
  select * into v_achievement
  from public.user_achievements
  where user_id = v_user_id and achievement_id = p_achievement_id;
  
  if v_achievement is null then
    return false;
  end if;
  
  -- Check if already claimed
  if v_achievement.claimed_at is not null then
    return true; -- Already claimed, return success
  end if;
  
  -- Check if there's a reward to claim
  if v_achievement.reward_token_id is null or v_achievement.reward_amount <= 0 then
    return false;
  end if;
  
  -- Mark as claimed
  update public.user_achievements
  set claimed_at = now()
  where user_id = v_user_id and achievement_id = p_achievement_id;
  
  -- Add tokens to user balance
  insert into public.user_tokens (
    user_id,
    token_id,
    balance,
    staked_balance
  ) values (
    v_user_id,
    v_achievement.reward_token_id,
    v_achievement.reward_amount,
    0
  ) on conflict (user_id, token_id)
  do update set
    balance = public.user_tokens.balance + v_achievement.reward_amount;
  
  -- Record token transaction
  insert into public.token_transactions (
    user_id,
    token_id,
    amount,
    transaction_type,
    reference_type,
    reference_id
  ) values (
    v_user_id,
    v_achievement.reward_token_id,
    v_achievement.reward_amount,
    'reward',
    'achievement_claim',
    p_achievement_id
  );
  
  -- Track activity
  perform public.track_user_activity(
    'achievement_claimed',
    'achievement',
    p_achievement_id::text,
    jsonb_build_object(
      'reward_amount', v_achievement.reward_amount,
      'token_id', v_achievement.reward_token_id
    )
  );
  
  return true;
exception
  when others then
    return false;
end;
$$;

-- Function to get all user achievements
create or replace function public.get_user_achievements(p_user_id uuid default null)
returns table (
  id uuid,
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
declare
  v_user_id uuid;
begin
  -- Determine which user to get achievements for
  if p_user_id is null then
    v_user_id := auth.uid();
  else
    -- Check if current user is admin when requesting another user's achievements
    if p_user_id != auth.uid() then
      if not exists(
        select 1 from public.user_roles ur
        join public.roles r on ur.role_id = r.id
        where ur.user_id = auth.uid() and r.is_admin = true
      ) then
        raise exception 'Only admin users can view other users achievements';
      end if;
    end if;
    v_user_id := p_user_id;
  end if;
  
  return query
  select 
    ua.achievement_id as id,
    ua.title,
    ua.description,
    ua.achievement_type as category,
    'token' as reward_type,
    ua.reward_amount,
    t.symbol as reward_token_symbol,
    ua.earned_at,
    ua.claimed_at
  from public.user_achievements ua
  left join public.tokens t on ua.reward_token_id = t.id
  where ua.user_id = v_user_id
  order by ua.earned_at desc;
end;
$$;

-- Function to get pillar progress
create or replace function public.get_all_pillars_progress(p_user_id uuid default null)
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
declare
  v_user_id uuid;
begin
  -- Determine which user to get progress for
  if p_user_id is null then
    v_user_id := auth.uid();
  else
    -- Check if current user is admin when requesting another user's progress
    if p_user_id != auth.uid() then
      if not exists(
        select 1 from public.user_roles ur
        join public.roles r on ur.role_id = r.id
        where ur.user_id = auth.uid() and r.is_admin = true
      ) then
        raise exception 'Only admin users can view other users progress';
      end if;
    end if;
    v_user_id := p_user_id;
  end if;
  
  return query
  with pillar_stats as (
    select
      p.id as pillar_id,
      p.title as pillar_title,
      p.slug as pillar_slug,
      p.gradient_class,
      count(distinct s.id) as total_sections,
      count(distinct c.id) as total_components,
      count(distinct case when up.is_completed then c.id end) as completed_components
    from public.pillars p
    left join public.sections s on s.pillar_id = p.id
    left join public.components c on c.section_id = s.id
    left join public.user_progress up on up.content_id = c.id and up.user_id = v_user_id
    group by p.id, p.title, p.slug, p.gradient_class
  ),
  section_completion as (
    select
      s.pillar_id,
      count(distinct s.id) as completed_sections
    from public.sections s
    join public.components c on c.section_id = s.id
    join public.user_progress up on up.content_id = c.id and up.user_id = v_user_id and up.is_completed
    group by s.pillar_id
    having count(distinct c.id) = count(distinct case when up.is_completed then c.id end)
  )
  select
    ps.pillar_id,
    ps.pillar_title,
    ps.pillar_slug,
    ps.gradient_class,
    ps.total_sections,
    coalesce(sc.completed_sections, 0) as completed_sections,
    ps.total_components,
    ps.completed_components,
    case 
      when ps.total_components = 0 then 0
      else (ps.completed_components::numeric / ps.total_components::numeric) * 100
    end as progress_percentage
  from pillar_stats ps
  left join section_completion sc on sc.pillar_id = ps.pillar_id
  order by ps.pillar_title;
end;
$$;

-- Function to get pillar progress for admin users
create or replace function public.get_all_pillars_progress_admin(p_user_id uuid)
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
declare
  v_is_admin boolean;
begin
  -- Check if current user is admin
  select exists(
    select 1 from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = auth.uid() and r.is_admin = true
  ) into v_is_admin;
  
  if not v_is_admin then
    raise exception 'Only admin users can access this function';
  end if;
  
  return query
  select * from public.get_all_pillars_progress(p_user_id);
end;
$$;

-- Function to get user tokens for admin users
create or replace function public.get_user_tokens_admin(p_user_id uuid)
returns table (
  token_id uuid,
  token_symbol text,
  token_name text,
  description text,
  gradient_class text,
  icon_url text,
  is_primary boolean,
  is_transferable boolean,
  parent_token_id uuid,
  parent_token_symbol text,
  balance numeric,
  staked_balance numeric,
  pending_release numeric
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_is_admin boolean;
begin
  -- Check if current user is admin
  select exists(
    select 1 from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = auth.uid() and r.is_admin = true
  ) into v_is_admin;
  
  if not v_is_admin then
    raise exception 'Only admin users can access this function';
  end if;
  
  return query
  select
    t.id as token_id,
    t.symbol as token_symbol,
    t.name as token_name,
    t.description,
    t.gradient_class,
    t.icon_url,
    t.is_primary,
    t.is_transferable,
    t.parent_token_id,
    pt.symbol as parent_token_symbol,
    ut.balance,
    ut.staked_balance,
    coalesce(
      (select sum(amount) from public.token_transactions
       where user_id = p_user_id and token_id = t.id and transaction_type = 'pending_release'),
      0
    ) as pending_release
  from public.tokens t
  left join public.tokens pt on t.parent_token_id = pt.id
  left join public.user_tokens ut on ut.token_id = t.id and ut.user_id = p_user_id
  where ut.user_id = p_user_id or t.is_primary = true
  order by t.is_primary desc, t.symbol;
end;
$$;

-- Function to get user roles for admin users
create or replace function public.get_user_roles_admin(p_user_id uuid)
returns table (
  role_id uuid,
  role_name text,
  role_type public.user_role_type,
  is_admin boolean,
  permissions jsonb,
  assigned_at timestamptz,
  expires_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_is_admin boolean;
begin
  -- Check if current user is admin
  select exists(
    select 1 from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = auth.uid() and r.is_admin = true
  ) into v_is_admin;
  
  if not v_is_admin then
    raise exception 'Only admin users can access this function';
  end if;
  
  return query
  select
    r.id as role_id,
    r.name as role_name,
    r.role_type,
    r.is_admin,
    r.permissions,
    ur.assigned_at,
    ur.expires_at
  from public.user_roles ur
  join public.roles r on ur.role_id = r.id
  where ur.user_id = p_user_id
  order by r.is_admin desc, r.name;
end;
$$;

-- Function to count token holders for analytics
create or replace function public.count_token_holders(p_token_symbol text)
returns int
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token_id uuid;
  v_count int;
  v_is_admin boolean;
begin
  -- Check if current user is admin
  select exists(
    select 1 from public.user_roles ur
    join public.roles r on ur.role_id = r.id
    where ur.user_id = auth.uid() and r.is_admin = true
  ) into v_is_admin;
  
  if not v_is_admin then
    raise exception 'Only admin users can access this function';
  end if;
  
  -- Get token ID
  select id into v_token_id
  from public.tokens
  where symbol = p_token_symbol;
  
  if v_token_id is null then
    return 0;
  end if;
  
  -- Count holders
  select count(*) into v_count
  from public.user_tokens
  where token_id = v_token_id and balance > 0;
  
  return v_count;
exception
  when others then
    return 0;
end;
$$;
