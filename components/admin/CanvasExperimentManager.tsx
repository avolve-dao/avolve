import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
const supabase = createClient();

interface CanvasEntry {
  id: string;
  title: string;
}

interface ExperimentInput {
  canvas_entry_id: string;
  title: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  experiment_type: 'real' | 'simulation';
}

const CanvasExperimentManager: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [canvasEntries, setCanvasEntries] = useState<CanvasEntry[]>([]);
  const [form, setForm] = useState<ExperimentInput>({
    canvas_entry_id: '',
    title: '',
    description: '',
    status: 'proposed',
    start_date: '',
    end_date: '',
    experiment_type: 'real',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCanvasEntries = async () => {
      const { data, error } = await supabase
        .from('canvas_entries')
        .select('id, title')
        .order('created_at', { ascending: false });
      if (!error && data) setCanvasEntries(data);
    };
    fetchCanvasEntries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const toInsert = { ...form };
    if (!toInsert.canvas_entry_id) {
      setError('Please select a Canvas Entry.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.from('experiments').insert([toInsert]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm({ canvas_entry_id: '', title: '', description: '', status: 'proposed', start_date: '', end_date: '', experiment_type: 'real' });
      if (onCreated) onCreated();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f0f8ff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
      <h2>Create New Experiment</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Canvas Entry:&nbsp;
          <select name="canvas_entry_id" value={form.canvas_entry_id} onChange={handleChange} required>
            <option value="">-- Select Canvas Entry --</option>
            {canvasEntries.map(entry => (
              <option key={entry.id} value={entry.id}>{entry.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Title:<br />
          <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Description:<br />
          <textarea name="description" value={form.description} onChange={handleChange} style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Status:&nbsp;
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="proposed">Proposed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Experiment Type:&nbsp;
          <select name="experiment_type" value={form.experiment_type} onChange={handleChange} required>
            <option value="real">Real-World</option>
            <option value="simulation">Simulation</option>
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Start Date:&nbsp;
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>End Date:&nbsp;
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
        </label>
      </div>
      <button type="submit" disabled={loading} style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
        {loading ? 'Creating...' : 'Create Experiment'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>Experiment created!</div>}
    </form>
  );
};

export default CanvasExperimentManager;
