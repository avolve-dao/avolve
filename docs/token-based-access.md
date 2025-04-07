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

# Token-Based Access System

## Overview

The Avolve platform implements a sophisticated token-based access control system that aligns with the platform's three main pillars:

1. **Superachiever** - Individual journey of transformation (Stone gradient) (SAP token)
2. **Superachievers** - Collective journey of transformation (Slate gradient) (SCQ token)
3. **Supercivilization** - Ecosystem journey for transformation (Zinc gradient) (GEN token)

This hierarchical token structure enables granular access control to different features and content within the platform, creating a seamless progression path for users as they earn and accumulate tokens.

## Token Hierarchy

The token hierarchy follows a parent-child relationship:

```
GEN (Supercivilization)
├── SAP (Superachiever)
│   ├── PSP (Personal Success Puzzle)
│   ├── BSP (Business Success Puzzle)
│   └── SMS (Supermind Superpowers)
└── SCQ (Superachievers)
    ├── SPD (Superpuzzle Developments)
    ├── SHE (Superhuman Enhancements)
    ├── SSA (Supersociety Advancements)
    └── SGB (Supergenius Breakthroughs)
```

Each token has specific properties:
- **Symbol**: Unique identifier (e.g., GEN, SAP)
- **Name**: Human-readable name
- **Description**: Detailed description
- **Gradient Class**: CSS gradient for visual representation
- **Is Primary**: Whether it's a primary token
- **Is Transferable**: Whether users can transfer it
- **Transfer Fee**: Fee applied to transfers (if any)

## Database Implementation

The token system is implemented in the database with the following key tables:

- **tokens**: Stores token definitions and relationships
- **user_tokens**: Tracks token ownership and balances
- **token_transactions**: Records all token movements
- **token_staking**: Manages token staking
- **staking_rewards**: Tracks rewards from staking
- **token_rewards**: Defines reward rules for activities

These tables work together to create a comprehensive token economy within the platform.

## Server-Side Implementation

The server-side implementation includes several PostgreSQL functions for token management:

### Core Functions

```sql
-- Check if a user has a specific token
has_token(user_id, token_symbol)

-- Check if a user has sufficient token balance
has_sufficient_token_balance(user_id, token_symbol, required_amount)

-- Check if a user has access to a specific resource
has_access_to_resource(user_id, resource_type, resource_id)

-- Get all resources a user has access to
get_accessible_resources(user_id)

-- Award tokens to a user
award_token(user_id, token_symbol, amount, reason)

-- Transfer tokens between users
transfer_token(from_user_id, to_user_id, token_symbol, amount, reason)

-- Stake tokens
stake_token(user_id, token_symbol, amount, lock_period_days)

-- Unstake tokens
unstake_token(staking_id)

-- Distribute staking rewards
distribute_staking_rewards()

-- Claim staking rewards
claim_staking_rewards(user_id, token_symbol)
```

### Row-Level Security

The database implements Row-Level Security (RLS) policies to ensure users can only access data they're authorized to see:

```sql
-- Tokens are viewable by everyone
create policy "Tokens are viewable by everyone" 
  on public.tokens for select 
  using (true);

-- Only allow access to resources based on token ownership
create policy "Access resources based on tokens" 
  on public.components for select 
  using (
    auth.uid() = user_id or 
    public.has_access_to_resource(auth.uid(), 'component', id)
  );
```

## Client-Side Implementation

The client-side implementation provides React hooks and components for interacting with the token system:

### Hooks

#### `useToken` Hook

The `useToken` hook provides token-related functionality for React components:

```tsx
const { 
  getUserTokens,
  getAllTokenTypes,
  getUserTokenBalance,
  awardToken,
  transferToken,
  stakeToken,
  unstakeToken,
  claimRewards
} = useToken();
```

#### `useTokenRBAC` Hook

The `useTokenRBAC` hook extends the RBAC system with token-based permissions:

```tsx
const {
  hasToken,
  hasSufficientTokenBalance,
  hasAccessToResource,
  getAccessibleResources,
  checkAccess
} = useTokenRBAC();
```

### Components

#### `TokenBadge` Component

The `TokenBadge` component visualizes token ownership with optional balance and tooltip information:

```tsx
<TokenBadge 
  tokenCode="GEN"
  tokenName="Supercivilization"
  tokenSymbol="GEN"
  showBalance={true}
  size="lg"
/>
```

#### `TokenSidebarDisplay` Component

The `TokenSidebarDisplay` component shows the user's tokens in a hierarchical structure that matches Avolve's three pillars:

```tsx
<TokenSidebarDisplay />
```

#### `TokenStats` Component

The `TokenStats` component displays token-related progress and statistics:

```tsx
<TokenStats 
  tokenCode="SAP"
  tokenName="Superachiever"
  tokenSymbol="SAP"
  gradientClass="from-stone-500 to-stone-700"
/>
```

#### `RouteCard` Component

The `RouteCard` component provides a consistent card for navigation with token visualization:

```tsx
<RouteCard
  title="Personal Success Puzzle"
  description="Manage your personal goals and achievements."
  href="/personal"
  gradientClass="from-amber-500 to-yellow-500"
  tokenCode="PSP"
  tokenName="Personal Success Puzzle"
  tokenSymbol="PSP"
  icon={<Heart className="h-5 w-5" />}
/>
```

## Usage Examples

### Checking Access

```tsx
// Check if the user has a specific token
const hasGenToken = await hasToken('GEN');

// Check if the user has sufficient token balance
const hasSufficientBalance = await hasSufficientTokenBalance('GEN', 100);

// Check if the user has access to a specific resource
const hasAccess = await hasAccessToResource('component', componentId);
```

### Token Transactions

```tsx
// Award tokens to a user
await awardToken('GEN', 100, 'Completed onboarding');

// Transfer tokens to another user
await transferToken(recipientId, 'GEN', 50, 'Gift');

// Stake tokens
await stakeToken('GEN', 200, 30); // Stake 200 GEN for 30 days

// Claim rewards
await claimRewards('GEN');
```

### UI Integration

```tsx
// Display token information in a component
function TokenDisplay() {
  const { getUserTokens } = useToken();
  const [tokens, setTokens] = useState([]);
  
  useEffect(() => {
    async function fetchTokens() {
      const result = await getUserTokens();
      if (result.data) {
        setTokens(result.data);
      }
    }
    
    fetchTokens();
  }, [getUserTokens]);
  
  return (
    <div>
      <h2>Your Tokens</h2>
      {tokens.map(token => (
        <TokenBadge 
          key={token.id}
          tokenCode={token.symbol}
          tokenName={token.name}
          tokenSymbol={token.symbol}
          showBalance={true}
        />
      ))}
    </div>
  );
}
```

## Token-Based UI Navigation

The Avolve platform uses tokens to control access to different sections of the UI:

1. **Main Navigation**: The sidebar displays only the pillars and sections the user has tokens for
2. **Route Cards**: Cards for different sections display token badges and are only clickable if the user has the required tokens
3. **Progress Tracking**: Token statistics show progress toward earning more tokens and unlocking new features

This creates a seamless experience where the UI naturally evolves as users earn more tokens and gain access to new features and content.

## Conclusion

The token-based access system is a core feature of the Avolve platform, enabling a sophisticated progression system that aligns with the platform's three pillars. By integrating tokens into both the database schema and UI components, we create a cohesive experience that encourages users to engage with the platform and earn tokens to unlock new features and content.
