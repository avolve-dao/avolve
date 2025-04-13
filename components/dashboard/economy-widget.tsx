/**
 * Economy Dashboard Widget
 * 
 * Displays token balances and recent transactions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEconomyApi } from '@/lib/api/hooks';
import { Token, TokenTransaction, UserToken } from '@/lib/types/database.types';
import { useUser } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function EconomyWidget() {
  const economyApi = useEconomyApi();
  const { user } = useUser();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [userTokens, setUserTokens] = useState<UserToken[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const tokensData = await economyApi.getTokens();
        setTokens(tokensData);

        if (user?.id) {
          const userTokensData = await economyApi.getUserTokens(user.id);
          setUserTokens(userTokensData);
          
          const transactionsData = await economyApi.getUserTransactions(user.id, 5);
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error('Error loading economy data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [economyApi, user?.id]);

  // Helper to get token details by ID
  const getTokenDetails = (tokenId: string) => {
    return tokens.find(token => token.id === tokenId);
  };

  // Format transaction type for display
  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'Transfer';
      case 'reward':
        return 'Reward';
      case 'mint':
        return 'Mint';
      case 'burn':
        return 'Burn';
      case 'stake':
        return 'Stake';
      case 'unstake':
        return 'Unstake';
      case 'pending_release':
        return 'Pending Release';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Token Economy</CardTitle>
        <CardDescription>Your token balances and recent transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Your Balances</h3>
              <div className="grid grid-cols-2 gap-2">
                {userTokens.map((userToken) => {
                  const token = getTokenDetails(userToken.token_id);
                  return (
                    <div 
                      key={userToken.id} 
                      className={`p-3 rounded-lg ${token?.gradient_class || 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          {token?.icon_url ? (
                            <img src={token.icon_url} alt={token?.name} className="w-5 h-5 mr-2" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-white/20 mr-2 flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {token?.symbol.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-white font-medium">{token?.symbol || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="text-white text-lg font-bold">{userToken.balance.toLocaleString()}</div>
                      {userToken.staked_balance > 0 && (
                        <div className="text-white/80 text-xs mt-1">
                          {userToken.staked_balance.toLocaleString()} staked
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {userTokens.length === 0 && (
                  <div className="col-span-2 text-center py-4 text-muted-foreground">
                    No tokens yet. Complete activities to earn tokens.
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.map((transaction) => {
                  const token = getTokenDetails(transaction.token_id);
                  const isIncoming = transaction.to_user_id === user?.id;
                  
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isIncoming ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isIncoming ? (
                              <path d="M12 3v18m0-18l-4 4m4-4l4 4" />
                            ) : (
                              <path d="M12 21V3m0 18l-4-4m4 4l4-4" />
                            )}
                          </svg>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">
                            {isIncoming ? 'Received' : 'Sent'} {transaction.amount} {token?.symbol || 'tokens'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{formatTransactionType(transaction.transaction_type)}</Badge>
                    </div>
                  );
                })}
                
                {transactions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent transactions.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
