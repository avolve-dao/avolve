import React, { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import FeedbackWidget from './FeedbackWidget';
import ExperimentParticipationWidget from './ExperimentParticipationWidget';
import UserAdminStoriesBar from './UserAdminStoriesBar';

const supabase = createClient();

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
  experiment_type: 'simulation' | 'real-world';
}

interface Learning {
  id: string;
  experiment_id: string;
  summary: string;
  details?: string;
  created_at: string;
  actionable_status: 'needs_review' | 'actionable' | 'implemented' | 'follow_up';
  context?: {
    pillar?: string;
    token?: string;
    quest?: string;
    [key: string]: any;
  };
}

const pillars = [
  { key: 'individual', label: 'Individual (Superachiever)' },
  { key: 'collective', label: 'Collective (Superachievers)' },
  { key: 'ecosystem', label: 'Ecosystem (Supercivilization)' },
];

const PublicCanvasDashboard: React.FC = () => {
  const [canvasEntries, setCanvasEntries] = useState<CanvasEntry[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [selectedPillar, setSelectedPillar] = useState<string>('individual');
  const [loading, setLoading] = useState(true);
  const [learningStatusFilter, setLearningStatusFilter] = useState<string>('');
  const [learningTypeFilter, setLearningTypeFilter] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Assume userId is obtained from auth context/session
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('user_id') || '' : '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: canvas, error: canvasError } = await supabase
        .from('canvas_entries')
        .select('*')
        .eq('pillar', selectedPillar)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      const { data: experiments, error: expError } = await supabase
        .from('experiments')
        .select('*');
      const { data: learnings, error: learnError } = await supabase
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

  useEffect(() => {
    // Show onboarding for first-time users (localStorage flag)
    if (typeof window !== 'undefined' && !window.localStorage.getItem('avolve_onboarded')) {
      setShowOnboarding(true);
      window.localStorage.setItem('avolve_onboarded', 'true');
    }
  }, []);

  const renderExperiments = (canvasId: string) => {
    const relatedExperiments = experiments.filter(e => e.canvas_entry_id === canvasId);
    return (
      <ul>
        {relatedExperiments.map(exp => (
          <li key={exp.id}>
            <strong>{exp.title}</strong> ({exp.status}){' '}
            <span style={{
              display: 'inline-block',
              marginLeft: 8,
              padding: '2px 8px',
              borderRadius: 8,
              fontSize: '0.85em',
              background: exp.experiment_type === 'simulation' ? '#f5eaff' : '#eaffea',
              color: exp.experiment_type === 'simulation' ? '#a259e6' : '#2e7d32',
              fontWeight: 600
            }}>
              {exp.experiment_type === 'simulation' ? 'Simulation' : 'Real-World'}
            </span><br />
            <span>{exp.description}</span>
            {/* Participation Widget */}
            {userId && <ExperimentParticipationWidget experimentId={exp.id} userId={userId} />}
            {/* Feedback Widget for experiment */}
            {userId && <FeedbackWidget context={`experiment:${exp.id}`} userId={userId} />}
            {/* Stories Bar for experiment */}
            <UserAdminStoriesBar context={`experiment:${exp.id}`} />
            {renderLearnings(exp.id)}
          </li>
        ))}
      </ul>
    );
  };

  const renderLearnings = (experimentId: string) => {
    let relatedLearnings = learnings.filter(l => l.experiment_id === experimentId);
    if (learningStatusFilter) {
      relatedLearnings = relatedLearnings.filter(l => l.actionable_status === learningStatusFilter);
    }
    if (learningTypeFilter) {
      relatedLearnings = relatedLearnings.filter(l => (l.context?.pillar || '').toLowerCase() === learningTypeFilter);
    }
    if (relatedLearnings.length === 0) return null;
    return (
      <ul style={{ marginLeft: '1em' }}>
        {relatedLearnings.map(learning => (
          <li key={learning.id} style={{ marginBottom: 10 }}>
            <em>{learning.summary}</em>
            {learning.details && <div style={{ fontSize: '0.95em', color: '#555' }}>{learning.details}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span
                style={{
                  fontSize: '0.8em', borderRadius: 8, padding: '2px 8px', fontWeight: 600,
                  background: learning.actionable_status === 'actionable' ? '#fffbe6' : learning.actionable_status === 'implemented' ? '#e6ffed' : learning.actionable_status === 'follow_up' ? '#e6f0ff' : '#f5f5f5',
                  color: learning.actionable_status === 'actionable' ? '#b26a00' : learning.actionable_status === 'implemented' ? '#237804' : learning.actionable_status === 'follow_up' ? '#0050b3' : '#888',
                  cursor: 'help',
                }}
                title="Actionable status: Needs Review, Actionable, Implemented, or Follow Up. Use this to track progress and next steps."
              >
                {learning.actionable_status.replace('_', ' ').toUpperCase()}
              </span>
              {learning.context?.pillar && (
                <span
                  style={{ fontSize: '0.8em', background: '#f0f8ff', color: '#0070f3', borderRadius: 8, padding: '2px 8px', fontWeight: 600, cursor: 'help' }}
                  title="Pillar: Individual (Superachiever), Collective (Superachievers), or Ecosystem (Supercivilization)."
                >
                  {learning.context.pillar.charAt(0).toUpperCase() + learning.context.pillar.slice(1)}
                </span>
              )}
              {learning.context?.token && (
                <span
                  style={{ fontSize: '0.8em', background: '#f8fff0', color: '#2e7d32', borderRadius: 8, padding: '2px 8px', fontWeight: 600, cursor: 'help' }}
                  title="Token: Platform or pillar token associated with this learning."
                >
                  {learning.context.token.toUpperCase()}
                </span>
              )}
              {learning.context?.quest && (
                <span
                  style={{ fontSize: '0.8em', background: '#fff0f8', color: '#b4004e', borderRadius: 8, padding: '2px 8px', fontWeight: 600, cursor: 'help' }}
                  title="Quest: Thematic or strategic quest linked to this learning."
                >
                  {learning.context.quest}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Strategyzer Canvas (Public Transparency)</h1>
      {/* Stories Bar - contextually filtered to pillar */}
      <UserAdminStoriesBar context={selectedPillar} />
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
      <h3 style={{ marginTop: 0 }}>Filter Learnings:</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={learningStatusFilter} onChange={e => setLearningStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="needs_review">Needs Review</option>
          <option value="actionable">Actionable</option>
          <option value="implemented">Implemented</option>
          <option value="follow_up">Follow Up</option>
        </select>
        <select value={learningTypeFilter} onChange={e => setLearningTypeFilter(e.target.value)}>
          <option value="">All Pillars</option>
          <option value="individual">Individual (Superachiever)</option>
          <option value="collective">Collective (Superachievers)</option>
          <option value="ecosystem">Ecosystem (Supercivilization)</option>
        </select>
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
                  <div><strong>Type:</strong> {entry.canvas_type}</div>
                  <div>{entry.description}</div>
                  {/* Feedback Widget for canvas entry */}
                  {userId && <FeedbackWidget context={`canvas:${entry.id}`} userId={userId} />}
                  {/* Stories Bar for canvas entry */}
                  <UserAdminStoriesBar context={`canvas:${entry.id}`} />
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
      <div style={{ marginTop: 32, fontSize: '0.95em', color: '#555' }}>
        <p>This dashboard provides transparent visibility into the current and evolving Canvas, experiments, and learnings for each pillar of the Avolve journey. User feedback and participation are always welcome!</p>
      </div>
      {/* Native React Modal for Onboarding */}
      {showOnboarding && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="avolve-onboarding-title"
        >
          <div style={{
            background: '#fff', borderRadius: 12, padding: 32, maxWidth: 480, width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)', position: 'relative',
          }}>
            <button
              onClick={() => setShowOnboarding(false)}
              style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}
              aria-label="Close onboarding modal"
            >&times;</button>
            <h2 id="avolve-onboarding-title" style={{ marginTop: 0, marginBottom: 12 }}>🌱 Welcome to Avolve!</h2>
            <p style={{ fontSize: '1.1em', marginBottom: 16 }}>
              Begin your Supercivilization journey from <strong>Degen</strong> to <strong>Regen</strong>.<br/>
              <br/>
              <strong>Explore:</strong>
              <ul style={{ margin: '8px 0 16px 18px', fontSize: '1em' }}>
                <li><b>Canvas Dashboard</b>: Visualize transformation at the <b>Individual</b>, <b>Collective</b>, and <b>Ecosystem</b> levels.</li>
                <li><b>Experiments</b>: Run Real-World & Simulation experiments. Track status and learnings.</li>
                <li><b>Learnings & Results</b>: Filter, act, and celebrate progress. Badges show actionable status and context.</li>
                <li><b>Stories Bar</b>: Share and discover real journeys and breakthroughs.</li>
              </ul>
              <b>Tip:</b> Hover over badges and icons for more context.
            </p>
            <button
              onClick={() => setShowOnboarding(false)}
              style={{
                background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6,
                padding: '10px 28px', fontWeight: 600, fontSize: '1em', cursor: 'pointer',
                marginTop: 8
              }}
            >
              🚀 Start Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCanvasDashboard;
