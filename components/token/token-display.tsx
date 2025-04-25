import { useState } from 'react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TokenDisplayProps {
  token: {
    id: string;
    symbol: string;
    name: string;
    description?: string;
    gradient_class: string;
    icon_url?: string;
    balance?: number;
    staked_balance?: number;
    parent_token_id?: string;
    parent_token_symbol?: string;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  showBalance?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * A component to display a token with its symbol, name, and optional details.
 */
export function TokenDisplay({
  token,
  size = 'md',
  showDetails = false,
  showBalance = false,
  interactive = true,
  onClick,
}: TokenDisplayProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Size mappings
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
  };

  const tokenClass = `${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${token.gradient_class}`;

  const tokenIcon = token.icon_url ? (
    <Image
      src={token.icon_url}
      alt={token.symbol}
      width={size === 'xl' ? 96 : size === 'lg' ? 64 : size === 'md' ? 48 : 32}
      height={size === 'xl' ? 96 : size === 'lg' ? 64 : size === 'md' ? 48 : 32}
      className="rounded-full"
    />
  ) : (
    <div className={tokenClass}>{token.symbol}</div>
  );

  // Basic token display with tooltip
  if (!showDetails && interactive) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="focus:outline-none" onClick={onClick || (() => setDialogOpen(true))}>
              {tokenIcon}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{token.name}</p>
            {showBalance && token.balance !== undefined && (
              <p className="text-xs">Balance: {token.balance}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Non-interactive token display
  if (!interactive) {
    return (
      <div className="flex items-center space-x-2">
        {tokenIcon}
        {showDetails && (
          <div>
            <p className="font-medium">{token.name}</p>
            {token.description && <p className="text-xs text-gray-500">{token.description}</p>}
            {showBalance && token.balance !== undefined && (
              <p className="text-xs">Balance: {token.balance}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Token display with details and dialog
  return (
    <>
      <div
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        onClick={onClick || (() => setDialogOpen(true))}
      >
        {tokenIcon}
        {showDetails && (
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium">{token.name}</p>
              <Badge variant="outline">{token.symbol}</Badge>
            </div>
            {token.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {token.description}
              </p>
            )}
            {showBalance && token.balance !== undefined && (
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">Balance: {token.balance}</Badge>
                {token.staked_balance !== undefined && token.staked_balance > 0 && (
                  <Badge variant="outline">Staked: {token.staked_balance}</Badge>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${token.gradient_class}`}
              >
                {token.symbol}
              </div>
              <span>{token.name}</span>
            </DialogTitle>
            <DialogDescription>{token.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {token.parent_token_symbol && (
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Parent Token</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {token.parent_token_symbol}
                </p>
              </div>
            )}
            {showBalance && token.balance !== undefined && (
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Balance</p>
                <p className="text-sm">{token.balance}</p>
              </div>
            )}
            {showBalance && token.staked_balance !== undefined && token.staked_balance > 0 && (
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Staked Balance</p>
                <p className="text-sm">{token.staked_balance}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
