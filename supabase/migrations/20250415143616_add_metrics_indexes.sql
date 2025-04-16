-- Migration: Add indexes for metrics(metric_type, recorded_at)
-- Created at: 2025-04-15T08:36:16-06:00

-- Add index on metric_type for fast filtering
create index if not exists idx_metrics_metric_type on public.metrics (metric_type);

-- Add index on recorded_at for fast ordering/filtering by date
create index if not exists idx_metrics_recorded_at on public.metrics (recorded_at);

-- Add composite index for common query pattern
create index if not exists idx_metrics_type_recorded_at on public.metrics (metric_type, recorded_at);
