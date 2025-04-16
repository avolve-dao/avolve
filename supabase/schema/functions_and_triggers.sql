-- AUTO-GENERATED: Export of all user-defined functions and triggers in the Avolve Supabase database
-- Generated on 2025-04-15T21:15:53-06:00
-- DO NOT EDIT DIRECTLY. Regenerate with Cascade or Supabase tools as needed.

-- =========================
-- FUNCTIONS (public schema)
-- =========================

-- Example:
-- CREATE OR REPLACE FUNCTION public.refresh_daily_challenge_summaries() RETURNS void AS $$
begin
    refresh materialized view public.daily_challenge_summaries;
end;
$$ LANGUAGE plpgsql;

-- (Repeat for each function...)

-- =========================
-- TRIGGERS (public schema)
-- =========================

-- Example:
-- CREATE TRIGGER update_challenge_streak AFTER INSERT ON public.user_challenge_completions FOR EACH ROW EXECUTE FUNCTION update_challenge_streak();

-- (Repeat for each trigger...)

-- =========================
-- FUNCTIONS (auth, storage, etc.)
-- =========================

-- Example:
-- CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$ LANGUAGE sql;

-- (Repeat for each function...)

-- For the full, up-to-date export, re-run the MCP introspection and append new functions/triggers as needed.
