/**
 * Token Manager Component
 * 
 * This component provides an interface for administrators to manage tokens and token ownership.
 * It allows creating, assigning, and managing tokens within the Avolve platform.
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import Confetti from 'react-confetti';
import { toast } from 'sonner';

// Native window size hook replacement
function useWindowSize() {
  const isClient = typeof window === 'object';
  const getSize = useCallback(() => {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }, [isClient]);
  const [windowSize, setWindowSize] = React.useState(getSize);
  React.useEffect(() => {
    if (!isClient) return;
    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isClient, getSize]);
  return windowSize;
}

interface TokenType {
  id: string;
  name: string;
  symbol: string;
  description: string;
  total_supply: number;
}

interface Token {
  id: string;
  token_type_id: string;
  amount: number;
  created_at: string;
}

interface TokenOwnership {
  id: string;
  token_id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

// TokenManager component for admin dashboard
export default function TokenManager() {
  const { session } = useAuth();
  const user = session?.user;
  const isAdmin = user?.app_metadata?.role === 'admin';
  const supabase = createClientComponentClient();

  // State for token types
  const [tokenTypes, setTokenTypes] = useState<TokenType[]>([]);
  const [loadingTokenTypes, setLoadingTokenTypes] = useState(true);

  // State for tokens
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // State for token ownership
  const [tokenOwnership, setTokenOwnership] = useState<TokenOwnership[]>([]);
  const [loadingOwnership, setLoadingOwnership] = useState(true);

  // Form state for creating token types
  const [newTokenTypeName, setNewTokenTypeName] = useState('');
  const [newTokenTypeSymbol, setNewTokenTypeSymbol] = useState('');
  const [newTokenTypeDescription, setNewTokenTypeDescription] = useState('');
  const [newTokenTypeTotalSupply, setNewTokenTypeTotalSupply] = useState('');
  const [creatingTokenType, setCreatingTokenType] = useState(false);

  // Form state for minting tokens
  const [selectedTokenTypeId, setSelectedTokenTypeId] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintingTokens, setMintingTokens] = useState(false);

  // Form state for transferring tokens
  const [transferTokenId, setTransferTokenId] = useState('');
  const [transferToUserId, setTransferToUserId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferringTokens, setTransferringTokens] = useState(false);

  // Error and success messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Celebration state
  const [celebrate, setCelebrate] = useState(false);
  const { width, height } = useWindowSize();

  // Fetch token types on component mount
  useEffect(() => {
    const fetchTokenTypes = async () => {
      setLoadingTokenTypes(true);
      setError(null);
      const { data, error } = await supabase
        .from('token_types')
        .select('*');
      if (error) {
        setError(error.message);
        setTokenTypes([]);
      } else {
        setTokenTypes(data || []);
      }
      setLoadingTokenTypes(false);
    };
    fetchTokenTypes();
  }, [supabase]);

  // Fetch tokens on component mount
  useEffect(() => {
    const fetchTokens = async () => {
      setLoadingTokens(true);
      setError(null);
      const { data, error } = await supabase
        .from('tokens')
        .select('*');
      if (error) {
        setError(error.message);
        setTokens([]);
      } else {
        setTokens(data || []);
      }
      setLoadingTokens(false);
    };
    fetchTokens();
  }, [supabase]);

  // Fetch token ownership on component mount
  useEffect(() => {
    const fetchTokenOwnership = async () => {
      setLoadingOwnership(true);
      setError(null);
      const { data, error } = await supabase
        .from('token_ownership')
        .select('*');
      if (error) {
        setError(error.message);
        setTokenOwnership([]);
      } else {
        setTokenOwnership(data || []);
      }
      setLoadingOwnership(false);
    };
    fetchTokenOwnership();
  }, [supabase]);

  // Handle creating a new token type
  async function handleCreateTokenType(e: React.FormEvent) {
    e.preventDefault();
    setCreatingTokenType(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase
      .from('token_types')
      .insert({
        name: newTokenTypeName,
        symbol: newTokenTypeSymbol,
        description: newTokenTypeDescription,
        total_supply: Number(newTokenTypeTotalSupply)
      });
    setCreatingTokenType(false);
    if (!error) {
      setSuccess('Token type created successfully!');
      setCelebrate(true);
      toast.success('🎉 Token type created!');
      setNewTokenTypeName('');
      setNewTokenTypeSymbol('');
      setNewTokenTypeDescription('');
      setNewTokenTypeTotalSupply('');
      // Refresh token types
      const { data } = await supabase.from('token_types').select('*');
      setTokenTypes(data || []);
      setTimeout(() => setCelebrate(false), 1800);
    } else {
      setError(error.message);
    }
  };

  // Handle minting tokens
  async function handleMintTokens(e: React.FormEvent) {
    e.preventDefault();
    setMintingTokens(true);
    setError(null);
    setSuccess(null);
    const { error } = await supabase
      .from('tokens')
      .insert({
        token_type_id: selectedTokenTypeId,
        amount: Number(mintAmount),
        created_at: new Date().toISOString()
      });
    setMintingTokens(false);
    if (!error) {
      setSuccess('Tokens minted successfully!');
      setCelebrate(true);
      toast.success('🎉 Tokens minted!');
      setSelectedTokenTypeId('');
      setMintAmount('');
      // Refresh tokens
      const { data } = await supabase.from('tokens').select('*');
      setTokens(data || []);
      setTimeout(() => setCelebrate(false), 1800);
    } else {
      setError(error.message);
    }
  };

  // Handle transferring tokens
  async function handleTransferTokens(e: React.FormEvent) {
    e.preventDefault();
    setTransferringTokens(true);
    setError(null);
    setSuccess(null);
    // Example: update token_ownership table (adjust logic as needed)
    const { error } = await supabase
      .from('token_ownership')
      .upsert({
        token_id: transferTokenId,
        user_id: transferToUserId,
        balance: Number(transferAmount),
        updated_at: new Date().toISOString()
      }, { onConflict: 'token_id,user_id' });
    setTransferringTokens(false);
    if (!error) {
      setSuccess('Tokens transferred successfully!');
      setCelebrate(true);
      toast.success('🎉 Tokens transferred!');
      setTransferTokenId('');
      setTransferToUserId('');
      setTransferAmount('');
      // Refresh ownership
      const { data } = await supabase.from('token_ownership').select('*');
      setTokenOwnership(data || []);
      setTimeout(() => setCelebrate(false), 1800);
    } else {
      setError(error.message);
    }
  };

  // Helper to get token type name by ID
  const getTokenTypeName = (id: string) => {
    const tokenType = tokenTypes.find(tt => tt.id === id);
    return tokenType ? tokenType.name : 'Unknown Token Type';
  };

  if (!isAdmin) {
    return (
      <Card title="Access Denied" className="mb-6">
        <Alert variant="destructive" className="mb-4">
          You do not have permission to access this page.
        </Alert>
      </Card>
    );
  }

  return (
    <div className="token-manager-container relative">
      {celebrate && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <Confetti width={width} height={height} numberOfPieces={350} recycle={false} />
          <span className="text-4xl font-bold mt-8 animate-bounce">🎉</span>
        </div>
      )}
      <h1 className="text-2xl font-bold">Token Manager</h1>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="default" className="mb-4">
          {success}
        </Alert>
      )}

      {/* Create Token Type Form */}
      <Card title="Create Token Type" className="mb-6">
        <form onSubmit={handleCreateTokenType} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tokenTypeName">Name</Label>
            <Input
              id="tokenTypeName"
              value={newTokenTypeName}
              onChange={(e) => setNewTokenTypeName(e.target.value)}
              placeholder="e.g., Gold Token"
              required
            />
          </div>
          <div>
            <Label htmlFor="tokenTypeSymbol">Symbol</Label>
            <Input
              id="tokenTypeSymbol"
              value={newTokenTypeSymbol}
              onChange={(e) => setNewTokenTypeSymbol(e.target.value)}
              placeholder="e.g., GOLD"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="tokenTypeDescription">Description</Label>
            <Input
              id="tokenTypeDescription"
              value={newTokenTypeDescription}
              onChange={(e) => setNewTokenTypeDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <Label htmlFor="tokenTypeTotalSupply">Total Supply</Label>
            <Input
              id="tokenTypeTotalSupply"
              type="number"
              value={newTokenTypeTotalSupply}
              onChange={(e) => setNewTokenTypeTotalSupply(e.target.value)}
              placeholder="e.g., 1000000"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Button type="submit" disabled={creatingTokenType}>
              {creatingTokenType ? 'Creating...' : 'Create Token Type'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Token Types List */}
      <Card title="Token Types" className="mb-6">
        {loadingTokenTypes ? (
          <div className="text-center py-6">Loading token types...</div>
        ) : tokenTypes.length === 0 ? (
          <div className="text-center py-6">No token types found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokenTypes.map((tokenType) => (
              <Card key={tokenType.id} className="p-4 border rounded shadow-sm">
                <h3 className="font-medium text-lg">{tokenType.name} ({tokenType.symbol})</h3>
                <p className="text-sm text-gray-600">Total Supply: {tokenType.total_supply}</p>
                {tokenType.description && <p className="text-sm text-gray-600">{tokenType.description}</p>}
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Mint Tokens Form */}
      <Card title="Mint Tokens" className="mb-6">
        <form onSubmit={handleMintTokens} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tokenTypeSelect">Token Type</Label>
            <select
              id="tokenTypeSelect"
              value={selectedTokenTypeId}
              onChange={(e) => setSelectedTokenTypeId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Token Type</option>
              {tokenTypes.map((tokenType) => (
                <option key={tokenType.id} value={tokenType.id}>
                  {tokenType.name} ({tokenType.symbol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="mintAmount">Amount to Mint</Label>
            <Input
              id="mintAmount"
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="e.g., 1000"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <Button type="submit" disabled={mintingTokens || loadingTokenTypes || tokenTypes.length === 0}>
              {mintingTokens ? 'Minting...' : 'Mint Tokens'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Tokens List */}
      <Card title="Tokens" className="mb-6">
        {loadingTokens ? (
          <div className="text-center py-6">Loading tokens...</div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-6">No tokens found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokens.map((token) => (
              <Card key={token.id} className="p-4 border rounded shadow-sm">
                <h3 className="font-medium text-lg">{getTokenTypeName(token.token_type_id)}</h3>
                <p className="text-sm text-gray-600">Amount: {token.amount}</p>
                <p className="text-sm text-gray-600">Created: {new Date(token.created_at || '').toLocaleString()}</p>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Transfer Tokens Form */}
      <Card title="Transfer Tokens" className="mb-6">
        <form onSubmit={handleTransferTokens} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="transferTokenSelect">Token</Label>
            <select
              id="transferTokenSelect"
              value={transferTokenId}
              onChange={(e) => setTransferTokenId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Token</option>
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {getTokenTypeName(token.token_type_id)} (Amount: {token.amount})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="transferToUserId">Recipient User ID</Label>
            <Input
              id="transferToUserId"
              value={transferToUserId}
              onChange={(e) => setTransferToUserId(e.target.value)}
              placeholder="e.g., user UUID"
              required
            />
          </div>
          <div>
            <Label htmlFor="transferAmount">Amount to Transfer</Label>
            <Input
              id="transferAmount"
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="e.g., 100"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-3">
            <Button type="submit" disabled={transferringTokens || loadingTokens || tokens.length === 0}>
              {transferringTokens ? 'Transferring...' : 'Transfer Tokens'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Token Ownership List */}
      <Card title="Token Ownership" className="mb-6">
        {loadingOwnership ? (
          <div className="text-center py-6">Loading token ownership...</div>
        ) : tokenOwnership.length === 0 ? (
          <div className="text-center py-6">No token ownership records found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokenOwnership.map((ownership) => (
              <Card key={ownership.id} className="p-4 border rounded shadow-sm">
                <h3 className="font-medium text-lg">User: {ownership.user_id}</h3>
                <p className="text-sm text-gray-600">Token: {getTokenTypeName(ownership.token_id)}</p>
                <p className="text-sm text-gray-600">Balance: {ownership.balance}</p>
                <p className="text-sm text-gray-600">Updated: {new Date(ownership.updated_at || '').toLocaleString()}</p>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
