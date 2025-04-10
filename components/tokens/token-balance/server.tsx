/**
 * Token Balance Server Component
 * 
 * Displays user's token balances with real-time updates
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { TokenBalanceClient } from './client';

// Types
import type { Database } from '@/types/supabase';

export async function TokenBalanceServer({ userId }: { userId: string }) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch user's token balances
  const { data: userTokens } = await supabase
    .from('user_tokens')
    .select('token_id, balance')
    .eq('user_id', userId);
  
  // Fetch token metadata
  const { data: tokens } = await supabase
    .from('tokens')
    .select('id, name, symbol, icon, description, is_primary');
  
  // Create a map of token metadata for easier lookup
  const tokenMetadata = (tokens || []).reduce((acc, token) => {
    acc[token.id] = token;
    return acc;
  }, {} as Record<string, any>);
  
  // Format token balances with metadata
  const formattedTokens = (userTokens || []).map(userToken => {
    const metadata = tokenMetadata[userToken.token_id] || {
      name: userToken.token_id,
      symbol: userToken.token_id,
      icon: 'default-token.svg',
      is_primary: false
    };
    
    return {
      id: userToken.token_id,
      balance: userToken.balance,
      name: metadata.name,
      symbol: metadata.symbol,
      icon: metadata.icon,
      description: metadata.description,
      isPrimary: metadata.is_primary
    };
  });
  
  // Sort tokens with primary tokens first
  const sortedTokens = formattedTokens.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.symbol.localeCompare(b.symbol);
  });
  
  // Get recent token transactions
  const { data: recentTransactions } = await supabase
    .from('token_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  
  return (
    <TokenBalanceClient 
      tokens={sortedTokens}
      recentTransactions={recentTransactions || []}
      userId={userId}
    />
  );
}
