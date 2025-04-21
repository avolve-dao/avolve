import React from 'react';

interface TokenBalanceProps {
  name: string;
  balance: number;
}

export const TokenBalance: React.FC<TokenBalanceProps> = ({ name, balance }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-zinc-200 last:border-b-0">
      <span className="font-medium text-foreground">{name}</span>
      <span className="text-muted-foreground">{balance.toFixed(2)}</span>
    </div>
  );
};
