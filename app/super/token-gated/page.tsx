import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function TokenGatedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user token balances
  const { data: userTokens, error: tokensError } = await supabase
    .from('user_tokens')
    .select('token_type_id, balance')
    .eq('user_id', user.id);

  if (tokensError) {
    console.error('Error fetching token balances:', tokensError.message);
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Token-Gated Content</h1>
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <p className="text-red-500">Error loading your token balances. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Fetch token types to map token_type_id to names
  const { data: tokenTypes, error: typesError } = await supabase
    .from('token_types')
    .select('id, name');

  if (typesError) {
    console.error('Error fetching token types:', typesError.message);
    return (
      <div className="flex flex-col min-h-screen p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Token-Gated Content</h1>
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <p className="text-red-500">Error loading token information. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Map token balances with token names
  const tokenBalances = userTokens?.map(token => {
    const type = tokenTypes?.find(t => t.id === token.token_type_id);
    return {
      name: type ? type.name : 'Unknown Token',
      balance: token.balance
    };
  }) || [];

  // Check for specific token balance - for example, requiring at least 100 of a specific token
  const requiredToken = 'Superachiever Token'; // Example token name
  const requiredBalance = 100;
  const hasAccess = tokenBalances.some(token => token.name === requiredToken && token.balance >= requiredBalance);

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Token-Gated Content</h1>
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-6">
        <h2 className="text-2xl font-semibold mb-2">Exclusive Access Area</h2>
        <p className="text-muted-foreground mb-4">This content is only accessible to users with specific token balances.</p>
        <p className="text-muted-foreground mb-4">Requirement: At least {requiredBalance} {requiredToken}</p>
      </div>
      {hasAccess ? (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-primary">Congratulations! You have access!</h2>
          <p className="text-muted-foreground mb-4">Welcome to the exclusive content area. Here you can find premium resources, special quests, and more.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="text-lg font-medium mb-2">Premium Resource</h3>
              <p className="text-sm text-muted-foreground">Access exclusive guides and materials.</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="text-lg font-medium mb-2">Special Quest</h3>
              <p className="text-sm text-muted-foreground">Participate in unique challenges.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have the required token balance to access this content.</p>
          <p className="text-muted-foreground mb-4">Current balance: {tokenBalances.find(token => token.name === requiredToken)?.balance || 0} {requiredToken}</p>
          <a href="/dashboard" className="inline-block text-primary font-medium hover:underline">Earn more tokens →</a>
        </div>
      )}
    </div>
  );
}
