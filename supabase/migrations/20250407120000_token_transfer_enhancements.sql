-- Migration: Token Transfer Enhancements
-- Description: Adds transfer fee and transferability features to the token system
-- Author: Cascade AI
-- Date: 2025-04-07

-- Add columns to tokens table if they don't exist
alter table if exists public.tokens 
  add column if not exists is_transferable boolean not null default true,
  add column if not exists transfer_fee numeric default 0;

-- Add comments to the columns
comment on column public.tokens.is_transferable is 'Determines if a token can be transferred between users';
comment on column public.tokens.transfer_fee is 'Fee percentage applied to token transfers (0-1 range)';

-- Add fee column to token_transactions if it doesn't exist
alter table if exists public.token_transactions
  add column if not exists fee numeric default 0;

-- Add comment to the fee column
comment on column public.token_transactions.fee is 'Fee amount applied to this transaction';

-- Create or replace the transfer_tokens function with fee calculation
create or replace function public.transfer_tokens(
  p_from_user_id uuid,
  p_to_user_id uuid,
  p_token_id uuid,
  p_amount numeric
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token record;
  v_from_balance numeric;
  v_fee numeric;
  v_transfer_amount numeric;
  v_transaction_id uuid;
begin
  -- Validate users
  if p_from_user_id = p_to_user_id then
    return json_build_object(
      'success', false,
      'message', 'Cannot transfer tokens to yourself'
    );
  end if;
  
  -- Validate amount
  if p_amount <= 0 then
    return json_build_object(
      'success', false,
      'message', 'Amount must be greater than 0'
    );
  end if;
  
  -- Get token details
  select * into v_token
  from public.tokens
  where id = p_token_id;
  
  if not found then
    return json_build_object(
      'success', false,
      'message', 'Token not found'
    );
  end if;
  
  -- Check if token is transferable
  if not v_token.is_transferable then
    return json_build_object(
      'success', false,
      'message', 'Token is not transferable'
    );
  end if;
  
  -- Get sender's balance
  select balance into v_from_balance
  from public.token_balances
  where user_id = p_from_user_id and token_id = p_token_id;
  
  if not found or v_from_balance < p_amount then
    return json_build_object(
      'success', false,
      'message', 'Insufficient balance'
    );
  end if;
  
  -- Calculate fee
  v_fee := p_amount * v_token.transfer_fee;
  v_transfer_amount := p_amount - v_fee;
  
  -- Update sender's balance
  update public.token_balances
  set 
    balance = balance - p_amount,
    updated_at = now()
  where 
    user_id = p_from_user_id 
    and token_id = p_token_id;
  
  -- Update or create recipient's balance
  insert into public.token_balances (
    user_id,
    token_id,
    balance
  )
  values (
    p_to_user_id,
    p_token_id,
    v_transfer_amount
  )
  on conflict (user_id, token_id)
  do update set
    balance = public.token_balances.balance + v_transfer_amount,
    updated_at = now();
  
  -- Create transaction record
  insert into public.token_transactions (
    from_user_id,
    to_user_id,
    token_id,
    amount,
    fee,
    transaction_type,
    status,
    metadata
  )
  values (
    p_from_user_id,
    p_to_user_id,
    p_token_id,
    p_amount,
    v_fee,
    'transfer',
    'completed',
    json_build_object(
      'token_symbol', v_token.symbol,
      'transfer_amount', v_transfer_amount
    )
  )
  returning id into v_transaction_id;
  
  -- Create audit log
  perform public.create_audit_log(
    p_from_user_id,
    'transfer_tokens',
    'token_transaction',
    v_transaction_id::text,
    json_build_object(
      'token_id', p_token_id,
      'to_user_id', p_to_user_id,
      'amount', p_amount,
      'fee', v_fee
    )
  );
  
  return json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'amount', p_amount,
    'fee', v_fee,
    'transfer_amount', v_transfer_amount
  );
end;
$$;

-- Create a function to get user token balance
create or replace function public.get_user_token_balance(
  p_user_id uuid,
  p_token_id uuid
)
returns numeric
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_balance numeric;
begin
  select balance into v_balance
  from public.token_balances
  where user_id = p_user_id and token_id = p_token_id;
  
  if not found then
    return 0;
  end if;
  
  return v_balance;
end;
$$;

-- Create a function to update token transferability and fee
create or replace function public.update_token_transfer_settings(
  p_token_id uuid,
  p_is_transferable boolean,
  p_transfer_fee numeric
)
returns json
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_token record;
begin
  -- Validate token exists
  select * into v_token
  from public.tokens
  where id = p_token_id;
  
  if not found then
    return json_build_object(
      'success', false,
      'message', 'Token not found'
    );
  end if;
  
  -- Validate transfer fee is in valid range
  if p_transfer_fee < 0 or p_transfer_fee > 1 then
    return json_build_object(
      'success', false,
      'message', 'Transfer fee must be between 0 and 1'
    );
  end if;
  
  -- Update token settings
  update public.tokens
  set 
    is_transferable = p_is_transferable,
    transfer_fee = p_transfer_fee,
    updated_at = now()
  where 
    id = p_token_id;
  
  return json_build_object(
    'success', true,
    'message', 'Token transfer settings updated successfully'
  );
end;
$$;
