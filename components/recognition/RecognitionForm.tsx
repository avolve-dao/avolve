import React, { useState, useCallback } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { Database } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/lib/notifications/use-notifications';
import { useToast } from '@/components/ui/use-toast';
import { useRecognitionAnalytics } from '@/lib/analytics/use-recognition-analytics';
import { Loader2 } from 'lucide-react';

interface RecognitionFormProps {
  recipientId: string;
  onRecognitionSent?: () => void;
}

export const RecognitionForm: React.FC<RecognitionFormProps> = ({
  recipientId,
  onRecognitionSent,
}) => {
  const { supabase, user } = useSupabase();
  const { createNotification } = useNotifications();
  const { toast } = useToast();
  const { trackRecognitionSent } = useRecognitionAnalytics();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRecognition = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        // Validation checks
        if (!user) {
          setError('You must be logged in to send recognition.');
          return;
        }

        if (!message.trim()) {
          setError('Recognition message cannot be empty.');
          return;
        }

        // Insert recognition
        const { error: insertError } = await supabase.from('peer_recognition').insert([
          {
            sender_id: user.id,
            recipient_id: recipientId,
            message: message.trim(),
          },
        ]);

        if (insertError) {
          console.error('Recognition insert error:', insertError);
          setError(insertError.message || 'Failed to send recognition. Please try again.');
          return;
        }

        // Success handling
        setSuccess(true);
        setMessage('');

        // Analytics tracking
        trackRecognitionSent(user.id, recipientId, message);

        // Create notification for recipient
        try {
          await createNotification(
            recipientId,
            'recognition',
            'You received recognition!',
            `You were recognized by ${user.email || 'a peer'}: "${message}"`,
            undefined,
            { sender_id: user.id }
          );
        } catch (notificationError) {
          // Log but don't block the user flow if notification fails
          console.error('Failed to create notification:', notificationError);
        }

        // Show success toast
        toast({
          title: 'Recognition Sent!',
          description: 'Your recognition has been sent successfully.',
          variant: 'default',
        });

        // Callback if provided
        if (onRecognitionSent) onRecognitionSent();
      } catch (err) {
        console.error('Unexpected error in recognition form:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      message,
      recipientId,
      supabase,
      createNotification,
      toast,
      trackRecognitionSent,
      onRecognitionSent,
    ]
  );

  return (
    <form onSubmit={handleRecognition} className="space-y-4">
      <label htmlFor="recognition-message" className="font-medium">
        Recognition Message
      </label>
      <Textarea
        id="recognition-message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Express gratitude, celebrate a win, or recognize a contribution..."
        minLength={3}
        maxLength={500}
        required
        disabled={loading}
        aria-label="Recognition message"
        aria-describedby={error ? 'recognition-error' : success ? 'recognition-success' : undefined}
        className="min-h-[100px] focus:border-blue-400"
      />

      {error && (
        <div id="recognition-error" className="text-red-500 text-sm font-medium" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div id="recognition-success" className="text-green-600 text-sm font-medium" role="status">
          Recognition sent!
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="bg-gradient-to-r from-green-400 to-blue-500 text-white w-full sm:w-auto"
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Recognition'
        )}
      </Button>
    </form>
  );
};

export default RecognitionForm;
