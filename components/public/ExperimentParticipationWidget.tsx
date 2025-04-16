import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ExperimentParticipationWidgetProps {
  experimentId: string;
  userId: string;
}

const ExperimentParticipationWidget: React.FC<ExperimentParticipationWidgetProps> = ({ experimentId, userId }) => {
  const [participating, setParticipating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParticipate = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const { error } = await supabase.from('experiment_participation').insert([
      { user_id: userId, experiment_name: experimentId, result: 'participated' }
    ]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setParticipating(true);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ margin: '16px 0' }}>
      {participating ? (
        <div style={{ color: '#008c4a' }}>Thank you for participating in this experiment!</div>
      ) : (
        <button onClick={handleParticipate} disabled={submitting} style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>
          {submitting ? 'Joining...' : 'Join this Experiment'}
        </button>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>Participation logged!</div>}
    </div>
  );
};

export default ExperimentParticipationWidget;
