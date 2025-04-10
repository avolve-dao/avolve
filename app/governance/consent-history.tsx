"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InfoIcon, AlertTriangleIcon, CheckIcon, XIcon } from 'lucide-react';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ConsentRecord = {
  consent_id: string;
  interaction_type: string;
  terms: {
    action: string;
    [key: string]: any;
  };
  status: string;
  timestamp: string;
  metadata?: {
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
};

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

/**
 * Consent History Component
 * 
 * Displays a user's consent records with filtering options
 * Implements The Prime Law's principles of voluntary consent by providing
 * transparency and control over consent records
 */
export default function ConsentHistory() {
  const user = useUser();
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [interactionType, setInteractionType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedRecord, setSelectedRecord] = useState<ConsentRecord | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // Fetch consent records when user changes
  useEffect(() => {
    if (!user) {
      setConsentRecords([]);
      setFilteredRecords([]);
      setLoading(false);
      return;
    }

    const fetchConsentRecords = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('user_consent')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setConsentRecords(data || []);
        setFilteredRecords(data || []);
      } catch (err) {
        console.error('Error fetching consent records:', err);
        setError('Failed to load consent records');
      } finally {
        setLoading(false);
      }
    };

    fetchConsentRecords();
  }, [user]);

  // Apply filters when tab, interaction type, or date range changes
  useEffect(() => {
    if (!consentRecords.length) return;

    let filtered = [...consentRecords];

    // Filter by status (tab)
    if (activeTab !== 'all') {
      filtered = filtered.filter(record => record.status === activeTab);
    }

    // Filter by interaction type
    if (interactionType !== 'all') {
      filtered = filtered.filter(record => record.interaction_type === interactionType);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(record => {
        const recordDate = parseISO(record.created_at);
        return (
          isAfter(recordDate, dateRange.from) && 
          isBefore(recordDate, dateRange.to)
        );
      });
    }

    setFilteredRecords(filtered);
  }, [activeTab, interactionType, dateRange, consentRecords]);

  // Handle viewing a consent record
  const handleViewRecord = (record: ConsentRecord) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  // Handle revoking consent
  const handleRevokeConsent = async () => {
    if (!selectedRecord || !user) return;

    setIsRevoking(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_consent')
        .update({ status: 'revoked', updated_at: new Date().toISOString() })
        .eq('consent_id', selectedRecord.consent_id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      const updatedRecords = consentRecords.map(record => 
        record.consent_id === selectedRecord.consent_id 
          ? { ...record, status: 'revoked', updated_at: new Date().toISOString() } 
          : record
      );

      setConsentRecords(updatedRecords);
      setIsRevokeDialogOpen(false);
      setIsViewDialogOpen(false);
    } catch (err) {
      console.error('Error revoking consent:', err);
      setError('Failed to revoke consent');
    } finally {
      setIsRevoking(false);
    }
  };

  // Get unique interaction types for filter dropdown
  const interactionTypes = [
    'all',
    ...Array.from(new Set(consentRecords.map(record => record.interaction_type)))
  ];

  // Format interaction type for display
  const formatInteractionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revoked</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Consent History</h1>
      </div>

      {!user && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to view your consent history.
          </AlertDescription>
        </Alert>
      )}

      {user && (
        <>
          <div className="bg-card rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Interaction Type</label>
                <Select
                  value={interactionType}
                  onValueChange={setInteractionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interactionTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type === 'all' ? 'All Types' : formatInteractionType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Date Range</label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="revoked">Revoked</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading consent records...</div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8">No consent records found</div>
              ) : (
                filteredRecords.map(record => (
                  <Card key={record.consent_id} className="mb-4">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">
                          {formatInteractionType(record.interaction_type)}
                        </CardTitle>
                        {getStatusBadge(record.status)}
                      </div>
                      <CardDescription>
                        {format(new Date(record.created_at), 'PPP p')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className="font-medium">Action:</span> {record.terms?.action || 'N/A'}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewRecord(record)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* View Consent Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          {selectedRecord && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle>{formatInteractionType(selectedRecord.interaction_type)}</DialogTitle>
                  {getStatusBadge(selectedRecord.status)}
                </div>
                <DialogDescription>
                  Created on {format(new Date(selectedRecord.created_at), 'PPP p')}
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Action</h3>
                    <p>{selectedRecord.terms?.action || 'N/A'}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Terms</h3>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
                      {JSON.stringify(selectedRecord.terms, null, 2)}
                    </pre>
                  </div>

                  {selectedRecord.metadata && (
                    <div>
                      <h3 className="font-medium mb-1">Additional Information</h3>
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
                        {JSON.stringify(selectedRecord.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {selectedRecord.status === 'approved' && (
                  <Alert className="mt-4" variant="warning">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Revocation Notice</AlertTitle>
                    <AlertDescription>
                      You can revoke this consent at any time. Revoking consent may affect related functionality.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                {selectedRecord.status === 'approved' && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsRevokeDialogOpen(true);
                    }}
                  >
                    Revoke Consent
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Consent Confirmation Dialog */}
      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Revoke Consent</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this consent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRevokeDialogOpen(false)}
              disabled={isRevoking}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevokeConsent}
              disabled={isRevoking}
            >
              {isRevoking ? 'Revoking...' : 'Revoke Consent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
