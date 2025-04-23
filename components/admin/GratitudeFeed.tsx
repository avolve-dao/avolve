"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RecognitionForm } from '@/components/recognition';

interface GratitudeEvent {
  id: string;
  recipient_id: string;
  giver_id: string;
  onboarding_id: string | null;
  reason: string;
  details: any;
  created_at: string;
}

export function GratitudeFeed({ adminId }: { adminId: string }) {
  const [events, setEvents] = useState<GratitudeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGratitudeEvents() {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('gratitude_events')
        .select('*')
        .eq('recipient_id', adminId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setEvents(data);
      setLoading(false);
    }
    fetchGratitudeEvents();
  }, [adminId]);

  if (loading) return <div className="p-4 text-center">Loading recognitions...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-2">Recent Recognitions</h3>
      <RecognitionForm recipientId={adminId} />
      {events.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No recent recognitions yet. Support your community to get recognized!</div>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="flex flex-col border-b last:border-b-0 pb-2">
              <span className="font-medium text-emerald-700">🎉 Recognized for: {event.reason.replace('_', ' ')}</span>
              <span className="text-xs text-gray-500">{new Date(event.created_at).toLocaleString()}</span>
              {event.details && (
                <span className="text-xs text-gray-400">Details: {JSON.stringify(event.details)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
