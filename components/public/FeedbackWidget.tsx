import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface FeedbackWidgetProps {
  context: string; // e.g. 'canvas', 'experiment', 'onboarding', etc.
  userId: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ context, userId }) => {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('user_feedback').insert([
      { user_id: userId, context, feedback }
    ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setFeedback('');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f8f8ff', padding: 16, borderRadius: 8, marginTop: 16, maxWidth: 400 }}>
      <label>
        <strong>Share your feedback:</strong>
        <textarea
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="What did you think? Any ideas, pains, or gains?"
          style={{ width: '100%', minHeight: 60, marginTop: 8 }}
          required
        />
      </label>
      <button type="submit" disabled={submitting || !feedback.trim()} style={{ marginTop: 8, background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>
        {submitting ? 'Submitting...' : 'Send Feedback'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>Thank you for your feedback!</div>}
    </form>
  );
};

export default FeedbackWidget;
