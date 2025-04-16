-- Migration: Add experiment_type to experiments table for distinguishing simulations vs real-world experiments
-- Purpose: Enable admins and users to clearly distinguish and filter between simulations and real-world experiments in the UI and analytics
-- Affects: Adds experiment_type column and index, updates comments

alter table public.experiments
  add column if not exists experiment_type text not null default 'real' check (experiment_type in ('real', 'simulation'));

create index if not exists idx_experiments_experiment_type on public.experiments(experiment_type);

comment on column public.experiments.experiment_type is 'Type of experiment: real (real-world) or simulation (test run)';
