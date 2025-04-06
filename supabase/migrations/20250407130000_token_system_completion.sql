-- Migration: Token System Completion
-- Description: Adds missing components for the token transfer system
-- Author: Cascade AI
-- Date: 2025-04-07

-- Add fee column to token_transactions if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns 
                where table_schema = 'public' 
                and table_name = 'token_transactions' 
                and column_name = 'fee') then
    alter table public.token_transactions add column fee numeric;
    alter table public.token_transactions alter column fee set default 0;
  end if;
end $$;

-- Add status column to token_transactions if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns 
                where table_schema = 'public' 
                and table_name = 'token_transactions' 
                and column_name = 'status') then
    alter table public.token_transactions add column status text;
    alter table public.token_transactions alter column status set default 'completed';
  end if;
end $$;

-- Add metadata column to token_transactions if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns 
                where table_schema = 'public' 
                and table_name = 'token_transactions' 
                and column_name = 'metadata') then
    alter table public.token_transactions add column metadata jsonb;
  end if;
end $$;

-- Add comments to the columns
comment on column public.token_transactions.fee is 'Fee amount applied to this transaction';
comment on column public.token_transactions.status is 'Status of the transaction (e.g., completed, pending, failed)';
comment on column public.token_transactions.metadata is 'Additional metadata for the transaction';

-- Create token_balances table if it doesn't exist
create table if not exists public.token_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token_id uuid not null references public.tokens(id) on delete cascade,
  balance numeric not null default 0,
  last_updated timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  constraint token_balances_user_token_key unique (user_id, token_id)
);

-- Enable RLS on token_balances
alter table public.token_balances enable row level security;

-- Create RLS policies for token_balances
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'token_balances' and policyname = 'Users can view their own token balances') then
    create policy "Users can view their own token balances"
      on public.token_balances for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'token_balances' and policyname = 'Admins can view all token balances') then
    create policy "Admins can view all token balances"
      on public.token_balances for select
      to authenticated
      using (
        exists (
          select 1 from public.user_roles ur
          join public.roles r on ur.role_id = r.id
          where ur.user_id = auth.uid() and r.name = 'admin'
        )
      );
  end if;
end $$;

-- Create transfer_tokens function
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
  
  -- Create audit log if the function exists
  begin
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
  exception
    when undefined_function then
      -- Function doesn't exist, just continue
      null;
  end;
  
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
