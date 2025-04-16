-- Migration: Fix handle_new_user_registration onboarding trigger function for Avolve
-- Purpose: Ensure onboarding logic matches actual table structure and logs all errors
-- Author: Cascade AI
-- Date: 2025-04-16T02:20:00Z

create or replace function public.handle_new_user_registration()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  begin
    -- Insert user profile (id, email, created_at)
    insert into public.profiles (id, email, created_at)
    values (new.id, new.email, now());

    -- Insert free membership (matches actual table columns)
    insert into public.memberships (
      user_id, status, plan, monthly_fee, start_date, next_billing_date, created_at, updated_at, is_free_tier
    ) values (
      new.id, 'active', 'free', 0, now(), now() + interval '1 month', now(), now(), true
    );

    -- Schedule initial token distribution (GEN token)
    perform public.schedule_membership_token_distribution(new.id, 'GEN', 100);

    -- Add additional onboarding steps here
    return new;
  exception
    when others then
      insert into public.user_registration_errors (
        user_email,
        user_id,
        error_message,
        error_detail,
        payload
      ) values (
        new.email,
        new.id,
        sqlerrm,
        pg_exception_detail(),
        to_jsonb(new)
      );
      raise;
  end;
end;
$$;

-- Note: This function now matches the actual memberships table structure and logs all errors.
-- After applying this migration, re-run your simulation and inspect the user_registration_errors table for details on any failures.
