import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function EcosystemPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user token balances for Supercivilization tokens
  const { data: userTokens, error: tokensError } = await supabase
    .from('user_tokens')
    .select('token_type_id, balance')
    .eq('user_id', user.id);

  if (tokensError) {
    console.error('Error fetching token balances:', tokensError.message);
  }

  // Fetch token types to map token_type_id to names, filter for Supercivilization category
  const { data: tokenTypes, error: typesError } = await supabase
    .from('token_types')
    .select('id, name, category')
    .eq('category', 'Supercivilization');

  if (typesError) {
    console.error('Error fetching token types:', typesError.message);
  }

  // Map token balances with token names
  const tokenBalances = userTokens?.map(token => {
    const type = tokenTypes?.find(t => t.id === token.token_type_id);
    return {
      name: type ? type.name : 'Unknown Token',
      balance: token.balance
    };
  }).filter(token => token.name !== 'Unknown Token') || [];

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Ecosystem Genesis</h1>
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-6">
        <h2 className="text-2xl font-semibold mb-2">Supercivilization Path</h2>
        <p className="text-muted-foreground mb-4">Contribute to the broader ecosystem and create lasting impact with GEN tokens.</p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4">Your GEN Tokens</h2>
          {tokenBalances.length > 0 ? (
            tokenBalances.map((token, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <span className="font-medium text-foreground">{token.name}</span>
                <span className="text-muted-foreground">{token.balance.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No GEN tokens found. Contribute to the ecosystem to earn rewards!</p>
          )}
        </div>
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4">GEN Fusion</h2>
          <p className="text-muted-foreground mb-4">Fuse your achievements into GEN tokens to support the supercivilization.</p>
          <a href="/super/ecosystem/fusion" className="block text-primary font-medium hover:underline mt-4 text-center">Start GEN Fusion</a>
        </div>
      </div>
    </div>
  );
}
