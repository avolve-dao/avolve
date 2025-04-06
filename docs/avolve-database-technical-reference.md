# Avolve Database Technical Reference

## Overview

This document provides technical details about the Avolve database schema, including SQL definitions, function implementations, and usage examples for developers working with the platform's token-based access system.

## Schema Definitions

### Tokens Table

```sql
CREATE TABLE public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  gradient_class TEXT,
  total_supply NUMERIC NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  blockchain_contract TEXT,
  chain_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  is_transferable BOOLEAN DEFAULT true,
  transfer_fee NUMERIC DEFAULT 0,
  parent_token_id UUID REFERENCES public.tokens(id)
);

-- Enable Row Level Security
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for anon users to view tokens
CREATE POLICY "Tokens are viewable by everyone" 
  ON public.tokens FOR SELECT 
  USING (true);
```

### User Tokens Table

```sql
CREATE TABLE public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  token_id UUID NOT NULL REFERENCES public.tokens(id),
  balance NUMERIC NOT NULL DEFAULT 0,
  staked_balance NUMERIC NOT NULL DEFAULT 0,
  pending_release NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, token_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own tokens
CREATE POLICY "Users can view their own tokens" 
  ON public.user_tokens FOR SELECT 
  USING (auth.uid() = user_id);
```

### Token Transactions Table

```sql
CREATE TABLE public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES public.tokens(id),
  from_user_id UUID REFERENCES auth.users(id),
  to_user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  transaction_type TEXT NOT NULL,
  reason TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view transactions they're involved in
CREATE POLICY "Users can view their own transactions" 
  ON public.token_transactions FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
```

### Pillars Table

```sql
CREATE TABLE public.pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  gradient_class TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  token_symbol TEXT,
  chain_id TEXT
);

-- Enable Row Level Security
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;

-- Create policy for everyone to view pillars
CREATE POLICY "Pillars are viewable by everyone" 
  ON public.pillars FOR SELECT 
  USING (true);
```

### Sections Table

```sql
CREATE TABLE public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID NOT NULL REFERENCES public.pillars(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon TEXT,
  gradient_class TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  token_symbol TEXT,
  chain_id TEXT,
  UNIQUE(pillar_id, slug)
);

-- Enable Row Level Security
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Create policy for everyone to view sections
CREATE POLICY "Sections are viewable by everyone" 
  ON public.sections FOR SELECT 
  USING (true);
```

## Core Functions

### Token Hierarchy Function

```sql
CREATE OR REPLACE FUNCTION public.get_token_hierarchy()
RETURNS TABLE (
  id UUID,
  symbol TEXT,
  name TEXT,
  description TEXT,
  gradient_class TEXT,
  is_primary BOOLEAN,
  parent_token_id UUID,
  parent_symbol TEXT,
  level INT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE token_tree AS (
    -- Base case: get all root tokens (those without a parent)
    SELECT 
      t.id,
      t.symbol,
      t.name,
      t.description,
      t.gradient_class,
      t.is_primary,
      t.parent_token_id,
      NULL::TEXT AS parent_symbol,
      0 AS level
    FROM public.tokens t
    WHERE t.parent_token_id IS NULL
    
    UNION ALL
    
    -- Recursive case: get all child tokens
    SELECT 
      c.id,
      c.symbol,
      c.name,
      c.description,
      c.gradient_class,
      c.is_primary,
      c.parent_token_id,
      p.symbol AS parent_symbol,
      p.level + 1 AS level
    FROM public.tokens c
    JOIN token_tree p ON p.id = c.parent_token_id
  )
  SELECT * FROM token_tree
  ORDER BY level, symbol;
END;
$$;
```

### Token Balance Check Function

```sql
CREATE OR REPLACE FUNCTION public.has_sufficient_token_balance(
  p_user_id UUID,
  p_token_symbol TEXT,
  p_required_amount NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_token_id UUID;
  v_balance NUMERIC;
BEGIN
  -- Get the token ID for the given symbol
  SELECT id INTO v_token_id
  FROM public.tokens
  WHERE symbol = p_token_symbol;
  
  IF v_token_id IS NULL THEN
    RETURN false; -- Token does not exist
  END IF;
  
  -- Get the user's balance for this token
  SELECT balance INTO v_balance
  FROM public.user_tokens
  WHERE user_id = p_user_id AND token_id = v_token_id;
  
  -- If the user does not have this token, balance is 0
  IF v_balance IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if balance is sufficient
  RETURN v_balance >= p_required_amount;
END;
$$;
```

### Token Ownership Check Function

```sql
CREATE OR REPLACE FUNCTION public.has_token(
  p_user_id UUID,
  p_token_symbol TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_token_id UUID;
  v_has_token BOOLEAN;
BEGIN
  -- Get the token ID for the given symbol
  SELECT id INTO v_token_id
  FROM public.tokens
  WHERE symbol = p_token_symbol;
  
  IF v_token_id IS NULL THEN
    RETURN false; -- Token does not exist
  END IF;
  
  -- Check if the user has this token with a positive balance
  SELECT EXISTS(
    SELECT 1
    FROM public.user_tokens
    WHERE user_id = p_user_id 
    AND token_id = v_token_id
    AND balance > 0
  ) INTO v_has_token;
  
  RETURN v_has_token;
END;
$$;
```

## Usage Examples

### Checking Token Ownership

```sql
-- Check if a user has the GEN token
SELECT public.has_token('user-uuid-here', 'GEN');

-- Check if a user has sufficient GEN token balance
SELECT public.has_sufficient_token_balance('user-uuid-here', 'GEN', 100);
```

### Getting Token Hierarchy

```sql
-- Get the complete token hierarchy
SELECT * FROM public.get_token_hierarchy();

-- Get tokens at a specific level
SELECT * FROM public.get_token_hierarchy() WHERE level = 1;

-- Get child tokens of a specific parent
SELECT * FROM public.get_token_hierarchy() WHERE parent_symbol = 'SAP';
```

### Querying Pillars and Sections

```sql
-- Get all pillars with their associated token symbols
SELECT p.title, p.token_symbol
FROM public.pillars p
ORDER BY p.display_order;

-- Get all sections for a specific pillar
SELECT s.title, s.token_symbol
FROM public.sections s
JOIN public.pillars p ON s.pillar_id = p.id
WHERE p.slug = 'superachiever'
ORDER BY s.display_order;
```

## Token-Based Access Control

### Row-Level Security Policies

```sql
-- Example policy for token-gated content
CREATE POLICY "Access content based on token ownership"
ON public.content
FOR SELECT
USING (
  public.has_token(auth.uid(), 
    (SELECT token_symbol FROM public.sections WHERE id = section_id)
  )
);
```

### Function to Check Access to Resources

```sql
CREATE OR REPLACE FUNCTION public.has_access_to_resource(
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_token_symbol TEXT;
BEGIN
  -- Determine the required token based on the resource type and ID
  CASE p_resource_type
    WHEN 'pillar' THEN
      SELECT token_symbol INTO v_token_symbol
      FROM public.pillars
      WHERE id = p_resource_id;
    
    WHEN 'section' THEN
      SELECT token_symbol INTO v_token_symbol
      FROM public.sections
      WHERE id = p_resource_id;
    
    ELSE
      RETURN false; -- Unknown resource type
  END CASE;
  
  IF v_token_symbol IS NULL THEN
    RETURN false; -- Resource does not exist or does not have a token requirement
  END IF;
  
  -- Check if the user has the required token
  RETURN public.has_token(p_user_id, v_token_symbol);
END;
$$;
```

## Best Practices

1. **Always Use Row-Level Security**: Ensure all tables have appropriate RLS policies to protect data.

2. **Use Token Hierarchy for Access Control**: Leverage the hierarchical token structure for access control. Users with parent tokens should have access to resources requiring child tokens.

3. **Optimize Token Queries**: Use indexes on token-related columns to optimize query performance.

4. **Validate Token Operations**: Always validate token operations (transfers, staking, etc.) to ensure they follow the platform's rules.

5. **Use Transactions for Token Operations**: Wrap token operations in transactions to ensure atomicity.

6. **Audit Token Operations**: Log all token operations for audit purposes.

7. **Implement Rate Limiting**: Implement rate limiting for token operations to prevent abuse.

## Future Enhancements

1. **Blockchain Integration**: Prepare for future integration with Psibase by implementing bridge components for data synchronization.

2. **Advanced Tokenomics**: Implement advanced tokenomics features such as token staking, rewards, and governance.

3. **Token Analytics**: Implement analytics for token usage, distribution, and value.

4. **Token Exchange**: Implement a token exchange system for users to exchange tokens.

5. **Token Governance**: Implement token-based governance mechanisms for platform decisions.

## Conclusion

This technical reference provides the foundation for working with the Avolve database and token-based access system. By following these guidelines and best practices, developers can build powerful features that leverage the platform's token structure and access control mechanisms.
