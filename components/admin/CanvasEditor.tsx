import React, { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

interface CanvasEntryInput {
  pillar: 'individual' | 'collective' | 'ecosystem';
  canvas_type: string;
  title: string;
  description?: string;
}

const canvasTypes = [
  'hypothesis',
  'pain',
  'gain',
  'job_to_be_done',
  'goal',
];

const pillars = [
  { key: 'individual', label: 'Individual (Superachiever)' },
  { key: 'collective', label: 'Collective (Superachievers)' },
  { key: 'ecosystem', label: 'Ecosystem (Supercivilization)' },
];

const CanvasEditor: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [form, setForm] = useState<CanvasEntryInput>({
    pillar: 'individual',
    canvas_type: 'hypothesis',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { error } = await createClient().from('canvas_entries').insert([form]);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm({ pillar: 'individual', canvas_type: 'hypothesis', title: '', description: '' });
      if (onCreated) onCreated();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: 24, borderRadius: 8, marginBottom: 24 }}>
      <h2>Create New Canvas Entry</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Pillar:&nbsp;
          <select name="pillar" value={form.pillar} onChange={handleChange}>
            {pillars.map(p => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label>Type:&nbsp;
          <select name="canvas_type" value={form.canvas_type} onChange={handleChange}>
            {canvasTypes.map(type => (
              <option key={type} value={type}>{type}</option>
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
      <button type="submit" disabled={loading} style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer' }}>
        {loading ? 'Creating...' : 'Create Canvas Entry'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>Canvas entry created!</div>}
    </form>
  );
};

export default CanvasEditor;
