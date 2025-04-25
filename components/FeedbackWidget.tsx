import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * FeedbackWidget - Collects real user feedback and stores it in Supabase user_feedback table.
 * @param context - The context for feedback (e.g., 'onboarding', 'puzzle', 'feature_request')
 */
export default function FeedbackWidget({ context }: { context: string }) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {
    await supabase.from('user_feedback').insert([{ context, feedback_text: feedback, rating }]);
    setSubmitted(true);
  };

  if (submitted)
    return (
      <div className="p-4 rounded bg-green-50 text-green-700">Thank you for your feedback!</div>
    );

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-xs border border-zinc-200">
      <div className="font-semibold mb-2">How was your experience?</div>
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            className={`px-2 py-1 rounded ${rating === n ? 'bg-yellow-300 font-bold' : 'bg-gray-100'} focus:outline focus:ring-2 focus:ring-yellow-400`}
          >
            {n}⭐
          </button>
        ))}
      </div>
      <textarea
        className="w-full p-2 mb-2 border rounded focus:outline focus:ring-2 focus:ring-blue-400"
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Optional comments..."
        rows={3}
      />
      <button
        className="w-full py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
        onClick={submitFeedback}
        disabled={!rating}
      >
        Submit
      </button>
    </div>
  );
}
