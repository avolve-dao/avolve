'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database-extensions';
import { useFeatureFlagContext } from '@/components/providers/FeatureFlagProvider';
import { Loader2, Copy, Check, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface TokenBalance {
  token_type: string;
  balance: number;
}

interface Invitation {
  id: string;
  code: string;
  email: string | null;
  created_by: string;
  claimed_by: string | null;
  max_uses: number;
  uses: number;
  used: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

interface Profile {
  is_admin: boolean;
}

/**
 * InvitationManager component
 *
 * Allows users to create and manage invitations for new users.
 * Part of the onboarding experience for the Avolve platform launch.
 */
export function InvitationManager() {
  const supabase = createClientComponentClient<Database>();
  const { isEnabled } = useFeatureFlagContext();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<Record<string, number>>({});
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user can create invitations
  const canCreateInvitation = isAdmin || (userTokens.GEN && userTokens.GEN >= 10);

  // Fetch invitations and user data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user profile to check if admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      setIsAdmin(profileData?.is_admin || false);

      // Fetch user tokens
      const { data: tokensData, error: tokensError } = (await supabase.rpc(
        'get_user_token_balances'
      )) as {
        data: TokenBalance[] | null;
        error: any;
      };

      if (tokensError) {
        console.error('Error fetching token balances:', tokensError);
      }

      if (tokensData) {
        const tokenMap: Record<string, number> = {};
        tokensData.forEach((token: TokenBalance) => {
          tokenMap[token.token_type] = token.balance;
        });
        setUserTokens(tokenMap);
      }

      // Fetch invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (invitationsError) {
        throw invitationsError;
      }

      // Ensure the data matches our Invitation type
      const typedInvitations: Invitation[] = (invitationsData || []).map(inv => ({
        id: inv.id,
        code: inv.code,
        email: inv.email,
        created_by: inv.created_by || '',
        claimed_by: inv.claimed_by,
        max_uses: inv.max_uses,
        uses: inv.uses,
        used: inv.used || false,
        used_at: inv.used_at,
        expires_at: inv.expires_at,
        created_at: inv.created_at,
        updated_at: inv.updated_at || '',
        metadata: inv.metadata || {},
      }));

      setInvitations(typedInvitations);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create a new invitation
  const createInvitation = async () => {
    if (!canCreateInvitation) {
      toast.error('You need at least 10 GEN tokens to create an invitation');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || null,
          maxUses,
          expiresInDays,
          metadata: {
            source: 'invitation_manager',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create invitation');
      }

      toast.success('Invitation created successfully');

      // Refresh data
      fetchData();

      // Reset form
      setEmail('');
      setMaxUses(1);
      setExpiresInDays(7);
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create invitation');
    } finally {
      setCreating(false);
    }
  };

  // Copy invitation code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Invitation code copied to clipboard');

    // Reset copied state after 3 seconds
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  if (!isEnabled('invite_friends') && !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>
            This feature is not available yet. Earn more tokens to unlock it!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Invitation Manager</span>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardTitle>
        <CardDescription>Create and manage invitations for new users</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                placeholder="user@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                If provided, this email will be associated with the invitation
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-uses">Maximum Uses</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={e => setMaxUses(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Expires In (days)</Label>
                <Input
                  id="expires"
                  type="number"
                  min={1}
                  value={expiresInDays}
                  onChange={e => setExpiresInDays(parseInt(e.target.value) || 7)}
                />
              </div>
            </div>

            {!isAdmin && (
              <div className="rounded-md bg-amber-50 p-4 mt-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">Token Cost</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>Creating an invitation costs 10 GEN tokens.</p>
                      <p className="font-semibold mt-1">Your balance: {userTokens.GEN || 0} GEN</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manage" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : invitations.length > 0 ? (
              <div className="space-y-4">
                {invitations.map(invitation => (
                  <Card key={invitation.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            Code: {invitation.code}
                            <button
                              onClick={() => copyToClipboard(invitation.code)}
                              className="hover:text-primary transition-colors"
                            >
                              {copiedCode === invitation.code ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </CardTitle>
                          <CardDescription>
                            Created{' '}
                            {formatDistanceToNow(new Date(invitation.created_at), {
                              addSuffix: true,
                            })}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {invitation.used && <Badge variant="secondary">Used</Badge>}
                          {invitation.expires_at &&
                            new Date(invitation.expires_at) < new Date() && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                          {!invitation.used &&
                            invitation.expires_at &&
                            new Date(invitation.expires_at) > new Date() && (
                              <Badge variant="outline">Active</Badge>
                            )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 pt-0">
                      <div className="text-sm">
                        {invitation.email && (
                          <p className="text-muted-foreground">Email: {invitation.email}</p>
                        )}
                        <p className="text-muted-foreground">
                          Uses: {invitation.uses} / {invitation.max_uses}
                        </p>
                        {invitation.expires_at && (
                          <p className="text-muted-foreground">
                            Expires:{' '}
                            {formatDistanceToNow(new Date(invitation.expires_at), {
                              addSuffix: true,
                            })}
                          </p>
                        )}
                        {invitation.claimed_by && (
                          <p className="text-muted-foreground">
                            Claimed by: {invitation.claimed_by.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No invitations found. Create one to get started!
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={createInvitation}
          disabled={creating || !canCreateInvitation || loading}
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Invitation'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
