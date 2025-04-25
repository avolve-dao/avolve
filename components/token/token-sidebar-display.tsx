'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTokens } from '@/hooks/use-tokens';
import { TokenBadge } from './token-badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface TokenHierarchyItem {
  code: string;
  name: string;
  symbol: string;
  children?: TokenHierarchyItem[];
}

interface TokenBalance {
  token_code: string;
  balance: number;
}

/**
 * TokenSidebarDisplay component shows the user's tokens in a hierarchical structure
 * that matches Avolve's three pillars and token hierarchy.
 */
export function TokenSidebarDisplay() {
  const { getAllTokenTypes, getUserTokenBalance, isLoading } = useTokens();
  const [tokenHierarchy, setTokenHierarchy] = React.useState<TokenHierarchyItem[]>([]);
  const [userTokens, setUserTokens] = React.useState<Record<string, number>>({});
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    GEN: true,
    SAP: false,
    SCQ: false,
  });

  // Fetch token types and user tokens
  React.useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // Get all token types to build hierarchy
        const tokenTypes = await getAllTokenTypes();
        if (tokenTypes) {
          // Build token hierarchy
          const hierarchy = buildTokenHierarchy(tokenTypes);
          setTokenHierarchy(hierarchy);

          // For each token type, get the user's balance
          const balances: Record<string, number> = {};
          for (const tokenType of tokenTypes) {
            if (tokenType.code) {
              const result = await getUserTokenBalance(tokenType.code);
              balances[tokenType.code] = result.data || 0;
            }
          }
          setUserTokens(balances);
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };

    fetchTokenData();
  }, [getAllTokenTypes, getUserTokenBalance]);

  // Build token hierarchy from flat list
  const buildTokenHierarchy = (tokenTypes: any[]): TokenHierarchyItem[] => {
    // Create a map of token types by ID
    const tokenMap: Record<string, any> = {};
    tokenTypes.forEach((token: any) => {
      tokenMap[token.id] = {
        ...token,
        children: [],
      };
    });

    // Build hierarchy
    const rootTokens: TokenHierarchyItem[] = [];
    tokenTypes.forEach((token: any) => {
      if (!token.parent_token_type_id) {
        // This is a root token
        rootTokens.push({
          code: token.code,
          name: token.name,
          symbol: token.symbol || token.code,
          children: [],
        });
      } else if (tokenMap[token.parent_token_type_id]) {
        // This is a child token
        const parent = tokenMap[token.parent_token_type_id];
        parent.children.push({
          code: token.code,
          name: token.name,
          symbol: token.symbol || token.code,
          children: [],
        });
      }
    });

    return rootTokens;
  };

  // Toggle expansion of a token group
  const toggleExpanded = (code: string) => {
    setExpanded(prev => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  // Render a token item with its children
  const renderTokenItem = (token: TokenHierarchyItem, level: number = 0) => {
    const hasChildren = token.children && token.children.length > 0;
    const isExpanded = expanded[token.code] || false;

    return (
      <div key={token.code} className={cn('py-1', level > 0 && 'ml-4')}>
        <div className="flex items-center">
          {hasChildren && (
            <CollapsibleTrigger
              onClick={() => toggleExpanded(token.code)}
              className="mr-1 p-0.5 rounded-sm hover:bg-muted"
            >
              <ChevronRight
                className={cn('h-3 w-3 transition-transform', isExpanded && 'transform rotate-90')}
              />
            </CollapsibleTrigger>
          )}
          {!hasChildren && <div className="w-4" />}

          <TokenBadge
            tokenCode={token.code}
            tokenName={token.name}
            tokenSymbol={token.symbol}
            showBalance={true}
            size={level === 0 ? 'md' : 'sm'}
          />
        </div>

        {hasChildren && (
          <Collapsible open={isExpanded}>
            <CollapsibleContent className="pt-1">
              {token.children?.map(child => renderTokenItem(child, level + 1))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading tokens...</div>;
  }

  return (
    <div className="px-3 py-2 space-y-1">
      <div className="text-sm font-medium mb-2">Your Tokens</div>
      <div className="space-y-1">{tokenHierarchy.map(token => renderTokenItem(token))}</div>
    </div>
  );
}
