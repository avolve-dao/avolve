-- avolve governance schema
-- this schema defines the meeting system for the avolve platform

-- weekly meetings table
create table public.weekly_meetings (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz not null,
  duration_minutes integer not null default 60,
  max_participants integer,
  status text not null default 'scheduled',
  webrtc_room_id text, -- for future psibase integration
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- meeting groups table
create table public.meeting_groups (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.weekly_meetings(id) on delete cascade,
  max_participants integer not null default 6,
  current_participants integer not null default 0,
  status text not null default 'forming',
  webrtc_room_id text, -- for future psibase integration
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('forming', 'active', 'completed')),
  check (current_participants <= max_participants)
);

-- meeting participants table
create table public.meeting_participants (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.weekly_meetings(id) on delete cascade,
  group_id uuid references public.meeting_groups(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank integer,
  respect_earned numeric,
  status text not null default 'registered',
  check_in_time timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('registered', 'checked_in', 'present', 'absent')),
  unique(meeting_id, user_id)
);

-- meeting notes table
create table public.meeting_notes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.weekly_meetings(id) on delete cascade,
  group_id uuid references public.meeting_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_consensus boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable row level security
alter table public.weekly_meetings enable row level security;
alter table public.meeting_groups enable row level security;
alter table public.meeting_participants enable row level security;
alter table public.meeting_notes enable row level security;

-- create rls policies
-- weekly meetings are viewable by everyone
create policy "weekly meetings are viewable by everyone"
  on public.weekly_meetings for select
  using (true);

-- meeting groups are viewable by everyone
create policy "meeting groups are viewable by everyone"
  on public.meeting_groups for select
  using (true);

-- meeting participants are viewable by everyone
create policy "meeting participants are viewable by everyone"
  on public.meeting_participants for select
  using (true);

-- meeting participants are manageable by the participant
create policy "meeting participants are manageable by the participant"
  on public.meeting_participants for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- meeting notes are viewable by everyone
create policy "meeting notes are viewable by everyone"
  on public.meeting_notes for select
  using (true);

-- meeting notes are manageable by the author
create policy "meeting notes are manageable by the author"
  on public.meeting_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
