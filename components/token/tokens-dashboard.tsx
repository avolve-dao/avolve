'use client';

import { useEffect, useState } from 'react';
import { useTokens } from '@/hooks/use-tokens';
import { TokenDisplay } from '@/components/token/token-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { 
  Coins, 
  ArrowLeftRight, 
  LockIcon, 
  UnlockIcon, 
  BarChart3, 
  History, 
  Info,
  ChevronRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// TokenWithBalance type for dashboard selection
import type { Token } from '@/hooks/use-tokens';
type TokenWithBalance = Token & { staked_balance?: number };

/**
 * Component that displays the user's tokens and allows them to manage them
 */
export function TokensDashboard() {
  const { tokens, userBalances, isLoading } = useTokens();
  
  const [activeTab, setActiveTab] = useState('tokens');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenWithBalance | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    // No changes needed here
  }, [tokens, userBalances]);

  // Handle token transfer
  const handleTransfer = () => {
    // In a real implementation, this would call the transferToken function
    console.log('Transferring', transferAmount, selectedToken?.symbol, 'to', recipientEmail);
    setIsTransferDialogOpen(false);
    setTransferAmount('');
    setRecipientEmail('');
  };

  // Handle token staking
  const handleStake = () => {
    // In a real implementation, this would call the stakeToken function
    console.log('Staking', stakeAmount, selectedToken?.symbol);
    setIsStakeDialogOpen(false);
    setStakeAmount('');
  };

  if (isLoading && tokens.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Token Overview</span>
          </CardTitle>
          <CardDescription>
            Your token balance and portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Tokens</div>
              <div className="text-2xl font-bold">{tokens.length}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Total Balance</div>
              <div className="text-2xl font-bold">
                {tokens.reduce((sum, token) => sum + token.balance, 0)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Staked Tokens</div>
              <div className="text-2xl font-bold">
                {tokens.reduce((sum, token) => sum + (token.staked_balance || 0), 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="tokens">My Tokens</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="hierarchy">Token Hierarchy</TabsTrigger>
        </TabsList>
        
        {/* My Tokens Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tokens.map(token => (
              <Card key={token.id}>
                <CardHeader className={`bg-gradient-to-r ${token.gradient_class} text-white rounded-t-lg`}>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      {token.symbol}
                    </div>
                    <span>{token.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Balance</span>
                      <span className="font-medium">{token.balance}</span>
                    </div>
                    {typeof token.staked_balance === 'number' && token.staked_balance > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Staked</span>
                        <span className="font-medium">{token.staked_balance}</span>
                      </div>
                    )}
                    {typeof token.pending_release === 'number' && token.pending_release > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Pending</span>
                        <span className="font-medium">{token.pending_release}</span>
                      </div>
                    )}
                    {token.parent_token_symbol && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Parent Token</span>
                        <Badge variant="outline">{token.parent_token_symbol}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsTransferDialogOpen(true);
                    }}
                    disabled={!token.is_transferable || token.balance <= 0}
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Transfer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsStakeDialogOpen(true);
                    }}
                    disabled={token.balance <= 0}
                  >
                    {typeof token.staked_balance === 'number' && token.staked_balance > 0 ? (
                      <>
                        <UnlockIcon className="mr-2 h-4 w-4" />
                        Unstake
                      </>
                    ) : (
                      <>
                        <LockIcon className="mr-2 h-4 w-4" />
                        Stake
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {tokens.length === 0 && (
              <div className="col-span-3 p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Coins className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">No tokens yet</h3>
                <p className="text-gray-500 mt-1">
                  Complete sections and achievements to earn tokens.
                </p>
              </div>
            )}
          </div>
          
          {/* Token Acquisition Guide */}
          <Card>
            <CardHeader>
              <CardTitle>How to Earn Tokens</CardTitle>
              <CardDescription>
                Complete these actions to earn more tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Complete Sections</span>
                    <p className="text-sm text-gray-500">Finish sections in each pillar to earn tokens</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Earn Achievements</span>
                    <p className="text-sm text-gray-500">Unlock achievements to receive token rewards</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Stake Your Tokens</span>
                    <p className="text-sm text-gray-500">Stake tokens to earn passive rewards over time</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Contribute to the Community</span>
                    <p className="text-sm text-gray-500">Help others and create content to earn special tokens</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Recent Transactions</span>
              </CardTitle>
              <CardDescription>
                Your recent token transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would be populated with actual transaction data */}
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ArrowLeftRight className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Received 5 GEN</div>
                      <div className="text-sm text-gray-500">From: system</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-medium">+5 GEN</div>
                    <div className="text-sm text-gray-500">Apr 6, 2025</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <LockIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Staked 2 SAP</div>
                      <div className="text-sm text-gray-500">Staking reward: 0.01 SAP/day</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-600 font-medium">2 SAP staked</div>
                    <div className="text-sm text-gray-500">Apr 5, 2025</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <ArrowLeftRight className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Received 3 SAP</div>
                      <div className="text-sm text-gray-500">Achievement reward</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-600 font-medium">+3 SAP</div>
                    <div className="text-sm text-gray-500">Apr 4, 2025</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Token Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Token Hierarchy</span>
              </CardTitle>
              <CardDescription>
                The hierarchical structure of tokens in the Avolve platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* GEN Token (Root) */}
                <div className="border-l-4 border-zinc-500 pl-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zinc-500 to-zinc-700 flex items-center justify-center text-white font-bold">
                      GEN
                    </div>
                    <div>
                      <div className="font-medium">Supercivilization</div>
                      <div className="text-sm text-gray-500">Primary token</div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">The GEN token is the primary token for the Supercivilization pillar. It represents the ecosystem journey of transformation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {/* SAP Token (Level 1) */}
                  <div className="ml-6 border-l-4 border-stone-500 pl-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-stone-500 to-stone-700 flex items-center justify-center text-white font-bold">
                        SAP
                      </div>
                      <div>
                        <div className="font-medium">Superachiever</div>
                        <div className="text-sm text-gray-500">Individual journey</div>
                      </div>
                    </div>
                    
                    {/* PSP Token (Level 2) */}
                    <div className="ml-6 border-l-4 border-amber-500 pl-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                          PSP
                        </div>
                        <div>
                          <div className="font-medium">Personal Success Puzzle</div>
                          <div className="text-sm text-gray-500">Greater Personal Successes</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* BSP Token (Level 2) */}
                    <div className="ml-6 border-l-4 border-teal-500 pl-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          BSP
                        </div>
                        <div>
                          <div className="font-medium">Business Success Puzzle</div>
                          <div className="text-sm text-gray-500">Greater Business Successes</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* SMS Token (Level 2) */}
                    <div className="ml-6 border-l-4 border-violet-500 pl-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                          SMS
                        </div>
                        <div>
                          <div className="font-medium">Supermind Superpowers</div>
                          <div className="text-sm text-gray-500">Go Further, Faster, & Forever</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* SCQ Token (Level 1) */}
                  <div className="ml-6 border-l-4 border-slate-500 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold">
                        SCQ
                      </div>
                      <div>
                        <div className="font-medium">Superachievers</div>
                        <div className="text-sm text-gray-500">Collective journey</div>
                      </div>
                    </div>
                    
                    {/* SPD Token (Level 2) */}
                    <div className="ml-6 border-l-4 border-red-500 pl-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          SPD
                        </div>
                        <div>
                          <div className="font-medium">Superpuzzle Developments</div>
                          <div className="text-sm text-gray-500">Conceive, Believe, & Achieve</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* SHE Token (Level 2) */}
                    <div className="ml-6 border-l-4 border-rose-500 pl-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                          SHE
                        </div>
                        <div>
                          <div className="font-medium">Superhuman Enhancements</div>
                          <div className="text-sm text-gray-500">Super Enhanced Individuals</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* SSA Token (Level 2) */}
                    <div className="ml-6 border-l-4 border-lime-500 pl-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                          SSA
                        </div>
                        <div>
                          <div className="font-medium">Supersociety Advancements</div>
                          <div className="text-sm text-gray-500">Super Advanced Collectives</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* SGB Token (Level 2) */}
                    <div className="ml-6 border-l-4 border-sky-500 pl-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                          SGB
                        </div>
                        <div>
                          <div className="font-medium">Supergenius Breakthroughs</div>
                          <div className="text-sm text-gray-500">Super Balanced Ecosystems</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Token</DialogTitle>
            <DialogDescription>
              Transfer {selectedToken?.name} to another user
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${selectedToken?.gradient_class}`}>
                {selectedToken?.symbol}
              </div>
              <div>
                <div className="font-medium">{selectedToken?.name}</div>
                <div className="text-sm text-gray-500">Balance: {selectedToken?.balance}</div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0"
                min="0"
                max={selectedToken?.balance}
              />
              <div className="text-sm text-gray-500">
                Maximum: {selectedToken?.balance} {selectedToken?.symbol}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTransferDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTransfer}
              disabled={
                !transferAmount || 
                !recipientEmail || 
                parseFloat(transferAmount) <= 0 || 
                parseFloat(transferAmount) > (selectedToken?.balance || 0)
              }
            >
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Stake Dialog */}
      <Dialog open={isStakeDialogOpen} onOpenChange={setIsStakeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {typeof selectedToken?.staked_balance === 'number' && selectedToken.staked_balance > 0 ? 'Unstake Token' : 'Stake Token'}
            </DialogTitle>
            <DialogDescription>
              {typeof selectedToken?.staked_balance === 'number' && selectedToken.staked_balance > 0 
                ? `Unstake ${selectedToken?.name} to make it available for transfer`
                : `Stake ${selectedToken?.name} to earn rewards over time`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-r ${selectedToken?.gradient_class}`}>
                {selectedToken?.symbol}
              </div>
              <div>
                <div className="font-medium">{selectedToken?.name}</div>
                <div className="text-sm text-gray-500">
                  {typeof selectedToken?.staked_balance === 'number' && selectedToken.staked_balance > 0 
                    ? `Staked: ${selectedToken?.staked_balance}`
                    : `Balance: ${selectedToken?.balance}`
                  }
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="stakeAmount">Amount</Label>
              <Input
                id="stakeAmount"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0"
                min="0"
                max={typeof selectedToken?.staked_balance === 'number' && selectedToken?.staked_balance && selectedToken.staked_balance > 0 
                  ? selectedToken.staked_balance 
                  : (selectedToken?.balance ?? 0)
                }
              />
              <div className="text-sm text-gray-500">
                Maximum: {
                  typeof selectedToken?.staked_balance === 'number' && selectedToken?.staked_balance && selectedToken.staked_balance > 0 
                    ? selectedToken.staked_balance 
                    : (selectedToken?.balance ?? 0)
                } {selectedToken?.symbol}
              </div>
            </div>
            
            {typeof selectedToken?.staked_balance === 'number' && selectedToken.staked_balance <= 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-800 dark:text-blue-300">
                <div className="font-medium">Staking Benefits</div>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Earn rewards over time</li>
                  <li>Contribute to platform stability</li>
                  <li>Unlock special features</li>
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStakeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStake}
              disabled={
                !stakeAmount || 
                parseFloat(stakeAmount) <= 0 || 
                parseFloat(stakeAmount) > (
                  typeof selectedToken?.staked_balance === 'number' && selectedToken?.staked_balance && selectedToken.staked_balance > 0 
                    ? selectedToken.staked_balance 
                    : (selectedToken?.balance ?? 0)
                )
              }
            >
              {typeof selectedToken?.staked_balance === 'number' && selectedToken.staked_balance > 0 ? 'Unstake' : 'Stake'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
