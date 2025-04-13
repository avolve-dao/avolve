-- avolve network schema
-- this schema defines the physical manifestation components for the avolve platform

-- physical nodes table
create table public.physical_nodes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  node_type text not null,
  founder_id uuid references auth.users(id),
  latitude numeric,
  longitude numeric,
  address jsonb,
  size_sqm numeric,
  capacity integer,
  occupation integer default 0,
  status text not null default 'proposed',
  chain_id text unique, -- for blockchain node reference
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (node_type in ('residence', 'coworking', 'event_space', 'community_center')),
  check (status in ('proposed', 'fundraising', 'under_development', 'active', 'inactive'))
);

-- node memberships table
create table public.node_memberships (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.physical_nodes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_type text not null,
  start_date timestamptz not null default now(),
  end_date timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (membership_type in ('founder', 'resident', 'member', 'visitor')),
  check (status in ('pending', 'active', 'inactive')),
  unique(node_id, user_id)
);

-- node funding table
create table public.node_funding (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.physical_nodes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  amount numeric not null check (amount > 0),
  ownership_percentage numeric,
  funding_date timestamptz not null default now(),
  tx_hash text, -- for blockchain transaction reference
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- network census table
create table public.network_census (
  id uuid primary key default gen_random_uuid(),
  census_date date not null,
  active_users integer not null default 0,
  total_users integer not null default 0,
  active_nodes integer not null default 0,
  total_nodes integer not null default 0,
  total_area_sqm numeric not null default 0,
  total_token_value numeric not null default 0,
  blockchain_proof text, -- for census verification on blockchain
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(census_date)
);

-- enable row level security
alter table public.physical_nodes enable row level security;
alter table public.node_memberships enable row level security;
alter table public.node_funding enable row level security;
alter table public.network_census enable row level security;

-- create rls policies
-- physical nodes are viewable by everyone
create policy "physical nodes are viewable by everyone"
  on public.physical_nodes for select
  using (true);

-- node memberships are viewable by everyone
create policy "node memberships are viewable by everyone"
  on public.node_memberships for select
  using (true);

-- node funding is viewable by contributors and founders
create policy "node funding is viewable by contributors"
  on public.node_funding for select
  using (
    auth.uid() = user_id or
    auth.uid() in (
      select founder_id from public.physical_nodes
      where id = node_id
    )
  );

-- network census is viewable by everyone
create policy "network census is viewable by everyone"
  on public.network_census for select
  using (true);
