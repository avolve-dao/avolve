-- Migration: Seed Token Hierarchy with Avolve Platform Structure
-- Purpose: Populate the tokens table with the hierarchical token structure of the Avolve platform
-- Affected tables: tokens
-- Special considerations: This migration assumes the tokens table has been enhanced with the previous migration

-- Function to safely insert tokens without duplicates
create or replace function public.safe_insert_token(
  p_symbol text,
  p_name text,
  p_description text,
  p_parent_symbol text default null,
  p_token_level integer default 1,
  p_gradient_class text default null,
  p_total_supply numeric default 1000000000
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_parent_id uuid;
  v_token_id uuid;
begin
  -- Get parent token ID if provided
  if p_parent_symbol is not null then
    select id into v_parent_id
    from public.tokens
    where symbol = p_parent_symbol;
  end if;

  -- Check if token already exists
  select id into v_token_id
  from public.tokens
  where symbol = p_symbol;

  -- Insert or update token
  if v_token_id is null then
    -- Insert new token
    insert into public.tokens (
      symbol,
      name,
      description,
      parent_token_id,
      token_level,
      gradient_class,
      total_supply
    )
    values (
      p_symbol,
      p_name,
      p_description,
      v_parent_id,
      p_token_level,
      p_gradient_class,
      p_total_supply
    )
    returning id into v_token_id;
  else
    -- Update existing token
    update public.tokens
    set
      name = p_name,
      description = p_description,
      parent_token_id = v_parent_id,
      token_level = p_token_level,
      gradient_class = coalesce(p_gradient_class, gradient_class),
      total_supply = p_total_supply
    where id = v_token_id;
  end if;

  return v_token_id;
end;
$$;

-- Seed the primary GEN token
select public.safe_insert_token(
  'GEN',
  'Genius Token',
  'Primary token of the Avolve platform, representing the Supercivilization ecosystem',
  null,
  9,
  'zinc-gradient',
  9000000000
);

-- Seed the three main pillar tokens
select public.safe_insert_token(
  'SAP',
  'Superachiever Token',
  'Token for the individual journey of transformation',
  'GEN',
  6,
  'stone-gradient',
  6000000000
);

select public.safe_insert_token(
  'SCQ',
  'Superachievers Token',
  'Token for the collective journey of transformation',
  'GEN',
  6,
  'slate-gradient',
  6000000000
);

select public.safe_insert_token(
  'SCP',
  'Supercivilization Token',
  'Token for the ecosystem journey of transformation',
  'GEN',
  6,
  'zinc-gradient',
  6000000000
);

-- Seed the Personal Success Puzzle tokens
select public.safe_insert_token(
  'PSP',
  'Personal Success Puzzle Token',
  'Token for greater personal successes',
  'SAP',
  3,
  'amber-yellow-gradient',
  3000000000
);

-- Seed the Business Success Puzzle tokens
select public.safe_insert_token(
  'BSP',
  'Business Success Puzzle Token',
  'Token for greater business successes',
  'SAP',
  3,
  'teal-cyan-gradient',
  3000000000
);

-- Seed the Supermind Superpowers tokens
select public.safe_insert_token(
  'SMS',
  'Supermind Superpowers Token',
  'Token for going further, faster, and forever',
  'SAP',
  3,
  'violet-purple-fuchsia-pink-gradient',
  3000000000
);

-- Seed the Superpuzzle Developments tokens
select public.safe_insert_token(
  'SPD',
  'Superpuzzle Developments Token',
  'Token for conceiving, believing, and achieving',
  'SCQ',
  3,
  'red-green-blue-gradient',
  3000000000
);

-- Seed the Superhuman Enhancements tokens
select public.safe_insert_token(
  'SHE',
  'Superhuman Enhancements Token',
  'Token for super enhanced individuals',
  'SCQ',
  3,
  'rose-red-orange-gradient',
  3000000000
);

-- Seed the Supersociety Advancements tokens
select public.safe_insert_token(
  'SSA',
  'Supersociety Advancements Token',
  'Token for super advanced collectives',
  'SCQ',
  3,
  'lime-green-emerald-gradient',
  3000000000
);

-- Seed the Supergenius Breakthroughs tokens
select public.safe_insert_token(
  'SGB',
  'Supergenius Breakthroughs Token',
  'Token for super balanced ecosystems',
  'SCQ',
  3,
  'sky-blue-indigo-gradient',
  3000000000
);

-- Drop the temporary function
drop function if exists public.safe_insert_token(text, text, text, text, integer, text, numeric);

-- Create token exchange rates based on sacred geometry principles
insert into public.token_exchange_rates (
  base_token_id,
  quote_token_id,
  rate,
  is_sacred_ratio,
  sacred_ratio_type
)
select
  base.id as base_token_id,
  quote.id as quote_token_id,
  case
    when base.token_level = 9 and quote.token_level = 6 then 1.618 -- Golden ratio
    when base.token_level = 6 and quote.token_level = 3 then 1.618 -- Golden ratio
    when base.token_level = 3 and quote.token_level = 1 then 1.618 -- Golden ratio
    when base.is_tesla_369 and quote.is_tesla_369 then 
      case
        when base.digital_root = 9 and quote.digital_root = 6 then 1.5 -- Tesla ratio
        when base.digital_root = 6 and quote.digital_root = 3 then 2.0 -- Tesla ratio
        when base.digital_root = 9 and quote.digital_root = 3 then 3.0 -- Tesla ratio
        else power(1.618, abs(base.token_level - quote.token_level))
      end
    else power(1.618, abs(base.token_level - quote.token_level))
  end as rate,
  true as is_sacred_ratio,
  case
    when (base.token_level = 9 and quote.token_level = 6) or
         (base.token_level = 6 and quote.token_level = 3) or
         (base.token_level = 3 and quote.token_level = 1) then 'golden_ratio'
    when base.is_tesla_369 and quote.is_tesla_369 then 'tesla_369'
    else 'fibonacci'
  end as sacred_ratio_type
from
  public.tokens base
cross join
  public.tokens quote
where
  base.id != quote.id
  and base.token_level > quote.token_level;

-- Create token achievements based on Tesla's 3-6-9 pattern
insert into public.token_achievements (
  name,
  description,
  token_id,
  required_balance,
  reward_token_id,
  reward_amount,
  is_tesla_369_achievement,
  achievement_level
)
select
  'Level ' || t.token_level || ' ' || t.symbol || ' Holder',
  'Hold at least ' || milestone || ' ' || t.symbol || ' tokens',
  t.id as token_id,
  milestone as required_balance,
  (select id from public.tokens where symbol = 'GEN') as reward_token_id,
  case
    when t.is_tesla_369 then milestone * 0.03 -- 3% reward for Tesla 3-6-9 tokens
    else milestone * 0.01 -- 1% reward for other tokens
  end as reward_amount,
  t.is_tesla_369 as is_tesla_369_achievement,
  level as achievement_level
from
  public.tokens t
cross join (
  values
    (3, 300),
    (6, 600),
    (9, 900)
) as milestones(level, milestone)
where
  t.symbol != 'GEN'; -- Exclude GEN token from achievements
