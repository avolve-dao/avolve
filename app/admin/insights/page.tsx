"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AdminInsights() {
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setEvents(data || []));
    supabase
      .from('user_feedback')
      .select('*')
      .order('submitted_at', { ascending: false })
      .then(({ data }) => setFeedback(data || []));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Insights</h1>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Recent Analytics Events</h2>
        <ul className="space-y-2 text-xs">
          {events.map((e: any) => (
            <li key={e.id} className="bg-gray-50 p-2 rounded border">
              <span className="font-semibold">{e.event_type}</span> — {e.created_at}
              <br />
              <span className="text-gray-700">{e.context}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Recent User Feedback</h2>
        <ul className="space-y-2">
          {feedback.map((f: any) => (
            <li key={f.id} className="bg-blue-50 p-3 rounded border text-xs">
              <span className="font-semibold">{f.context}</span> — {f.submitted_at}
              <br />
              <span className="text-blue-700">
                {f.rating ? `${f.rating}⭐ – ` : ''}
                {f.feedback_text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
