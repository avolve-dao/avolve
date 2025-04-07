import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { useRoles } from '@/lib/roles/useRoles';
import { useToken } from '@/lib/token/useToken';
import RoleProtectedRoute from '@/components/roles/role-protected-route';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  UsersIcon, 
  KeyIcon, 
  BarChart3Icon, 
  ActivityIcon, 
  CoinsIcon, 
  UserPlusIcon, 
  UserMinusIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';

// Define types
type User = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  roles: string[];
};

type UserActivity = {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
  metadata: any;
};

type PillarProgress = {
  pillar_id: string;
  pillar_title: string;
  pillar_slug: string;
  gradient_class: string;
  total_sections: number;
  completed_sections: number;
  total_components: number;
  completed_components: number;
  progress_percentage: number;
};

export default function AdminDashboard() {
  return (
    <RoleProtectedRoute adminOnly>
      <AdminDashboardContent />
    </RoleProtectedRoute>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const { isAdmin, getUserRoles, assignRole, removeRole } = useRoles();
  const { getUserTokens, getAllTokenTypes } = useToken();
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<PillarProgress[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [newRoleForUser, setNewRoleForUser] = useState('');
  
  // Analytics data
  const [usersByPhase, setUsersByPhase] = useState<{[key: string]: number}>({});
  const [tokenDistribution, setTokenDistribution] = useState<{[key: string]: number}>({});
  const [activityByType, setActivityByType] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    const checkAdmin = async () => {
      const isAdminUser = await isAdmin();
      if (!isAdminUser) {
        router.push('/dashboard');
      } else {
        fetchUsers();
      }
    };
    
    checkAdmin();
  }, [isAdmin, router]);
  
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, created_at, last_sign_in_at');
      
      if (error) throw error;
      
      // For each user, get their roles
      const usersWithRoles = await Promise.all(
        data.map(async (user) => {
          const { data: roles } = await supabase
            .rpc('get_user_roles_admin', { p_user_id: user.id });
          
          return {
            ...user,
            roles: roles ? roles.map((r: any) => r.role_name) : []
          };
        })
      );
      
      setUsers(usersWithRoles);
      
      // Calculate analytics data
      calculateAnalytics(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateAnalytics = async (users: User[]) => {
    try {
      // Get user phases
      const phases: {[key: string]: number} = {
        discovery: 0,
        onboarding: 0,
        scaffolding: 0,
        endgame: 0
      };
      
      for (const user of users) {
        const { data: phase } = await supabase
          .rpc('get_user_experience_phase_admin', { p_user_id: user.id });
        
        if (phase) {
          phases[phase] = (phases[phase] || 0) + 1;
        }
      }
      
      setUsersByPhase(phases);
      
      // Get token distribution
      const { data: tokens } = await supabase
        .from('tokens')
        .select('symbol');
      
      const distribution: {[key: string]: number} = {};
      
      if (tokens) {
        for (const token of tokens) {
          const { data: count } = await supabase
            .rpc('count_token_holders', { p_token_symbol: token.symbol });
          
          distribution[token.symbol] = count || 0;
        }
      }
      
      setTokenDistribution(distribution);
      
      // Get activity by type
      const { data: activities } = await supabase
        .from('user_activity_logs')
        .select('activity_type, count')
        .group('activity_type');
      
      const activityCounts: {[key: string]: number} = {};
      
      if (activities) {
        for (const activity of activities) {
          activityCounts[activity.activity_type] = activity.count;
        }
      }
      
      setActivityByType(activityCounts);
    } catch (error) {
      console.error('Error calculating analytics:', error);
    }
  };
  
  const selectUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setUserRoles(user.roles);
      
      // Fetch user tokens
      try {
        const { data: tokens } = await supabase
          .rpc('get_user_tokens_admin', { p_user_id: userId });
        
        setUserTokens(tokens || []);
      } catch (error) {
        console.error('Error fetching user tokens:', error);
      }
      
      // Fetch user progress
      try {
        const { data: progress } = await supabase
          .rpc('get_all_pillars_progress_admin', { p_user_id: userId });
        
        setUserProgress(progress || []);
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
      
      // Fetch user activity
      try {
        const { data: activity } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);
        
        setUserActivity(activity || []);
      } catch (error) {
        console.error('Error fetching user activity:', error);
      }
    }
  };
  
  const handleAssignRole = async () => {
    if (selectedUser && newRoleForUser) {
      try {
        const success = await assignRole(selectedUser.id, newRoleForUser);
        
        if (success) {
          // Update local state
          setUserRoles([...userRoles, newRoleForUser]);
          
          // Update users list
          const updatedUsers = users.map(u => {
            if (u.id === selectedUser.id) {
              return {
                ...u,
                roles: [...u.roles, newRoleForUser]
              };
            }
            return u;
          });
          
          setUsers(updatedUsers);
          setNewRoleForUser('');
        }
      } catch (error) {
        console.error('Error assigning role:', error);
      }
    }
  };
  
  const handleRemoveRole = async (role: string) => {
    if (selectedUser) {
      try {
        const success = await removeRole(selectedUser.id, role);
        
        if (success) {
          // Update local state
          setUserRoles(userRoles.filter(r => r !== role));
          
          // Update users list
          const updatedUsers = users.map(u => {
            if (u.id === selectedUser.id) {
              return {
                ...u,
                roles: u.roles.filter(r => r !== role)
              };
            }
            return u;
          });
          
          setUsers(updatedUsers);
        }
      } catch (error) {
        console.error('Error removing role:', error);
      }
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            <span>Users & Roles</span>
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <CoinsIcon className="h-4 w-4" />
            <span>Token Management</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4" />
            <span>User Progress</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Users & Roles Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                {/* Users List */}
                <div className="col-span-1 border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Users</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {users.map(user => (
                      <div 
                        key={user.id}
                        className={`p-2 rounded cursor-pointer hover:bg-accent ${selectedUser?.id === user.id ? 'bg-accent' : ''}`}
                        onClick={() => selectUser(user.id)}
                      >
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* User Details */}
                <div className="col-span-2 border rounded-lg p-4">
                  {selectedUser ? (
                    <div>
                      <h3 className="font-medium text-lg mb-4">{selectedUser.email}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <div className="text-sm text-muted-foreground">User ID</div>
                          <div className="font-mono text-xs">{selectedUser.id}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Created</div>
                          <div>{new Date(selectedUser.created_at).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Last Sign In</div>
                          <div>{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'Never'}</div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-medium mb-2">Roles</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {userRoles.map(role => (
                            <Badge key={role} className="flex items-center gap-1 px-3 py-1">
                              {role}
                              <button 
                                onClick={() => handleRemoveRole(role)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Select value={newRoleForUser} onValueChange={setNewRoleForUser}>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="subscriber">Subscriber</SelectItem>
                              <SelectItem value="participant">Participant</SelectItem>
                              <SelectItem value="contributor">Contributor</SelectItem>
                              <SelectItem value="associate">Associate (Admin)</SelectItem>
                              <SelectItem value="builder">Builder (Admin)</SelectItem>
                              <SelectItem value="partner">Partner (Admin)</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={handleAssignRole} disabled={!newRoleForUser}>
                            Assign Role
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recent Activity</h4>
                        <div className="max-h-[200px] overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Activity</TableHead>
                                <TableHead>Date</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userActivity.slice(0, 5).map(activity => (
                                <TableRow key={activity.id}>
                                  <TableCell>
                                    {activity.activity_type}
                                    {activity.entity_type && ` (${activity.entity_type})`}
                                  </TableCell>
                                  <TableCell>
                                    {new Date(activity.created_at).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                              {userActivity.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={2} className="text-center">
                                    No activity recorded
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select a user to view details
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Token Management Tab */}
        <TabsContent value="tokens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Management</CardTitle>
              <CardDescription>
                View and manage token distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div>
                  <h3 className="font-medium mb-4">Tokens for {selectedUser.email}</h3>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Staked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userTokens.map((token: any) => (
                        <TableRow key={token.token_id}>
                          <TableCell>
                            <Badge 
                              className={`bg-gradient-to-r ${token.gradient_class} text-white`}
                            >
                              {token.token_symbol}
                            </Badge>
                          </TableCell>
                          <TableCell>{token.token_name}</TableCell>
                          <TableCell>{token.balance}</TableCell>
                          <TableCell>{token.staked_balance}</TableCell>
                        </TableRow>
                      ))}
                      {userTokens.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No tokens owned
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Token Distribution</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(tokenDistribution).map(([symbol, count]) => (
                        <div key={symbol} className="border rounded p-3">
                          <div className="font-medium">{symbol}</div>
                          <div className="text-2xl font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">users</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a user to view their tokens
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Progress</CardTitle>
              <CardDescription>
                Track user progression through the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedUser ? (
                <div>
                  <h3 className="font-medium mb-4">Progress for {selectedUser.email}</h3>
                  
                  <div className="space-y-6">
                    {userProgress.map((pillar) => (
                      <div key={pillar.pillar_id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{pillar.pillar_title}</h4>
                          <Badge 
                            className={`bg-gradient-to-r ${pillar.gradient_class} text-white`}
                          >
                            {Math.round(pillar.progress_percentage)}%
                          </Badge>
                        </div>
                        
                        <Progress value={pillar.progress_percentage} className="h-2 mb-4" />
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Sections: </span>
                            {pillar.completed_sections} / {pillar.total_sections}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Components: </span>
                            {pillar.completed_components} / {pillar.total_components}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {userProgress.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No progress data available
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a user to view their progress
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>
                Overview of user engagement and platform usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Users by Experience Phase</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(usersByPhase).map(([phase, count]) => (
                      <div key={phase} className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground capitalize">{phase}</div>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">users</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Activity by Type</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(activityByType).map(([type, count]) => (
                      <div key={type} className="border rounded-lg p-4">
                        <div className="text-sm text-muted-foreground">{type}</div>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-xs text-muted-foreground">activities</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium mb-4">Pillar Engagement</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pillar</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Avg. Time Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Superachiever</TableCell>
                      <TableCell>42</TableCell>
                      <TableCell>68%</TableCell>
                      <TableCell>3h 24m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Superachievers</TableCell>
                      <TableCell>28</TableCell>
                      <TableCell>45%</TableCell>
                      <TableCell>2h 12m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Supercivilization</TableCell>
                      <TableCell>17</TableCell>
                      <TableCell>32%</TableCell>
                      <TableCell>1h 45m</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
