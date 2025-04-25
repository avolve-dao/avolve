import React, { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import FeedbackWidget from './FeedbackWidget';
import ExperimentParticipationWidget from './ExperimentParticipationWidget';
import UserAdminStoriesBar from './UserAdminStoriesBar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

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
      const { data: experiments, error: expError } = await supabase.from('experiments').select('*');
      const { data: learnings, error: learnError } = await supabase.from('learnings').select('*');
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
            <span
              className="inline-block ml-2 px-2 py-1 rounded-md text-xs font-bold"
              style={{
                background: exp.experiment_type === 'simulation' ? '#f5eaff' : '#eaffea',
                color: exp.experiment_type === 'simulation' ? '#a259e6' : '#2e7d32',
              }}
            >
              {exp.experiment_type === 'simulation' ? 'Simulation' : 'Real-World'}
            </span>
            <br />
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
      relatedLearnings = relatedLearnings.filter(
        l => (l.context?.pillar || '').toLowerCase() === learningTypeFilter
      );
    }
    if (relatedLearnings.length === 0) return null;
    return (
      <ul className="ml-4">
        {relatedLearnings.map(learning => (
          <li key={learning.id} className="mb-4">
            <em>{learning.summary}</em>
            {learning.details && (
              <div className="text-sm text-muted-foreground">{learning.details}</div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-bold rounded-md px-2 py-1"
                style={{
                  background:
                    learning.actionable_status === 'actionable'
                      ? '#fffbe6'
                      : learning.actionable_status === 'implemented'
                        ? '#e6ffed'
                        : learning.actionable_status === 'follow_up'
                          ? '#e6f0ff'
                          : '#f5f5f5',
                  color:
                    learning.actionable_status === 'actionable'
                      ? '#b26a00'
                      : learning.actionable_status === 'implemented'
                        ? '#237804'
                        : learning.actionable_status === 'follow_up'
                          ? '#0050b3'
                          : '#888',
                  cursor: 'help',
                }}
                title="Actionable status: Needs Review, Actionable, Implemented, or Follow Up. Use this to track progress and next steps."
              >
                {learning.actionable_status.replace('_', ' ').toUpperCase()}
              </span>
              {learning.context?.pillar && (
                <span
                  className="text-xs font-bold rounded-md px-2 py-1"
                  style={{
                    background: '#f0f8ff',
                    color: '#0070f3',
                    cursor: 'help',
                  }}
                  title="Pillar: Individual (Superachiever), Collective (Superachievers), or Ecosystem (Supercivilization)."
                >
                  {learning.context.pillar.charAt(0).toUpperCase() +
                    learning.context.pillar.slice(1)}
                </span>
              )}
              {learning.context?.token && (
                <span
                  className="text-xs font-bold rounded-md px-2 py-1"
                  style={{
                    background: '#f8fff0',
                    color: '#2e7d32',
                    cursor: 'help',
                  }}
                  title="Token: Platform or pillar token associated with this learning."
                >
                  {learning.context.token.toUpperCase()}
                </span>
              )}
              {learning.context?.quest && (
                <span
                  className="text-xs font-bold rounded-md px-2 py-1"
                  style={{
                    background: '#fff0f8',
                    color: '#b4004e',
                    cursor: 'help',
                  }}
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
    <div className="p-6">
      <h1>Strategyzer Canvas (Public Transparency)</h1>
      {/* Stories Bar - contextually filtered to pillar */}
      <UserAdminStoriesBar context={selectedPillar} />
      <div className="flex flex-wrap gap-2 mb-4">
        {pillars.map(p => (
          <Button
            key={p.key}
            variant={selectedPillar === p.key ? 'default' : 'secondary'}
            onClick={() => setSelectedPillar(p.key)}
            className={selectedPillar === p.key ? '' : 'text-foreground'}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <h3 className="mt-0">Filter Learnings:</h3>
      <div className="flex gap-3 mb-4">
        <Select value={learningStatusFilter} onValueChange={setLearningStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="needs_review">Needs Review</SelectItem>
            <SelectItem value="actionable">Actionable</SelectItem>
            <SelectItem value="implemented">Implemented</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
          </SelectContent>
        </Select>
        <Select value={learningTypeFilter} onValueChange={setLearningTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Pillars" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Pillars</SelectItem>
            <SelectItem value="individual">Individual (Superachiever)</SelectItem>
            <SelectItem value="collective">Collective (Superachievers)</SelectItem>
            <SelectItem value="ecosystem">Ecosystem (Supercivilization)</SelectItem>
          </SelectContent>
        </Select>
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
                <li key={entry.id} className="mb-6">
                  <h3>{entry.title}</h3>
                  <div>
                    <strong>Type:</strong> {entry.canvas_type}
                  </div>
                  <div>{entry.description}</div>
                  {/* Feedback Widget for canvas entry */}
                  {userId && <FeedbackWidget context={`canvas:${entry.id}`} userId={userId} />}
                  {/* Stories Bar for canvas entry */}
                  <UserAdminStoriesBar context={`canvas:${entry.id}`} />
                  <div className="mt-2">
                    <strong>Experiments:</strong>
                    {renderExperiments(entry.id)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="mt-8 text-[0.95em] text-muted-foreground">
        <p>
          This dashboard provides transparent visibility into the current and evolving Canvas,
          experiments, and learnings for each pillar of the Avolve journey. User feedback and
          participation are always welcome!
        </p>
      </div>
      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>🌱 Welcome to Avolve!</DialogTitle>
          </DialogHeader>
          <div className="mb-3 text-base">
            Begin your Supercivilization journey from <strong>Degen</strong> to{' '}
            <strong>Regen</strong>.<br />
            <br />
            <strong>Explore:</strong>
            <ul className="my-2 ml-5 list-disc text-base">
              <li>
                <b>Canvas Dashboard</b>: Visualize transformation at the <b>Individual</b>,{' '}
                <b>Collective</b>, and <b>Ecosystem</b> levels.
              </li>
              <li>
                <b>Experiments</b>: Run Real-World & Simulation experiments. Track status and
                learnings.
              </li>
              <li>
                <b>Learnings & Results</b>: Filter, act, and celebrate progress. Badges show
                actionable status and context.
              </li>
              <li>
                <b>Stories Bar</b>: Share and discover real journeys and breakthroughs.
              </li>
            </ul>
            <b>Tip:</b> Hover over badges and icons for more context.
          </div>
          <Button onClick={() => setShowOnboarding(false)} className="mt-2 w-full">
            🚀 Start Exploring
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicCanvasDashboard;
