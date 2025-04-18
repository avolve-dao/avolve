import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define explicit types for events and feedback
interface AnalyticsEvent {
  id: string;
  event_type: string;
  created_at: string;
  event_data: Record<string, unknown>;
}

interface UserFeedback {
  id: string;
  context: string;
  submitted_at: string;
  rating?: number;
  feedback_text: string;
}

export default function AdminInsights() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);

  useEffect(() => {
    supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setEvents((data as AnalyticsEvent[]) || []));
    supabase
      .from('user_feedback')
      .select('*')
      .order('submitted_at', { ascending: false })
      .then(({ data }) => setFeedback((data as UserFeedback[]) || []));
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Live Analytics Events</h1>
      <ul className="mb-10 space-y-2">
        {events.map(e => (
          <li key={e.id} className="bg-gray-50 p-3 rounded border text-xs">
            <span className="font-semibold">{e.event_type}</span> — {e.created_at}<br />
            <span className="text-gray-700">{JSON.stringify(e.event_data)}</span>
          </li>
        ))}
      </ul>
      <h1 className="text-2xl font-bold mb-6">User Feedback</h1>
      <ul className="space-y-2">
        {feedback.map(f => (
          <li key={f.id} className="bg-blue-50 p-3 rounded border text-xs">
            <span className="font-semibold">{f.context}</span> — {f.submitted_at}<br />
            <span className="text-blue-700">{f.rating ? `${f.rating}⭐ – ` : ''}{f.feedback_text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
