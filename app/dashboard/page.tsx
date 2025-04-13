'use client'

import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/dashboard/dashboard';
import { TokenBalance } from '@/components/token/TokenBalance';
import { QuestProgress } from '@/components/quest/QuestProgress';

interface TokenType {
  id: string;
  name: string;
}

interface UserToken {
  token_type_id: string;
  balance: number;
}

interface TokenBalanceData {
  name: string;
  balance: number;
}

interface UserQuest {
  quest_id: string;
  status: string;
  progress: number;
}

interface Quest {
  id: string;
  title: string;
  category: string;
}

interface QuestProgressData {
  title: string;
  category: string;
  status: string;
  progress: number;
}

export default async function DashboardPage() {
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
  }

  // Fetch token types to map token_type_id to names
  const { data: tokenTypes, error: typesError } = await supabase
    .from('token_types')
    .select('id, name');

  if (typesError) {
    console.error('Error fetching token types:', typesError.message);
  }

  // Map token balances with token names
  const tokenBalances: TokenBalanceData[] = userTokens?.map((token: UserToken) => {
    const type = tokenTypes?.find((t: TokenType) => t.id === token.token_type_id);
    return {
      name: type ? type.name : 'Unknown Token',
      balance: token.balance
    };
  }) || [];

  // Fetch user quests progress
  const { data: userQuests, error: questsError } = await supabase
    .from('user_quests')
    .select('quest_id, status, progress')
    .eq('user_id', user.id);

  if (questsError) {
    console.error('Error fetching quest progress:', questsError.message);
  }

  // Fetch quest details
  const questIds = userQuests?.map((q: UserQuest) => q.quest_id) || [];
  const { data: quests, error: questDetailsError } = await supabase
    .from('quests')
    .select('id, title, category')
    .in('id', questIds);

  if (questDetailsError) {
    console.error('Error fetching quest details:', questDetailsError.message);
  }

  // Map quest progress with quest details
  const questProgress: QuestProgressData[] = userQuests?.map((uq: UserQuest) => {
    const quest = quests?.find((q: Quest) => q.id === uq.quest_id);
    return {
      title: quest ? quest.title : 'Unknown Quest',
      category: quest ? quest.category : 'Unknown',
      status: uq.status,
      progress: uq.progress
    };
  }) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Dashboard>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <h2 className="text-2xl font-bold mb-4">Token Balances</h2>
            {tokenBalances.length > 0 ? (
              tokenBalances.map((token: TokenBalanceData, index: number) => (
                <TokenBalance key={index} name={token.name} balance={token.balance} />
              ))
            ) : (
              <p className="text-muted-foreground">No tokens found.</p>
            )}
          </div>
          <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <h2 className="text-2xl font-bold mb-4">Quest Progress</h2>
            {questProgress.length > 0 ? (
              questProgress.map((quest: QuestProgressData, index: number) => (
                <QuestProgress 
                  key={index} 
                  title={quest.title} 
                  category={quest.category} 
                  status={quest.status} 
                  progress={quest.progress} 
                />
              ))
            ) : (
              <p className="text-muted-foreground">No quests found.</p>
            )}
          </div>
        </div>
      </Dashboard>
    </div>
  );
}
