'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Papa from 'papaparse';

interface BulkInvitationUploadProps {
  onInvitationsCreated?: (count: number) => void;
}

type InvitationData = {
  email: string;
  maxUses?: number;
  expiresIn?: string;
  metadata?: Record<string, any>;
};

export function BulkInvitationUpload({ onInvitationsCreated }: BulkInvitationUploadProps) {
  const [activeTab, setActiveTab] = useState('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [emailList, setEmailList] = useState('');
  const [maxUses, setMaxUses] = useState('1');
  const [expiresIn, setExpiresIn] = useState('7 days');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCsvFile(files[0]);

      // Preview the CSV content
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setCsvText(event.target.result as string);
        }
      };
      reader.readAsText(files[0]);
    }
  };

  const parseCSV = (csvContent: string): InvitationData[] => {
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      setErrors(results.errors.map(err => `CSV Error: ${err.message} at row ${err.row}`));
      return [];
    }

    const invitations: InvitationData[] = [];
    const newErrors: string[] = [];

    results.data.forEach((row: any, index: number) => {
      if (!row.email) {
        newErrors.push(`Row ${index + 1}: Missing email address`);
        return;
      }

      const invitation: InvitationData = {
        email: row.email.trim(),
        maxUses: row.maxUses ? parseInt(row.maxUses, 10) : undefined,
        expiresIn: row.expiresIn || undefined,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      };

      invitations.push(invitation);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return [];
    }

    return invitations;
  };

  const parseEmailList = (): InvitationData[] => {
    const emails = emailList
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      setErrors(['No valid email addresses found']);
      return [];
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: string[] = [];
    const validEmails: string[] = [];

    emails.forEach((email, index) => {
      if (!emailRegex.test(email)) {
        newErrors.push(`Line ${index + 1}: Invalid email format - ${email}`);
      } else {
        validEmails.push(email);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    return validEmails.map(email => ({
      email,
      maxUses: parseInt(maxUses, 10),
      expiresIn,
    }));
  };

  const createInvitations = async (invitations: InvitationData[]) => {
    setLoading(true);
    setErrors([]);
    setSuccessCount(0);
    setErrorCount(0);

    try {
      const response = await fetch('/api/invitations/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitations }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create invitations');
      }

      setSuccessCount(data.created);
      setErrorCount(data.failed);

      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }

      if (data.created > 0) {
        toast.success(`Created ${data.created} invitations successfully!`);

        if (onInvitationsCreated) {
          onInvitationsCreated(data.created);
        }
      }
    } catch (error) {
      console.error('Error creating invitations:', error);
      setErrors([error instanceof Error ? error.message : 'Failed to create invitations']);
      toast.error('Error creating invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let invitations: InvitationData[] = [];

    if (activeTab === 'csv') {
      if (!csvFile && !csvText) {
        setErrors(['Please upload a CSV file or paste CSV content']);
        return;
      }

      invitations = parseCSV(csvText || (await csvFile?.text()) || '');
    } else {
      invitations = parseEmailList();
    }

    if (invitations.length === 0) {
      if (errors.length === 0) {
        setErrors(['No valid invitations found']);
      }
      return;
    }

    await createInvitations(invitations);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Invitation Upload
        </CardTitle>
        <CardDescription>
          Create multiple invitations at once by uploading a CSV file or entering a list of email
          addresses
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <Tabs defaultValue="csv" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
              <TabsTrigger value="list">Email List</TabsTrigger>
            </TabsList>

            <TabsContent value="csv" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvFile">Upload CSV File</Label>
                <Input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  CSV should include columns: email (required), maxUses, expiresIn, metadata
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csvText">Or Paste CSV Content</Label>
                <Textarea
                  id="csvText"
                  placeholder="email,maxUses,expiresIn,metadata
user1@example.com,1,7 days,{}"
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  disabled={loading}
                  rows={5}
                />
              </div>

              {csvFile && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{csvFile.name}</span>
                  <span className="text-muted-foreground">
                    ({Math.round(csvFile.size / 1024)} KB)
                  </span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailList">Email Addresses (one per line)</Label>
                <Textarea
                  id="emailList"
                  placeholder="user1@example.com
user2@example.com
user3@example.com"
                  value={emailList}
                  onChange={e => setEmailList(e.target.value)}
                  disabled={loading}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses Per Invitation</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={e => setMaxUses(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Expires In</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn} disabled={loading}>
                    <SelectTrigger id="expiresIn">
                      <SelectValue placeholder="Select expiration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 day">1 day</SelectItem>
                      <SelectItem value="3 days">3 days</SelectItem>
                      <SelectItem value="7 days">7 days</SelectItem>
                      <SelectItem value="14 days">14 days</SelectItem>
                      <SelectItem value="30 days">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 text-sm">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {(successCount > 0 || errorCount > 0) && (
            <Alert variant={errorCount > 0 ? 'warning' : 'success'}>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Upload Results</AlertTitle>
              <AlertDescription>
                <p>
                  Successfully created: <strong>{successCount}</strong> invitations
                </p>
                {errorCount > 0 && (
                  <p>
                    Failed to create: <strong>{errorCount}</strong> invitations
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="text-xs text-muted-foreground">
            <Mail className="h-3 w-3 inline-block mr-1" />
            Invitations will be created immediately
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Create Invitations'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
