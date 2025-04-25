'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Mail } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RequestInviteFormProps {
  onRequestSent?: () => void;
}

export function RequestInviteForm({ onRequestSent }: RequestInviteFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/invitations/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit invitation request');
      }

      setSubmitted(true);
      toast.success('Invitation request submitted successfully!');

      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      console.error('Error submitting invitation request:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit invitation request');
      toast.error('Error submitting invitation request');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Request Received
          </CardTitle>
          <CardDescription>Thank you for your interest in joining Avolve</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              We've received your request to join Avolve. Our team will review your application and
              get back to you soon.
            </p>
            <p>
              Please check your email <strong>{email}</strong> for updates on your invitation
              status.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            If you don't receive an email within a few days, please check your spam folder.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Request an Invitation
        </CardTitle>
        <CardDescription>Join the Avolve community of extraordinary individuals</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Why do you want to join Avolve?</Label>
            <Textarea
              id="reason"
              placeholder="Share a bit about yourself and why you're interested in joining our community..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              disabled={submitting}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Tell us about your interests, goals, and what you hope to contribute to the community.
            </p>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}
        </CardContent>

        <CardFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            We review all requests and send invitations periodically.
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
