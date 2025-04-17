import React, { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';

interface Experiment {
  id: string;
  title: string;
}

interface LearningInput {
  experiment_id: string;
  summary: string;
  details?: string;
}

const CanvasLearningManager: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [form, setForm] = useState<LearningInput>({
    experiment_id: '',
    summary: '',
    details: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchExperiments = async () => {
      const { data, error } = await createClient()
        .from('experiments')
        .select('id, title')
        .order('created_at', { ascending: false });
      if (!error && data) setExperiments(data);
    };
    fetchExperiments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!form.experiment_id) {
      setError('Please select an Experiment.');
      setLoading(false);
      return;
    }
    const { error } = await createClient().from('learnings').insert([form]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm({ experiment_id: '', summary: '', details: '' });
      if (onCreated) onCreated();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f6fff6', padding: 24, borderRadius: 8, marginBottom: 24 }}>
      <h2>Add Learning/Insight</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Experiment:&nbsp;
          <select name="experiment_id" value={form.experiment_id} onChange={handleChange} required>
            <option value="">-- Select Experiment --</option>
            {experiments.map(exp => (
              <option key={exp.id} value={exp.id}>{exp.title}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Summary:<br />
          <input name="summary" value={form.summary} onChange={handleChange} required style={{ width: '100%' }} />
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Details:<br />
          <textarea name="details" value={form.details} onChange={handleChange} style={{ width: '100%' }} />
        </label>
      </div>
      <button type="submit" disabled={loading} style={{ background: '#008c4a', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
        {loading ? 'Adding...' : 'Add Learning'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>Learning added!</div>}
    </form>
  );
};

export default CanvasLearningManager;
