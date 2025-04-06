# Token-Based Access Control System

This document outlines the token-based access control system implemented for the Avolve platform. This system integrates with the existing RBAC (Role-Based Access Control) system to provide a comprehensive access control solution that aligns with Avolve's business model and token structure.

## Overview

The Avolve platform uses a hierarchical token structure that represents different aspects of the platform's value pillars:

1. **Superachiever** - For the individual journey of transformation
2. **Superachievers** - For collective journey of transformation
3. **Supercivilization** - For the ecosystem journey of transformation

Each of these pillars is represented by different token types, which grant access to specific features and functionalities within the platform.

## Token Structure

The platform has a hierarchical token structure:

- **GEN token** (Supercivilization)
- **SAP token** (Superachiever)
  - PSP token (Personal Success)
  - BSP token (Business Success)
  - SMS token (Supermind Superpowers)
- **SCQ token** (Superachievers)
  - SPD token (Superpuzzle Developments)
  - SHE token (Superhuman Enhancements)
  - SSA token (Supersociety Advancements)
  - SGB token (Supergenius Breakthroughs)

## Database Schema

The token-based access control system is implemented using the following database tables:

### token_types

Stores token type definitions (GEN, SAP, PSP, etc.)

```sql
create table if not exists public.token_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  parent_token_type_id uuid references public.token_types(id),
  is_system boolean not null default false,
  metadata jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
```

### tokens

Stores token instances

```sql
create table if not exists public.tokens (
  id uuid primary key default gen_random_uuid(),
  token_type_id uuid not null references public.token_types(id) on delete cascade,
  name text not null,
  symbol text not null,
  description text,
  metadata jsonb,
  total_supply bigint,
  is_transferable boolean not null default true,
  transfer_fee numeric default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
```

### token_balances

Maps users to tokens and tracks their balances

```sql
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
```

### token_permissions

Maps tokens to permissions

```sql
create table if not exists public.token_permissions (
  id uuid primary key default gen_random_uuid(),
  token_type_id uuid not null references public.token_types(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  min_balance numeric not null default 1,
  created_at timestamp with time zone not null default now(),
  -- Ensure each permission is assigned to a token type only once
  unique(token_type_id, permission_id)
);
```

### token_transactions

Stores token transaction history for audit purposes

```sql
create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.tokens(id) on delete cascade,
  from_user_id uuid references auth.users(id) on delete set null,
  to_user_id uuid references auth.users(id) on delete set null,
  amount numeric not null,
  fee numeric default 0,
  transaction_type text not null,
  status text not null,
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);
```

## Database Functions

The token-based access control system is implemented using the following database functions:

### has_permission_enhanced_with_tokens

Checks if a user has a permission through either roles or tokens.

```sql
create or replace function public.has_permission_enhanced_with_tokens(
  p_user_id uuid,
  p_resource text,
  p_action text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_has_permission boolean;
begin
  -- First check if user has permission through roles
  select exists(
    select 1
    from public.role_permissions rp
    join public.permissions p on rp.permission_id = p.id
    join public.user_roles ur on rp.role_id = ur.role_id
    where ur.user_id = p_user_id
    and p.resource = p_resource
    and p.action = p_action
  ) into v_has_permission;
  
  -- If user has permission through roles, return true
  if v_has_permission then
    return true;
  end if;
  
  -- Check if user has permission through tokens
  select exists(
    select 1
    from public.token_permissions tp
    join public.permissions p on tp.permission_id = p.id
    join public.tokens t on tp.token_type_id = t.token_type_id
    join public.token_balances tb on t.id = tb.token_id
    where tb.user_id = p_user_id
    and p.resource = p_resource
    and p.action = p_action
    and tb.balance >= tp.min_balance
  ) into v_has_permission;
  
  return v_has_permission;
end;
$$;
```

### get_user_permissions_with_tokens

Gets all permissions for a user (including from tokens).

```sql
create or replace function public.get_user_permissions_with_tokens(
  p_user_id uuid
)
returns setof public.permissions
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Return permissions from roles
  return query
  select distinct p.*
  from public.role_permissions rp
  join public.permissions p on rp.permission_id = p.id
  join public.user_roles ur on rp.role_id = ur.role_id
  where ur.user_id = p_user_id;
  
  -- Return permissions from tokens
  return query
  select distinct p.*
  from public.token_permissions tp
  join public.permissions p on tp.permission_id = p.id
  join public.tokens t on tp.token_type_id = t.token_type_id
  join public.token_balances tb on t.id = tb.token_id
  where tb.user_id = p_user_id
  and tb.balance >= tp.min_balance;
end;
$$;
```

### transfer_tokens

Transfers tokens from one user to another with fee calculation.

```sql
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
```

## Client-Side Implementation

### TokenService

The `TokenService` class centralizes all token management functionality for the Avolve platform. It provides methods for managing tokens, token ownership, and token-based permissions.

```typescript
export class TokenService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // Token management
  async getAllTokens() {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting tokens:', error);
      return { data: null, error };
    }
  }

  async getTokenById(tokenId: string) {
    try {
      const { data, error } = await this.client
        .from('tokens')
        .select('*')
        .eq('id', tokenId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting token:', error);
      return { data: null, error };
    }
  }

  // Token balance management
  async getUserTokens(userId: string) {
    try {
      const { data, error } = await this.client
        .from('token_balances')
        .select('*, tokens(*)')
        .eq('user_id', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user tokens:', error);
      return { data: null, error };
    }
  }

  async getUserTokenBalance(userId: string, tokenId: string) {
    try {
      const { data, error } = await this.client.rpc('get_user_token_balance', {
        p_user_id: userId,
        p_token_id: tokenId
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user token balance:', error);
      return { data: null, error };
    }
  }

  // Token transfers
  async transferTokensWithFee(fromUserId: string, toUserId: string, tokenId: string, amount: number) {
    try {
      const { data, error } = await this.client.rpc('transfer_tokens', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_token_id: tokenId,
        p_amount: amount
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return { data: null, error };
    }
  }

  // Permission management
  async hasPermissionViaToken(userId: string, resource: string, action: string) {
    try {
      const { data, error } = await this.client.rpc('has_permission_enhanced_with_tokens', {
        p_user_id: userId,
        p_resource: resource,
        p_action: action
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error checking permission via token:', error);
      return { data: false, error };
    }
  }

  async getUserPermissionsWithTokens(userId: string) {
    try {
      const { data, error } = await this.client.rpc('get_user_permissions_with_tokens', {
        p_user_id: userId
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting user permissions with tokens:', error);
      return { data: null, error };
    }
  }
}
```

### useToken Hook

The `useToken` hook provides a React-friendly interface for the TokenService:

```typescript
import { useState, useCallback } from 'react';
import { useSupabase } from '../supabase/use-supabase';
import { TokenService } from './token-service';
import { useAuth } from '../auth/use-auth';
import { useAudit } from '../audit/use-audit';

export function useToken() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { logAction } = useAudit();
  
  const [tokenService] = useState(() => new TokenService(supabase));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getAllTokens = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await tokenService.getAllTokens();
      
      if (error) {
        setError(error);
        return null;
      }
      
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tokenService]);

  const getUserTokens = useCallback(async () => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await tokenService.getUserTokens(user.id);
      
      if (error) {
        setError(error);
        return null;
      }
      
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tokenService, user]);

  const transferTokens = useCallback(async (toUserId: string, tokenId: string, amount: number) => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await tokenService.transferTokensWithFee(user.id, toUserId, tokenId, amount);
      
      if (error) {
        setError(error);
        return false;
      }
      
      // Log the action
      await logAction({
        action: 'transfer_tokens',
        entityType: 'token_transaction',
        entityId: data.transaction_id,
        metadata: {
          toUserId,
          tokenId,
          amount,
          fee: data.fee,
          transferAmount: data.transfer_amount
        }
      });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [tokenService, user, logAction]);

  return {
    getAllTokens,
    getUserTokens,
    transferTokens,
    isLoading,
    error
  };
}
```

### useTokenRBAC Hook

The `useTokenRBAC` hook integrates with the existing RBAC system to provide a comprehensive access control solution:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../supabase/use-supabase';
import { TokenService } from './token-service';
import { useAuth } from '../auth/use-auth';
import { useRBAC } from '../auth/use-rbac';

export function useTokenRBAC() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const rbac = useRBAC();
  
  const [tokenService] = useState(() => new TokenService(supabase));
  const [tokenPermissions, setTokenPermissions] = useState<any[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokenError, setTokenError] = useState<Error | null>(null);

  // Load token permissions
  useEffect(() => {
    if (!user) return;
    
    setIsLoadingTokens(true);
    
    tokenService.getUserPermissionsWithTokens(user.id)
      .then(({ data, error }) => {
        if (error) {
          setTokenError(error);
        } else {
          setTokenPermissions(data || []);
        }
      })
      .catch(err => {
        setTokenError(err instanceof Error ? err : new Error('Unknown error'));
      })
      .finally(() => {
        setIsLoadingTokens(false);
      });
  }, [user, tokenService]);

  // Check if user has permission via token
  const hasTokenPermission = useCallback((resource: string, action: string) => {
    return tokenPermissions.some(p => p.resource === resource && p.action === action);
  }, [tokenPermissions]);

  // Combined permission check (roles + tokens)
  const hasPermission = useCallback((resource: string, action: string) => {
    return rbac.hasPermission(resource, action) || hasTokenPermission(resource, action);
  }, [rbac.hasPermission, hasTokenPermission]);

  return {
    // Token-specific states
    tokenPermissions,
    hasTokenPermission,
    isLoadingTokens,
    tokenError,
    
    // Combined RBAC states (considering both roles and tokens)
    hasPermission,
    hasRole: rbac.hasRole,
    isAuthorized: hasPermission, // Alias for hasPermission
    isLoading: rbac.isLoading || isLoadingTokens,
    error: rbac.error || tokenError
  };
}
```

## UI Components

### TokenManager

The `TokenManager` component provides an interface for administrators to manage tokens and token ownership. It allows creating, assigning, and managing tokens within the Avolve platform.

Features include:
- Creating and managing token types
- Creating and managing tokens
- Minting tokens to users
- Transferring tokens between users
- Viewing token ownership
- Setting transfer fees and transferability flags

## Integration with RBAC

The token-based access control system integrates with the existing RBAC system in the following ways:

1. **Permission Checking**: The `has_permission_enhanced_with_tokens` function checks if a user has a permission through either roles or tokens.
2. **Permission Retrieval**: The `get_user_permissions_with_tokens` function retrieves all permissions for a user, including those from both roles and tokens.
3. **React Hook Integration**: The `useTokenRBAC` hook integrates with the existing `useRBAC` hook to provide a comprehensive access control solution.

## Usage Examples

### Checking if a User Has a Token Type

```typescript
const { getUserTokens } = useToken();

const checkTokenType = async (tokenTypeId) => {
  const tokens = await getUserTokens();
  return tokens?.some(token => token.tokens.token_type_id === tokenTypeId) || false;
};
```

### Checking if a User Has a Permission via Token

```typescript
const { hasTokenPermission } = useTokenRBAC();

// In a component
if (hasTokenPermission('superachiever', 'access')) {
  // User has access to superachiever features via token
}
```

### Using the useTokenRBAC Hook in a Component

```tsx
import { useTokenRBAC } from '@/lib/token/use-token-rbac';

function ProtectedComponent() {
  const { hasPermission, isLoading } = useTokenRBAC();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!hasPermission('superachiever', 'access')) {
    return <div>You don't have access to this feature</div>;
  }
  
  return <div>Protected content</div>;
}
```

### Transferring Tokens Between Users

```tsx
import { useToken } from '@/lib/token/use-token';

function TokenTransferForm() {
  const { transferTokens, isLoading, error } = useToken();
  const [toUserId, setToUserId] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [amount, setAmount] = useState(0);
  
  const handleTransfer = async () => {
    const success = await transferTokens(toUserId, tokenId, amount);
    
    if (success) {
      // Show success message
    }
  };
  
  return (
    <form onSubmit={e => { e.preventDefault(); handleTransfer(); }}>
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Transferring...' : 'Transfer Tokens'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

## Best Practices

1. **Use the TokenService for All Token Operations**: The `TokenService` centralizes all token management functionality and should be used for all token operations.

2. **Use the useToken Hook for React Components**: The `useToken` hook provides a React-friendly interface for the TokenService and should be used in React components.

3. **Use the useTokenRBAC Hook for Access Control**: The `useTokenRBAC` hook provides a comprehensive access control solution that considers both role-based and token-based permissions.

4. **Consider Transfer Fees and Transferability**: When designing token transfers, consider the transfer fee and whether the token is transferable.

5. **Audit All Token Transactions**: All token transactions are automatically logged in the `token_transactions` table and in the audit logs for security and compliance purposes.

6. **Implement Proper Error Handling**: All token operations should include proper error handling to ensure a smooth user experience.

7. **Use RLS Policies for Data Access Control**: All token-related tables have RLS policies to ensure secure access control.

8. **Consider Token Hierarchies**: When designing token-based access control, consider the hierarchical nature of tokens and how permissions should be inherited.

9. **Integrate with the Existing RBAC System**: The token-based access control system should be integrated with the existing RBAC system to provide a comprehensive access control solution.

## Conclusion

The token-based access control system provides a flexible and secure way to control access to resources based on token ownership, enhancing the overall security posture of the application while aligning with Avolve's business model and token structure.
