/**
 * Token Manager Component
 * 
 * This component provides an interface for administrators to manage tokens and token ownership.
 * It allows creating, assigning, and managing tokens within the Avolve platform.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { TokenService, TokenType, Token, TokenOwnership, TransactionType } from '@/lib/token/token-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

export default function TokenManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const tokenService = TokenService.getBrowserInstance();
  
  // State for token types
  const [tokenTypes, setTokenTypes] = useState<TokenType[]>([]);
  const [loadingTokenTypes, setLoadingTokenTypes] = useState(true);
  
  // State for tokens
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  
  // State for token ownership
  const [tokenOwnership, setTokenOwnership] = useState<(TokenOwnership & { token: Token })[]>([]);
  const [loadingTokenOwnership, setLoadingTokenOwnership] = useState(true);
  
  // State for users
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // State for new token type form
  const [newTokenType, setNewTokenType] = useState({
    code: '',
    name: '',
    description: '',
    parentTokenTypeId: ''
  });
  
  // State for new token form
  const [newToken, setNewToken] = useState({
    tokenTypeId: '',
    name: '',
    symbol: '',
    description: '',
    totalSupply: 0,
    isTransferable: true
  });
  
  // State for mint token form
  const [mintToken, setMintToken] = useState({
    tokenId: '',
    userId: '',
    amount: 1
  });
  
  // State for transfer token form
  const [transferToken, setTransferToken] = useState({
    tokenId: '',
    fromUserId: '',
    toUserId: '',
    amount: 1
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('token-types');
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  
  // Load token types
  useEffect(() => {
    const loadTokenTypes = async () => {
      setLoadingTokenTypes(true);
      const { data, error } = await tokenService.getAllTokenTypes();
      
      if (error) {
        setError(`Failed to load token types: ${error.message}`);
      } else if (data) {
        setTokenTypes(data);
      }
      
      setLoadingTokenTypes(false);
    };
    
    loadTokenTypes();
  }, []);
  
  // Load tokens
  useEffect(() => {
    const loadTokens = async () => {
      setLoadingTokens(true);
      const { data, error } = await tokenService.getAllTokens();
      
      if (error) {
        setError(`Failed to load tokens: ${error.message}`);
      } else if (data) {
        setTokens(data);
      }
      
      setLoadingTokens(false);
    };
    
    loadTokens();
  }, []);
  
  // Load token ownership for current user
  useEffect(() => {
    const loadTokenOwnership = async () => {
      if (!user) return;
      
      setLoadingTokenOwnership(true);
      const { data, error } = await tokenService.getUserTokens(user.id);
      
      if (error) {
        setError(`Failed to load token ownership: ${error.message}`);
      } else if (data) {
        setTokenOwnership(data);
      }
      
      setLoadingTokenOwnership(false);
    };
    
    loadTokenOwnership();
  }, [user]);
  
  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      
      try {
        const { data, error } = await tokenService.getSupabaseClient()
          .from('profiles')
          .select('id, email, first_name, last_name');
          
        if (error) {
          setError(`Failed to load users: ${error.message}`);
        } else if (data) {
          setUsers(data);
        }
      } catch (err) {
        setError(`Failed to load users: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      setLoadingUsers(false);
    };
    
    loadUsers();
  }, []);
  
  // Handle creating a new token type
  const handleCreateTokenType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await tokenService.createTokenType(
        newTokenType.code,
        newTokenType.name,
        newTokenType.description,
        newTokenType.parentTokenTypeId || undefined
      );
      
      if (error) {
        setError(`Failed to create token type: ${error.message}`);
        return;
      }
      
      // Add the new token type to the list
      if (data) {
        setTokenTypes([...tokenTypes, data]);
      }
      
      // Reset the form
      setNewTokenType({
        code: '',
        name: '',
        description: '',
        parentTokenTypeId: ''
      });
      
      toast({
        title: "Token Type Created",
        description: `Successfully created token type: ${newTokenType.name}`,
      });
    } catch (err) {
      setError(`Failed to create token type: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Handle creating a new token
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await tokenService.createToken(
        newToken.tokenTypeId,
        newToken.name,
        newToken.symbol,
        newToken.description,
        newToken.totalSupply > 0 ? newToken.totalSupply : undefined,
        newToken.isTransferable
      );
      
      if (error) {
        setError(`Failed to create token: ${error.message}`);
        return;
      }
      
      // Add the new token to the list
      if (data) {
        setTokens([...tokens, data]);
      }
      
      // Reset the form
      setNewToken({
        tokenTypeId: '',
        name: '',
        symbol: '',
        description: '',
        totalSupply: 0,
        isTransferable: true
      });
      
      toast({
        title: "Token Created",
        description: `Successfully created token: ${newToken.name}`,
      });
    } catch (err) {
      setError(`Failed to create token: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Handle minting tokens
  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await tokenService.mintTokens(
        mintToken.tokenId,
        mintToken.userId,
        mintToken.amount
      );
      
      if (error) {
        setError(`Failed to mint tokens: ${error.message}`);
        return;
      }
      
      // Reset the form
      setMintToken({
        tokenId: '',
        userId: '',
        amount: 1
      });
      
      toast({
        title: "Tokens Minted",
        description: `Successfully minted ${mintToken.amount} tokens to user`,
      });
      
      // Refresh token ownership if the current user is the recipient
      if (user && mintToken.userId === user.id) {
        const { data: ownershipData } = await tokenService.getUserTokens(user.id);
        if (ownershipData) {
          setTokenOwnership(ownershipData);
        }
      }
    } catch (err) {
      setError(`Failed to mint tokens: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Handle transferring tokens
  const handleTransferTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await tokenService.transferTokens(
        transferToken.tokenId,
        transferToken.fromUserId,
        transferToken.toUserId,
        transferToken.amount
      );
      
      if (error) {
        setError(`Failed to transfer tokens: ${error.message}`);
        return;
      }
      
      // Reset the form
      setTransferToken({
        tokenId: '',
        fromUserId: '',
        toUserId: '',
        amount: 1
      });
      
      toast({
        title: "Tokens Transferred",
        description: `Successfully transferred ${transferToken.amount} tokens`,
      });
      
      // Refresh token ownership if the current user is involved
      if (user && (transferToken.fromUserId === user.id || transferToken.toUserId === user.id)) {
        const { data: ownershipData } = await tokenService.getUserTokens(user.id);
        if (ownershipData) {
          setTokenOwnership(ownershipData);
        }
      }
    } catch (err) {
      setError(`Failed to transfer tokens: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Get token type name by ID
  const getTokenTypeName = (id: string): string => {
    const tokenType = tokenTypes.find(tt => tt.id === id);
    return tokenType ? tokenType.name : 'Unknown';
  };
  
  // Get token name by ID
  const getTokenName = (id: string): string => {
    const token = tokens.find(t => t.id === id);
    return token ? token.name : 'Unknown';
  };
  
  // Get user name by ID
  const getUserName = (id: string): string => {
    const user = users.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };
  
  // Render token types tab
  const renderTokenTypesTab = () => {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Create Token Type</CardTitle>
            <CardDescription>Create a new token type in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTokenType} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={newTokenType.code}
                    onChange={(e) => setNewTokenType({ ...newTokenType, code: e.target.value })}
                    placeholder="GEN"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newTokenType.name}
                    onChange={(e) => setNewTokenType({ ...newTokenType, name: e.target.value })}
                    placeholder="Genius"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTokenType.description}
                  onChange={(e) => setNewTokenType({ ...newTokenType, description: e.target.value })}
                  placeholder="Supercivilization token for Genius ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parentTokenTypeId">Parent Token Type (Optional)</Label>
                <Select
                  value={newTokenType.parentTokenTypeId}
                  onValueChange={(value) => setNewTokenType({ ...newTokenType, parentTokenTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent token type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {tokenTypes.map((tokenType) => (
                      <SelectItem key={tokenType.id} value={tokenType.id}>
                        {tokenType.name} ({tokenType.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit">Create Token Type</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Token Types</CardTitle>
            <CardDescription>All token types in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTokenTypes ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableCaption>List of token types</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>System</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokenTypes.map((tokenType) => (
                    <TableRow key={tokenType.id}>
                      <TableCell className="font-medium">{tokenType.code}</TableCell>
                      <TableCell>{tokenType.name}</TableCell>
                      <TableCell>{tokenType.description}</TableCell>
                      <TableCell>
                        {tokenType.parent_token_type_id ? 
                          getTokenTypeName(tokenType.parent_token_type_id) : 
                          'None'}
                      </TableCell>
                      <TableCell>
                        {tokenType.is_system ? (
                          <Badge variant="default">System</Badge>
                        ) : (
                          <Badge variant="outline">Custom</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render tokens tab
  const renderTokensTab = () => {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Create Token</CardTitle>
            <CardDescription>Create a new token in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateToken} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenTypeId">Token Type</Label>
                <Select
                  value={newToken.tokenTypeId}
                  onValueChange={(value) => setNewToken({ ...newToken, tokenTypeId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token type" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenTypes.map((tokenType) => (
                      <SelectItem key={tokenType.id} value={tokenType.id}>
                        {tokenType.name} ({tokenType.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newToken.name}
                    onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                    placeholder="Genius Token"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={newToken.symbol}
                    onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
                    placeholder="GEN"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newToken.description}
                  onChange={(e) => setNewToken({ ...newToken, description: e.target.value })}
                  placeholder="Token for the Genius ecosystem"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalSupply">Total Supply (0 for unlimited)</Label>
                  <Input
                    id="totalSupply"
                    type="number"
                    min="0"
                    value={newToken.totalSupply}
                    onChange={(e) => setNewToken({ ...newToken, totalSupply: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isTransferable">Transferable</Label>
                  <Select
                    value={newToken.isTransferable ? "true" : "false"}
                    onValueChange={(value) => setNewToken({ ...newToken, isTransferable: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Is token transferable?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button type="submit">Create Token</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tokens</CardTitle>
            <CardDescription>All tokens in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTokens ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableCaption>List of tokens</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Token Type</TableHead>
                    <TableHead>Total Supply</TableHead>
                    <TableHead>Transferable</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.id}>
                      <TableCell className="font-medium">{token.name}</TableCell>
                      <TableCell>{token.symbol}</TableCell>
                      <TableCell>{getTokenTypeName(token.token_type_id)}</TableCell>
                      <TableCell>{token.total_supply || 'Unlimited'}</TableCell>
                      <TableCell>
                        {token.is_transferable ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {token.is_active ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Render token ownership tab
  const renderTokenOwnershipTab = () => {
    return (
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Mint Tokens</CardTitle>
            <CardDescription>Mint tokens to a user</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMintTokens} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenId">Token</Label>
                <Select
                  value={mintToken.tokenId}
                  onValueChange={(value) => setMintToken({ ...mintToken, tokenId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userId">User</Label>
                <Select
                  value={mintToken.userId}
                  onValueChange={(value) => setMintToken({ ...mintToken, userId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={mintToken.amount}
                  onChange={(e) => setMintToken({ ...mintToken, amount: parseInt(e.target.value) })}
                  required
                />
              </div>
              
              <Button type="submit">Mint Tokens</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transfer Tokens</CardTitle>
            <CardDescription>Transfer tokens between users</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransferTokens} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tokenId">Token</Label>
                <Select
                  value={transferToken.tokenId}
                  onValueChange={(value) => setTransferToken({ ...transferToken, tokenId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.id} value={token.id}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromUserId">From User</Label>
                  <Select
                    value={transferToken.fromUserId}
                    onValueChange={(value) => setTransferToken({ ...transferToken, fromUserId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sender" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toUserId">To User</Label>
                  <Select
                    value={transferToken.toUserId}
                    onValueChange={(value) => setTransferToken({ ...transferToken, toUserId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={transferToken.amount}
                  onChange={(e) => setTransferToken({ ...transferToken, amount: parseInt(e.target.value) })}
                  required
                />
              </div>
              
              <Button type="submit">Transfer Tokens</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Tokens</CardTitle>
            <CardDescription>Tokens owned by you</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTokenOwnership ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableCaption>List of your tokens</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Acquired</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokenOwnership.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">You don't own any tokens yet</TableCell>
                    </TableRow>
                  ) : (
                    tokenOwnership.map((ownership) => (
                      <TableRow key={ownership.id}>
                        <TableCell className="font-medium">{ownership.token.name}</TableCell>
                        <TableCell>{ownership.token.symbol}</TableCell>
                        <TableCell>{ownership.balance}</TableCell>
                        <TableCell>{new Date(ownership.acquired_at || '').toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Token Manager</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="token-types">Token Types</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="token-ownership">Token Ownership</TabsTrigger>
        </TabsList>
        <TabsContent value="token-types">
          {renderTokenTypesTab()}
        </TabsContent>
        <TabsContent value="tokens">
          {renderTokensTab()}
        </TabsContent>
        <TabsContent value="token-ownership">
          {renderTokenOwnershipTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
