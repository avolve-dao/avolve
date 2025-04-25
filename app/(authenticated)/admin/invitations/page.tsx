'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvitationManager } from '@/components/invitation/InvitationManager';
import { BulkInvitationUpload } from '@/components/invitation/BulkInvitationUpload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Loader2, RefreshCw } from 'lucide-react';

interface InvitationStats {
  total: number;
  active: number;
  used: number;
  expired: number;
}

// Define the invitation type based on the actual database schema
interface Invitation {
  id: string;
  email: string | null;
  code: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
  created_by: string | null;
  max_uses: number;
  uses: number;
  expires_at: string | null;
  updated_at: string;
  metadata: Record<string, any>;
  claimed_by: string | null;
}

export default function InvitationsAdminPage() {
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
  });

  // Fetch invitation statistics
  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('invitations').select('*');

      if (error) throw error;

      const now = new Date();
      const invitations = (data as unknown as Invitation[]) || [];

      setStats({
        total: invitations.length,
        active: invitations.filter(
          inv => !inv.used && (!inv.expires_at || new Date(inv.expires_at) > now)
        ).length,
        used: invitations.filter(inv => inv.used).length,
        expired: invitations.filter(inv => inv.expires_at && new Date(inv.expires_at) <= now)
          .length,
      });
    } catch (error) {
      console.error('Error fetching invitation stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitation statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk invitations created
  const handleBulkInvitationsCreated = (count: number) => {
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invitation Management</h1>
        <Button variant="outline" onClick={fetchStats} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
            <CardDescription>Total Invitations</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-green-600">{stats.active}</CardTitle>
            <CardDescription>Active Invitations</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-blue-600">{stats.used}</CardTitle>
            <CardDescription>Used Invitations</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-amber-600">{stats.expired}</CardTitle>
            <CardDescription>Expired Invitations</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="manage">Manage Invitations</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="requests">Invitation Requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <InvitationManager onInvitationCreated={fetchStats} />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkInvitationUpload onInvitationsCreated={handleBulkInvitationsCreated} />
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Invitation Requests</CardTitle>
              <CardDescription>Manage requests from users who want to join Avolve</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Coming Soon</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          Invitation request management will be available in an upcoming release.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Invitation Settings</CardTitle>
              <CardDescription>Configure global invitation settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Coming Soon</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>Global invitation settings will be available in an upcoming release.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
