'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';
import { AuditService, AuditLog, AuditLogFilter } from '@/lib/auth/audit-service';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Clock, Filter, Download, RefreshCw, Shield, User, FileText } from 'lucide-react';
import { ProtectedPage } from '@/components/auth/protected-page';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

/**
 * RBAC Audit Log Viewer Component
 *
 * This component provides an interface for administrators to view and analyze
 * RBAC audit logs. It allows filtering by action type, entity type, and date range.
 */
export function AuditLogViewer() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState<AuditLogFilter>({
    limit: 100,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);

  const auditService = AuditService.getBrowserInstance();

  // Load audit logs
  useEffect(() => {
    const loadAuditLogs = async () => {
      setLoading(true);
      setError(null);

      try {
        let result;

        if (activeTab === 'all') {
          result = await auditService.getAllAuditLogs(filter);
        } else if (activeTab === 'user' && user) {
          result = await auditService.getUserAuditLogs(user.id, filter.limit, filter.offset);
        }

        if (result?.error) {
          throw new Error(`Failed to load audit logs: ${result.error.message}`);
        }

        if (result?.data) {
          setAuditLogs(result.data);

          // Extract unique action types and entity types for filters
          const actions = [...new Set(result.data.map(log => log.action_type))];
          const entities = [...new Set(result.data.map(log => log.entity_type))];

          setActionTypes(actions);
          setEntityTypes(entities);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAuditLogs();
  }, [activeTab, filter, user, auditService]);

  // Filter logs based on search query
  const filteredLogs = auditLogs.filter(
    log =>
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reset filters
  const resetFilters = () => {
    setFilter({
      limit: 100,
      offset: 0,
    });
    setShowFilters(false);
  };

  // Export logs to CSV
  const exportToCsv = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'ID',
      'User ID',
      'Action Type',
      'Entity Type',
      'Entity ID',
      'Target ID',
      'Details',
      'Created At',
    ];
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log =>
        [
          log.id,
          log.user_id,
          log.action_type,
          log.entity_type,
          log.entity_id,
          log.target_id || '',
          log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : '',
          log.created_at,
        ].join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', `rbac-audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get action type badge color
  const getActionTypeBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case 'assign_role':
      case 'assign_permission':
        return 'default';
      case 'remove_role':
      case 'remove_permission':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Render entity type icon
  const renderEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'user_role':
        return <User className="h-4 w-4" />;
      case 'role_permission':
        return <Shield className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <ProtectedPage requiredRoles="admin" title="RBAC Audit Logs">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>RBAC Audit Logs</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    const currentFilter = { ...filter };
                    setFilter({ ...currentFilter });
                  }, 100);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCsv}
                disabled={filteredLogs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <CardDescription>View and analyze role-based access control audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Logs</TabsTrigger>
              <TabsTrigger value="user">My Logs</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select
                    value={filter.actionType || ''}
                    onValueChange={value =>
                      setFilter({ ...filter, actionType: value || undefined })
                    }
                  >
                    <SelectTrigger id="action-type">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All actions</SelectItem>
                      {actionTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entity-type">Entity Type</Label>
                  <Select
                    value={filter.entityType || ''}
                    onValueChange={value =>
                      setFilter({ ...filter, entityType: value || undefined })
                    }
                  >
                    <SelectTrigger id="entity-type">
                      <SelectValue placeholder="All entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All entities</SelectItem>
                      {entityTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="from-date">From Date</Label>
                  <DatePicker
                    date={filter.fromDate}
                    setDate={date => setFilter({ ...filter, fromDate: date })}
                    placeholder="Select from date"
                  />
                </div>
                <div>
                  <Label htmlFor="to-date">To Date</Label>
                  <DatePicker
                    date={filter.toDate}
                    setDate={date => setFilter({ ...filter, toDate: date })}
                    placeholder="Select to date"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </div>
          )}

          {filteredLogs.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <Clock className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">No audit logs found</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={getActionTypeBadgeVariant(log.action_type)}>
                              {log.action_type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {renderEntityTypeIcon(log.entity_type)}
                            <span>{log.entity_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.details ? (
                            <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto max-w-[300px]">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-muted-foreground">No details</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {auditLogs.length} logs
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilter({
                  ...filter,
                  offset: Math.max(0, (filter.offset || 0) - (filter.limit || 100)),
                })
              }
              disabled={filter.offset === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilter({ ...filter, offset: (filter.offset || 0) + (filter.limit || 100) })
              }
              disabled={filteredLogs.length < (filter.limit || 100)}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </ProtectedPage>
  );
}
