/**
 * Token Manager Component
 * 
 * This component provides an interface for administrators to manage tokens and token ownership.
 * It allows creating, assigning, and managing tokens within the Avolve platform.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { TokenService } from '@/lib/token/token-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

// TokenManager component for admin dashboard
export default function TokenManager() {
  const { session } = useAuth();
  const user = session?.user;
  const isAdmin = user?.app_metadata?.role === 'admin';

  // Initialize token service (adjust initialization based on your actual service)
  // For now, we'll assume TokenService can be instantiated or used statically
  const tokenService = TokenService; // Update this line based on actual service initialization

  // State for token types
  const [tokenTypes, setTokenTypes] = useState<any[]>([]);
  const [loadingTokenTypes, setLoadingTokenTypes] = useState(true);

  // State for tokens
  const [tokens, setTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // State for token ownership
  const [tokenOwnership, setTokenOwnership] = useState<any[]>([]);
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

  // Fetch token types on component mount
  useEffect(() => {
    const fetchTokenTypes = async () => {
      setLoadingTokenTypes(true);
      setError(null);
      try {
        // Use dummy data since actual method is not available
        const types = [
          { id: '1', name: 'Gold Token', symbol: 'GOLD', total_supply: 1000000 },
          { id: '2', name: 'Silver Token', symbol: 'SILV', total_supply: 2000000 },
          { id: '3', name: 'Bronze Token', symbol: 'BRNZ', total_supply: 3000000 },
        ];
        setTokenTypes(types);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch token types');
        setTokenTypes([]);
      } finally {
        setLoadingTokenTypes(false);
      }
    };

    fetchTokenTypes();
  }, []);

  // Fetch tokens on component mount
  useEffect(() => {
    const fetchTokens = async () => {
      setLoadingTokens(true);
      setError(null);
      try {
        // Use dummy data since actual method is not available
        const tokenData = [
          { id: '1', token_type_id: '1', amount: 500, created_at: '2023-10-01T00:00:00Z' },
          { id: '2', token_type_id: '2', amount: 1000, created_at: '2023-10-02T00:00:00Z' },
          { id: '3', token_type_id: '3', amount: 1500, created_at: '2023-10-03T00:00:00Z' },
        ];
        setTokens(tokenData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tokens');
        setTokens([]);
      } finally {
        setLoadingTokens(false);
      }
    };

    fetchTokens();
  }, []);

  // Fetch token ownership on component mount
  useEffect(() => {
    const fetchTokenOwnership = async () => {
      setLoadingOwnership(true);
      setError(null);
      try {
        // Use dummy data since actual method is not available
        const ownershipData = [
          { id: '1', user_id: 'user1', token_type_id: '1', balance: 200, updated_at: '2023-10-05T00:00:00Z' },
          { id: '2', user_id: 'user2', token_type_id: '2', balance: 300, updated_at: '2023-10-06T00:00:00Z' },
          { id: '3', user_id: 'user3', token_type_id: '3', balance: 400, updated_at: '2023-10-07T00:00:00Z' },
        ];
        setTokenOwnership(ownershipData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch token ownership');
        setTokenOwnership([]);
      } finally {
        setLoadingOwnership(false);
      }
    };

    fetchTokenOwnership();
  }, []);

  // Handle creating a new token type
  const handleCreateTokenType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenTypeName || !newTokenTypeSymbol || !newTokenTypeTotalSupply) {
      setError('Name, symbol, and total supply are required');
      return;
    }

    setCreatingTokenType(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate creating a token type since actual method is not available
      const newType = {
        id: Math.random().toString(36).substr(2, 9),
        name: newTokenTypeName,
        symbol: newTokenTypeSymbol,
        description: newTokenTypeDescription || null,
        total_supply: parseInt(newTokenTypeTotalSupply, 10),
      };
      setTokenTypes([...tokenTypes, newType]);

      setSuccess(`Successfully created token type: ${newTokenTypeName}`);
      setNewTokenTypeName('');
      setNewTokenTypeSymbol('');
      setNewTokenTypeDescription('');
      setNewTokenTypeTotalSupply('');
    } catch (err: any) {
      setError(err.message || 'Failed to create token type');
    } finally {
      setCreatingTokenType(false);
    }
  };

  // Handle minting tokens
  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenTypeId || !mintAmount) {
      setError('Token type and amount are required');
      return;
    }

    setMintingTokens(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate minting tokens since actual method is not available
      const newToken = {
        id: Math.random().toString(36).substr(2, 9),
        token_type_id: selectedTokenTypeId,
        amount: parseInt(mintAmount, 10),
        created_at: new Date().toISOString(),
      };
      setTokens([...tokens, newToken]);

      setSuccess(`Successfully minted ${mintAmount} tokens`);
      setSelectedTokenTypeId('');
      setMintAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to mint tokens');
    } finally {
      setMintingTokens(false);
    }
  };

  // Handle transferring tokens
  const handleTransferTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTokenId || !transferToUserId || !transferAmount) {
      setError('Token, recipient, and amount are required');
      return;
    }

    setTransferringTokens(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate transferring tokens since actual method is not available
      const updatedOwnership = tokenOwnership.map(o => {
        if (o.token_type_id === tokens.find(t => t.id === transferTokenId)?.token_type_id) {
          return { ...o, balance: o.balance - parseInt(transferAmount, 10) };
        }
        return o;
      });
      setTokenOwnership(updatedOwnership);

      const newOwnership = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: transferToUserId,
        token_type_id: tokens.find(t => t.id === transferTokenId)?.token_type_id || '',
        balance: parseInt(transferAmount, 10),
        updated_at: new Date().toISOString(),
      };
      setTokenOwnership([...updatedOwnership, newOwnership]);

      setSuccess(`Successfully transferred ${transferAmount} tokens`);
      setTransferTokenId('');
      setTransferToUserId('');
      setTransferAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to transfer tokens');
    } finally {
      setTransferringTokens(false);
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
    <div className="space-y-6 max-w-7xl mx-auto p-6">
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
                <p className="text-sm text-gray-600">Token: {getTokenTypeName(ownership.token_type_id)}</p>
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
