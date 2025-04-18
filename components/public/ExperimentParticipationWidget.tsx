import React, { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ExperimentParticipationWidgetProps {
  experimentId: string;
  userId: string;
}

const supabase = createClient();

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
    <Card className="my-4 max-w-md">
      <CardContent className="p-4">
        {participating ? (
          <div className="text-green-600 font-medium">Thank you for participating in this experiment!</div>
        ) : (
          <Button onClick={handleParticipate} disabled={submitting} className="w-full">
            {submitting ? 'Joining...' : 'Join this Experiment'}
          </Button>
        )}
        {error && <div className="text-sm text-destructive mt-2">{error}</div>}
        {success && <div className="text-sm text-green-600 mt-2">Participation logged!</div>}
      </CardContent>
    </Card>
  );
};

export default ExperimentParticipationWidget;
