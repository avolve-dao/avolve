-- Migration: Add canvas, experiment, and learnings tables for Strategyzer-style process in Avolve
-- Purpose: Enable admins to Canvas, Design, Attest, and Evolve; support transparent user views
-- Created: 20250416T221942Z (UTC)

-- 1. Canvas Entries Table
create table if not exists public.canvas_entries (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  pillar text not null, -- 'individual', 'collective', 'ecosystem'
  canvas_type text not null, -- 'hypothesis', 'pain', 'gain', 'job_to_be_done', 'goal', etc.
  title text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- 2. Experiments Table
create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  canvas_entry_id uuid references public.canvas_entries(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  status text default 'proposed', -- 'proposed', 'active', 'completed', 'archived'
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now()
);

-- 3. Experiment Results Table
create table if not exists public.experiment_results (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references public.experiments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  result_type text, -- 'metric', 'feedback', 'observation', etc.
  value text,
  created_at timestamptz default now()
);

-- 4. Learnings Table
create table if not exists public.learnings (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references public.experiments(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  summary text not null,
  details text,
  created_at timestamptz default now()
);

-- Enable RLS and policies for all new tables
alter table public.canvas_entries enable row level security;
alter table public.experiments enable row level security;
alter table public.experiment_results enable row level security;
alter table public.learnings enable row level security;

-- RLS: Only allow users to select all, but only insert/update/delete their own entries
create policy "Select all canvas entries" on public.canvas_entries for select using (true);
create policy "Manage own canvas entries" on public.canvas_entries for all using (created_by = auth.uid());

create policy "Select all experiments" on public.experiments for select using (true);
create policy "Manage own experiments" on public.experiments for all using (created_by = auth.uid());

create policy "Select all experiment results" on public.experiment_results for select using (true);
create policy "Manage own experiment results" on public.experiment_results for all using (user_id = auth.uid());

create policy "Select all learnings" on public.learnings for select using (true);
create policy "Manage own learnings" on public.learnings for all using (created_by = auth.uid());

-- Admins can manage all
create policy "Admin can manage all canvas entries" on public.canvas_entries for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin can manage all experiments" on public.experiments for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin can manage all experiment results" on public.experiment_results for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Admin can manage all learnings" on public.learnings for all using (exists (select 1 from auth.users u where u.id = auth.uid() and u.role = 'admin'));

-- Indexes for performance
create index if not exists idx_canvas_entries_created_by on public.canvas_entries(created_by);
create index if not exists idx_experiments_canvas_entry_id on public.experiments(canvas_entry_id);
create index if not exists idx_experiment_results_experiment_id on public.experiment_results(experiment_id);
create index if not exists idx_learnings_experiment_id on public.learnings(experiment_id);

-- Comments and documentation
comment on table public.canvas_entries is 'Canvas entries for Strategyzer-style Canvas, Design, Attest, Evolve process.';
comment on table public.experiments is 'Experiments linked to Canvas entries.';
comment on table public.experiment_results is 'Results, feedback, and metrics for experiments.';
comment on table public.learnings is 'Learnings and insights from experiments.';
