-- Migration: Create get_user_token_balances function
-- Generated: 2025-04-23T12:50:00Z
-- Purpose: Create an optimized function to calculate user token balances
-- Author: @avolve-dao

/**
 * Get token balances for a user
 * 
 * This function aggregates all token transactions for a user
 * and returns the current balance for each token type.
 * 
 * @param p_user_id - The UUID of the user
 * @returns Table of token_type and balance
 */
create or replace function public.get_user_token_balances(p_user_id uuid)
returns table (
  token_type text,
  balance numeric
)
language plpgsql
security invoker
set search_path = ''
stable
as $$
begin
  -- Validate input
  if p_user_id is null then
    raise exception 'User ID cannot be null';
  end if;
  
  -- Return aggregated token balances
  return query
    select 
      t.token_type,
      coalesce(sum(t.amount), 0) as balance
    from 
      public.tokens t
    where 
      t.user_id = p_user_id
    group by 
      t.token_type
    order by 
      t.token_type;
      
  -- If no rows returned, return empty result
  if not found then
    return;
  end if;
end;
$$;

-- Create an index to optimize the function
create index if not exists idx_tokens_user_id_token_type
  on public.tokens(user_id, token_type);

-- Add comment to function for documentation
comment on function public.get_user_token_balances(uuid) is 
  'Returns the current token balances for a user, aggregated by token type';
