## 🧩 Database Functions

Our token system comes to life through a set of powerful database functions that handle permissions, balances, and transactions. These functions follow Supabase best practices with `SECURITY INVOKER` and empty search paths.

### 🔍 has_permission_enhanced_with_tokens()

This function extends our RBAC system by checking if a user has permission through either roles OR token ownership.

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
  return exists(
    select 1
    from public.token_permissions tp
    join public.permissions p on tp.permission_id = p.id
    join public.token_balances tb on tp.token_type_id = (
      select token_type_id from public.tokens where id = tb.token_id
    )
    where tb.user_id = p_user_id
    and p.resource = p_resource
    and p.action = p_action
    and tb.balance >= tp.min_balance
  );
end;
$$;
```

> 🔀 **Dual-Path Permissions**: This function first checks traditional role-based permissions, then falls back to token-based permissions if needed.

### 📋 get_user_permissions_with_tokens()

Gets all permissions for a user, including those granted through token ownership.

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
  join public.token_balances tb on tp.token_type_id = (
    select token_type_id from public.tokens where id = tb.token_id
  )
  where tb.user_id = p_user_id
  and tb.balance >= tp.min_balance;
end;
$$;
```

> 🔄 **Union of Permissions**: This function returns the union of permissions from both roles and tokens, eliminating duplicates with `distinct`.

### 💸 transfer_tokens()

Handles the secure transfer of tokens between users, including fee calculation and transaction recording.

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
      'message', 'Amount must be greater than zero'
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
      'message', 'This token is not transferable'
    );
  end if;
  
  -- Check if sender has enough balance
  select balance into v_from_balance
  from public.token_balances
  where user_id = p_from_user_id and token_id = p_token_id;
  
  if not found or v_from_balance < p_amount then
    return json_build_object(
      'success', false,
      'message', 'Insufficient balance'
    );
  end if;
  
  -- Calculate fee and transfer amount
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
    balance = token_balances.balance + v_transfer_amount,
    updated_at = now();
    
  -- Record the transaction
  insert into public.token_transactions (
    token_id,
    from_user_id,
    to_user_id,
    amount,
    fee,
    transaction_type,
    status,
    metadata
  )
  values (
    p_token_id,
    p_from_user_id,
    p_to_user_id,
    p_amount,
    v_fee,
    'transfer',
    'completed',
    json_build_object(
      'amount', p_amount,
      'fee', v_fee
    )
  )
  returning id into v_transaction_id;
  
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

> 🛡️ **Robust Validation**: This function performs multiple validation checks before processing a transfer:
> - Prevents self-transfers
> - Validates positive amounts
> - Checks token existence and transferability
> - Verifies sufficient balance

## 🖥️ Client-Side Implementation

Our token system isn't just powerful in the database—it's also beautifully integrated into the frontend application with a set of intuitive services and hooks.

### 🛠️ TokenService

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
        .select('*, token_types(*)');

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
        .select('*, token_types(*)')
        .eq('id', tokenId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error getting token by ID:', error);
      return { data: null, error };
    }
  }

  // User token management
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
      return { data: 0, error };
    }
  }

  // Token-based permissions
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

  // Token transfer
  async transferTokens(toUserId: string, tokenId: string, amount: number) {
    try {
      const { user } = await this.client.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First check if token is transferable
      const { data: token } = await this.getTokenById(tokenId);
      if (!token) throw new Error('Token not found');
      
      if (!token.is_transferable) {
        throw new Error('This token is not transferable');
      }

      // Calculate potential fee
      const fee = amount * (token.transfer_fee || 0);
      const transferAmount = amount - fee;

      // Confirm with user if there's a fee
      if (fee > 0) {
        const confirmMessage = `This transfer will incur a fee of ${fee} tokens. You will transfer ${amount} tokens, but the recipient will receive ${transferAmount} tokens. Do you want to proceed?`;
        if (!confirm(confirmMessage)) {
          return { success: false, message: 'Transfer cancelled by user' };
        }
      }

      const { data, error } = await this.client.rpc('transfer_tokens', {
        p_from_user_id: user.id,
        p_to_user_id: toUserId,
        p_token_id: tokenId,
        p_amount: amount
      });

      if (error) throw error;
      
      // Log the transfer in audit logs
      await this.auditService.logAction(
        'token_transfer',
        'token',
        tokenId,
        toUserId,
        { amount, fee, transferAmount }
      );
      
      return data;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return { success: false, message: error.message };
    }
  }
}
```

> 💎 **Complete Token Management**: The TokenService provides a comprehensive API for all token-related operations, from querying balances to executing transfers.

### 🪝 useToken Hook

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
  const { auditService } = useAudit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const tokenService = new TokenService(supabase);
  tokenService.auditService = auditService;
  
  const getUserTokens = useCallback(async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await tokenService.getUserTokens(user.id);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, tokenService]);
  
  const transferTokens = useCallback(async (toUserId: string, tokenId: string, amount: number) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await tokenService.transferTokens(toUserId, tokenId, amount);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, tokenService]);
  
  return {
    getUserTokens,
    transferTokens,
    loading,
    error
  };
}
```

> 🧪 **React Integration**: The useToken hook makes it easy to integrate token functionality into React components with loading and error states.

### 🔐 useTokenRBAC Hook

The `useTokenRBAC` hook integrates with the existing `useRBAC` hook to provide a comprehensive access control solution:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../supabase/use-supabase';
import { TokenService } from './token-service';
import { useAuth } from '../auth/use-auth';
import { useRBAC } from '../rbac/use-rbac';

export function useTokenRBAC() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const rbac = useRBAC();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const tokenService = new TokenService(supabase);
  
  const hasPermissionEnhanced = useCallback(async (resource: string, action: string) => {
    if (!user) return false;
    
    // First check traditional RBAC permissions
    const hasRbacPermission = await rbac.hasPermission(resource, action);
    if (hasRbacPermission) return true;
    
    // If no RBAC permission, check token-based permissions
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await tokenService.hasPermissionViaToken(
        user.id,
        resource,
        action
      );
      
      if (error) throw error;
      return !!data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, rbac, tokenService]);
  
  const getAllPermissions = useCallback(async () => {
    if (!user) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await tokenService.getUserPermissionsWithTokens(user.id);
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, tokenService]);
  
  return {
    ...rbac,
    hasPermissionEnhanced,
    getAllPermissions,
    loading,
    error
  };
}
```

> 🔄 **Seamless Integration**: This hook extends the traditional RBAC system with token-based permissions, providing a unified API for access control.

### 📊 TokenBalanceDisplay Component

Here's an example of a component that displays a user's token balances:

```tsx
import React, { useEffect, useState } from 'react';
import { useToken } from '@/hooks/use-token';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export const TokenBalanceDisplay: React.FC = () => {
  const { getUserTokens, loading, error } = useToken();
  const [tokens, setTokens] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchTokens = async () => {
      const userTokens = await getUserTokens();
      setTokens(userTokens);
    };
    
    fetchTokens();
  }, [getUserTokens]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Token Balances</CardTitle>
        <CardDescription>
          View and manage your token portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : tokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No tokens found
                </TableCell>
              </TableRow>
            ) : (
              tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>{token.tokens.name}</TableCell>
                  <TableCell>{token.tokens.symbol}</TableCell>
                  <TableCell>{token.balance}</TableCell>
                  <TableCell>
                    {new Date(token.last_updated).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
```

### 💱 TokenTransferForm Component

And here's a component for transferring tokens between users:

```tsx
import React, { useState, useEffect } from 'react';
import { useToken } from '@/hooks/use-token';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export const TokenTransferForm: React.FC = () => {
  const { getUserTokens, transferTokens, loading, error } = useToken();
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchTokens = async () => {
      const userTokens = await getUserTokens();
      setTokens(userTokens);
      
      if (userTokens.length > 0) {
        setSelectedToken(userTokens[0].tokens.id);
      }
    };
    
    fetchTokens();
  }, [getUserTokens]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    try {
      const result = await transferTokens(recipient, selectedToken, amount);
      setSuccess(true);
      setRecipient('');
      setAmount(0);
    } catch (err) {
      // Error is already handled by the hook
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Tokens transferred successfully!</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="token">Token</label>
              <Select
                id="token"
                value={selectedToken}
                onValueChange={setSelectedToken}
                disabled={loading || tokens.length === 0}
              >
                {tokens.map((token) => (
                  <option key={token.tokens.id} value={token.tokens.id}>
                    {token.tokens.name} ({token.tokens.symbol}) - Balance: {token.balance}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="recipient">Recipient ID</label>
              <Input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="amount">Amount</label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={loading || !selectedToken || !recipient || amount <= 0}
          >
            {loading ? 'Processing...' : 'Transfer Tokens'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

> 🎨 **Beautiful UI Components**: These components provide a polished, user-friendly interface for interacting with the token system.
