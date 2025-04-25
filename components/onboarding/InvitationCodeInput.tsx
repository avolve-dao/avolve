'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

interface InvitationCodeInputProps {
  onValidCode: (code: string) => void;
  onSkip?: () => void;
  required?: boolean;
}

export function InvitationCodeInput({
  onValidCode,
  onSkip,
  required = true,
}: InvitationCodeInputProps) {
  const supabase = createClientComponentClient<Database>();
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [error, setError] = useState<string | null>(null);

  const validateCode = async () => {
    if (!code.trim()) {
      setError('Please enter an invitation code');
      return;
    }

    setValidating(true);
    setError(null);
    setValidationStatus('idle');

    try {
      const response = await fetch('/api/invitations/validate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to validate invitation code');
      }

      if (data.isValid) {
        setValidationStatus('valid');
        toast.success('Valid invitation code!');
        onValidCode(code.trim());
      } else {
        setValidationStatus('invalid');
        setError('Invalid invitation code. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating invitation code:', error);
      setValidationStatus('invalid');
      setError(error instanceof Error ? error.message : 'Failed to validate invitation code');
    } finally {
      setValidating(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      toast.error('Invitation code is required to continue');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invitation-code">
          Invitation Code {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              id="invitation-code"
              placeholder="Enter your invitation code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className={`pr-10 ${
                validationStatus === 'valid'
                  ? 'border-green-500 focus-visible:ring-green-500'
                  : validationStatus === 'invalid'
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
              }`}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  validateCode();
                }
              }}
              disabled={validating || validationStatus === 'valid'}
            />
            {validationStatus === 'valid' && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
            {validationStatus === 'invalid' && (
              <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
            )}
          </div>
          <Button
            onClick={validateCode}
            disabled={validating || !code.trim() || validationStatus === 'valid'}
          >
            {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-sm text-muted-foreground">
          Enter the invitation code you received to join Avolve.
        </p>
      </div>

      {!required && (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
}
