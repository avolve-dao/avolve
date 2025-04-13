import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function CollectivePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user token balances for Superachievers tokens
  const { data: userTokens, error: tokensError } = await supabase
    .from('user_tokens')
    .select('token_type_id, balance')
    .eq('user_id', user.id);

  if (tokensError) {
    console.error('Error fetching token balances:', tokensError.message);
  }

  // Fetch token types to map token_type_id to names, filter for Superachievers category
  const { data: tokenTypes, error: typesError } = await supabase
    .from('token_types')
    .select('id, name, category')
    .eq('category', 'Superachievers');

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

  // Fetch user quests for collective category
  const { data: userQuests, error: questsError } = await supabase
    .from('user_quests')
    .select('quest_id, status, progress')
    .eq('user_id', user.id);

  if (questsError) {
    console.error('Error fetching quest progress:', questsError.message);
  }

  // Fetch quest details for collective category
  const questIds = userQuests?.map(q => q.quest_id) || [];
  const { data: quests, error: questDetailsError } = await supabase
    .from('quests')
    .select('id, title, category, difficulty')
    .in('id', questIds)
    .eq('category', 'collective');

  if (questDetailsError) {
    console.error('Error fetching quest details:', questDetailsError.message);
  }

  // Map quest progress with quest details
  const questProgress = userQuests?.map(uq => {
    const quest = quests?.find(q => q.id === uq.quest_id);
    return {
      title: quest ? quest.title : 'Unknown Quest',
      category: quest ? quest.category : 'Unknown',
      difficulty: quest ? quest.difficulty : 0,
      status: uq.status,
      progress: uq.progress
    };
  }).filter(quest => quest.category === 'collective') || [];

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Collective Impact</h1>
      <div className="bg-card rounded-lg shadow-md p-6 border border-border mb-6">
        <h2 className="text-2xl font-semibold mb-2">Superachievers Path</h2>
        <p className="text-muted-foreground mb-4">Join forces with others to achieve superhuman enhancements and societal advancements.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4">Your Superachievers Tokens</h2>
          {tokenBalances.length > 0 ? (
            tokenBalances.map((token, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <span className="font-medium text-foreground">{token.name}</span>
                <span className="text-muted-foreground">{token.balance.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No Superachievers tokens found. Collaborate to earn collective rewards!</p>
          )}
        </div>
        <div className="bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-2xl font-bold mb-4">Team Quests</h2>
          {questProgress.length > 0 ? (
            questProgress.map((quest, index) => (
              <div key={index} className="py-2 border-b border-border last:border-b-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-foreground">{quest.title}</span>
                  <span className="text-sm text-muted-foreground">{quest.status.charAt(0).toUpperCase() + quest.status.slice(1).replace('_', ' ')}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-1">Difficulty: {quest.difficulty}</div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${quest.progress}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-muted-foreground mt-1">{quest.progress}% Complete</div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No team quests found. Join a collective to start contributing!</p>
          )}
          <a href="/super/collective/quests" className="block text-primary font-medium hover:underline mt-4 text-center">View All Team Quests</a>
        </div>
      </div>
    </div>
  );
}
