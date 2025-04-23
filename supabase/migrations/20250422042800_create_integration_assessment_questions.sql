-- Migration: Create integration_assessment_questions table
-- Purpose: Adds a table to store assessment questions for integrations, including question text, domain, subdomain, type, and options.
-- Affected tables: public.integration_assessment_questions
-- Special considerations: Enables Row Level Security (RLS) and adds granular policies for anon and authenticated roles.

-- 1. Create the integration_assessment_questions table
create table public.integration_assessment_questions (
  id bigserial primary key,
  question_text text not null,
  domain text not null,
  subdomain text not null,
  question_type text not null, -- e.g., 'multiple_choice', 'short_answer', etc.
  options jsonb, -- for multiple choice or similar types
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- 2. Enable Row Level Security
alter table public.integration_assessment_questions enable row level security;

-- 3. RLS Policies
-- Allow SELECT for anon users
create policy "Allow anon select integration_assessment_questions"
  on public.integration_assessment_questions
  for select
  to anon
  using (true);

-- Allow SELECT for authenticated users
create policy "Allow authenticated select integration_assessment_questions"
  on public.integration_assessment_questions
  for select
  to authenticated
  using (true);

-- Allow INSERT for authenticated users only
create policy "Allow authenticated insert integration_assessment_questions"
  on public.integration_assessment_questions
  for insert
  to authenticated
  with check (true);

-- Allow UPDATE for authenticated users only
create policy "Allow authenticated update integration_assessment_questions"
  on public.integration_assessment_questions
  for update
  to authenticated
  using (true);

-- Allow DELETE for authenticated users only
create policy "Allow authenticated delete integration_assessment_questions"
  on public.integration_assessment_questions
  for delete
  to authenticated
  using (true);

-- Index for fast lookup by domain/subdomain
create index idx_integration_assessment_questions_domain_subdomain
  on public.integration_assessment_questions(domain, subdomain);

-- Comments for documentation
comment on table public.integration_assessment_questions is 'Stores assessment questions for integrations, including question text, domain, subdomain, type, and options.';
comment on column public.integration_assessment_questions.question_text is 'The text of the assessment question.';
comment on column public.integration_assessment_questions.domain is 'Domain/category for the question (e.g., business, technical, etc.).';
comment on column public.integration_assessment_questions.subdomain is 'Subdomain for more granular categorization.';
comment on column public.integration_assessment_questions.question_type is 'Type of question (multiple_choice, short_answer, etc.).';
comment on column public.integration_assessment_questions.options is 'JSON array of options for multiple choice questions.';
comment on column public.integration_assessment_questions.is_active is 'Whether the question is currently active.';
comment on column public.integration_assessment_questions.created_at is 'Timestamp when the question was created.';
comment on column public.integration_assessment_questions.updated_at is 'Timestamp when the question was last updated.';
