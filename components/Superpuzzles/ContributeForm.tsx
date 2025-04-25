'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function ContributeForm({ puzzleId }: { puzzleId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to contribute');
      }

      const { error } = await supabase.from('puzzle_contributions').insert({
        puzzle_id: puzzleId,
        user_id: user.id,
        title,
        description,
      });

      if (error) throw error;

      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting contribution:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Contribution'}
      </Button>
    </form>
  );
}
