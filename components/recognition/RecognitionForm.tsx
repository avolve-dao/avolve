import React, { useState } from 'react';
import { useSupabase } from '@/lib/supabase/use-supabase';
import { Database } from '@/lib/supabase/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/lib/notifications/use-notifications';
import { useToast } from '@/components/ui/use-toast';
import { useRecognitionAnalytics } from '@/lib/analytics/use-recognition-analytics';

interface RecognitionFormProps {
  recipientId: string;
  onRecognitionSent?: () => void;
}

export const RecognitionForm: React.FC<RecognitionFormProps> = ({ recipientId, onRecognitionSent }) => {
  const { supabase, user } = useSupabase();
  const { createNotification } = useNotifications();
  const { toast } = useToast();
  const { trackRecognitionSent } = useRecognitionAnalytics();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRecognition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!user) {
      setError('You must be logged in to send recognition.');
      setLoading(false);
      return;
    }
    if (!message.trim()) {
      setError('Recognition message cannot be empty.');
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('peer_recognition')
      .insert([
        {
          sender_id: user.id,
          recipient_id: recipientId,
          message,
        },
      ]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setMessage('');
    // Analytics: Track recognition sent
    trackRecognitionSent(user.id, recipientId, message);
    // Trigger in-app notification for recipient
    await createNotification(
      recipientId,
      'recognition',
      'You received recognition!',
      `You were recognized by ${user.email || 'a peer'}: "${message}"`,
      undefined,
      { sender_id: user.id }
    );
    toast({
      title: 'Recognition Sent!',
      description: 'Your recognition has been sent successfully.',
      variant: 'default',
    });
    if (onRecognitionSent) onRecognitionSent();
    setLoading(false);
  };

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
        aria-label="Recognition message"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">Recognition sent!</div>}
      <Button type="submit" disabled={loading} className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
        {loading ? 'Sending...' : 'Send Recognition'}
      </Button>
    </form>
  );
};

export default RecognitionForm;
