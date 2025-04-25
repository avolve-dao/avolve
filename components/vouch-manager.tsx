'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/hooks/use-user';
import { CheckCircle2, Search, UserCheck, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type VouchRecord = {
  id: string;
  vouched_user_id: string;
  vouched_user_email?: string;
  vouched_user_name?: string;
  vouched_user_avatar?: string;
  created_at: string;
};

type UserToVouch = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  current_level?: string;
  vouch_count?: number;
  vouched_user_id?: string;
  vouched_user_email?: string;
  vouched_user_name?: string;
  vouched_user_avatar?: string;
  created_at?: string;
};

export function VouchManager() {
  const { user } = useUser();
  const { toast } = useToast();
  const [vouches, setVouches] = useState<VouchRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserToVouch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [vouching, setVouching] = useState(false);
  const [canVouch, setCanVouch] = useState(false);
  const [activeTab, setActiveTab] = useState('search');

  useEffect(() => {
    if (user?.id) {
      fetchVouches();
      checkVouchingAbility();
    }
  }, [user?.id]);

  const fetchVouches = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get all vouches made by the current user
      const { data: vouchData, error: vouchError } = await supabase
        .from('vouches')
        .select('id, vouched_user_id, created_at')
        .eq('voucher_id', user?.id)
        .order('created_at', { ascending: false });

      if (vouchError) throw vouchError;

      // Get user details for each vouched user
      const vouchesWithUserDetails = await Promise.all(
        (vouchData as VouchRecord[]).map(async (vouch: VouchRecord) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('email, full_name, avatar_url')
            .eq('id', vouch.vouched_user_id)
            .single();

          if (userError) {
            console.error('Error fetching user details:', userError);
            return {
              ...vouch,
              vouched_user_email: 'Unknown user',
              vouched_user_name: 'Unknown',
              vouched_user_avatar: null,
            };
          }

          return {
            ...vouch,
            vouched_user_email: userData.email,
            vouched_user_name: userData.full_name,
            vouched_user_avatar: userData.avatar_url,
          };
        })
      );

      setVouches(vouchesWithUserDetails);
    } catch (error) {
      console.error('Error fetching vouches:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkVouchingAbility = async () => {
    try {
      const supabase = createClient();

      // Get the user's journey status
      const { data, error } = await supabase.rpc('get_member_journey_status');

      if (error) throw error;

      // Only contributors and full members can vouch
      setCanVouch(data.current_level === 'contributor' || data.current_level === 'full_member');
    } catch (error) {
      console.error('Error checking vouching ability:', error);
      setCanVouch(false);
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const supabase = createClient();

      // Search for users by email or name
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(5);

      if (error) throw error;

      // Filter out the current user
      const filteredUsers = (data as UserToVouch[]).filter((u: UserToVouch) => u.id !== user?.id);

      // Get member journey info for each user
      const usersWithJourneyInfo = await Promise.all(
        filteredUsers.map(async (user: UserToVouch) => {
          const { data: journeyData, error: journeyError } = await supabase
            .from('member_journey')
            .select('current_level, vouch_count')
            .eq('user_id', user.id)
            .single();

          if (journeyError) {
            console.error('Error fetching journey info:', journeyError);
            return {
              ...user,
              current_level: null,
              vouch_count: 0,
            };
          }

          return {
            ...user,
            current_level: journeyData.current_level,
            vouch_count: journeyData.vouch_count,
          };
        })
      );

      const eligibleUsers = usersWithJourneyInfo
        .map((u: any) => ({
          ...u,
          email: u.email || u.vouched_user_email || '',
        }))
        .filter((u: any) => !u.current_level || u.current_level === 'invited');

      setSearchResults(eligibleUsers);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: 'Error searching users',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const vouchForUser = async (userId: string) => {
    try {
      setVouching(true);
      const supabase = createClient();

      const { data, error } = await supabase.rpc('vouch_for_user', {
        p_user_id: userId,
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          title: "Couldn't vouch for user",
          description: data.message,
          variant: 'destructive',
        });
        return;
      }

      // Get user details to add to the vouches list
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Add the new vouch to the list
      const newVouch: VouchRecord = {
        id: crypto.randomUUID(),
        vouched_user_id: userId,
        vouched_user_email: userData.email,
        vouched_user_name: userData.full_name,
        vouched_user_avatar: userData.avatar_url,
        created_at: new Date().toISOString(),
      };

      setVouches([newVouch, ...vouches]);

      // Remove the user from search results
      setSearchResults(searchResults.filter(u => u.id !== userId));

      toast({
        title: 'Vouch successful',
        description: data.message,
      });

      // If the user was upgraded to the next level, show a special toast
      if (data.level_upgraded) {
        toast({
          title: 'User level upgraded!',
          description: 'Your vouch helped this user reach the next membership level',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error vouching for user:', error);
      toast({
        title: 'Error vouching for user',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setVouching(false);
    }
  };

  const alreadyVouchedFor = (userId: string) => {
    return vouches.some(v => v.vouched_user_id === userId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Vouch Manager</CardTitle>
        <CardDescription>Vouch for new members to help them advance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canVouch ? (
          <div className="bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 p-4 rounded-lg text-sm">
            <p>You need to be a Contributor or Full Member to vouch for others.</p>
            <p className="mt-2">Continue your member journey to unlock this feature.</p>
          </div>
        ) : (
          <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search Users</TabsTrigger>
              <TabsTrigger value="history">Vouch History</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="search">Search by email or name</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchUsers()}
                  />
                  <Button onClick={searchUsers} disabled={searching || !searchTerm.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.current_level && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {user.vouch_count || 0}/2 Vouches
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={alreadyVouchedFor(user.id) ? 'outline' : 'default'}
                          onClick={() => vouchForUser(user.id)}
                          disabled={vouching || alreadyVouchedFor(user.id)}
                        >
                          {alreadyVouchedFor(user.id) ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Vouched
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Vouch
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchTerm && !searching ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No eligible users found
                  </div>
                ) : null}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-2">
              {loading ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Loading vouch history...
                </div>
              ) : vouches.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  You haven't vouched for anyone yet
                </div>
              ) : (
                <div className="space-y-2">
                  {vouches.map(vouch => (
                    <div
                      key={vouch.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={vouch.vouched_user_avatar} />
                          <AvatarFallback>
                            {vouch.vouched_user_name?.charAt(0) ||
                              vouch.vouched_user_email?.charAt(0) ||
                              'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{vouch.vouched_user_name || 'Unnamed User'}</p>
                          <p className="text-sm text-muted-foreground">
                            {vouch.vouched_user_email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vouched{' '}
                            {formatDistanceToNow(new Date(vouch.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Vouched
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
