/**
 * Network Dashboard Widget
 *
 * Displays physical nodes and user memberships
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNetworkApi } from '@/lib/api/hooks';
import { PhysicalNode, NodeMembership, NetworkCensus } from '@/lib/types/database.types';
import { useUser } from '@/lib/hooks/use-user';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function NetworkWidget() {
  const networkApi = useNetworkApi();
  const { user } = useUser();
  const [activeNodes, setActiveNodes] = useState<PhysicalNode[]>([]);
  const [userMemberships, setUserMemberships] = useState<any[]>([]);
  const [latestCensus, setLatestCensus] = useState<NetworkCensus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // Load active nodes
        const nodesData = await networkApi.getPhysicalNodes('active');
        setActiveNodes(nodesData);

        // Load latest census
        const censusData = await networkApi.getLatestCensus();
        setLatestCensus(censusData);

        if (user?.id) {
          // Load user's memberships
          const membershipsData = await networkApi.getUserMemberships(user.id, 'active');
          setUserMemberships(membershipsData);
        }
      } catch (error) {
        console.error('Error loading network data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [networkApi, user?.id]);

  // Format node type for display
  const formatNodeType = (type: string) => {
    switch (type) {
      case 'residence':
        return 'Residence';
      case 'coworking':
        return 'Coworking Space';
      case 'event_space':
        return 'Event Space';
      case 'community_center':
        return 'Community Center';
      default:
        return type
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  // Format membership type for display
  const formatMembershipType = (type: string) => {
    switch (type) {
      case 'founder':
        return 'Founder';
      case 'resident':
        return 'Resident';
      case 'member':
        return 'Member';
      case 'visitor':
        return 'Visitor';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Physical Network</CardTitle>
        <CardDescription>Nodes and your memberships</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-20 w-full mb-2" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          <>
            {latestCensus && (
              <div className="mb-4 p-3 rounded-lg bg-muted">
                <h3 className="text-sm font-medium mb-2">Network Census</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold">{latestCensus.total_nodes}</div>
                    <div className="text-xs text-muted-foreground">Nodes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{latestCensus.total_members}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {latestCensus.total_funding.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Funding</div>
                  </div>
                </div>
              </div>
            )}

            {userMemberships.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Your Memberships</h3>
                <div className="space-y-2">
                  {userMemberships.map(membership => (
                    <div key={membership.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{membership.node?.name || 'Unknown Node'}</h4>
                        <Badge>{formatMembershipType(membership.membership_type)}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {membership.node?.city}, {membership.node?.state_province},{' '}
                        {membership.node?.country}
                      </div>
                      {membership.node?.funding_goal > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Funding Progress</span>
                            <span>
                              {Math.round(
                                (membership.node.current_funding / membership.node.funding_goal) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              (membership.node.current_funding / membership.node.funding_goal) * 100
                            }
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium mb-2">Active Nodes</h3>
              <div className="grid grid-cols-2 gap-2">
                {activeNodes.slice(0, 4).map(node => (
                  <div key={node.id} className="border rounded-lg p-2">
                    <h4 className="font-medium text-sm truncate">{node.name}</h4>
                    <div className="text-xs text-muted-foreground mb-1 truncate">
                      {node.city}, {node.country}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatNodeType(node.node_type)}
                    </Badge>
                  </div>
                ))}

                {activeNodes.length === 0 && (
                  <div className="col-span-2 text-center py-4 text-muted-foreground">
                    No active nodes found.
                  </div>
                )}
              </div>

              {activeNodes.length > 4 && (
                <div className="text-center mt-2">
                  <a href="/network/nodes" className="text-sm text-primary hover:underline">
                    View all {activeNodes.length} nodes
                  </a>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
