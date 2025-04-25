'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit,
  Loader2,
  Search,
  Shield,
  User,
  UserX,
  Mail,
  Flag,
} from 'lucide-react';

interface User {
  id: string;
  user_email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  regeneration_status: string;
}

export default function AdminDashboardPage() {
  const { user } = useSupabase();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
    newUsersToday: 0,
    pendingInvitations: 0,
  });

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();

        if (data.error) {
          toast({
            title: 'Error',
            description: data.error,
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        setUsers(data.users || []);
        setFilteredUsers(data.users || []);

        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        // Fetch invitation count
        const invitationResponse = await fetch('/api/invitations');
        const invitationData = await invitationResponse.json();
        const pendingInvitations = invitationData.invitations
          ? invitationData.invitations.filter(
              (inv: any) => !inv.used && (!inv.expires_at || new Date(inv.expires_at) > now)
            ).length
          : 0;

        setStats({
          totalUsers: data.users.length,
          activeUsers: data.users.filter((u: User) => u.regeneration_status !== 'deactivated')
            .length,
          admins: data.users.filter((u: User) => u.is_admin).length,
          newUsersToday: data.users.filter((u: User) => new Date(u.created_at) >= new Date(today))
            .length,
          pendingInvitations,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    }

    if (user) {
      fetchUsers();
    }
  }, [user, toast]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      user =>
        user.full_name.toLowerCase().includes(query) ||
        user.user_email.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle user update
  const handleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates,
        }),
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Update the local state
      setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? { ...u, ...updates } : u)));

      setEditingUser(null);

      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle user deactivation
  const handleUserDeactivation = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Update the local state
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, regeneration_status: 'deactivated' } : u))
      );

      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // User card component
  const UserCard = ({ user }: { user: User }) => {
    const [expanded, setExpanded] = useState(false);
    const isEditing = editingUser?.id === user.id;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {user.full_name}
                  {user.is_admin && (
                    <Badge variant="outline" className="bg-amber-50">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{user.user_email}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${user.id}`}>Full Name</Label>
                    <Input
                      id={`name-${user.id}`}
                      value={editingUser.full_name}
                      onChange={e =>
                        setEditingUser({
                          ...editingUser,
                          full_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`email-${user.id}`}>Email</Label>
                    <Input id={`email-${user.id}`} value={editingUser.user_email} disabled />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`bio-${user.id}`}>Bio</Label>
                  <Input
                    id={`bio-${user.id}`}
                    value={editingUser.bio || ''}
                    onChange={e =>
                      setEditingUser({
                        ...editingUser,
                        bio: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`admin-${user.id}`}
                    checked={editingUser.is_admin}
                    onCheckedChange={checked =>
                      setEditingUser({
                        ...editingUser,
                        is_admin: checked,
                      })
                    }
                  />
                  <Label htmlFor={`admin-${user.id}`}>Admin privileges</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      handleUserUpdate(user.id, {
                        full_name: editingUser.full_name,
                        bio: editingUser.bio,
                        is_admin: editingUser.is_admin,
                      })
                    }
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="flex items-center mt-1">
                      {user.regeneration_status === 'deactivated' ? (
                        <Badge variant="outline" className="bg-red-50">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Deactivated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Joined</p>
                    <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {user.bio && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Bio</p>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingUser(user)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  {user.regeneration_status !== 'deactivated' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleUserDeactivation(user.id)}
                      disabled={loading}
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <Card className="bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.totalUsers}</CardTitle>
            <CardDescription>Total Users</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-green-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.activeUsers}</CardTitle>
            <CardDescription>Active Users</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.admins}</CardTitle>
            <CardDescription>Admins</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-purple-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.newUsersToday}</CardTitle>
            <CardDescription>New Today</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-indigo-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.pendingInvitations}</CardTitle>
            <CardDescription>Pending Invitations</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Link href="/admin/invitations" className="block">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Invitation Management
              </CardTitle>
              <CardDescription>Create and manage invitation codes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Control who can join the platform with invitation codes. Monitor usage and create
                new invitations.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/settings" className="block">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flag className="w-5 h-5 mr-2" />
                Feature Flags
              </CardTitle>
              <CardDescription>Control feature visibility and rollout</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage which features are available to users. Control rollout percentages and token
                requirements.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="stats">Platform Stats</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  Total: {stats.totalUsers}
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  Active: {stats.activeUsers}
                </Badge>
                <Badge variant="outline" className="bg-amber-50">
                  Admins: {stats.admins}
                </Badge>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div>
              {filteredUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>Key metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed platform statistics will be available here soon. This will include user
                engagement metrics, recognition trends, and token economy analytics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure global platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Platform settings will be available here soon. This will include feature flags,
                notification settings, and integration configurations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
