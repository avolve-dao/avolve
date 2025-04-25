import React, { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

// Types for Canvas, Experiment, Learning
interface CanvasEntry {
  id: string;
  pillar: 'individual' | 'collective' | 'ecosystem';
  canvas_type: string;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface Experiment {
  id: string;
  canvas_entry_id: string;
  title: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface Learning {
  id: string;
  experiment_id: string;
  summary: string;
  details?: string;
  created_at: string;
}

const pillars = [
  { key: 'individual', label: 'Individual (Superachiever)' },
  { key: 'collective', label: 'Collective (Superachievers)' },
  { key: 'ecosystem', label: 'Ecosystem (Supercivilization)' },
];

const CanvasDashboard: React.FC = () => {
  const [canvasEntries, setCanvasEntries] = useState<CanvasEntry[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string>('individual');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: canvas, error: canvasError } = await createClient()
        .from('canvas_entries')
        .select('*')
        .eq('pillar', selectedPillar)
        .order('created_at', { ascending: false });
      const { data: experiments, error: expError } = await createClient()
        .from('experiments')
        .select('*');
      const { data: learnings, error: learnError } = await createClient()
        .from('learnings')
        .select('*');
      if (!canvasError && !expError && !learnError) {
        setCanvasEntries(canvas || []);
        setExperiments(experiments || []);
        setLearnings(learnings || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [selectedPillar]);

  const renderExperiments = (canvasId: string) => {
    const relatedExperiments = experiments.filter(e => e.canvas_entry_id === canvasId);
    return (
      <ul>
        {relatedExperiments.map(exp => (
          <li key={exp.id}>
            <strong>{exp.title}</strong> ({exp.status})<br />
            <span>{exp.description}</span>
            {renderLearnings(exp.id)}
          </li>
        ))}
      </ul>
    );
  };

  const renderLearnings = (experimentId: string) => {
    const relatedLearnings = learnings.filter(l => l.experiment_id === experimentId);
    if (relatedLearnings.length === 0) return null;
    return (
      <ul style={{ marginLeft: '1em' }}>
        {relatedLearnings.map(learning => (
          <li key={learning.id}>
            <em>{learning.summary}</em>
            {learning.details && (
              <div style={{ fontSize: '0.95em', color: '#555' }}>{learning.details}</div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Strategyzer Canvas Dashboard</h1>
      <div style={{ marginBottom: 16 }}>
        {pillars.map(p => (
          <button
            key={p.key}
            onClick={() => setSelectedPillar(p.key)}
            style={{
              marginRight: 8,
              background: selectedPillar === p.key ? '#0070f3' : '#eee',
              color: selectedPillar === p.key ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {canvasEntries.length === 0 ? (
            <div>No Canvas entries for this pillar yet.</div>
          ) : (
            <ul>
              {canvasEntries.map(entry => (
                <li key={entry.id} style={{ marginBottom: 24 }}>
                  <h3>{entry.title}</h3>
                  <div>
                    <strong>Type:</strong> {entry.canvas_type}
                  </div>
                  <div>{entry.description}</div>
                  <div style={{ marginTop: 8 }}>
                    <strong>Experiments:</strong>
                    {renderExperiments(entry.id)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasDashboard;
