-- Migration: Restore onboarding logic in handle_new_user_registration with robust error logging
-- Purpose: Ensure onboarding runs and logs all exceptions for debugging
-- Author: Cascade AI
-- Date: 2025-04-16T02:15:00Z

-- Replace the stub with a best-practice onboarding trigger function
create or replace function public.handle_new_user_registration()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  begin
    -- === BEGIN USER ONBOARDING LOGIC ===
    -- Insert user profile
    insert into public.profiles (id, email, created_at)
    values (new.id, new.email, now());

    -- Insert free membership (example logic, customize as needed)
    insert into public.memberships (user_id, membership_type, status, created_at)
    values (new.id, 'free', 'active', now());

    -- Schedule initial token distribution (example logic, customize as needed)
    perform public.schedule_membership_token_distribution(new.id, 'GEN', 100);

    -- Add additional onboarding steps here as needed
    
    -- === END USER ONBOARDING LOGIC ===
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

-- Note: Replace the onboarding logic with your actual business rules as needed.
-- After applying this migration, re-run your simulation and inspect the user_registration_errors table for details on any failures.
